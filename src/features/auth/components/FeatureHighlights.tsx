import React from "react";
import { Box, Typography } from "@mui/material";

const FEATURES = [
  "Real-time change request tracking with automated approvals",
  "Role-based access control with fine-grained permissions",
  "Full audit trail, impact scoring, and analytics dashboard",
  "Signed session tokens validated server-side on every request",
];

const FeatureRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.2,
      animation: `lp-fadeUp 0.6s ${delay}s both`,
    }}
  >
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        bgcolor: "rgba(24,95,165,0.1)",
        border: "1px solid rgba(24,95,165,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: "1px",
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#185FA5" }} />
    </Box>
    <Typography
      sx={{
        fontSize: "12.5px",
        color: "rgba(12,27,46,0.5)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.6,
      }}
    >
      {text}
    </Typography>
  </Box>
);

const FeatureHighlights: React.FC = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
    {FEATURES.map((text, i) => (
      <FeatureRow key={text} text={text} delay={0.42 + i * 0.04} />
    ))}
  </Box>
);

export default FeatureHighlights;
