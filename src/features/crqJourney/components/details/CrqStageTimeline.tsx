import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import type { CrqDetailsStage } from "../../types/crqJourney.types";
import { formatDateTime, formatStageCode, formatStatusLabel, normalizeStepStatus, STEP_STATUS_CONFIG } from "../../utils/crqJourney.utils";
import { StatusIcon } from "../StepStatusBadge";

interface CrqStageTimelineProps {
  stages: CrqDetailsStage[];
}

const MetaRow = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Icon sx={{ fontSize: 14, color: "text.disabled" }} />
    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{children}</Typography>
  </Box>
);

export const CrqStageTimeline: React.FC<CrqStageTimelineProps> = ({ stages }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        boxShadow: "0 1px 3px rgba(16,40,70,0.05)",
        p: "20px 24px",
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "text.primary", mb: 2.5 }}>
        Workflow Timeline
      </Typography>

      <Box>
        {stages.map((stage, idx) => {
          const status = normalizeStepStatus(stage.isCurrent ? stage.stageStatus : stage.stageStatus);
          const cfg = STEP_STATUS_CONFIG[status];
          const isLast = idx === stages.length - 1;
          const hasActivity = stage.assignedTo || stage.performedBy || stage.assignStart || stage.stageStartDate;

          return (
            <Box key={stage.stage} sx={{ display: "flex", gap: 2 }}>
              {/* node + connector */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <StatusIcon status={status} size={26} />
                {!isLast && (
                  <Box
                    sx={{
                      width: "2px",
                      flexGrow: 1,
                      minHeight: 28,
                      background: status === "completed" ? cfg.color : theme.palette.divider,
                      my: "4px",
                    }}
                  />
                )}
              </Box>

              {/* content */}
              <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: stage.isCurrent ? 700 : 600, color: stage.isCurrent ? "#1565C0" : "text.primary" }}>
                    {formatStageCode(stage.stage)}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: cfg.color,
                      background: cfg.bgColor,
                      border: `1px solid ${cfg.color}33`,
                      borderRadius: "999px",
                      px: "8px",
                      py: "1px",
                    }}
                  >
                    {formatStatusLabel(stage.stageStatus)}
                  </Box>
                  {stage.isCurrent && (
                    <Box
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.4px",
                        color: "#1565C0",
                        background: "#E8F1FC",
                        borderRadius: "999px",
                        px: "8px",
                        py: "1px",
                      }}
                    >
                      CURRENT
                    </Box>
                  )}
                </Box>

                {hasActivity ? (
                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
                    {stage.assignedTo && <MetaRow icon={PersonRoundedIcon}>Assigned to {stage.assignedTo}</MetaRow>}
                    {stage.performedBy && <MetaRow icon={EngineeringRoundedIcon}>Performed by {stage.performedBy}</MetaRow>}
                    {(stage.assignStart || stage.assignEnd) && (
                      <MetaRow icon={ScheduleRoundedIcon}>
                        Assigned {formatDateTime(stage.assignStart)} → {formatDateTime(stage.assignEnd)}
                      </MetaRow>
                    )}
                    {(stage.stageStartDate || stage.stageEndDate) && (
                      <MetaRow icon={ScheduleRoundedIcon}>
                        Active {formatDateTime(stage.stageStartDate)} → {formatDateTime(stage.stageEndDate)}
                      </MetaRow>
                    )}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.5, fontStyle: "italic" }}>
                    No activity yet
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
