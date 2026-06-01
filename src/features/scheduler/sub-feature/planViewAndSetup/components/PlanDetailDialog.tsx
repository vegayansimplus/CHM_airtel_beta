import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LayersIcon from "@mui/icons-material/Layers";
import AddIcon from "@mui/icons-material/Add";
import {
  useGetActivityPhaseViewQuery,
  type PlanViewRow,
  type ActivityEntry,
  type ActivityPhaseView,
} from "../api/planApiSlice";
// import { AddIcCall } from "@mui/icons-material";
import AddActivityDialog from "./AddActivityDialog";

// ─────────────────────────────── Constants ───────────────────────────────────
const SHIFTS = ["General", "Morning", "Evening", "Night"];
const LEVELS = ["L1", "L2", "L3", "L4"];

const STAGE_KEYS = [
  "review",
  "impactAnalysis",
  "scheduling",
  "mopCreation",
  "mopValidation",
  "execution",
] as const;

type StageKey = (typeof STAGE_KEYS)[number];

// ─── Phase metadata ───────────────────────────────────────────────────────────
const PHASE_META: Record<
  StageKey,
  { label: string; desc: string; icon: React.ReactNode }
> = {
  review: {
    label: "Review",
    desc: "CRQ review shift and time allocation",
    icon: <VisibilityIcon sx={{ fontSize: 16 }} />,
  },
  impactAnalysis: {
    label: "Impact analysis",
    desc: "Assess impact scope, level and time needed",
    icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  },
  scheduling: {
    label: "Scheduling",
    desc: "Scheduling shift, level and duration window",
    icon: <CalendarMonthIcon sx={{ fontSize: 16 }} />,
  },
  mopCreation: {
    label: "MOP creation",
    desc: "MOP document creation shift and level",
    icon: <NoteAddIcon sx={{ fontSize: 16 }} />,
  },
  mopValidation: {
    label: "MOP validation",
    desc: "MOP validation shift, level and review time",
    icon: <FactCheckIcon sx={{ fontSize: 16 }} />,
  },
  execution: {
    label: "Execution",
    desc: "Full execution config — shift, margins and timing",
    icon: <PlayArrowIcon sx={{ fontSize: 16 }} />,
  },
};

// ─── Field definitions ────────────────────────────────────────────────────────
type FieldDef = {
  key: string;
  label: string;
  type?: "number";
  options?: string[];
  hint?: string;
};

const FIELD_MAP: Record<StageKey, FieldDef[]> = {
  review: [
    { key: "crqReviewShift", label: "Shift", options: SHIFTS },
    {
      key: "crqReviewTimeMinutes",
      label: "Time required (min)",
      type: "number",
      hint: "Typical: 30–120 min",
    },
    {
      key: "daysMargin",
      label: "Days margin",
      type: "number",
      hint: "Buffer days before review",
    },
    {
      key: "reservationMargin",
      label: "Reservation margin",
      type: "number",
      hint: "Resource reservation buffer",
    },
    {
      key: "rollbackTimeMinutes",
      label: "Rollback time (min)",
      type: "number",
      hint: "Time to rollback if needed",
    },
  ],
  impactAnalysis: [
    { key: "impactShift", label: "Shift", options: SHIFTS },
    { key: "minimumLevel", label: "Minimum level", options: LEVELS },
    {
      key: "timeMinutes",
      label: "Time required (min)",
      type: "number",
      hint: "Typical: 30–90 min",
    },
  ],
  scheduling: [
    { key: "shift", label: "Shift", options: SHIFTS },
    { key: "level", label: "Level", options: LEVELS },
    {
      key: "durationMinutes",
      label: "Duration (min)",
      type: "number",
      hint: "Typical: 60–180 min",
    },
  ],
  mopCreation: [
    { key: "shift", label: "Shift", options: SHIFTS },
    { key: "minimumLevel", label: "Minimum level", options: LEVELS },
    {
      key: "timeMinutes",
      label: "Time required (min)",
      type: "number",
      hint: "Typical: 45–120 min",
    },
  ],
  mopValidation: [
    { key: "shift", label: "Shift", options: SHIFTS },
    { key: "minimumLevel", label: "Minimum level", options: LEVELS },
    {
      key: "timeMinutes",
      label: "Time required (min)",
      type: "number",
      hint: "Typical: 30–60 min",
    },
  ],
  execution: [
    { key: "executionShift", label: "Shift", options: SHIFTS },
    { key: "minimumLevel", label: "Minimum level", options: LEVELS },
    {
      key: "daysMargin",
      label: "Days margin",
      type: "number",
      hint: "Buffer days before execution",
    },
    {
      key: "reservationMargin",
      label: "Reservation margin",
      type: "number",
      hint: "Resource reservation buffer",
    },
    {
      key: "activityTimeMinutes",
      label: "Activity time (min)",
      type: "number",
      hint: "Total activity duration",
    },
    {
      key: "rollbackTimeMinutes",
      label: "Rollback time (min)",
      type: "number",
      hint: "Time to rollback if needed",
    },
  ],
};

// ─── Transform one ActivityEntry into editable form state ─────────────────────
const transformEntry = (entry: ActivityEntry) => ({
  activityId: entry.activityId,
  activityName: entry.activityName,
  phases: {
    review: {
      crqReviewShift: entry.phases.review?.shift ?? "",
      crqReviewTimeMinutes: entry.phases.review?.requiredTimeMinutes ?? "",
      daysMargin: entry.phases.review?.daysMargin ?? "",
      reservationMargin: entry.phases.review?.reservationMargin ?? "",
      rollbackTimeMinutes: entry.phases.review?.rollbackTime ?? "",
    },
    impactAnalysis: {
      impactShift: entry.phases.impactAnalysis?.shift ?? "",
      minimumLevel: entry.phases.impactAnalysis?.minimumLevelRequirement ?? "",
      timeMinutes: entry.phases.impactAnalysis?.requiredTimeMinutes ?? "",
    },
    scheduling: {
      shift: entry.phases.scheduling?.shift ?? "",
      level: entry.phases.scheduling?.minimumLevelRequirement ?? "",
      durationMinutes: entry.phases.scheduling?.requiredTimeMinutes ?? "",
    },
    mopCreation: {
      shift: entry.phases.mopCreation?.shift ?? "",
      minimumLevel: entry.phases.mopCreation?.minimumLevelRequirement ?? "",
      timeMinutes: entry.phases.mopCreation?.requiredTimeMinutes ?? "",
    },
    mopValidation: {
      shift: entry.phases.mopValidation?.shift ?? "",
      minimumLevel: entry.phases.mopValidation?.minimumLevelRequirement ?? "",
      timeMinutes: entry.phases.mopValidation?.requiredTimeMinutes ?? "",
    },
    execution: {
      executionShift: entry.phases.execution?.shift ?? "",
      minimumLevel: entry.phases.execution?.minimumLevelRequirement ?? "",
      daysMargin: entry.phases.execution?.daysMargin ?? "",
      reservationMargin: entry.phases.execution?.reservationMargin ?? "",
      activityTimeMinutes: entry.phases.execution?.requiredTimeMinutes ?? "",
      rollbackTimeMinutes: entry.phases.execution?.rollbackTime ?? "",
    },
  },
});

type TransformedActivity = ReturnType<typeof transformEntry>;

// ─── Per-activity configs shape ───────────────────────────────────────────────
// activityId -> StageKey -> field -> value
type AllConfigs = Record<string, Record<StageKey, Record<string, any>>>;

function buildInitialConfigs(activities: TransformedActivity[]): AllConfigs {
  const result: AllConfigs = {};
  for (const a of activities) {
    result[a.activityId] = a.phases as Record<StageKey, Record<string, any>>;
  }
  return result;
}

// ─────────────────────────────── PhaseForm ───────────────────────────────────
const PhaseForm = ({
  stageKey,
  config,
  onChange,
}: {
  stageKey: StageKey;
  config: Record<string, any>;
  onChange: (key: string, val: string) => void;
}) => {
  const meta = PHASE_META[stageKey];
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          p: 1.5,
          mb: 2.5,
          bgcolor: "action.hover",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            color: "primary.main",
            mt: 0.2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {meta.icon}
        </Box>
        <Box>
          <Typography fontWeight={500} fontSize={14}>
            {meta.label}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {meta.desc}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
        }}
      >
        {FIELD_MAP[stageKey].map((f) => (
          <Box
            key={f.key}
            sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <TextField
              select={!!f.options}
              fullWidth
              size="small"
              type={f.type || "text"}
              label={f.label}
              value={config[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              inputProps={f.type === "number" ? { min: 0 } : undefined}
            >
              {f.options?.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
            {f.hint && (
              <Typography fontSize={11} color="text.disabled" sx={{ pl: 0.5 }}>
                {f.hint}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────── BasicInfoBar ────────────────────────────────────
const BasicInfoBar = ({ info }: { info: ActivityPhaseView["basicInfo"] }) => (
  <Box
    sx={{
      px: 2.5,
      py: 0.75,
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 2,
      bgcolor: "action.hover",
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    {[
      { label: "Domain", val: info.domain },
      { label: "Layer", val: info.layer },
      { label: "CHM", val: `${info.chmDomain} › ${info.chmSubDomain}` },
      { label: "Vendor", val: info.vendorOem },
      { label: "Impact", val: info.changeImpact },
    ].map(({ label, val }) => (
      <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography fontSize={11} color="text.disabled">
          {label}:
        </Typography>
        <Typography fontSize={11} fontWeight={500} color="text.secondary">
          {val}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ─────────────────────────────── Main Dialog ─────────────────────────────────
interface Props {
  open: boolean;
  plan: PlanViewRow | null;
  onClose: () => void;
}

export const PlanDetailDialog: React.FC<Props> = ({ open, plan, onClose }) => {
  const { data, isLoading } = useGetActivityPhaseViewQuery(
    { planId: plan?.planId ?? 0 },
    { skip: !plan },
  );

  // All activities transformed to editable form state
  const activities = useMemo<TransformedActivity[]>(
    () => (data?.activities ?? []).map(transformEntry),
    [data],
  );

  // Which activity tab is active
  const [activityIdx, setActivityIdx] = useState(0);
  // Which phase is active
  const [phaseIdx, setPhaseIdx] = useState(0);
  // Save flash
  const [savedPhase, setSavedPhase] = useState<StageKey | null>(null);

  // Per-activity, per-phase form configs
  const [allConfigs, setAllConfigs] = useState<AllConfigs>({});

  // +++++++++++++++++++++++++++++++++++++++
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Sync from API data
  useEffect(() => {
    if (activities.length > 0) {
      setAllConfigs(buildInitialConfigs(activities));
      setActivityIdx(0);
      setPhaseIdx(0);
    }
  }, [activities]);

  const currentActivity = activities[activityIdx] ?? null;
  const activeKey = STAGE_KEYS[phaseIdx];

  // Configs for the currently selected activity
  const currentConfigs: Record<StageKey, Record<string, any>> = useMemo(
    () =>
      currentActivity
        ? (allConfigs[currentActivity.activityId] ??
          (Object.fromEntries(STAGE_KEYS.map((k) => [k, {}])) as any))
        : (Object.fromEntries(STAGE_KEYS.map((k) => [k, {}])) as any),
    [allConfigs, currentActivity],
  );

  const isFilled = useCallback(
    (key: StageKey) =>
      Object.values(currentConfigs[key] ?? {}).some(
        (v) => v !== "" && v !== null && v !== undefined,
      ),
    [currentConfigs],
  );

  const filledCount = STAGE_KEYS.filter(isFilled).length;
  const progress = Math.round((filledCount / STAGE_KEYS.length) * 100);

  const handleChange = (field: string, value: string) => {
    if (!currentActivity) return;
    setAllConfigs((prev) => ({
      ...prev,
      [currentActivity.activityId]: {
        ...prev[currentActivity.activityId],
        [activeKey]: {
          ...(prev[currentActivity.activityId]?.[activeKey] ?? {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    if (!currentActivity) return;
    setSavedPhase(activeKey);
    console.log(
      "Saving",
      currentActivity.activityId,
      activeKey,
      currentConfigs[activeKey],
    );
    setTimeout(() => setSavedPhase(null), 1800);
  };

  // Reset phase selection when switching activity
  const handleActivityChange = (_: React.SyntheticEvent, idx: number) => {
    setActivityIdx(idx);
    setPhaseIdx(0);
    setSavedPhase(null);
  };

  if (!plan) return null;

  const hasActivities = activities.length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* ── Header ── */}
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          // P:2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AccessTimeIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography fontWeight={500} fontSize={16}>
            Plan #{plan.planId}
          </Typography>
          <Chip
            label={plan.planType}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 22, fontSize: 11, fontWeight: 500 }}
          />

          <Chip
            clickable
            onClick={() => setOpenAddDialog(true)}
            icon={<AddIcon />}
            label="Add New Activity"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ borderRadius: 2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Basic info strip ── */}
      {data?.basicInfo && <BasicInfoBar info={data.basicInfo} />}

      {/* ── Activity tabs ── */}
      {hasActivities && (
        <Box
          sx={{
            px: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LayersIcon sx={{ fontSize: 14, color: "text.disabled", mr: 0.5 }} />
          <Tabs
            value={activityIdx}
            onChange={handleActivityChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                fontSize: 12,
                py: 0,
                textTransform: "none",
              },
            }}
          >
            {activities.map((a) => {
              // Count filled phases for this activity
              const actConfigs =
                allConfigs[a.activityId] ??
                Object.fromEntries(STAGE_KEYS.map((k) => [k, {}]));
              const filled = STAGE_KEYS.filter((k) =>
                Object.values(actConfigs[k] ?? {}).some(
                  (v) => v !== "" && v !== null && v !== undefined,
                ),
              ).length;
              return (
                <Tab
                  key={a.activityId}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <span>{a.activityName}</span>
                      <Chip
                        label={`${filled}/${STAGE_KEYS.length}`}
                        size="small"
                        variant={
                          filled === STAGE_KEYS.length ? "filled" : "outlined"
                        }
                        color={
                          filled === STAGE_KEYS.length ? "success" : "default"
                        }
                        sx={{
                          height: 16,
                          fontSize: 10,
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>
      )}

      <DialogContent sx={{ p: 0, display: "flex", m: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : hasActivities && currentActivity ? (
          <>
            {/* ── Sidebar ── */}
            <Box
              sx={{
                width: 200,
                flexShrink: 0,
                borderRight: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                py: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "text.disabled",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  px: 2,
                  pb: 1,
                }}
              >
                Phases
              </Typography>

              {STAGE_KEYS.map((key, i) => {
                const meta = PHASE_META[key];
                const filled = isFilled(key);
                const isActive = i === phaseIdx;
                return (
                  <Tooltip key={key} title={meta.desc} placement="right" arrow>
                    <Box
                      onClick={() => setPhaseIdx(i)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        px: 2,
                        py: 1.1,
                        cursor: "pointer",
                        borderLeft: "3px solid",
                        borderColor: isActive ? "primary.main" : "transparent",
                        bgcolor: isActive ? "primary.50" : "transparent",
                        "&:hover": {
                          bgcolor: isActive ? "primary.50" : "action.hover",
                        },
                        transition: "all 0.12s",
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          bgcolor: isActive ? "primary.main" : "action.hover",
                          color: isActive
                            ? "primary.contrastText"
                            : "text.secondary",
                          transition: "all 0.12s",
                        }}
                      >
                        {meta.icon}
                      </Box>
                      <Typography
                        fontSize={13}
                        fontWeight={isActive ? 500 : 400}
                        color={isActive ? "primary.dark" : "text.secondary"}
                        sx={{ flex: 1 }}
                      >
                        {meta.label}
                      </Typography>
                      {filled && (
                        <CheckCircleIcon
                          sx={{
                            fontSize: 15,
                            color: "success.main",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}

              {/* Progress */}
              <Box sx={{ mt: "auto", px: 2, pt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography fontSize={11} color="text.disabled">
                    Progress
                  </Typography>
                  <Typography
                    fontSize={11}
                    fontWeight={500}
                    color="primary.main"
                  >
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 4, borderRadius: 99 }}
                />
              </Box>
            </Box>

            {/* ── Form panel ── */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
                <PhaseForm
                  stageKey={activeKey}
                  config={currentConfigs[activeKey]}
                  onChange={handleChange}
                />
              </Box>

              {/* Prev / Next */}
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  size="small"
                  disabled={phaseIdx === 0}
                  startIcon={<ChevronLeftIcon />}
                  onClick={() => setPhaseIdx((i) => i - 1)}
                  sx={{ fontSize: 12, color: "primary.main" }}
                >
                  {phaseIdx > 0
                    ? PHASE_META[STAGE_KEYS[phaseIdx - 1]].label
                    : "Previous"}
                </Button>
                <Button
                  size="small"
                  disabled={phaseIdx === STAGE_KEYS.length - 1}
                  endIcon={<ChevronRightIcon />}
                  onClick={() => setPhaseIdx((i) => i + 1)}
                  sx={{ fontSize: 12, color: "primary.main" }}
                >
                  {phaseIdx < STAGE_KEYS.length - 1
                    ? PHASE_META[STAGE_KEYS[phaseIdx + 1]].label
                    : "Next"}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          !isLoading && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography fontSize={13} color="text.disabled">
                No activity data available
              </Typography>
            </Box>
          )
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "action.hover",
        }}
      >
        {/* Activity name label */}
        <Typography fontSize={12} color="text.secondary">
          {currentActivity
            ? `${currentActivity.activityName} › ${PHASE_META[activeKey].label}`
            : ""}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" onClick={onClose} sx={{ fontSize: 13 }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            disabled={!currentActivity}
            startIcon={
              savedPhase === activeKey ? (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              ) : (
                <SaveIcon sx={{ fontSize: 16 }} />
              )
            }
            onClick={handleSave}
            color={savedPhase === activeKey ? "success" : "primary"}
            sx={{ fontSize: 13, px: 2.5, borderRadius: 2 }}
          >
            {savedPhase === activeKey ? "Saved!" : "Save phase"}
          </Button>
        </Box>
      </Box>
      {plan && (
        <AddActivityDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          plan={plan}
        />
      )}
    </Dialog>
  );
};
