import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface RowCardProps {
  icon: React.ElementType;
  label: string;
  statusLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pulse?: boolean;
}

/** Horizontal icon-left row card — matches the original Scheduling-column card style. */
export const RowCard: React.FC<RowCardProps> = ({ icon: Icon, label, statusLabel, color, bgColor, borderColor, pulse }) => (
  <Paper
    elevation={0}
    sx={{
      width: 148,
      height: 60,
      border: `1.5px solid ${borderColor}`,
      borderRadius: "11px",
      px: 1.5,
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      background: "#fff",
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        background: bgColor,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1F2937", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: "3px" }}>
        {pulse && (
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              animation: "crqPulse 1.6s ease-in-out infinite",
              "@keyframes crqPulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
            }}
          />
        )}
        <Typography sx={{ fontSize: 11, color, fontWeight: 500, whiteSpace: "nowrap" }}>{statusLabel}</Typography>
      </Box>
    </Box>
  </Paper>
);
