import React from "react";
import { Box, Typography } from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";

export const CrqEmptyState: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 340,
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.07)",
      borderRadius: "14px",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "18px",
        background: "#EEF2FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AccountTreeRoundedIcon sx={{ fontSize: 32, color: "#6366F1" }} />
    </Box>
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{ fontWeight: 600, color: "#1F2937", fontSize: 15 }}>
        No CRQ Selected
      </Typography>
      <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>
        Choose a Change Request above to view its journey flow.
      </Typography>
    </Box>
  </Box>
);
