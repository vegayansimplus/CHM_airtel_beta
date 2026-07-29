import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import type { CrqJourneyStageRow } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG, formatStatusLabel, normalizeStepStatus } from "../utils/crqJourney.utils";
import { StatusIcon, StepStatusBadge } from "./StepStatusBadge";

const STAGE_ICON_MAP: Record<string, React.ElementType> = {
  "SPOC/FE ASSIGNMENT": GroupsRoundedIcon,
  VALIDATE: AssignmentTurnedInRoundedIcon,
  "IMPACT ANALYSIS": BarChartRoundedIcon,
  "MOP CREATE": DescriptionRoundedIcon,
  "MOP VALIDATE": DescriptionRoundedIcon,
  SCHEDULING: CalendarMonthRoundedIcon,
  IMPLEMENTATION: BuildRoundedIcon,
  CLOSURE: CheckCircleOutlineRoundedIcon,
};

interface StageCardProps {
  stage: CrqJourneyStageRow;
  compact?: boolean;
}

/** Single canonical/assignment stage — used for every fixed (non-dynamic) slot in the journey flow. */
export const StageCard: React.FC<StageCardProps> = ({ stage, compact = false }) => {
  const status = normalizeStepStatus(stage.status);
  const cfg = STEP_STATUS_CONFIG[status];
  const Icon = STAGE_ICON_MAP[stage.stage.toUpperCase()] ?? FlagRoundedIcon;
  const isActive = status === "in_progress";

  return (
    <Paper
      elevation={0}
      sx={{
        width: compact ? 132 : 148,
        minHeight: isActive ? 90 : 80,
        border: `${isActive ? "1.6px" : "1.5px"} solid ${cfg.borderColor}`,
        borderRadius: "11px",
        p: "11px 12px",
        position: "relative",
        background: isActive ? "linear-gradient(180deg, #F2F7FE, #E7F0FD)" : "#fff",
        boxShadow: isActive ? "0 4px 16px rgba(25,118,210,0.18)" : "none",
        transition: "box-shadow 0.2s",
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.1 }}>
        <Icon sx={{ fontSize: 19, color: cfg.color, flexShrink: 0, mt: "1px" }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 700 : 600, color: isActive ? "#1565C0" : "#1F2937", lineHeight: 1.25 }}>
          {stage.stage}
        </Typography>
      </Box>

      <StepStatusBadge status={status} label={formatStatusLabel(stage.status)} />

      <Box sx={{ position: "absolute", right: 10, bottom: 10 }}>
        <StatusIcon status={status} size={20} />
      </Box>
    </Paper>
  );
};
