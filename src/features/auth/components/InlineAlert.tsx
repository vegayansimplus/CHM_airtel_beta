import React from "react";
import { Box, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

type Tone = "error" | "warning";

const TONE_STYLES: Record<Tone, { bg: string; border: string; fg: string }> = {
  error: {
    bg: "rgba(226,75,74,0.06)",
    border: "rgba(226,75,74,0.2)",
    fg: "#C0392B",
  },
  warning: {
    bg: "rgba(234,179,8,0.06)",
    border: "rgba(234,179,8,0.22)",
    fg: "#92400E",
  },
};

interface Props {
  tone: Tone;
  children: React.ReactNode;
}

const InlineAlert: React.FC<Props> = ({ tone, children }) => {
  const s = TONE_STYLES[tone];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0.9,
        mb: 1.8,
        bgcolor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "8px",
        px: 1.2,
        py: 0.85,
      }}
    >
      <ErrorOutline sx={{ fontSize: 14, color: s.fg, mt: "1px" }} />
      <Typography
        sx={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: s.fg,
          fontSize: "11.5px",
          lineHeight: 1.5,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

export default InlineAlert;
