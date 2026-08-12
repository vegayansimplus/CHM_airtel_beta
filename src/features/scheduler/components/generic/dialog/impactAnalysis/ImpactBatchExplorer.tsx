import React, { useEffect, useMemo, useState } from "react";
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
import FolderZipTwoToneIcon from "@mui/icons-material/FolderZipTwoTone";
import FolderOpenTwoToneIcon from "@mui/icons-material/FolderOpenTwoTone";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import type { Colors } from "../../../../types/colorTypes";
import { BATCH_SLOTS } from "../../../../types/impactBatch.types";
import {
  useGetImpactBatchesQuery,
  useGetImpactBatchHeaderQuery,
  useLazyDownloadImpactBatchExcelQuery,
} from "../../../../api/impactBatchApiSlice";
import { ImpactDeltaDialog } from "./ImpactDeltaDialog";

// One accent per batch slot, purely presentational (theme-independent so the
// 4 slots stay visually distinct in both light and dark mode).
const SLOT_ACCENTS = ["#1E6FD9", "#7C3AED", "#0891B2", "#0E9F6E"];

interface ImpactBatchExplorerProps {
  crqNo: string | null;
  colors: Colors;
}

function formatModifiedDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw.replace(" ", "T"));
  if (isNaN(d.getTime())) return raw;
  return format(d, "dd-MMM-yyyy HH:mm");
}

function buildExcelFileName(crqNo: string, batchNo: number): string {
  return `Impact_Data_${crqNo}_Batch_${batchNo}.xlsx`;
}

export const ImpactBatchExplorer: React.FC<ImpactBatchExplorerProps> = ({ crqNo, colors }) => {
  const {
    data: batches,
    isFetching: batchesLoading,
    refetch: refetchBatches,
  } = useGetImpactBatchesQuery({ crqNo: crqNo as string }, { skip: !crqNo });

  const availableSlots = useMemo(
    () => BATCH_SLOTS.filter((slot) => !!batches?.[slot.key]?.files?.length),
    [batches],
  );

  const [selectedBatchNo, setSelectedBatchNo] = useState<number | null>(null);
  const [deltaOpen, setDeltaOpen] = useState(false);

  // Default to the most recent batch that actually has data once it loads.
  useEffect(() => {
    if (selectedBatchNo !== null && availableSlots.some((s) => s.batchNo === selectedBatchNo)) return;
    const latest = availableSlots[availableSlots.length - 1];
    setSelectedBatchNo(latest ? latest.batchNo : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableSlots]);

  const selectedSlot = BATCH_SLOTS.find((s) => s.batchNo === selectedBatchNo) ?? null;
  const selectedInfo = selectedSlot ? batches?.[selectedSlot.key] : undefined;

  const { data: headerRows, isFetching: headerLoading } = useGetImpactBatchHeaderQuery(
    { crqNo: crqNo as string, batchNo: selectedBatchNo as number },
    { skip: !crqNo || !selectedBatchNo },
  );

  const [triggerDownload, { isFetching: downloading }] = useLazyDownloadImpactBatchExcelQuery();

  const handleDownload = async () => {
    if (!crqNo || !selectedSlot || !selectedInfo?.files?.length) return;
    try {
      const blob = await triggerDownload({ fileNames: selectedInfo.files }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildExcelFileName(crqNo, selectedSlot.batchNo);
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // RTK Query surfaces the failure via isError on the same hook; a
      // failed download simply means no file gets saved, nothing else to
      // clean up here.
    }
  };

  const totalRows = useMemo(
    () => (headerRows ?? []).reduce((sum, r) => sum + r.cnt, 0),
    [headerRows],
  );

  if (!crqNo) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Batch slot selector */}
      <Stack direction="row" spacing={1.25}>
        {BATCH_SLOTS.map((slot, index) => {
          const info = batches?.[slot.key];
          const hasData = !!info?.files?.length;
          const isSelected = selectedBatchNo === slot.batchNo;
          const accent = SLOT_ACCENTS[index % SLOT_ACCENTS.length];

          return (
            <Paper
              key={slot.key}
              elevation={0}
              onClick={() => hasData && setSelectedBatchNo(slot.batchNo)}
              sx={{
                flex: 1,
                minWidth: 0,
                cursor: hasData ? "pointer" : "default",
                border: `1.5px solid ${isSelected && hasData ? accent : colors.border}`,
                bgcolor: isSelected && hasData ? alpha(accent, 0.08) : colors.surface,
                borderRadius: colors.radiusL,
                opacity: hasData ? 1 : 0.5,
                p: 1.25,
                transition: "all 0.18s ease",
                "&:hover": hasData ? { borderColor: accent, boxShadow: `0 2px 10px ${alpha(accent, 0.15)}` } : {},
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: colors.radius,
                    bgcolor: isSelected && hasData ? accent : alpha(accent, 0.12),
                    color: isSelected && hasData ? "#fff" : accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isSelected && hasData ? (
                    <FolderOpenTwoToneIcon sx={{ fontSize: 13 }} />
                  ) : (
                    <FolderZipTwoToneIcon sx={{ fontSize: 13 }} />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: isSelected && hasData ? accent : colors.textPrimary,
                    flex: 1,
                  }}
                  noWrap
                >
                  {slot.label}
                </Typography>
                {isSelected && hasData && (
                  <CheckRoundedIcon sx={{ fontSize: 14, color: accent }} />
                )}
              </Stack>
              <Typography sx={{ fontSize: 10.5, color: colors.textSecondary, fontWeight: 600 }} noWrap>
                {slot.sublabel}
              </Typography>
              <Typography sx={{ fontSize: 10, color: colors.textDim, mt: 0.4 }} noWrap>
                {hasData ? formatModifiedDate(info?.modifiedDate) : "No files yet"}
              </Typography>
            </Paper>
          );
        })}
      </Stack>

      {/* Selected batch detail */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${colors.border}`,
          borderRadius: colors.radiusL,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface2,
          }}
        >
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary }}>
            {selectedSlot ? `${selectedSlot.label} Files` : "Batch Files"}
          </Typography>
          {selectedInfo && (
            <Chip
              label={`${selectedInfo.files.length} file${selectedInfo.files.length === 1 ? "" : "s"} • ${totalRows.toLocaleString()} rows`}
              size="small"
              sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: colors.accentDim, color: colors.accent }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Refresh batch list" arrow>
            <IconButton size="small" onClick={() => refetchBatches()} disabled={batchesLoading}>
              <RefreshRoundedIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 15 }} />}
            onClick={() => setDeltaOpen(true)}
            disabled={availableSlots.length < 2}
            sx={{ fontSize: 11.5, textTransform: "none", color: colors.textSecondary, border: `1px solid ${colors.border}` }}
          >
            Compare
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={
              downloading ? <CircularProgress size={13} color="inherit" /> : <FileDownloadRoundedIcon sx={{ fontSize: 15 }} />
            }
            onClick={handleDownload}
            disabled={!selectedInfo || downloading}
            sx={{ fontSize: 11.5, textTransform: "none", bgcolor: colors.accent }}
          >
            {downloading ? "Preparing…" : "Download Excel"}
          </Button>
        </Box>

        <Box sx={{ p: 2 }}>
          {batchesLoading ? (
            <Stack alignItems="center" py={3} spacing={1}>
              <CircularProgress size={22} sx={{ color: colors.accent }} />
              <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>Loading batches…</Typography>
            </Stack>
          ) : !selectedSlot ? (
            <Stack alignItems="center" py={3} spacing={1}>
              <StorageRoundedIcon sx={{ fontSize: 28, color: colors.textDim }} />
              <Typography sx={{ fontSize: 12.5, color: colors.textSecondary, fontWeight: 600 }}>
                No batch files available yet for this CRQ
              </Typography>
            </Stack>
          ) : headerLoading ? (
            <Stack alignItems="center" py={3} spacing={1}>
              <CircularProgress size={20} sx={{ color: colors.accent }} />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(headerRows ?? []).map((row) => (
                <Chip
                  key={row.entity}
                  label={`${row.entity}: ${row.cnt.toLocaleString()}`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 11.5,
                    fontWeight: 700,
                    bgcolor: colors.surface2,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              ))}
              {(headerRows ?? []).length === 0 && (
                <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
                  No rows found in this batch's files.
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      <ImpactDeltaDialog
        open={deltaOpen}
        onClose={() => setDeltaOpen(false)}
        crqNo={crqNo}
        availableSlots={availableSlots}
        colors={colors}
      />
    </Box>
  );
};

export default ImpactBatchExplorer;
