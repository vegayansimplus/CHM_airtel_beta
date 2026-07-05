import React from "react";
import { Box, Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { Colors } from "../../types/colorTypes";
import type { Crq, Plan } from "../../types/crqWorkflow.types";
import { WORKFLOW_STAGES, resolveCurrentStageIndex, resolveStageState } from "../../constants/workflowStages";

interface CrqWorkflowSidebarProps {
  plans: Plan[];
  expPlans: Record<string, boolean>;
  expCrqs: Record<string, boolean>;
  selectedCrqNo: string | null;
  onTogglePlan: (planNumber: string) => void;
  onToggleCrq: (crqNo: string) => void;
  onSelectCrq: (crq: Crq, planNumber: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  colors: Colors;
}

/** Per-CRQ status dot + chip, matching the reference tree row's status
 * indicator - derived from the same resolveStageState the stage rail uses. */
const crqStatusMeta = (crq: Crq, colors: Colors) => {
  const idx = resolveCurrentStageIndex(crq);
  const state = resolveStageState(crq, idx, idx);
  if (state === "completed") {
    return { dot: colors.success, chipBg: colors.successDim, chipFg: colors.success, chipLabel: "Done" };
  }
  if (state === "in_progress") {
    return { dot: colors.accent, chipBg: colors.infoDim, chipFg: colors.info, chipLabel: "In Progress" };
  }
  if (state === "failed") {
    return { dot: colors.danger, chipBg: colors.dangerDim, chipFg: colors.danger, chipLabel: "Failed" };
  }
  return { dot: colors.textDim, chipBg: colors.trackOff, chipFg: colors.textDim, chipLabel: "Paused" };
};

/**
 * Left Plan -> CRQ -> Task tree for the CRQ workflow cockpit. Reads/writes
 * the same plans/expand-state shape the rest of the scheduler feature
 * already uses (Plan.crqs[].tasks[]) - purely a navigation view, no
 * business logic of its own.
 */
export const CrqWorkflowSidebar: React.FC<CrqWorkflowSidebarProps> = ({
  plans,
  expPlans,
  expCrqs,
  selectedCrqNo,
  onTogglePlan,
  onToggleCrq,
  onSelectCrq,
  searchValue,
  onSearchChange,
  colors,
}) => (
  <Box
    sx={{
      flex: "0 0 328px",
      bgcolor: colors.surface,
      borderRight: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    }}
  >
    <Box sx={{ p: "13px 14px 11px", borderBottom: `1px solid ${colors.border}` }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search plans, CRQs, tasks…"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 15, color: colors.textDim }} />
            </InputAdornment>
          ),
          sx: { fontSize: 13, borderRadius: "9px", bgcolor: colors.trackOff },
        }}
      />
    </Box>

    <Box sx={{ flex: 1, overflowY: "auto", p: 1.2 }}>
      {plans.map((plan) => {
        const isPlanOpen = !!expPlans[plan.planNumber];
        const crqs = plan.crqs ?? [];
        return (
          <Box
            key={plan.planNumber}
            sx={{
              mb: 1,
              border: `1px solid ${colors.border}`,
              borderRadius: colors.radiusL,
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.1}
              onClick={() => onTogglePlan(plan.planNumber)}
              sx={{
                px: 1.5,
                py: 1.2,
                cursor: "pointer",
                bgcolor: colors.trackOff,
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: colors.surface2 },
              }}
            >
              <ChevronRightRoundedIcon
                className={`expand-chevron${isPlanOpen ? " open" : ""}`}
                sx={{ fontSize: 16, color: colors.textDim }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 9.5,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: colors.textDim,
                    fontWeight: 800,
                  }}
                >
                  Plan · {crqs.length} {crqs.length === 1 ? "CRQ" : "CRQs"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    mt: 0.2,
                    wordBreak: "break-all",
                  }}
                >
                  {plan.planNumber}
                </Typography>
              </Box>
              <Chip
                label={plan.planType}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: colors.surface,
                  border: `1px solid ${colors.accentBorder}`,
                  color: colors.accent,
                  whiteSpace: "nowrap",
                }}
              />
            </Stack>

            {isPlanOpen && (
              <Box sx={{ p: "6px 8px 8px" }}>
                {crqs.map((crq) => {
                  const isSelected = crq.crqNo === selectedCrqNo;
                  const isCrqOpen = !!expCrqs[crq.crqNo];
                  const tasks = crq.tasks ?? [];
                  const stageIdx = resolveCurrentStageIndex(crq);
                  const statusMeta = crqStatusMeta(crq, colors);
                  return (
                    <Box key={crq.crqNo} sx={{ mt: 0.5 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => onSelectCrq(crq, plan.planNumber)}
                        sx={{
                          px: 1.2,
                          py: 1.1,
                          borderRadius: "9px",
                          cursor: "pointer",
                          border: `1px solid ${isSelected ? colors.accentBorder : "transparent"}`,
                          bgcolor: isSelected ? colors.accentDim : "transparent",
                        }}
                      >
                        <ChevronRightRoundedIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCrq(crq.crqNo);
                          }}
                          className={`expand-chevron${isCrqOpen ? " open" : ""}`}
                          sx={{ fontSize: 15, color: colors.textDim }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: 600,
                              color: colors.textPrimary,
                            }}
                            noWrap
                          >
                            {crq.crqNo}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mt: 0.3 }}>
                            <FiberManualRecordIcon
                              className={statusMeta.chipLabel === "In Progress" ? "status-pulse-dot" : undefined}
                              sx={{ fontSize: 7, color: statusMeta.dot }}
                            />
                            <Typography
                              sx={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600 }}
                              noWrap
                            >
                              {WORKFLOW_STAGES[stageIdx].shortLabel}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box
                          sx={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            px: "8px",
                            py: "2px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap",
                            bgcolor: statusMeta.chipBg,
                            color: statusMeta.chipFg,
                          }}
                        >
                          {statusMeta.chipLabel}
                        </Box>
                      </Stack>

                      {isCrqOpen && (
                        <Box
                          sx={{
                            ml: 2.5,
                            mt: 0.4,
                            mb: 0.5,
                            pl: 1.2,
                            borderLeft: `1.5px dashed ${colors.border}`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 9.5,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              color: colors.textDim,
                              fontWeight: 800,
                              py: 0.5,
                            }}
                          >
                            Tasks · {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                          </Typography>
                          {tasks.map((t) => (
                            <Box key={t.taskId} sx={{ display: "flex", gap: 1, py: 0.6, px: 0.5 }}>
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  bgcolor: colors.border,
                                  mt: 0.6,
                                  flexShrink: 0,
                                }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontFamily: "monospace",
                                    fontSize: 10.5,
                                    color: colors.textSecondary,
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {t.taskId}
                                </Typography>
                                <Typography sx={{ fontSize: 10.5, color: colors.textDim, fontWeight: 600 }}>
                                  {t.taskActivity || t.planActivityDetails || "—"}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                          {!tasks.length && (
                            <Typography sx={{ fontSize: 11, color: colors.textDim, py: 0.5 }}>
                              No tasks.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}
                {!crqs.length && (
                  <Typography sx={{ fontSize: 12, color: colors.textDim, p: 1 }}>
                    No CRQs found.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      })}
      {!plans.length && (
        <Typography sx={{ fontSize: 12, color: colors.textDim, p: 2, textAlign: "center" }}>
          No plans found.
        </Typography>
      )}
    </Box>
  </Box>
);

export default CrqWorkflowSidebar;
