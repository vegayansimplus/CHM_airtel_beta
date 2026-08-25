import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FolderZipTwoToneIcon from "@mui/icons-material/FolderZipTwoTone";
import FolderOpenTwoToneIcon from "@mui/icons-material/FolderOpenTwoTone";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { useTabColorTokens } from "../../../../style/theme";
import {
  buildImpactBatchFileNames,
  errorMessage,
  formatImpactModifiedDate,
} from "../../../scheduler/types/impactBatch.types";
import {
  useGetImpactBatchStatusQuery,
  useGetImpactAnalysisSummaryQuery,
  useLazyDownloadImpactBatchExcelQuery,
} from "../../../scheduler/api/impactBatchApiSlice";

// One accent per batch slot / entity row, purely presentational (theme
// independent so slots stay visually distinct in both light and dark mode).
const SLOT_ACCENTS = ["#1E6FD9", "#7C3AED", "#0891B2", "#0E9F6E"];
const ENTITY_ACCENTS = ["#1E6FD9", "#7C3AED", "#0E9F6E", "#D97706", "#DB2777", "#0891B2", "#EA580C", "#059669"];

type Colors = ReturnType<typeof useTabColorTokens>;

interface CrqImpactAnalysisPanelProps {
  crqNo: string | null;
}

function buildExcelFileName(crqNo: string, batchNo: number): string {
  return `Impact_Data_${crqNo}_Batch_${batchNo}.xlsx`;
}

// ─────────────────────────────────────────────
// BATCH PILL — drawer-width variant of the scheduler's batch slot card:
// same data, laid out to scroll horizontally instead of wrapping into a grid.
// ─────────────────────────────────────────────
const BatchPill: React.FC<{
  label: string;
  sublabel: string;
  fileCount: number;
  modifiedLabel: string;
  isActive: boolean;
  colorMain: string;
  colors: Colors;
  onSelect: () => void;
}> = ({ label, sublabel, fileCount, modifiedLabel, isActive, colorMain, colors, onSelect }) => (
  <Paper
    elevation={0}
    onClick={onSelect}
    sx={{
      width: 146,
      flexShrink: 0,
      px: 1.25,
      py: 1,
      cursor: "pointer",
      borderRadius: colors.radiusL,
      border: `1.5px solid ${isActive ? colorMain : colors.border}`,
      bgcolor: isActive ? alpha(colorMain, colors.isDark ? 0.16 : 0.08) : colors.surface,
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": { borderColor: colorMain, boxShadow: `0 4px 12px ${alpha(colorMain, 0.15)}` },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mb: 0.6 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: colors.radius,
          bgcolor: isActive ? colorMain : alpha(colorMain, 0.14),
          color: isActive ? "#fff" : colorMain,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isActive ? <FolderOpenTwoToneIcon sx={{ fontSize: 12 }} /> : <FolderZipTwoToneIcon sx={{ fontSize: 12 }} />}
      </Box>
      <Typography
        noWrap
        sx={{ flex: 1, fontSize: "0.68rem", fontWeight: 800, letterSpacing: 0.3, color: isActive ? colorMain : colors.textSecondary }}
      >
        {label}
      </Typography>
      {isActive && <CheckRoundedIcon sx={{ fontSize: 12, color: colorMain }} />}
    </Stack>

    <Typography
      noWrap
      sx={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: colors.textDim }}
    >
      {sublabel}
    </Typography>

    <Tooltip title={`${fileCount} CSV file(s) on SFTP · last modified ${modifiedLabel}`} arrow>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.4 }}>
        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: fileCount > 0 ? colors.success : colors.border, flexShrink: 0 }} />
        <Typography noWrap sx={{ fontSize: "0.6rem", fontWeight: 600, color: colors.textSecondary }}>
          {fileCount} file{fileCount === 1 ? "" : "s"} · {modifiedLabel}
        </Typography>
      </Stack>
    </Tooltip>
  </Paper>
);

// ─────────────────────────────────────────────
// METRIC ROW — the scheduler's metric card re-laid out as a full-width row,
// which is what fits a 480px drawer. Its drilldown nests underneath it
// instead of pushing a separate "Details for:" section further down.
// ─────────────────────────────────────────────
const MetricRow: React.FC<{
  entity: string;
  count: number;
  pct: number;
  isActive: boolean;
  colorMain: string;
  colors: Colors;
  onClick: () => void;
}> = ({ entity, count, pct, isActive, colorMain, colors, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      px: 1.25,
      py: 0.9,
      cursor: "pointer",
      borderRadius: colors.radiusL,
      border: `1.5px solid ${isActive ? colorMain : colors.border}`,
      bgcolor: isActive ? alpha(colorMain, colors.isDark ? 0.14 : 0.06) : colors.surface,
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": { borderColor: colorMain, boxShadow: `0 3px 10px ${alpha(colorMain, 0.13)}` },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colorMain, flexShrink: 0 }} />
      <Typography
        noWrap
        sx={{ flex: 1, fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: colors.textPrimary }}
      >
        {entity}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: -0.3, color: isActive ? colorMain : colors.textPrimary }}>
        {count.toLocaleString()}
      </Typography>
      <ExpandMoreRoundedIcon
        sx={{
          fontSize: 16,
          color: colors.textDim,
          transition: "transform 0.2s",
          transform: isActive ? "rotate(180deg)" : "none",
        }}
      />
    </Stack>
    <Box sx={{ mt: 0.6, height: 3, borderRadius: 3, bgcolor: alpha(colorMain, 0.12), overflow: "hidden" }}>
      <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: colorMain, borderRadius: 3, opacity: 0.85, transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)" }} />
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────
// BREAKDOWN ROW — one sub-entity inside an expanded category.
// ─────────────────────────────────────────────
const BreakdownRow: React.FC<{
  entity: string;
  count: number;
  pct: number;
  colorMain: string;
  colors: Colors;
}> = ({ entity, count, pct, colorMain, colors }) => (
  <Box sx={{ px: 1.25, py: 0.7, borderRadius: colors.radius, bgcolor: colors.surface2 }}>
    <Stack direction="row" alignItems="center" spacing={0.8}>
      <StorageRoundedIcon sx={{ fontSize: 11, color: colorMain, flexShrink: 0 }} />
      <Typography noWrap sx={{ flex: 1, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 0.3, color: colors.textSecondary }}>
        {entity}
      </Typography>
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: colors.textPrimary }}>{count.toLocaleString()}</Typography>
    </Stack>
    <Box sx={{ mt: 0.45, height: 2.5, borderRadius: 3, bgcolor: alpha(colorMain, 0.12), overflow: "hidden" }}>
      <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: colorMain, borderRadius: 3, opacity: 0.8 }} />
    </Box>
  </Box>
);

/**
 * Impact Analysis summary for the All-CRQs drawer.
 *
 * Same two-step contract as the scheduler's Impact Analysis review panel, and
 * the same endpoints - nothing new was added on the API side:
 *
 *   1. GET /impact/statuscsv/batch?crqNo=          -> which batches exist and
 *      each batch's SFTP `modifiedDate`.
 *   2. GET /crqworkflow/impactanalysis/batch?...   -> summary rows for that
 *      batchNo *and* that modifiedDate (flag="Main"; the category name as
 *      `flag` drills into its sub-entities).
 *
 * Export Excel posts the file names step 1 reported to /excel/impact-batchwise
 * and saves the returned blob. Only the layout differs from the scheduler
 * version: batches scroll horizontally and metrics are rows, because the
 * drawer is ~440px of usable width instead of a half-screen dialog panel.
 *
 * This is a read-only view of what the scheduler produced: no "Refetch" (which
 * re-runs the script server-side) and no "Delta" compare - CAB reviews the
 * numbers here, it does not generate them.
 */
export const CrqImpactAnalysisPanel: React.FC<CrqImpactAnalysisPanelProps> = ({ crqNo }) => {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  // The user's explicit pick, if any - resolved against the step-1 listing
  // below, so it can never point at a batch the server didn't report.
  const [pickedBatchNo, setPickedBatchNo] = useState<number | null>(null);
  // Drilldown is scoped to the CRQ + batch it was opened from, so switching
  // either one drops it automatically instead of showing another batch's
  // category as if it were this one's.
  const [drill, setDrill] = useState<{ crqNo: string; batchNo: number; entity: string } | null>(null);

  // ── STEP 1 ──
  const {
    data: batchStatus,
    isFetching: batchesLoading,
    error: batchesError,
  } = useGetImpactBatchStatusQuery({ crqNo: crqNo as string }, { skip: !crqNo });

  const batches = useMemo(() => batchStatus ?? [], [batchStatus]);

  // An unset or no-longer-listed pick (new CRQ, re-run that changed the batch
  // set) falls back to the newest batch, which is the run people care about.
  const selectedBatch = useMemo(() => {
    if (!batches.length) return null;
    return batches.find((b) => b.batchNo === pickedBatchNo) ?? batches[batches.length - 1];
  }, [batches, pickedBatchNo]);

  const selectedBatchNo = selectedBatch?.batchNo ?? null;

  const drillEntity =
    drill && drill.crqNo === crqNo && drill.batchNo === selectedBatchNo ? drill.entity : null;

  // ── STEP 2 ── batchNo *and* modifiedDate both come from the step-1 row, so
  // the query never fires with a guessed date (which matches zero rows).
  const {
    data: summaryRows,
    isFetching: summaryLoading,
    error: summaryError,
  } = useGetImpactAnalysisSummaryQuery(
    {
      crqNo: crqNo as string,
      batchNo: selectedBatch?.batchNo as number,
      modifiedDate: selectedBatch?.modifiedDate as string,
      flag: "Main",
    },
    { skip: !crqNo || !selectedBatch },
  );

  // Drilldown re-issues step 2 for the same batch/date with the category as flag.
  const {
    data: drillRows,
    isFetching: drillLoading,
    error: drillError,
  } = useGetImpactAnalysisSummaryQuery(
    {
      crqNo: crqNo as string,
      batchNo: selectedBatch?.batchNo as number,
      modifiedDate: selectedBatch?.modifiedDate as string,
      flag: drillEntity as string,
    },
    { skip: !crqNo || !selectedBatch || !drillEntity },
  );

  const [triggerDownload, { isFetching: downloading }] = useLazyDownloadImpactBatchExcelQuery();

  const handleDownload = async () => {
    if (!crqNo || !selectedBatch) return;
    try {
      // Real names from step 1; the constructed candidate set is only a
      // fallback for a batch whose listing came back without files.
      const fileNames = selectedBatch.files.length
        ? selectedBatch.files
        : buildImpactBatchFileNames(crqNo, selectedBatch.batchNo);
      const blob = await triggerDownload({ fileNames }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildExcelFileName(crqNo, selectedBatch.batchNo);
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // RTK Query surfaces the failure via isError on the same hook; a failed
      // download simply means no file gets saved, nothing else to clean up.
    }
  };

  const maxSummaryCount = useMemo(
    () => ((summaryRows && summaryRows.length) ? Math.max(...summaryRows.map((d) => d.cnt)) : 0),
    [summaryRows],
  );
  const maxDrillCount = useMemo(
    () => ((drillRows && drillRows.length) ? Math.max(...drillRows.map((d) => d.cnt)) : 0),
    [drillRows],
  );

  // The metrics block is shown only when step 2 actually returned categories.
  // A failed step 2 (e.g. "Impact analysis status not SUCCESS for the given
  // date") and an empty one are the same thing here: nothing to render.
  const hasSummaryRows =
    !!selectedBatch && !summaryLoading && !summaryError && (summaryRows ?? []).length > 0;

  if (!crqNo) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* ── Batch Selection ── */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
        <LayersRoundedIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary }}>Batch Selection</Typography>
        <Chip
          label={
            batchesLoading && !batches.length
              ? "Loading…"
              : `${batches.length} batch${batches.length === 1 ? "" : "es"}`
          }
          size="small"
          sx={{
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: batches.length > 0 ? colors.successDim : colors.surface2,
            color: batches.length > 0 ? colors.success : colors.textDim,
          }}
        />
      </Stack>

      {batchesLoading && !batches.length ? (
        <Stack alignItems="center" py={2} spacing={0.75}>
          <CircularProgress size={18} sx={{ color: colors.accent }} />
          <Typography sx={{ fontSize: 11.5, color: colors.textSecondary }}>Discovering batches…</Typography>
        </Stack>
      ) : !batches.length ? (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: colors.radiusL,
            border: `1px dashed ${colors.border}`,
            bgcolor: colors.surface2,
          }}
        >
          <FolderZipTwoToneIcon sx={{ fontSize: 17, color: colors.textDim, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11.5, color: colors.textSecondary, fontWeight: 600 }}>
            {errorMessage(batchesError, "No impact analysis batch files found for this CRQ yet.")}
          </Typography>
        </Paper>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: 0.5,
            // The drawer is far narrower than the scheduler's panel, so batches
            // scroll sideways rather than wrapping into unreadably short cards.
            "&::-webkit-scrollbar": { height: 5 },
            "&::-webkit-scrollbar-thumb": { bgcolor: colors.border, borderRadius: 3 },
          }}
        >
          {batches.map((batch, index) => (
            <BatchPill
              key={batch.key}
              label={batch.label}
              sublabel={batch.sublabel}
              fileCount={batch.files.length}
              modifiedLabel={formatImpactModifiedDate(batch.modifiedDate)}
              isActive={selectedBatchNo === batch.batchNo}
              colorMain={SLOT_ACCENTS[index % SLOT_ACCENTS.length]}
              colors={colors}
              onSelect={() => {
                setPickedBatchNo(batch.batchNo);
                setDrill(null);
              }}
            />
          ))}
        </Stack>
      )}

      {/* ── Key Impact Metrics ──
          The whole block - heading, run chip, drill hint and rows - only
          renders when the batch actually has categories to show. A batch whose
          run never reached SUCCESS ("Impact analysis status not SUCCESS for
          the given date") has nothing to drill into, so the drawer stays on
          the batch strip and the export rather than showing an empty heading
          over a backend error string. */}
      {summaryLoading ? (
        <Stack alignItems="center" py={2.5} spacing={0.75}>
          <CircularProgress size={20} sx={{ color: colors.accent }} />
          <Typography sx={{ fontSize: 11.5, color: colors.textSecondary }}>Loading summary…</Typography>
        </Stack>
      ) : !hasSummaryRows ? null : (
        <>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary }}>Key Impact Metrics</Typography>
              {selectedBatch && (
                <Chip
                  label={`Run ${formatImpactModifiedDate(selectedBatch.modifiedDate)}`}
                  size="small"
                  sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: colors.surface2, color: colors.textSecondary }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: 10.5, color: colors.textDim, mt: 0.25 }}>Tap a category to drill down</Typography>
          </Box>

          <Stack spacing={0.75}>
          {(summaryRows ?? []).map((row, i) => {
            const accent = ENTITY_ACCENTS[i % ENTITY_ACCENTS.length];
            const isActive = drillEntity === row.entity;
            return (
              <Box key={row.entity}>
                <MetricRow
                  entity={row.entity}
                  count={row.cnt}
                  pct={maxSummaryCount > 0 ? Math.max((row.cnt / maxSummaryCount) * 100, 2) : 0}
                  isActive={isActive}
                  colorMain={accent}
                  colors={colors}
                  onClick={() =>
                    setDrill(
                      isActive || !selectedBatch ? null : { crqNo, batchNo: selectedBatch.batchNo, entity: row.entity },
                    )
                  }
                />

                {/* Drilldown nests under the row it came from - in a drawer that
                    reads better than a detached "Details for:" block. */}
                <Collapse in={isActive} unmountOnExit>
                  <Box
                    sx={{
                      mt: 0.6,
                      ml: 1.25,
                      pl: 1.25,
                      borderLeft: `2px solid ${alpha(accent, 0.35)}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.6,
                    }}
                  >
                    {drillLoading ? (
                      <Stack alignItems="center" py={1.5}>
                        <CircularProgress size={16} sx={{ color: colors.accent }} />
                      </Stack>
                    ) : drillError ? (
                      <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>
                        {errorMessage(drillError, "No breakdown data found for this category.")}
                      </Typography>
                    ) : (drillRows ?? []).length === 0 ? (
                      <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>No rows found for this category.</Typography>
                    ) : (
                      (drillRows ?? []).map((sub, j) => (
                        <BreakdownRow
                          key={sub.entity}
                          entity={sub.entity}
                          count={sub.cnt}
                          pct={maxDrillCount > 0 ? Math.max((sub.cnt / maxDrillCount) * 100, 2) : 0}
                          colorMain={ENTITY_ACCENTS[j % ENTITY_ACCENTS.length]}
                          colors={colors}
                        />
                      ))
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
          </Stack>
        </>
      )}

      {/* ── Active batch breadcrumb + export ── */}
      <Paper
        elevation={0}
        sx={{
          mt: 0.5,
          px: 1.5,
          py: 1.1,
          borderRadius: colors.radiusL,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface2,
        }}
      >
        <Typography sx={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, mb: 1, display: "block" }}>
          Active batch:{" "}
          <Box component="span" sx={{ color: colors.textPrimary, fontWeight: 800 }}>
            {selectedBatch ? selectedBatch.label : "—"}
          </Box>
          {selectedBatch && (
            <Box component="span" sx={{ color: colors.textDim, ml: 0.6 }}>
              ({selectedBatch.files.length} file{selectedBatch.files.length === 1 ? "" : "s"} ·{" "}
              {formatImpactModifiedDate(selectedBatch.modifiedDate)})
            </Box>
          )}
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
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={downloading ? <CircularProgress size={13} color="inherit" /> : <FileDownloadRoundedIcon sx={{ fontSize: 15 }} />}
          onClick={handleDownload}
          disabled={downloading || !selectedBatch}
          sx={{ fontSize: 11.5, textTransform: "none", bgcolor: colors.accent, borderRadius: colors.radiusL }}
        >
          {downloading ? "Preparing…" : "Export Excel"}
        </Button>
      </Paper>
    </Box>
  );
};

export default CrqImpactAnalysisPanel;
