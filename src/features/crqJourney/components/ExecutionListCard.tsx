import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface ExecutionListCardProps {
  icon: React.ElementType;
  label: string;
  statusLabel: string;
  color: string;
  muted?: boolean;
}

/** Compact monochrome-bordered card used inside the dashed Execution box. */
export const ExecutionListCard: React.FC<ExecutionListCardProps> = ({ icon: Icon, label, statusLabel, color, muted }) => (
  <Paper elevation={0} sx={{ border: "1.5px solid #DBE6F2", borderRadius: "10px", p: "10px 11px", position: "relative", background: "#fff" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
      <Icon sx={{ fontSize: 16, color: "#64748B", flexShrink: 0, mt: "1px" }} />
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", lineHeight: 1.25 }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: 11, color, mt: 0.75, pl: "24px", fontWeight: muted ? 400 : 500 }}>{statusLabel}</Typography>
    <Box
      sx={{
        position: "absolute",
        right: 9,
        bottom: 9,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: muted ? "#CBD5E1" : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
    </Box>
  </Paper>
);
