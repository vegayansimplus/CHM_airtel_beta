import React from "react";
import { Box, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import type { Colors } from "../../../types/colorTypes";
import type { WorkflowStageId } from "../../../constants/workflowStages";
import { STEPPER_DONE } from "../constants/attributeUpdate.constants";

export interface StageStepDescriptor {
  id: WorkflowStageId;
  label: string;
  shortLabel: string;
}

interface AttributeStageStepperProps {
  stages: StageStepDescriptor[];
  selectedIndex: number;
  onSelectStage: (stageId: WorkflowStageId) => void;
  /** False renders a read-only progress strip (single-stage locked mode). */
  interactive?: boolean;
  colors: Colors;
}

/**
 * 7-stage stepper across the top of the Attribute Update dialog. Stages
 * before the selected one render as done (green check), the selected stage
 * is highlighted with an accent underline. When `interactive` is false the
 * strip only shows where the stage sits in the flow — clicks are disabled
 * and the other stages are dimmed.
 */
export const AttributeStageStepper: React.FC<AttributeStageStepperProps> = ({
  stages,
  selectedIndex,
  onSelectStage,
  interactive = true,
  colors,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
      bgcolor: colors.surface2,
      borderBottom: `1px solid ${colors.border}`,
      flexShrink: 0,
    }}
  >
    {stages.map((stage, index) => {
      const isActive = index === selectedIndex;
      const isDone = index < selectedIndex;

      return (
        <Box
          key={stage.id}
          onClick={interactive ? () => onSelectStage(stage.id) : undefined}
          sx={{
            textAlign: "center",
            px: 0.75,
            pt: 1.2,
            pb: 1,
            minWidth: 0,
            cursor: interactive ? "pointer" : "default",
            opacity: interactive || isActive ? 1 : 0.55,
            borderBottom: `3px solid ${isActive ? colors.accent : "transparent"}`,
            bgcolor: isActive ? colors.surface : "transparent",
            transition: "background 0.15s ease",
            "&:hover": interactive
              ? { bgcolor: isActive ? colors.surface : colors.trackOff }
              : undefined,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              mb: 0.5,
              fontSize: 12,
              fontWeight: 600,
              bgcolor: isDone
                ? STEPPER_DONE.bg
                : isActive
                  ? colors.accent
                  : colors.surface,
              border: `1.5px solid ${
                isDone
                  ? STEPPER_DONE.border
                  : isActive
                    ? colors.accent
                    : colors.border
              }`,
              color: isDone
                ? STEPPER_DONE.fg
                : isActive
                  ? "#fff"
                  : colors.textSecondary,
            }}
          >
            {isDone ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : index + 1}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              lineHeight: 1.35,
              px: 0.5,
              wordBreak: "break-word",
              fontWeight: isActive ? 600 : 400,
              color:
                isActive || isDone ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {stage.shortLabel}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

export default AttributeStageStepper;
