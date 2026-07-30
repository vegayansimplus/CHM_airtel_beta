import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { CrqDetailsInfo } from "../../types/crqJourney.types";
import { formatDateTime, formatStatusLabel, statusChipColor } from "../../utils/crqJourney.utils";

interface CrqDetailsInfoCardProps {
  info: CrqDetailsInfo;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
    <Typography sx={{ fontSize: 10.5, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary", wordBreak: "break-word" }}>
      {value}
    </Typography>
  </Box>
);

export const CrqDetailsInfoCard: React.FC<CrqDetailsInfoCardProps> = ({ info }) => {
  const theme = useTheme();
  const chip = statusChipColor(info.currentStatus);

  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        boxShadow: "0 1px 3px rgba(16,40,70,0.05)",
        overflow: "hidden",
      }}
    >
      {/* accent header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: chip.bg,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography sx={{ fontFamily: "Roboto Mono, monospace", fontSize: 15, fontWeight: 700, color: "#1565C0" }}>
          {info.crqNo}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: 11.5,
            fontWeight: 700,
            color: chip.color,
            background: theme.palette.background.paper,
            border: `1px solid ${chip.color}33`,
            borderRadius: "999px",
            px: "10px",
            py: "3px",
          }}
        >
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: chip.dot }} />
          {formatStatusLabel(info.currentStatus)}
        </Box>
        <Typography sx={{ ml: "auto", fontSize: 12, color: "text.secondary" }}>
          Current stage: <strong>{info.currentStage}</strong>
        </Typography>
      </Box>

      {/* field grid */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 2.5,
        }}
      >
        <Field label="Team Function" value={info.teamFunction ?? "—"} />
        <Field label="Team Sub-Function" value={info.teamSubFunction ?? "—"} />
        <Field label="Created On" value={formatDateTime(info.createdDate)} />
        <Field label="Remark" value={info.remark?.trim() ? info.remark : "—"} />
      </Box>
    </Box>
  );
};
