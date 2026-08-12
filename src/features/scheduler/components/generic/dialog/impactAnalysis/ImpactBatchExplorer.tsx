import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { format } from "date-fns";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FolderZipTwoToneIcon from "@mui/icons-material/FolderZipTwoTone";
import FolderOpenTwoToneIcon from "@mui/icons-material/FolderOpenTwoTone";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import type { Colors } from "../../../../types/colorTypes";
import { BATCH_SLOTS, buildImpactBatchFileNames } from "../../../../types/impactBatch.types";
import {
  useGetImpactAnalysisSummaryQuery,
  useRunImpactAnalysisScriptMutation,
  useLazyDownloadImpactBatchExcelQuery,
} from "../../../../api/impactBatchApiSlice";
import { ImpactDeltaDialog } from "./ImpactDeltaDialog";

// One accent per batch slot / entity card, purely presentational (theme
// independent so slots stay visually distinct in both light and dark mode).
const SLOT_ACCENTS = ["#1E6FD9", "#7C3AED", "#0891B2", "#0E9F6E"];
const ENTITY_ACCENTS = ["#1E6FD9", "#7C3AED", "#0E9F6E", "#D97706", "#DB2777", "#0891B2", "#EA580C", "#059669"];

interface ImpactBatchExplorerProps {
  crqNo: string | null;
  colors: Colors;
}

function buildExcelFileName(crqNo: string, batchNo: number): string {
  return `Impact_Data_${crqNo}_Batch_${batchNo}.xlsx`;
}

function errorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: unknown } | undefined)?.data;
  return typeof data === "string" && data ? data : fallback;
}

// ─────────────────────────────────────────────
// BATCH SLOT CARD — two-row static/dynamic layout
// ─────────────────────────────────────────────
const BatchSlotCard: React.FC<{
  label: string;
  sublabel: string;
  hasData: boolean;
  isActive: boolean;
  colorMain: string;
  colors: Colors;
  onSelect: () => void;
}> = ({ label, sublabel, hasData, isActive, colorMain, colors, onSelect }) => (
  <Paper
    elevation={0}
    onClick={onSelect}
    sx={{
      flex: 1,
      minWidth: 0,
      border: `1.5px solid ${isActive && hasData ? colorMain : colors.border}`,
      bgcolor: isActive && hasData ? alpha(colorMain, colors.isDark ? 0.16 : 0.08) : colors.surface,
      borderRadius: colors.radiusL,
      overflow: "hidden",
      cursor: "pointer",
      opacity: hasData ? 1 : 0.55,
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": { borderColor: colorMain, boxShadow: `0 4px 14px ${alpha(colorMain, 0.15)}`, transform: "translateY(-1px)" },
    }}
  >
    {/* Static label row */}
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderBottom: `1px solid ${isActive && hasData ? alpha(colorMain, 0.25) : colors.border}`,
        background: isActive && hasData
          ? `linear-gradient(90deg, ${alpha(colorMain, 0.14)}, ${alpha(colorMain, 0.04)})`
          : colors.surface2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: colors.radius,
            bgcolor: isActive && hasData ? colorMain : alpha(colorMain, 0.14),
            color: isActive && hasData ? "#fff" : colorMain,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: isActive && hasData ? `0 2px 6px ${alpha(colorMain, 0.35)}` : "none",
          }}
        >
          {isActive && hasData ? <FolderOpenTwoToneIcon sx={{ fontSize: 13 }} /> : <FolderZipTwoToneIcon sx={{ fontSize: 13 }} />}
        </Box>
        <Typography
          sx={{ fontSize: "0.7rem", fontWeight: 800, color: isActive && hasData ? colorMain : colors.textSecondary, letterSpacing: 0.3, lineHeight: 1, flex: 1 }}
          noWrap
        >
          {label}
        </Typography>
        {isActive && hasData && (
          <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: colorMain, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckRoundedIcon sx={{ fontSize: 10, color: "#fff" }} />
          </Box>
        )}
      </Stack>
    </Box>

    {/* Dynamic data row */}
    <Box sx={{ px: 1.5, py: 1 }}>
      <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: colors.textDim, letterSpacing: 0.5, textTransform: "uppercase", mb: 0.3 }} noWrap>
        {sublabel}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: hasData ? colors.success : colors.border, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.62rem", color: colors.textSecondary, fontStyle: hasData ? "normal" : "italic", fontWeight: hasData ? 600 : 400 }} noWrap>
          {hasData ? `• ${label}` : "No data yet"}
        </Typography>
      </Stack>
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────
// KEY IMPACT METRIC CARD — top-level entity summary
// ─────────────────────────────────────────────
const EntityMetricCard: React.FC<{
  entity: string;
  count: number;
  isActive: boolean;
  colorMain: string;
  colors: Colors;
  onClick: () => void;
}> = ({ entity, count, isActive, colorMain, colors, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      flex: "1 1 150px",
      minWidth: 140,
      p: 1.5,
      borderRadius: colors.radiusL,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      border: `1.5px solid ${isActive ? colorMain : colors.border}`,
      bgcolor: isActive ? colorMain : colors.surface,
      display: "flex",
      flexDirection: "column",
      gap: 0.6,
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isActive ? `0 6px 20px ${alpha(colorMain, 0.28)}` : `0 4px 14px ${alpha(colorMain, 0.12)}`,
        borderColor: colorMain,
      },
    }}
  >
    <Box
      sx={{
        position: "absolute",
        right: -10,
        bottom: -10,
        width: 56,
        height: 56,
        borderRadius: "50%",
        bgcolor: isActive ? alpha("#fff", 0.1) : alpha(colorMain, 0.06),
      }}
    />
    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ zIndex: 1 }}>
      <Box
        sx={{
          p: 0.55,
          borderRadius: colors.radius,
          bgcolor: isActive ? alpha("#fff", 0.2) : alpha(colorMain, 0.12),
          color: isActive ? "#fff" : colorMain,
          display: "flex",
        }}
      >
        <BarChartRoundedIcon sx={{ fontSize: 12 }} />
      </Box>
      <Typography
        noWrap
        sx={{ flex: 1, fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: isActive ? "#fff" : colors.textPrimary, zIndex: 1 }}
      >
        {entity}
      </Typography>
      {isActive && (
        <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: alpha("#fff", 0.25), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckRoundedIcon sx={{ fontSize: 10, color: "#fff" }} />
        </Box>
      )}
    </Stack>
    <Box sx={{ height: "1px", bgcolor: isActive ? alpha("#fff", 0.2) : alpha(colorMain, 0.1), borderRadius: 1, zIndex: 1 }} />
    <Typography sx={{ color: isActive ? "#fff" : colors.textSecondary, fontSize: "0.95rem", fontWeight: 800, lineHeight: 1, letterSpacing: -0.5, zIndex: 1 }}>
      {count.toLocaleString()}
    </Typography>
  </Paper>
);

// ─────────────────────────────────────────────
// DETAIL BREAKDOWN CARD — drilldown, with volume-share bar
// ─────────────────────────────────────────────
const EntityBreakdownCard: React.FC<{
  entity: string;
  count: number;
  colorMain: string;
  pct: number;
  colors: Colors;
}> = ({ entity, count, colorMain, pct, colors }) => (
  <Paper
    elevation={0}
    sx={{
      flex: "1 1 150px",
      minWidth: 140,
      p: 1.5,
      borderRadius: colors.radiusL,
      border: `1px solid ${colors.border}`,
      bgcolor: colors.surface,
      display: "flex",
      flexDirection: "column",
      gap: 0.8,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": { boxShadow: `0 6px 18px ${alpha(colorMain, 0.14)}`, transform: "translateY(-2px)", borderColor: alpha(colorMain, 0.4) },
    }}
  >
    <Box sx={{ position: "absolute", left: 0, top: "15%", height: "70%", width: 3, bgcolor: colorMain, borderRadius: "0 4px 4px 0" }} />
    <Stack direction="row" alignItems="center" spacing={0.7} sx={{ pl: 0.5 }}>
      <Box sx={{ p: 0.5, borderRadius: colors.radius, bgcolor: alpha(colorMain, 0.1), color: colorMain, display: "flex" }}>
        <StorageRoundedIcon sx={{ fontSize: 11 }} />
      </Box>
      <Typography noWrap sx={{ color: colors.textSecondary, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", flex: 1 }}>
        {entity}
      </Typography>
    </Stack>
    <Typography sx={{ fontWeight: 800, color: colors.textPrimary, fontSize: "1.2rem", lineHeight: 1, letterSpacing: -0.4, pl: 0.5 }}>
      {count.toLocaleString()}
    </Typography>
    <Box sx={{ pl: 0.5 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: "0.52rem", color: colors.textDim, fontWeight: 700, letterSpacing: 0.5 }}>VOLUME SHARE</Typography>
        <Typography sx={{ fontSize: "0.58rem", color: colorMain, fontWeight: 800 }}>{Math.round(pct)}%</Typography>
      </Stack>
      <Box sx={{ width: "100%", height: 4, bgcolor: alpha(colorMain, 0.1), borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: colorMain, borderRadius: 3, transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)", opacity: 0.85 }} />
      </Box>
    </Box>
  </Paper>
);

export const ImpactBatchExplorer: React.FC<ImpactBatchExplorerProps> = ({ crqNo, colors }) => {
  const [selectedBatchNo, setSelectedBatchNo] = useState<number>(1);
  const [drillEntity, setDrillEntity] = useState<string | null>(null);
  const [deltaOpen, setDeltaOpen] = useState(false);

  // Always today's date - the proc only ever matches today's run anyway
  // (chm_get_main_summary_data compares on the date portion of modifiedDate),
  // so there's nothing useful for the user to pick.
  const modifiedDate = useMemo(() => new Date(`${format(new Date(), "yyyy-MM-dd")}T12:00:00`), []);

  // One summary query per fixed batch slot (not a dynamic loop - BATCH_SLOTS
  // is a 4-entry compile-time constant) so every batch card can show its
  // real "loaded / no data yet" state up front, matching the reference
  // design, instead of only after it's selected. RTK Query dedupes this
  // against the same-args query below once a slot is picked, so selecting
  // a batch never re-fetches.
  const batchQuery1 = useGetImpactAnalysisSummaryQuery({ crqNo: crqNo as string, batchNo: 1, modifiedDate, flag: "Main" }, { skip: !crqNo });
  const batchQuery2 = useGetImpactAnalysisSummaryQuery({ crqNo: crqNo as string, batchNo: 2, modifiedDate, flag: "Main" }, { skip: !crqNo });
  const batchQuery3 = useGetImpactAnalysisSummaryQuery({ crqNo: crqNo as string, batchNo: 3, modifiedDate, flag: "Main" }, { skip: !crqNo });
  const batchQuery4 = useGetImpactAnalysisSummaryQuery({ crqNo: crqNo as string, batchNo: 4, modifiedDate, flag: "Main" }, { skip: !crqNo });
  const batchQueries = [batchQuery1, batchQuery2, batchQuery3, batchQuery4];
  const loadedCount = batchQueries.filter((q) => (q.data?.length ?? 0) > 0).length;

  const activeBatchQuery = batchQueries[selectedBatchNo - 1];
  const summaryRows = activeBatchQuery.data;
  const summaryLoading = activeBatchQuery.isFetching;
  const summaryError = activeBatchQuery.error;

  const {
    data: drillRows,
    isFetching: drillLoading,
    error: drillError,
  } = useGetImpactAnalysisSummaryQuery(
    { crqNo: crqNo as string, batchNo: selectedBatchNo, modifiedDate, flag: drillEntity as string },
    { skip: !crqNo || !drillEntity },
  );

  const [runScript, { isLoading: scriptRunning }] = useRunImpactAnalysisScriptMutation();
  const [scriptStatus, setScriptStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const handleRunScript = async () => {
    if (!crqNo) return;
    setScriptStatus(null);
    try {
      const result = await runScript({ crqNo, attempt: selectedBatchNo }).unwrap();
      setScriptStatus({ ok: result.status === "SUCCESS", message: result.message });
    } catch (err) {
      setScriptStatus({ ok: false, message: errorMessage(err, "Failed to execute impact analysis script.") });
    }
  };

  const [triggerDownload, { isFetching: downloading }] = useLazyDownloadImpactBatchExcelQuery();

  const handleDownload = async () => {
    if (!crqNo) return;
    try {
      const fileNames = buildImpactBatchFileNames(crqNo, selectedBatchNo);
      const blob = await triggerDownload({ fileNames }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildExcelFileName(crqNo, selectedBatchNo);
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // RTK Query surfaces the failure via isError on the same hook; a
      // failed download simply means no file gets saved, nothing else to
      // clean up here.
    }
  };

  const maxDrillCount = useMemo(
    () => ((drillRows && drillRows.length) ? Math.max(...drillRows.map((d) => d.cnt)) : 0),
    [drillRows],
  );

  if (!crqNo) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ── Batch Selection ── */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, flexWrap: "wrap", rowGap: 1 }}>
          <LayersRoundedIcon sx={{ fontSize: 15, color: colors.textSecondary }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: colors.textPrimary }}>Batch Selection</Typography>
          <Chip
            label={`${loadedCount}/${BATCH_SLOTS.length} loaded`}
            size="small"
            sx={{
              height: 20,
              fontSize: 10.5,
              fontWeight: 700,
              bgcolor: loadedCount > 0 ? colors.successDim : colors.surface2,
              color: loadedCount > 0 ? colors.success : colors.textDim,
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Run the impact analysis script for this batch" arrow>
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={scriptRunning ? <CircularProgress size={12} color="inherit" /> : <RefreshRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={handleRunScript}
                disabled={scriptRunning}
                sx={{ fontSize: 11, textTransform: "none", borderRadius: colors.radiusL, px: 1.25 }}
              >
                {scriptRunning ? "Running…" : "Refetch"}
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={() => setDeltaOpen(true)}
            sx={{ fontSize: 11, textTransform: "none", color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: colors.radiusL, px: 1.25 }}
          >
            Delta
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.25}>
          {BATCH_SLOTS.map((slot, index) => (
            <BatchSlotCard
              key={slot.key}
              label={slot.label}
              sublabel={slot.sublabel}
              hasData={(batchQueries[index].data?.length ?? 0) > 0}
              isActive={selectedBatchNo === slot.batchNo}
              colorMain={SLOT_ACCENTS[index % SLOT_ACCENTS.length]}
              colors={colors}
              onSelect={() => {
                setSelectedBatchNo(slot.batchNo);
                setDrillEntity(null);
                setScriptStatus(null);
              }}
            />
          ))}
        </Stack>
      </Box>

      {scriptStatus && (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: colors.radiusL,
            border: `1px solid ${scriptStatus.ok ? colors.success : colors.danger}`,
            bgcolor: scriptStatus.ok ? colors.successDim : colors.dangerDim,
          }}
        >
          {scriptStatus.ok ? (
            <CheckRoundedIcon sx={{ fontSize: 16, color: colors.success }} />
          ) : (
            <StorageRoundedIcon sx={{ fontSize: 16, color: colors.danger }} />
          )}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{scriptStatus.message}</Typography>
        </Paper>
      )}

      {/* ── Key Impact Metrics ── */}
      <Box>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.25 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: colors.textPrimary }}>Key Impact Metrics</Typography>
          <Typography sx={{ fontSize: 11, color: colors.textDim }}>Click a category to drill down</Typography>
        </Stack>

        {summaryLoading ? (
          <Stack alignItems="center" py={3} spacing={1}>
            <CircularProgress size={22} sx={{ color: colors.accent }} />
            <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>Loading summary…</Typography>
          </Stack>
        ) : summaryError ? (
          <Stack alignItems="center" py={3} spacing={1}>
            <StorageRoundedIcon sx={{ fontSize: 28, color: colors.textDim }} />
            <Typography sx={{ fontSize: 12.5, color: colors.textSecondary, fontWeight: 600, textAlign: "center" }}>
              {errorMessage(summaryError, "No impact analysis data for this batch/date yet — use Refetch above to generate it.")}
            </Typography>
          </Stack>
        ) : (summaryRows ?? []).length === 0 ? (
          <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>No categories found in this batch.</Typography>
        ) : (
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            {(summaryRows ?? []).map((row, i) => (
              <EntityMetricCard
                key={row.entity}
                entity={row.entity}
                count={row.cnt}
                isActive={drillEntity === row.entity}
                colorMain={ENTITY_ACCENTS[i % ENTITY_ACCENTS.length]}
                colors={colors}
                onClick={() => setDrillEntity(drillEntity === row.entity ? null : row.entity)}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Details / drilldown ── */}
      {drillEntity && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <IconButton size="small" onClick={() => setDrillEntity(null)}>
              <ArrowBackRoundedIcon sx={{ fontSize: 15, color: colors.textSecondary }} />
            </IconButton>
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: colors.textPrimary }}>
              Details for: <Box component="span" sx={{ color: colors.accent }}>{drillEntity}</Box>
            </Typography>
            {!drillLoading && (drillRows?.length ?? 0) > 0 && (
              <Chip
                label={`${drillRows!.length} ${drillRows!.length === 1 ? "entry" : "entries"}`}
                size="small"
                sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: colors.accentDim, color: colors.accent }}
              />
            )}
          </Stack>

          {drillLoading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={20} sx={{ color: colors.accent }} />
            </Stack>
          ) : drillError ? (
            <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
              {errorMessage(drillError, "No breakdown data found for this category.")}
            </Typography>
          ) : (drillRows ?? []).length === 0 ? (
            <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>No rows found for this category.</Typography>
          ) : (
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              {(drillRows ?? []).map((row, i) => (
                <EntityBreakdownCard
                  key={row.entity}
                  entity={row.entity}
                  count={row.cnt}
                  colorMain={ENTITY_ACCENTS[i % ENTITY_ACCENTS.length]}
                  pct={maxDrillCount > 0 ? Math.max((row.cnt / maxDrillCount) * 100, 2) : 0}
                  colors={colors}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* ── Active batch breadcrumb + export ── */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.1,
          borderRadius: colors.radiusL,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface2,
        }}
      >
        <Typography sx={{ fontSize: 11.5, color: colors.textSecondary, fontWeight: 600 }}>
          Active batch:{" "}
          <Box component="span" sx={{ color: colors.textPrimary, fontWeight: 800 }}>
            Batch {selectedBatchNo}
          </Box>
          {drillEntity && (
            <>
              <Box component="span" sx={{ color: colors.textDim, mx: 0.6 }}>
                ›
              </Box>
              <Box component="span" sx={{ color: colors.textPrimary, fontWeight: 800 }}>
                {drillEntity}
              </Box>
            </>
          )}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="contained"
          startIcon={downloading ? <CircularProgress size={13} color="inherit" /> : <FileDownloadRoundedIcon sx={{ fontSize: 15 }} />}
          onClick={handleDownload}
          disabled={downloading}
          sx={{ fontSize: 11.5, textTransform: "none", bgcolor: colors.accent, borderRadius: colors.radiusL }}
        >
          {downloading ? "Preparing…" : "Export Excel"}
        </Button>
      </Paper>

      <ImpactDeltaDialog open={deltaOpen} onClose={() => setDeltaOpen(false)} crqNo={crqNo} modifiedDate={modifiedDate} colors={colors} />
    </Box>
  );
};

export default ImpactBatchExplorer;
