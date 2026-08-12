import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import type { Colors } from "../../../../types/colorTypes";
import type { BATCH_SLOTS } from "../../../../types/impactBatch.types";
import { useGetImpactBatchHeaderQuery } from "../../../../api/impactBatchApiSlice";

type BatchSlot = (typeof BATCH_SLOTS)[number];

interface ImpactDeltaDialogProps {
  open: boolean;
  onClose: () => void;
  crqNo: string | null;
  /** Only the slots that actually have files - the dialog never offers an empty batch. */
  availableSlots: readonly BatchSlot[];
  colors: Colors;
}

interface ComparisonRow {
  entity: string;
  cntA: number | null;
  cntB: number | null;
}

export const ImpactDeltaDialog: React.FC<ImpactDeltaDialogProps> = ({
  open,
  onClose,
  crqNo,
  availableSlots,
  colors,
}) => {
  const [batchA, setBatchA] = useState<number | null>(null);
  const [batchB, setBatchB] = useState<number | null>(null);

  const { data: dataA, isFetching: loadingA } = useGetImpactBatchHeaderQuery(
    { crqNo: crqNo as string, batchNo: batchA as number },
    { skip: !crqNo || !batchA },
  );
  const { data: dataB, isFetching: loadingB } = useGetImpactBatchHeaderQuery(
    { crqNo: crqNo as string, batchNo: batchB as number },
    { skip: !crqNo || !batchB },
  );

  const isLoading = loadingA || loadingB;

  const handleSelect = (batchNo: number) => {
    if (batchA === batchNo) return setBatchA(null);
    if (batchB === batchNo) return setBatchB(null);
    if (!batchA) return setBatchA(batchNo);
    if (!batchB) return setBatchB(batchNo);
    setBatchA(batchNo);
  };

  const labelFor = (batchNo: number | null): "A" | "B" | null =>
    batchNo === batchA ? "A" : batchNo === batchB ? "B" : null;

  const rows: ComparisonRow[] = useMemo(() => {
    if (!dataA && !dataB) return [];
    const mapA = new Map((dataA ?? []).map((d) => [d.entity, d.cnt]));
    const mapB = new Map((dataB ?? []).map((d) => [d.entity, d.cnt]));
    const entities = new Set([...mapA.keys(), ...mapB.keys()]);
    return Array.from(entities)
      .sort()
      .map((entity) => ({
        entity,
        cntA: mapA.has(entity) ? (mapA.get(entity) as number) : null,
        cntB: mapB.has(entity) ? (mapB.get(entity) as number) : null,
      }));
  }, [dataA, dataB]);

  const totalA = (dataA ?? []).reduce((s, d) => s + d.cnt, 0);
  const totalB = (dataB ?? []).reduce((s, d) => s + d.cnt, 0);
  const totalDelta = totalB - totalA;

  const handleClose = () => {
    setBatchA(null);
    setBatchB(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { borderRadius: colors.radiusXL, border: `1px solid ${colors.border}`, bgcolor: colors.surface },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <CompareArrowsRoundedIcon sx={{ fontSize: 18, color: colors.accent }} />
        <Typography sx={{ fontWeight: 800, fontSize: 14, color: colors.textPrimary }}>
          Batch Delta — {crqNo ?? "N/A"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: colors.textSecondary, letterSpacing: 0.4 }}>
            SELECT TWO BATCHES
          </Typography>
          <Chip
            label={!batchA ? "Pick Batch A" : !batchB ? "Pick Batch B" : "Ready to compare"}
            size="small"
            icon={batchA && batchB ? <CheckRoundedIcon sx={{ fontSize: 12 }} /> : undefined}
            sx={{
              height: 20,
              fontSize: 10.5,
              fontWeight: 700,
              bgcolor: batchA && batchB ? colors.successDim : colors.accentDim,
              color: batchA && batchB ? colors.success : colors.accent,
            }}
          />
          {(batchA || batchB) && (
            <Button
              size="small"
              startIcon={<SwapHorizRoundedIcon sx={{ fontSize: 13 }} />}
              onClick={() => {
                setBatchA(null);
                setBatchB(null);
              }}
              sx={{ fontSize: 11, textTransform: "none", color: colors.textSecondary }}
            >
              Clear
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          {availableSlots.map((slot) => {
            const label = labelFor(slot.batchNo);
            const isSelected = label !== null;
            const accent = label === "A" ? colors.accent : label === "B" ? colors.danger : colors.textSecondary;

            return (
              <Paper
                key={slot.key}
                elevation={0}
                onClick={() => handleSelect(slot.batchNo)}
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  border: `1.5px solid ${isSelected ? accent : colors.border}`,
                  bgcolor: isSelected ? alpha(accent, 0.08) : colors.surface,
                  borderRadius: colors.radiusL,
                  p: 1,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: isSelected ? accent : colors.textPrimary }}>
                  {label ? `${label} · ${slot.label}` : slot.label}
                </Typography>
              </Paper>
            );
          })}
        </Stack>

        {!batchA || !batchB ? (
          <Stack alignItems="center" py={4} spacing={1}>
            <CompareArrowsRoundedIcon sx={{ fontSize: 30, color: colors.textDim }} />
            <Typography sx={{ fontSize: 12.5, color: colors.textSecondary }}>
              Select two batches above to see the delta
            </Typography>
          </Stack>
        ) : isLoading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={24} sx={{ color: colors.accent }} />
          </Stack>
        ) : (
          <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: colors.radiusL, overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 110px 130px",
                px: 2,
                py: 1,
                bgcolor: colors.surface2,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: colors.textSecondary }}>ENTITY</Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: colors.accent, textAlign: "right" }}>
                BATCH A
              </Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: colors.danger, textAlign: "right" }}>
                BATCH B
              </Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: colors.textSecondary, textAlign: "right" }}>
                Δ DELTA
              </Typography>
            </Box>

            {rows.length === 0 && (
              <Box sx={{ p: 2.5, textAlign: "center" }}>
                <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
                  No data in either batch.
                </Typography>
              </Box>
            )}

            {rows.map((row, i) => {
              const delta = row.cntA !== null && row.cntB !== null ? row.cntB - row.cntA : null;
              const deltaColor =
                delta === null || delta === 0 ? colors.textDim : delta > 0 ? colors.success : colors.danger;
              const DeltaIcon =
                delta === null || delta === 0
                  ? TrendingFlatRoundedIcon
                  : delta > 0
                    ? TrendingUpRoundedIcon
                    : TrendingDownRoundedIcon;

              return (
                <Box
                  key={row.entity}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 110px 130px",
                    px: 2,
                    py: 1,
                    bgcolor: i % 2 === 0 ? colors.surface : colors.surface2,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>
                    {row.entity}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, textAlign: "right", fontFamily: "monospace" }}>
                    {row.cntA !== null ? row.cntA.toLocaleString() : "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, textAlign: "right", fontFamily: "monospace" }}>
                    {row.cntB !== null ? row.cntB.toLocaleString() : "—"}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.4 }}>
                    <DeltaIcon sx={{ fontSize: 13, color: deltaColor }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: deltaColor, fontFamily: "monospace" }}>
                      {delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toLocaleString()}`}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {rows.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 110px 110px 130px",
                  px: 2,
                  py: 1.1,
                  bgcolor: colors.surface2,
                  borderTop: `2px solid ${colors.border}`,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary }}>TOTAL</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: colors.accent, textAlign: "right", fontFamily: "monospace" }}>
                  {totalA.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: colors.danger, textAlign: "right", fontFamily: "monospace" }}>
                  {totalB.toLocaleString()}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    textAlign: "right",
                    fontFamily: "monospace",
                    color: totalDelta === 0 ? colors.textDim : totalDelta > 0 ? colors.success : colors.danger,
                  }}
                >
                  {totalDelta >= 0 ? "+" : ""}
                  {totalDelta.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Dialog>
  );
};

export default ImpactDeltaDialog;
