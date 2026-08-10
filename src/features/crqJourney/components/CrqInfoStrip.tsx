import React, { useCallback, useState } from "react";
import { Box, Typography, Divider, IconButton, Tooltip, Snackbar, useTheme } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
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
  const [copied, setCopied] = useState(false);
  const chip = statusChipColor(info.currentStatus, isDark);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(info.crqNo).then(() => setCopied(true));
  }, [info.crqNo]);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontFamily: "Roboto Mono, monospace", fontSize: 12.5, fontWeight: 700, color: theme.palette.primary.main, whiteSpace: "nowrap" }}>
            {info.crqNo}
          </Typography>
          <Tooltip title="Copy ID" placement="top" arrow>
            <IconButton size="small" onClick={handleCopy} sx={{ p: "2px", color: "text.disabled", "&:hover": { color: theme.palette.primary.main } }} aria-label="Copy CRQ ID">
              <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Box>
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

      <Snackbar
        open={copied}
        autoHideDuration={1600}
        onClose={() => setCopied(false)}
        message="CRQ ID copied"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{ sx: { fontSize: 12.5, minWidth: "unset", py: 0.5 } }}
      />
    </Box>
  );
};
