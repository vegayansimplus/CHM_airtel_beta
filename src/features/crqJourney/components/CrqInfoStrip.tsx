import React from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import type { CrqJourneySearchRow } from "../types/crqJourney.types";
import { formatDateTime, formatStatusLabel, statusChipColor } from "../utils/crqJourney.utils";

interface CrqInfoStripProps {
  info: CrqJourneySearchRow;
}

const MetaItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
    <Typography sx={{ fontSize: 10, color: "text.disabled", whiteSpace: "nowrap", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.4px" }}>
      {label}
    </Typography>
    {children}
  </Box>
);

export const CrqInfoStrip: React.FC<CrqInfoStripProps> = ({ info }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const chip = statusChipColor(info.currentStatus, isDark);

  const dividerSx = { mx: 0.25, my: 0.25, alignSelf: "stretch" };

  return (
    <Box
      sx={{
        px: 2,
        py: "10px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "nowrap",
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <MetaItem label="CRQ ID">
        <Typography sx={{ fontFamily: "Roboto Mono, monospace", fontSize: 12.5, fontWeight: 700, color: theme.palette.primary.main, whiteSpace: "nowrap" }}>
          {info.crqNo}
        </Typography>
      </MetaItem>

      <Divider orientation="vertical" flexItem sx={dividerSx} />

      <MetaItem label="Current Stage">
        <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", color: "text.primary" }}>
          {info.currentStage}
        </Typography>
      </MetaItem>

      <Divider orientation="vertical" flexItem sx={dividerSx} />

      <MetaItem label="Status">
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: 22,
            fontSize: 11,
            fontWeight: 600,
            background: chip.bg,
            color: chip.color,
            border: `1px solid ${chip.color}28`,
            borderRadius: "11px",
            px: "9px",
            whiteSpace: "nowrap",
          }}
        >
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: chip.dot, flexShrink: 0 }} />
          {formatStatusLabel(info.currentStatus)}
        </Box>
      </MetaItem>

      <Divider orientation="vertical" flexItem sx={dividerSx} />

      <MetaItem label="Entered Stage At">
        <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "text.secondary" }}>
          <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>
            {formatDateTime(info.enteredCurrentStageAt)}
          </Typography>
        </Box>
      </MetaItem>
    </Box>
  );
};
