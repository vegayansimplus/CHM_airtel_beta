import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { Colors } from "../../types/colorTypes";
import type { Crq } from "../../types/crqWorkflow.types";
import {
  WORKFLOW_STAGES,
  resolveStageState,
  stageStatePalette,
  type WorkflowStageId,
} from "../../constants/workflowStages";

interface StageRailProps {
  crq: Crq;
  currentStageIndex: number;
  selectedStageId: WorkflowStageId;
  onSelectStage: (stageId: WorkflowStageId) => void;
  colors: Colors;
}

/** Horizontal 7-stage navigator - one card per WORKFLOW_STAGES entry. */
export const StageRail: React.FC<StageRailProps> = ({
  crq,
  currentStageIndex,
  selectedStageId,
  onSelectStage,
  colors,
}) => (
  <Box sx={{ bgcolor: colors.trackOff, borderBottom: `1px solid ${colors.border}`, px: 2, py: 1 }}>
    <Stack direction="row" spacing={0.85} sx={{ overflowX: "auto", pb: 0.4 }}>
      {WORKFLOW_STAGES.map((stage, idx) => {
        const state = resolveStageState(crq, idx, currentStageIndex);
        const isSelected = stage.id === selectedStageId;
        const clickable = idx <= currentStageIndex;

        const palette = stageStatePalette(state, colors);
        const chipLabel = palette.label;

        return (
          <Box
            key={stage.id}
            onClick={() => clickable && onSelectStage(stage.id)}
            sx={{
              flex: "0 0 144px",
              p: "8px 12px",
              borderRadius: colors.radius,
              border: `1.5px solid ${isSelected ? colors.accent : colors.border}`,
              bgcolor: colors.surface,
              cursor: clickable ? "pointer" : "not-allowed",
              boxShadow: isSelected ? `0 4px 14px ${colors.accentBorder}` : "0 1px 2px rgba(20,30,50,0.03)",
              transition: "all 0.16s ease",
              "&:hover": clickable && !isSelected ? { borderColor: colors.borderHover, transform: "translateY(-2px)" } : undefined,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                  className={state === "in_progress" ? "status-pulse-dot" : undefined}
                  sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: palette.dot }}
                />
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: colors.textDim, fontFamily: "monospace" }}>
                  S{idx + 1}
                </Typography>
              </Stack>
              <Box
                sx={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  px: "8px",
                  py: "2px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                  bgcolor: palette.bg,
                  color: palette.fg,
                }}
              >
                {chipLabel}
              </Box>
            </Stack>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: state === "locked" ? colors.textDim : colors.textPrimary,
                mt: 0.6,
                lineHeight: 1.15,
              }}
            >
              {stage.shortLabel}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  </Box>
);

export default StageRail;
