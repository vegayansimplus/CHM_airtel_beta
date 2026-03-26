/**
 * DetailPanel.tsx
 * Expandable detail panel shown beneath a plan row in MaterialReactTable.
 * Renders a list of CrqCard components for the plan's CRQs.
 */
import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import type { Colors } from "../../types/colorTypes";
import { CrqCard } from "./CrqCard";

// import { CrqCard }     from "./CrqCard";
// import type { Colors } from "./colorTypes";

// ─────────────────────────────────────────────────────────────────────────────
interface DetailPanelProps {
  plan: any;
  openCrqs: Record<string, boolean>;
  selectedCrq: any | null;
  colors: Colors;
  onToggle: (crqNo: string) => void;
  onSelect: (crq: any | null) => void;
  onStartPause: (crq: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export const DetailPanel: React.FC<DetailPanelProps> = ({
  plan,
  openCrqs,
  selectedCrq,
  colors,
  onToggle,
  onSelect,
  onStartPause,
}) => (
  <Box
    sx={{
      width: "100%",
      p: 2,
      bgcolor: colors.isDark
        ? "rgba(0,0,0,0.20)"
        : "rgba(248,250,252,0.92)",
      borderTop: `1px solid ${colors.border}`,
    }}
  >
    {/* ── Section heading ─────────────────────────────────────────────────── */}
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.8 }}>
      {/* Gradient accent bar */}
      <Box
        sx={{
          width: 3,
          height: 16,
          borderRadius: 99,
          background: `linear-gradient(180deg, ${colors.accent}, ${colors.info})`,
        }}
      />

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.55,
          color: colors.textSecondary,
          textTransform: "uppercase",
        }}
      >
        CRQs
      </Typography>

      <Chip
        label={plan.crqs?.length ?? 0}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 800,
          bgcolor: colors.accentDim,
          color: colors.accent,
          border: `1px solid ${colors.accentBorder}`,
          "& .MuiChip-label": { px: 0.8 },
        }}
      />

      <Typography
        sx={{
          fontSize: 12,
          color: colors.textDim,
          fontFamily: "monospace",
        }}
      >
        › {plan.planNumber}
      </Typography>
    </Stack>

    {/* ── Empty state ─────────────────────────────────────────────────────── */}
    {!plan.crqs?.length ? (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: `1px dashed ${colors.border}`,
          borderRadius: colors.radiusL,
        }}
      >
        <TableRowsRoundedIcon
          sx={{ fontSize: 28, mb: 1, color: colors.textDim, opacity: 0.5 }}
        />
        <Typography sx={{ fontSize: 13, color: colors.textDim }}>
          No CRQs found.
        </Typography>
      </Box>
    ) : (
      /* ── CRQ cards ──────────────────────────────────────────────────────── */
      plan.crqs.map((crq: any) => (
        <CrqCard
          key={crq.crqNo}
          crq={crq}
          plan={plan}
          colors={colors}
          isOpen={!!openCrqs[crq.crqNo]}
          isSelected={selectedCrq?.crqNo === crq.crqNo}
          onToggle={() => onToggle(crq.crqNo)}
          onSelect={() =>
            onSelect(
              selectedCrq?.crqNo === crq.crqNo
                ? null
                : { ...crq, planNumber: plan.planNumber }
            )
          }
          onStartPause={() => onStartPause(crq)}
        />
      ))
    )}
  </Box>
);