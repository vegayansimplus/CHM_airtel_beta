import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
  useTheme,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { useActivity } from "../../../hooks/useActivity";
import { useGetActivityPhaseViewQuery } from "../../../api/acitivityApiSlice";
import { ImpactBadge } from "../shared/badges";
import { PHASE_CONFIGS } from "../shared/phaseFieldConfigs";
import { PhaseSummaryTab } from "./PhaseSummaryTab";
import type { ExecutionConfig, PhaseConfig } from "../../../types/activity.types";

const isPhaseComplete = (phase: PhaseConfig | ExecutionConfig | null | undefined): boolean =>
  !!phase && !!phase.shift && !!phase.minimumLevelRequirement;

export const ConfigurePhases: React.FC = () => {
  const { selectedPlanId, selectedActivityId, activePhaseTab, changePhaseTab, goToList } =
    useActivity();
  const theme = useTheme();

  const {
    data,
    isLoading,
    isError,
  } = useGetActivityPhaseViewQuery(
    { planId: selectedPlanId as number },
    { skip: selectedPlanId === null },
  );

  if (selectedPlanId === null) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No activity selected.</Typography>
        <Button sx={{ mt: 2 }} onClick={goToList} variant="outlined">
          Close
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to load phase details for this plan.</Alert>
        <Button sx={{ mt: 2 }} onClick={goToList} variant="outlined">
          Close
        </Button>
      </Box>
    );
  }

  const entry = data.activities.find((a) => a.activityId === selectedActivityId);

  if (!entry) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          This activity was not found in the plan's phase data.
        </Typography>
        <Button sx={{ mt: 2 }} onClick={goToList} variant="outlined">
          Close
        </Button>
      </Box>
    );
  }

  const completedCount = PHASE_CONFIGS.filter(({ viewKey }) =>
    isPhaseComplete(viewKey === "execution" ? entry.execution : entry.phases[viewKey as keyof typeof entry.phases]),
  ).length;

  const activeConfig = PHASE_CONFIGS.find((p) => p.viewKey === activePhaseTab) ?? PHASE_CONFIGS[0];
  const activePhase =
    activeConfig.viewKey === "execution"
      ? entry.execution
      : entry.phases[activeConfig.viewKey as keyof typeof entry.phases];

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {entry.activityName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {entry.activityId} · Plan #{selectedPlanId}
          </Typography>
        </Box>
        <IconButton size="small" onClick={goToList}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, backgroundColor: theme.palette.background.default }}>
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2,
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor:
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              alignItems: "center",
            }}
          >
            {[
              ["Domain", data.basicInfo.domain],
              ["Layer", data.basicInfo.layer],
              ["Plan", data.basicInfo.planType],
              ["Vendor", data.basicInfo.vendorOem],
              ["CHM Domain", data.basicInfo.chmDomain],
            ].map(([label, val]) => (
              <Box key={label} sx={{ display: "flex", gap: 0.4, alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {label}:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {val}
                </Typography>
              </Box>
            ))}
            <ImpactBadge value={data.basicInfo.changeImpact} size="md" label="Impact: " />
            <Box sx={{ ml: "auto" }}>
              <Typography variant="caption" color="text.secondary">
                Phases configured:{" "}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color={completedCount === PHASE_CONFIGS.length ? "success.main" : "text.primary"}
              >
                {completedCount}/{PHASE_CONFIGS.length}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
            <Tabs
              value={activeConfig.viewKey}
              onChange={(_, v) => changePhaseTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                px: 1,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: 13, minHeight: 44 },
                "& .Mui-selected": { fontWeight: 600, color: theme.palette.primary.main },
              }}
            >
              {PHASE_CONFIGS.map(({ viewKey, label }) => {
                const phase = viewKey === "execution" ? entry.execution : entry.phases[viewKey as keyof typeof entry.phases];
                return (
                  <Tab
                    key={viewKey}
                    value={viewKey}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {isPhaseComplete(phase) ? (
                          <CheckCircleIcon sx={{ fontSize: 14, color: "success.main" }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        )}
                        {label}
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              <PhaseSummaryTab
                title={activeConfig.label}
                phase={activePhase}
                hasMargins={activeConfig.variant === "full"}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
};
