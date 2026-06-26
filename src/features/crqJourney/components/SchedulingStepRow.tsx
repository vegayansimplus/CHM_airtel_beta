import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import type { SchedulingStep } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";

const ICON_MAP: Record<string, React.ElementType> = {
  calendar: CalendarMonthRoundedIcon,
  team:     GroupsRoundedIcon,
  shield:   SecurityRoundedIcon,
  check:    AssignmentTurnedInRoundedIcon,
};

interface SchedulingStepRowProps {
  step: SchedulingStep;
}

export const SchedulingStepRow: React.FC<SchedulingStepRowProps> = ({ step }) => {
  const cfg = STEP_STATUS_CONFIG[step.status];
  const Icon = ICON_MAP[step.iconType] ?? CalendarMonthRoundedIcon;
  const isPending = step.status === "pending";

  return (
    <Paper
      elevation={0}
      sx={{
        width: 148,
        height: 60,
        border: `1.5px solid ${cfg.borderColor}`,
        borderRadius: "11px",
        px: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        background: "#fff",
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "8px",
          background: cfg.bgColor,
          color: cfg.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1F2937", lineHeight: 1.2 }}>
          {step.label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            mt: "3px",
          }}
        >
          {isPending && (
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: cfg.color,
                animation: "crqPulse 1.6s ease-in-out infinite",
                "@keyframes crqPulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
          )}
          <Typography sx={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>
            {cfg.label}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
