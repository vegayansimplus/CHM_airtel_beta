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
import {
  useGetActivityPhaseViewQuery,
  type PlanViewRow,
} from "../api/planApiSlice";

// ─── Constants ───────────────────────────────────────────────
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

// ─── Phase Metadata ──────────────────────────────────────────
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

// ─── Field Definitions ───────────────────────────────────────
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

// ─── Transform ───────────────────────────────────────────────
const transformActivity = (api: any) => ({
  activityName: api.activityName,
  phases: {
    review: {
      crqReviewShift: api?.phases?.review?.shift || "",
      crqReviewTimeMinutes: api?.phases?.review?.requiredTimeMinutes || "",
    },
    impactAnalysis: {
      impactShift: api?.phases?.impactAnalysis?.shift || "",
      minimumLevel: api?.phases?.impactAnalysis?.minimumLevelRequirement || "",
      timeMinutes: api?.phases?.impactAnalysis?.requiredTimeMinutes || "",
    },
    scheduling: {
      shift: api?.phases?.scheduling?.shift || "",
      level: api?.phases?.scheduling?.minimumLevelRequirement || "",
      durationMinutes: api?.phases?.scheduling?.requiredTimeMinutes || "",
    },
    mopCreation: {
      shift: api?.phases?.mopCreation?.shift || "",
      minimumLevel: api?.phases?.mopCreation?.minimumLevelRequirement || "",
      timeMinutes: api?.phases?.mopCreation?.requiredTimeMinutes || "",
    },
    mopValidation: {
      shift: api?.phases?.mopValidation?.shift || "",
      minimumLevel: api?.phases?.mopValidation?.minimumLevelRequirement || "",
      timeMinutes: api?.phases?.mopValidation?.requiredTimeMinutes || "",
    },
    execution: {
      executionShift: api?.phases?.execution?.shift || "",
      minimumLevel: api?.phases?.execution?.minimumLevelRequirement || "",
      daysMargin: api?.phases?.execution?.daysMargin || "",
      reservationMargin: api?.phases?.execution?.reservationMargin || "",
      activityTimeMinutes: api?.phases?.execution?.requiredTimeMinutes || "",
      rollbackTimeMinutes: api?.phases?.execution?.rollbackTime || "",
    },
  },
});

// ─── Phase Form ──────────────────────────────────────────────
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

// ─── Main Dialog ─────────────────────────────────────────────
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

  const activity = useMemo(
    () => (data ? transformActivity(data) : null),
    [data],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [savedPhase, setSavedPhase] = useState<StageKey | null>(null);
  const [configs, setConfigs] = useState<Record<StageKey, Record<string, any>>>(
    () => Object.fromEntries(STAGE_KEYS.map((k) => [k, {}])) as any,
  );

  useEffect(() => {
    if (activity) setConfigs(activity.phases as any);
  }, [activity]);

  const activeKey = STAGE_KEYS[activeIdx];

  const isFilled = useCallback(
    (key: StageKey) => Object.values(configs[key] ?? {}).some((v) => v !== ""),
    [configs],
  );

  const filledCount = STAGE_KEYS.filter(isFilled).length;
  const progress = Math.round((filledCount / STAGE_KEYS.length) * 100);

  const handleChange = (field: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [field]: value },
    }));
  };

  const handleSave = () => {
    setSavedPhase(activeKey);
    console.log("Saving", activeKey, configs[activeKey]);
    setTimeout(() => setSavedPhase(null), 1800);
  };

  if (!plan) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      // PaperProps={{
      //   sx: { borderRadius: 3, overflow: "hidden" },
      //   elevation: 4,
      // }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
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
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ borderRadius: 2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Activity bar ── */}
      {activity && (
        <Box
          sx={{
            px: 2.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "action.hover",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography fontSize={12} color="text.secondary">
            Activity:
          </Typography>
          <Typography fontSize={13} fontWeight={500}>
            {activity.activityName}
          </Typography>
          <Box flex={1} />
          <Typography fontSize={11} color="text.disabled">
            {filledCount} of {STAGE_KEYS.length} phases done
          </Typography>
        </Box>
      )}

      <DialogContent sx={{ p: 0, display: "flex", minHeight: 460 }}>
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
        ) : activity ? (
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
                const isActive = i === activeIdx;
                return (
                  <Tooltip key={key} title={meta.desc} placement="right" arrow>
                    <Box
                      onClick={() => setActiveIdx(i)}
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
                  config={configs[activeKey]}
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
                  disabled={activeIdx === 0}
                  startIcon={<ChevronLeftIcon />}
                  onClick={() => setActiveIdx((i) => i - 1)}
                  sx={{ fontSize: 12, color: "primary.main" }}
                >
                  {activeIdx > 0
                    ? PHASE_META[STAGE_KEYS[activeIdx - 1]].label
                    : "Previous"}
                </Button>
                <Button
                  size="small"
                  disabled={activeIdx === STAGE_KEYS.length - 1}
                  endIcon={<ChevronRightIcon />}
                  onClick={() => setActiveIdx((i) => i + 1)}
                  sx={{ fontSize: 12, color: "primary.main" }}
                >
                  {activeIdx < STAGE_KEYS.length - 1
                    ? PHASE_META[STAGE_KEYS[activeIdx + 1]].label
                    : "Next"}
                </Button>
              </Box>
            </Box>
          </>
        ) : null}
      </DialogContent>

      {/* ── Footer ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          bgcolor: "action.hover",
        }}
      >
        <Button size="small" onClick={onClose} sx={{ fontSize: 13 }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
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
    </Dialog>
  );
};
