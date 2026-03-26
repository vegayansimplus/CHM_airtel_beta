/**
 * StatusPill.tsx
 * Animated status badge with a pulsing dot for "In Progress".
 * Fully driven by the useTabColorTokens colour system.
 */
import React from "react";
import { Box } from "@mui/material";
import type { Colors } from "../../types/colorTypes";

// ─── colour map ──────────────────────────────────────────────────────────────
const buildStatusCfg = (c: Colors) =>
  ({
    "In Progress": { bg: c.accentDim,              color: c.accent,         dot: c.accent,   pulse: true  },
    "Paused":      { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B",        dot: "#F59E0B",  pulse: false },
    "Completed":   { bg: c.successDim,             color: c.success,        dot: c.success,  pulse: false },
    "Canceled":    { bg: c.dangerDim,              color: c.danger,         dot: c.danger,   pulse: false },
    "canceled":    { bg: c.dangerDim,              color: c.danger,         dot: c.danger,   pulse: false },
    "cancel":      { bg: c.dangerDim,              color: c.danger,         dot: c.danger,   pulse: false },
  }) as Record<string, { bg: string; color: string; dot: string; pulse: boolean }>;

// ─── component ───────────────────────────────────────────────────────────────
interface StatusPillProps {
  value: string;
  colors: Colors;
}

export const StatusPill: React.FC<StatusPillProps> = ({ value, colors }) => {
  const cfg = buildStatusCfg(colors)[value] ?? {
    bg: colors.trackOff,
    color: colors.textSecondary,
    dot: colors.textDim,
    pulse: false,
  };

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.55,
        px: 1.1,
        py: 0.4,
        borderRadius: "6px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.25,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}28`,
        whiteSpace: "nowrap",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {/* Status dot — pulses when In Progress */}
      <Box
        component="span"
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
          ...(cfg.pulse && { animation: "pulseRing 1.8s ease infinite" }),
        }}
      />
      {value}
    </Box>
  );
};