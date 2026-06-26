import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import type { MopStep } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";
import { StatusIcon, StepStatusBadge } from "./StepStatusBadge";

interface MopStepCardProps {
  step: MopStep;
}

export const MopStepCard: React.FC<MopStepCardProps> = ({ step }) => {
  const cfg = STEP_STATUS_CONFIG[step.status];
  const isActive = step.status === "in_progress";

  return (
    <Paper
      elevation={0}
      sx={{
        width: 142,
        minHeight: isActive ? 90 : 80,
        border: `${isActive ? "1.6px" : "1.5px"} solid ${cfg.borderColor}`,
        borderRadius: "12px",
        p: "13px 13px 12px",
        position: "relative",
        background: isActive
          ? "linear-gradient(180deg, #F2F7FE, #E7F0FD)"
          : "#fff",
        overflow: "hidden",
        boxShadow: isActive
          ? "0 4px 16px rgba(25,118,210,0.18)"
          : "none",
        animation: isActive ? "crqBlueGlow 2.6s ease-in-out infinite" : "none",
        "@keyframes crqBlueGlow": {
          "0%, 100%": { boxShadow: "0 4px 14px rgba(25,118,210,0.16)" },
          "50%": { boxShadow: "0 6px 22px rgba(25,118,210,0.34)" },
        },
        transition: "box-shadow 0.2s",
      }}
    >
      {/* animated top bar */}
      {isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg,#1976D2,#7DB1F2,#1976D2)",
            backgroundSize: "200% 100%",
            animation: "crqSlide 2.2s linear infinite",
            "@keyframes crqSlide": {
              to: { backgroundPosition: "200% 0" },
            },
          }}
        />
      )}

      {/* shimmer */}
      {isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "48%",
            background:
              "linear-gradient(100deg,transparent,rgba(255,255,255,0.6),transparent)",
            animation: "crqShimmer 2.6s ease-in-out infinite",
            "@keyframes crqShimmer": {
              "0%": { transform: "translateX(-130%)" },
              "55%, 100%": { transform: "translateX(260%)" },
            },
            pointerEvents: "none",
          }}
        />
      )}

      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 1.1,
        }}
      >
        <DescriptionRoundedIcon
          sx={{ fontSize: 19, color: cfg.color, flexShrink: 0 }}
        />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: isActive ? 700 : 600,
            color: isActive ? "#1565C0" : "#1F2937",
          }}
        >
          {step.label}
        </Typography>
      </Box>

      <StepStatusBadge status={step.status} />

      <Box sx={{ position: "absolute", right: 11, bottom: 11 }}>
        <StatusIcon status={step.status} size={isActive ? 22 : 20} />
      </Box>
    </Paper>
  );
};
