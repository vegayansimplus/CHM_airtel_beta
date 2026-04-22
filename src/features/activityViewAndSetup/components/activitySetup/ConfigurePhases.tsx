import React from "react";
import {
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
  useTheme,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { useActivity } from "../../hooks/useActivity";
import { ImpactChip, StatusChip } from "./shared/ActivityShared";
import {
  ReviewPhaseTab,
  ImpactAnalysisPhaseTab,
  SchedulingPhaseTab,
  MOPCreationPhaseTab,
  MOPValidationPhaseTab,
  ExecutionPhaseTab,
} from "./PhaseTabs";
import type { Activity, ActivityPhases } from "../../types/activity.types";

const PHASE_TABS: Array<{
  id: string;
  label: string;
  phaseKey: keyof ActivityPhases;
}> = [
  { id: "review", label: "Review", phaseKey: "review" },
  {
    id: "impactAnalysis",
    label: "Impact Analysis",
    phaseKey: "impactAnalysis",
  },
  { id: "scheduling", label: "Scheduling", phaseKey: "scheduling" },
  { id: "mopCreation", label: "MOP Creation", phaseKey: "mopCreation" },
  { id: "mopValidation", label: "MOP Validation", phaseKey: "mopValidation" },
  { id: "execution", label: "Execution", phaseKey: "execution" },
];

const isPhaseComplete = (phase: Record<string, unknown>): boolean =>
  Object.values(phase).every((v) => v !== "" && v !== null && v !== undefined);

const PhaseTabLabel: React.FC<{ label: string; complete: boolean }> = ({
  label,
  complete,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    {complete ? (
      <CheckCircleIcon sx={{ fontSize: 14, color: "success.main" }} />
    ) : (
      <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
    )}
    {label}
  </Box>
);

const PhaseContent: React.FC<{ tabId: string; activity: Activity }> = ({
  tabId,
  activity,
}) => {
  switch (tabId) {
    case "review":
      return <ReviewPhaseTab activity={activity} />;
    case "impactAnalysis":
      return <ImpactAnalysisPhaseTab activity={activity} />;
    case "scheduling":
      return <SchedulingPhaseTab activity={activity} />;
    case "mopCreation":
      return <MOPCreationPhaseTab activity={activity} />;
    case "mopValidation":
      return <MOPValidationPhaseTab activity={activity} />;
    case "execution":
      return <ExecutionPhaseTab activity={activity} />;
    default:
      return null;
  }
};

export const ConfigurePhases: React.FC = () => {
  const { selectedActivity, activePhaseTab, changePhaseTab, goToList } =
    useActivity();
  const theme = useTheme();

  if (!selectedActivity) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No activity selected.</Typography>
        <Button sx={{ mt: 2 }} onClick={goToList} variant="outlined">
          Close
        </Button>
      </Box>
    );
  }

  const activity = selectedActivity;
  const completedCount = PHASE_TABS.filter(({ phaseKey }) =>
    isPhaseComplete(activity.phases[phaseKey] as Record<string, unknown>),
  ).length;

  return (
    <>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {activity.activityName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activity.id} · Created {activity.createdAt}
          </Typography>
        </Box>
        <IconButton size="small" onClick={goToList}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 0, backgroundColor: theme.palette.background.default }}
      >
        <Box sx={{ p: 2.5 }}>
          {/* Activity meta bar */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2,
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              alignItems: "center",
            }}
          >
            {[
              ["Domain", activity.domain],
              ["Layer", activity.layer],
              ["Plan", activity.planType],
              ["Vendor", activity.vendorOEM],
              ["CHM Domain", activity.chmDomain],
            ].map(([label, val]) => (
              <Box
                key={label}
                sx={{ display: "flex", gap: 0.4, alignItems: "center" }}
              >
                <Typography variant="caption" color="text.secondary">
                  {label}:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {val}
                </Typography>
              </Box>
            ))}
            <ImpactChip impact={activity.changeImpact} />
            <StatusChip status={activity.status} />
            <Box sx={{ ml: "auto" }}>
              <Typography variant="caption" color="text.secondary">
                Phases configured:{" "}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color={completedCount === 6 ? "success.main" : "text.primary"}
              >
                {completedCount}/6
              </Typography>
            </Box>
          </Box>

          {/* Tabbed phase config */}
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Tabs
              value={activePhaseTab}
              onChange={(_, v) => changePhaseTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                px: 1,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 13,
                  minHeight: 44,
                },
                "& .Mui-selected": {
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                },
              }}
            >
              {PHASE_TABS.map(({ id, label, phaseKey }) => (
                <Tab
                  key={id}
                  value={id}
                  label={
                    <PhaseTabLabel
                      label={label}
                      complete={isPhaseComplete(
                        activity.phases[phaseKey] as Record<string, unknown>,
                      )}
                    />
                  }
                />
              ))}
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              <PhaseContent tabId={activePhaseTab} activity={activity} />
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </>
  );
};
