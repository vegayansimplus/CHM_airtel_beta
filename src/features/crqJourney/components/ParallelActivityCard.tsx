import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import type { ParallelActivityStep } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";
import { StatusIcon, StepStatusBadge } from "./StepStatusBadge";

const ICON_MAP: Record<string, React.ElementType> = {
  team:      GroupsRoundedIcon,
  tools:     BuildRoundedIcon,
  clipboard: AssignmentTurnedInRoundedIcon,
  chart:     BarChartRoundedIcon,
};

interface ParallelActivityCardProps {
  step: ParallelActivityStep;
}

export const ParallelActivityCard: React.FC<ParallelActivityCardProps> = ({ step }) => {
  const cfg = STEP_STATUS_CONFIG[step.status];
  const Icon = ICON_MAP[step.iconType] ?? GroupsRoundedIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 140,
        minHeight: 80,
        border: `1.5px solid ${cfg.borderColor}`,
        borderRadius: "11px",
        p: "11px 12px",
        position: "relative",
        background: "#fff",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.1 }}>
        <Icon sx={{ fontSize: 19, color: cfg.color, flexShrink: 0, mt: "1px" }} />
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "#1F2937",
            lineHeight: 1.25,
          }}
        >
          {step.label}
        </Typography>
      </Box>

      <StepStatusBadge status={step.status} />

      <Box sx={{ position: "absolute", right: 10, bottom: 10 }}>
        <StatusIcon status={step.status} size={20} />
      </Box>
    </Paper>
  );
};
