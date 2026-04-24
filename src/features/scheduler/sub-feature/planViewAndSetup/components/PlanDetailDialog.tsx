import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  useTheme,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArticleIcon from "@mui/icons-material/Article";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import BuildIcon from "@mui/icons-material/Build";
import { alpha } from "@mui/material/styles";
import type { PlanViewRow } from "../api/planApiSlice";

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIC_ACTIVITIES = {
  activity_1: {
    activityId: "ACT001",
    activityName: "5G LKF Upgrade",
    basicInfo: {
      chmDomain: "Network",
      chmSubDomain: "RAN",
      domain: "RAN",
      layer: "Access",
      planType: "Plan-A",
      vendorOEM: "Nokia",
      changeImpact: "High",
    },
    phases: {
      review: {
        auto: {
          chmDomain: "Network",
          domain: "RAN",
          planType: "Plan-A",
          vendorOEM: "Nokia",
          changeImpact: "High",
        },
        config: { crqReviewShift: "Night", crqReviewTimeMinutes: 30 },
      },
      impactAnalysis: {
        auto: {
          chmDomain: "Network",
          domain: "RAN",
          planType: "Plan-A",
          vendorOEM: "Nokia",
        },
        config: { impactShift: "General", minimumLevel: "L2", timeMinutes: 45 },
      },
      scheduling: {
        auto: {
          domain: "RAN",
          layer: "Access",
          vendor: "Nokia",
          plan: "Plan-A",
          changeImpact: "High",
        },
        config: { shift: "Night", level: "L3", durationMinutes: 60 },
      },
      mopCreation: {
        config: { shift: "General", minimumLevel: "L2", timeMinutes: 90 },
      },
      mopValidation: {
        config: { shift: "General", minimumLevel: "L3", timeMinutes: 60 },
      },
      execution: {
        config: {
          executionShift: "Night",
          daysMargin: 2,
          reservationMargin: 1,
          activityTimeMinutes: 120,
          minimumLevel: "L3",
          rollbackTimeMinutes: 45,
        },
      },
    },
  },
  activity_2: {
    activityId: "ACT002",
    activityName: "Fiber Cutover",
    basicInfo: {
      chmDomain: "Network",
      chmSubDomain: "Transport",
      domain: "Transport",
      layer: "Core",
      planType: "Plan-B",
      vendorOEM: "STL",
      changeImpact: "Medium",
    },
    phases: {
      review: {
        auto: {
          chmDomain: "Network",
          domain: "Transport",
          planType: "Plan-B",
          vendorOEM: "STL",
          changeImpact: "Medium",
        },
        config: { crqReviewShift: "General", crqReviewTimeMinutes: 20 },
      },
      impactAnalysis: {
        auto: {
          chmDomain: "Network",
          domain: "Transport",
          planType: "Plan-B",
          vendorOEM: "STL",
        },
        config: { impactShift: "General", minimumLevel: "L1", timeMinutes: 30 },
      },
      scheduling: {
        auto: {
          domain: "Transport",
          layer: "Core",
          vendor: "STL",
          plan: "Plan-B",
          changeImpact: "Medium",
        },
        config: { shift: "Evening", level: "L2", durationMinutes: 45 },
      },
      mopCreation: {
        config: { shift: "General", minimumLevel: "L1", timeMinutes: 60 },
      },
      mopValidation: {
        config: { shift: "General", minimumLevel: "L2", timeMinutes: 45 },
      },
      execution: {
        config: {
          executionShift: "Night",
          daysMargin: 1,
          reservationMargin: 1,
          activityTimeMinutes: 90,
          minimumLevel: "L2",
          rollbackTimeMinutes: 30,
        },
      },
    },
  },
};

// ─── Config ───────────────────────────────────────────────────────────────────

const SHIFTS = [
  "General",
  "Morning (06:00 - 14:00)",
  "Evening (14:00 - 22:00)",
  "Night (22:00 - 06:00)",
];
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
type Activity = typeof STATIC_ACTIVITIES.activity_1;

const STAGE_META: Record<
  StageKey,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  review: {
    label: "Review",
    icon: <RateReviewIcon sx={{ fontSize: 14 }} />,
    color: "#1e40af",
    bg: "#dbeafe",
  },
  impactAnalysis: {
    label: "Impact Analysis",
    icon: <AssessmentIcon sx={{ fontSize: 14 }} />,
    color: "#065f46",
    bg: "#d1fae5",
  },
  scheduling: {
    label: "Scheduling",
    icon: <CalendarMonthIcon sx={{ fontSize: 14 }} />,
    color: "#92400e",
    bg: "#fef3c7",
  },
  mopCreation: {
    label: "MOP Creation",
    icon: <ArticleIcon sx={{ fontSize: 14 }} />,
    color: "#6b21a8",
    bg: "#f3e8ff",
  },
  mopValidation: {
    label: "MOP Validation",
    icon: <FactCheckIcon sx={{ fontSize: 14 }} />,
    color: "#0e7490",
    bg: "#cffafe",
  },
  execution: {
    label: "Execution",
    icon: <BuildIcon sx={{ fontSize: 14 }} />,
    color: "#9a3412",
    bg: "#ffedd5",
  },
};

const IMPACT_STYLE: Record<string, { color: string; bg: string; dot: string }> =
  {
    High: { color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
    Medium: { color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
    Low: { color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
    Critical: { color: "#581c87", bg: "#f3e8ff", dot: "#a855f7" },
  };

// ─── Impact badge ─────────────────────────────────────────────────────────────

const ImpactBadge: React.FC<{ value: string }> = ({ value }) => {
  const s = IMPACT_STYLE[value] ?? {
    color: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
          flexShrink: 0,
        }}
      />
      {value}
    </Box>
  );
};

// ─── Phase stepper tabs ───────────────────────────────────────────────────────

const PhaseStepper: React.FC<{
  active: number;
  onChange: (i: number) => void;
}> = ({ active, onChange }) => (
  <Box
    sx={{
      display: "flex",
      gap: 0.5,
      px: 2,
      py: 1.25,
      overflowX: "auto",
      borderBottom: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
      "&::-webkit-scrollbar": { height: 3 },
    }}
  >
    {STAGE_KEYS.map((key, idx) => {
      const meta = STAGE_META[key];
      const isActive = active === idx;
      return (
        <Box
          key={key}
          onClick={() => onChange(idx)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.6,
            borderRadius: 1.5,
            cursor: "pointer",
            flexShrink: 0,
            backgroundColor: isActive ? meta.bg : "transparent",
            color: isActive ? meta.color : "text.secondary",
            border: "1.5px solid",
            borderColor: isActive ? meta.color : "transparent",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: isActive ? meta.bg : "action.hover",
              borderColor: isActive ? meta.color : "divider",
            },
          }}
        >
          <Box
            sx={{
              color: isActive ? meta.color : "text.disabled",
              display: "flex",
              alignItems: "center",
            }}
          >
            {meta.icon}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? meta.color : "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            {meta.label}
          </Typography>
          {isActive && (
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: meta.color,
                flexShrink: 0,
              }}
            />
          )}
        </Box>
      );
    })}
  </Box>
);

// ─── Auto-filled fields panel ─────────────────────────────────────────────────

const AutoFields: React.FC<{ data: Record<string, string> }> = ({ data }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 0.75,
      mb: 2,
      p: 1.25,
      borderRadius: 1.5,
      backgroundColor: alpha("#1e40af", 0.04),
      border: "1px solid",
      borderColor: alpha("#1e40af", 0.12),
    }}
  >
    <Typography
      sx={{
        width: "100%",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#1e40af",
        mb: 0.5,
      }}
    >
      AUTO-FILLED — READ ONLY
    </Typography>
    {Object.entries(data).map(([key, val]) => (
      <Box
        key={key}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.3,
          borderRadius: 1,
          backgroundColor: alpha("#1e40af", 0.07),
          border: "1px solid",
          borderColor: alpha("#1e40af", 0.12),
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            color: "#1e40af",
            textTransform: "capitalize",
            opacity: 0.75,
          }}
        >
          {key}:
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a" }}>
          {val}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ─── Compact form field wrapper ───────────────────────────────────────────────

const fieldSx = {
  "& .MuiInputBase-root": { fontSize: 12, borderRadius: 1.5 },
  "& .MuiInputLabel-root": { fontSize: 12 },
  "& .MuiInputBase-input": { py: "6px", px: "10px" },
};

// ─── Section label inside form ────────────────────────────────────────────────

const FormSection: React.FC<{ label: string; stageKey: StageKey }> = ({
  label,
  stageKey,
}) => {
  const meta = STAGE_META[stageKey];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: 1,
          backgroundColor: meta.bg,
          color: meta.color,
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: meta.color }}>
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
};

// ─── Save button ──────────────────────────────────────────────────────────────

const SaveBtn: React.FC<{
  label: string;
  stageKey: StageKey;
  onClick: () => void;
}> = ({ label, stageKey, onClick }) => {
  const meta = STAGE_META[stageKey];
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<SaveIcon sx={{ fontSize: 13 }} />}
        onClick={onClick}
        disableElevation
        sx={{
          fontSize: 12,
          textTransform: "none",
          borderRadius: 1.5,
          fontWeight: 600,
          py: 0.6,
          px: 2,
          backgroundColor: meta.color,
          "&:hover": { backgroundColor: meta.color, filter: "brightness(0.9)" },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

// ─── Phase Forms ──────────────────────────────────────────────────────────────

const ReviewForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const phase = activity.phases.review;
  const [config, setConfig] = useState(phase.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
      <FormSection label="Review Configuration" stageKey="review" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="CRQ Review Shift"
            value={config.crqReviewShift}
            onChange={set("crqReviewShift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Review Time (min)"
            value={config.crqReviewTimeMinutes}
            onChange={set("crqReviewTimeMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save Review"
        stageKey="review"
        onClick={() => console.log("Save Review", activity.activityId, config)}
      />
    </Box>
  );
};

const ImpactAnalysisForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const phase = activity.phases.impactAnalysis;
  const [config, setConfig] = useState(phase.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
      <FormSection
        label="Impact Analysis Configuration"
        stageKey="impactAnalysis"
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Impact Shift"
            value={config.impactShift}
            onChange={set("impactShift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Minimum Level"
            value={config.minimumLevel}
            onChange={set("minimumLevel")}
            sx={fieldSx}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Time (min)"
            value={config.timeMinutes}
            onChange={set("timeMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save Impact Analysis"
        stageKey="impactAnalysis"
        onClick={() => console.log("Save Impact", activity.activityId, config)}
      />
    </Box>
  );
};

const SchedulingForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const phase = activity.phases.scheduling;
  const [config, setConfig] = useState(phase.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
      <FormSection label="Scheduling Configuration" stageKey="scheduling" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Shift"
            value={config.shift}
            onChange={set("shift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Level"
            value={config.level}
            onChange={set("level")}
            sx={fieldSx}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Duration (min)"
            value={config.durationMinutes}
            onChange={set("durationMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save Scheduling"
        stageKey="scheduling"
        onClick={() =>
          console.log("Save Scheduling", activity.activityId, config)
        }
      />
    </Box>
  );
};

const MopCreationForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [config, setConfig] = useState(activity.phases.mopCreation.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      <FormSection label="MOP Creation Configuration" stageKey="mopCreation" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Shift"
            value={config.shift}
            onChange={set("shift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Minimum Level"
            value={config.minimumLevel}
            onChange={set("minimumLevel")}
            sx={fieldSx}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Time (min)"
            value={config.timeMinutes}
            onChange={set("timeMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save MOP Creation"
        stageKey="mopCreation"
        onClick={() =>
          console.log("Save MOP Creation", activity.activityId, config)
        }
      />
    </Box>
  );
};

const MopValidationForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [config, setConfig] = useState(activity.phases.mopValidation.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      <FormSection
        label="MOP Validation Configuration"
        stageKey="mopValidation"
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Shift"
            value={config.shift}
            onChange={set("shift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Minimum Level"
            value={config.minimumLevel}
            onChange={set("minimumLevel")}
            sx={fieldSx}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Time (min)"
            value={config.timeMinutes}
            onChange={set("timeMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save MOP Validation"
        stageKey="mopValidation"
        onClick={() =>
          console.log("Save MOP Validation", activity.activityId, config)
        }
      />
    </Box>
  );
};

const ExecutionForm: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [config, setConfig] = useState(activity.phases.execution.config);
  const set =
    (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Box>
      <FormSection label="Execution Configuration" stageKey="execution" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Execution Shift"
            value={config.executionShift}
            onChange={set("executionShift")}
            sx={fieldSx}
          >
            {SHIFTS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Minimum Level"
            value={config.minimumLevel}
            onChange={set("minimumLevel")}
            sx={fieldSx}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Days Margin"
            value={config.daysMargin}
            onChange={set("daysMargin")}
            sx={fieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Reservation Margin"
            value={config.reservationMargin}
            onChange={set("reservationMargin")}
            sx={fieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Activity Time (min)"
            value={config.activityTimeMinutes}
            onChange={set("activityTimeMinutes")}
            sx={fieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Rollback Time (min)"
            value={config.rollbackTimeMinutes}
            onChange={set("rollbackTimeMinutes")}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <SaveBtn
        label="Save Execution"
        stageKey="execution"
        onClick={() =>
          console.log("Save Execution", activity.activityId, config)
        }
      />
    </Box>
  );
};

// ─── Phase content router ─────────────────────────────────────────────────────

const PhaseContent: React.FC<{ stageKey: StageKey; activity: Activity }> = ({
  stageKey,
  activity,
}) => {
  switch (stageKey) {
    case "review":
      return <ReviewForm activity={activity} />;
    case "impactAnalysis":
      return <ImpactAnalysisForm activity={activity} />;
    case "scheduling":
      return <SchedulingForm activity={activity} />;
    case "mopCreation":
      return <MopCreationForm activity={activity} />;
    case "mopValidation":
      return <MopValidationForm activity={activity} />;
    case "execution":
      return <ExecutionForm activity={activity} />;
    default:
      return null;
  }
};

// ─── Activity stage tabs ──────────────────────────────────────────────────────

const ActivityStageTabs: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box sx={{ width: "100%" }}>
      <PhaseStepper active={activeTab} onChange={setActiveTab} />
      <Box sx={{ p: 2.5, minHeight: 200 }}>
        <PhaseContent stageKey={STAGE_KEYS[activeTab]} activity={activity} />
      </Box>
    </Box>
  );
};

// ─── Accordion list ───────────────────────────────────────────────────────────

const ActivityAccordionList: React.FC = () => {
  const theme = useTheme();
  const activities = Object.values(STATIC_ACTIVITIES);
  const [expanded, setExpanded] = useState<string | false>(
    activities[0].activityId,
  );

  return (
    <>
      {activities.map((activity, idx) => {
        const isOpen = expanded === activity.activityId;
        const impact = activity.basicInfo.changeImpact;
        const impactStyle = IMPACT_STYLE[impact] ?? {
          color: "#374151",
          bg: "#f3f4f6",
          dot: "#9ca3af",
        };

        return (
          <Accordion
            key={activity.activityId}
            expanded={isOpen}
            onChange={(_, exp) =>
              setExpanded(exp ? activity.activityId : false)
            }
            variant="outlined"
            sx={{
              mb: 1.5,
              borderRadius: "10px !important",
              backgroundColor: "background.paper",
              "&:before": { display: "none" },
              border: "1.5px solid",
              borderColor: isOpen ? "primary.main" : "divider",
              boxShadow: isOpen
                ? `0 2px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                : "none",
              transition: "all 0.18s ease",
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    fontSize: 18,
                    color: isOpen ? "primary.main" : "text.secondary",
                  }}
                />
              }
              sx={{
                minHeight: 52,
                px: 2,
                backgroundColor: isOpen
                  ? alpha(theme.palette.primary.main, 0.03)
                  : "transparent",
                borderRadius: "10px",
                "& .MuiAccordionSummary-content": {
                  my: 0,
                  alignItems: "center",
                  gap: 1.5,
                },
              }}
            >
              {/* Index badge */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isOpen
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.text.disabled, 0.08),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isOpen ? "primary.main" : "text.secondary",
                  }}
                >
                  {idx + 1}
                </Typography>
              </Box>

              {/* Name + meta */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: isOpen ? 700 : 600,
                    color: isOpen ? "primary.main" : "text.primary",
                    lineHeight: 1.3,
                  }}
                >
                  {activity.activityName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mt: 0.25,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {[
                    { k: "Domain", v: activity.basicInfo.domain },
                    { k: "Layer", v: activity.basicInfo.layer },
                    { k: "Vendor", v: activity.basicInfo.vendorOEM },
                  ].map(({ k, v }) => (
                    <Typography
                      key={k}
                      sx={{ fontSize: 11, color: "text.secondary" }}
                    >
                      <Box
                        component="span"
                        sx={{ color: "text.disabled", mr: 0.3 }}
                      >
                        {k}:
                      </Box>
                      {v}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Badges */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: "auto",
                  flexShrink: 0,
                  pr: 0.5,
                }}
              >
                <Chip
                  label={activity.activityId}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 20,
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                />
                <ImpactBadge value={impact} />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Divider />
              <ActivityStageTabs activity={activity} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  plan: PlanViewRow | null;
  onClose: () => void;
}

export const PlanDetailDialog: React.FC<Props> = ({ open, plan, onClose }) => {
  const theme = useTheme();
  if (!plan) return null;

  const impact = plan.changeImpact;
  const impactStyle = IMPACT_STYLE[impact] ?? {
    color: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { borderRadius: 3, minHeight: "75vh", overflow: "hidden" },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 60%)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          {/* Plan type pill */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.3,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "primary.main",
                  letterSpacing: "0.05em",
                }}
              >
                PLAN #{plan.planId}
              </Typography>
            </Box>
            <ImpactBadge value={impact} />
          </Box>

          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {plan.planType}
          </Typography>

          {/* Meta row */}
          <Box sx={{ display: "flex", gap: 2, mt: 0.75, flexWrap: "wrap" }}>
            {[
              { label: "Domain", value: plan.domain },
              { label: "Layer", value: plan.layer },
              { label: "Vendor", value: plan.vendorOem },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  {label}:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            mt: -0.5,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              color: "error.main",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Body ── */}
      <DialogContent sx={{ p: 2.5, backgroundColor: theme.palette.grey[50] }}>
        <ActivityAccordionList />
      </DialogContent>
    </Dialog>
  );
};

export default PlanDetailDialog;

// ++++++++++++++++++++++++++++++++++++++++++++++++++Old view +++++++++++++++++++++++++++++++++++++++++++++++++
// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   IconButton,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Box,
//   Typography,
//   Tabs,
//   Tab,
//   TextField,
//   MenuItem,
//   Button,
//   Grid,
//   useTheme,
//   Divider,
//   Paper,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import SaveIcon from "@mui/icons-material/Save";
// import CloseIcon from "@mui/icons-material/Close";
// import { alpha } from "@mui/material/styles";
// import type { PlanViewRow } from "../api/planApiSlice";
// // import type { PlanViewRow } from "../../api/planApiSlice";

// // ─── Static Data ──────────────────────────────────────────────────────────────

// const STATIC_ACTIVITIES = {
//   activity_1: {
//     activityId: "ACT001",
//     activityName: "5G LKF Upgrade",
//     basicInfo: {
//       chmDomain: "Network",
//       chmSubDomain: "RAN",
//       domain: "RAN",
//       layer: "Access",
//       planType: "Plan-A",
//       vendorOEM: "Nokia",
//       changeImpact: "High",
//     },
//     phases: {
//       review: {
//         auto: {
//           chmDomain: "Network",
//           domain: "RAN",
//           planType: "Plan-A",
//           vendorOEM: "Nokia",
//           changeImpact: "High",
//         },
//         config: { crqReviewShift: "Night", crqReviewTimeMinutes: 30 },
//       },
//       impactAnalysis: {
//         auto: {
//           chmDomain: "Network",
//           domain: "RAN",
//           planType: "Plan-A",
//           vendorOEM: "Nokia",
//         },
//         config: { impactShift: "General", minimumLevel: "L2", timeMinutes: 45 },
//       },
//       scheduling: {
//         auto: {
//           domain: "RAN",
//           layer: "Access",
//           vendor: "Nokia",
//           plan: "Plan-A",
//           changeImpact: "High",
//         },
//         config: { shift: "Night", level: "L3", durationMinutes: 60 },
//       },
//       mopCreation: {
//         config: { shift: "General", minimumLevel: "L2", timeMinutes: 90 },
//       },
//       mopValidation: {
//         config: { shift: "General", minimumLevel: "L3", timeMinutes: 60 },
//       },
//       execution: {
//         config: {
//           executionShift: "Night",
//           daysMargin: 2,
//           reservationMargin: 1,
//           activityTimeMinutes: 120,
//           minimumLevel: "L3",
//           rollbackTimeMinutes: 45,
//         },
//       },
//     },
//   },
//   activity_2: {
//     activityId: "ACT002",
//     activityName: "Fiber Cutover",
//     basicInfo: {
//       chmDomain: "Network",
//       chmSubDomain: "Transport",
//       domain: "Transport",
//       layer: "Core",
//       planType: "Plan-B",
//       vendorOEM: "STL",
//       changeImpact: "Medium",
//     },
//     phases: {
//       review: {
//         auto: {
//           chmDomain: "Network",
//           domain: "Transport",
//           planType: "Plan-B",
//           vendorOEM: "STL",
//           changeImpact: "Medium",
//         },
//         config: { crqReviewShift: "General", crqReviewTimeMinutes: 20 },
//       },
//       impactAnalysis: {
//         auto: {
//           chmDomain: "Network",
//           domain: "Transport",
//           planType: "Plan-B",
//           vendorOEM: "STL",
//         },
//         config: { impactShift: "General", minimumLevel: "L1", timeMinutes: 30 },
//       },
//       scheduling: {
//         auto: {
//           domain: "Transport",
//           layer: "Core",
//           vendor: "STL",
//           plan: "Plan-B",
//           changeImpact: "Medium",
//         },
//         config: { shift: "Evening", level: "L2", durationMinutes: 45 },
//       },
//       mopCreation: {
//         config: { shift: "General", minimumLevel: "L1", timeMinutes: 60 },
//       },
//       mopValidation: {
//         config: { shift: "General", minimumLevel: "L2", timeMinutes: 45 },
//       },
//       execution: {
//         config: {
//           executionShift: "Night",
//           daysMargin: 1,
//           reservationMargin: 1,
//           activityTimeMinutes: 90,
//           minimumLevel: "L2",
//           rollbackTimeMinutes: 30,
//         },
//       },
//     },
//   },
// };

// // ─── Dropdown options ─────────────────────────────────────────────────────────

// const SHIFTS = [
//   "General",
//   "Morning (06:00 - 14:00)",
//   "Evening (14:00 - 22:00)",
//   "Night (22:00 - 06:00)",
// ];
// const LEVELS = ["L1", "L2", "L3", "L4"];
// const STAGE_KEYS = [
//   "review",
//   "impactAnalysis",
//   "scheduling",
//   "mopCreation",
//   "mopValidation",
//   "execution",
// ] as const;
// const STAGE_LABELS: Record<(typeof STAGE_KEYS)[number], string> = {
//   review: "Review",
//   impactAnalysis: "Impact Analysis",
//   scheduling: "Scheduling",
//   mopCreation: "MOP Creation",
//   mopValidation: "MOP Validation",
//   execution: "Execution",
// };

// type StageKey = (typeof STAGE_KEYS)[number];
// type Activity = typeof STATIC_ACTIVITIES.activity_1;

// // ─── Shared: Auto-filled read-only chip row ───────────────────────────────────

// const AutoFields: React.FC<{ data: Record<string, string> }> = ({ data }) => {
//   const theme = useTheme();
//   return (
//     <Paper
//       variant="outlined"
//       sx={{
//         p: 1.5,
//         mb: 2.5,
//         borderRadius: 2,
//         backgroundColor: alpha(theme.palette.info.main, 0.04),
//         borderColor: alpha(theme.palette.info.main, 0.2),
//       }}
//     >
//       <Typography
//         sx={{
//           fontSize: 10,
//           fontWeight: 700,
//           color: "info.main",
//           letterSpacing: "0.08em",
//           mb: 1,
//         }}
//       >
//         AUTO-FILLED (READ ONLY)
//       </Typography>
//       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//         {Object.entries(data).map(([key, val]) => (
//           <Box
//             key={key}
//             sx={{
//               px: 1.5,
//               py: 0.4,
//               borderRadius: 1,
//               backgroundColor: alpha(theme.palette.info.main, 0.08),
//               border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
//               display: "flex",
//               gap: 0.75,
//               alignItems: "center",
//             }}
//           >
//             <Typography
//               sx={{
//                 fontSize: 10,
//                 color: "text.secondary",
//                 textTransform: "capitalize",
//               }}
//             >
//               {key}:
//             </Typography>
//             <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
//               {val}
//             </Typography>
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // ─── Phase Forms ──────────────────────────────────────────────────────────────

// const ReviewForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const phase = activity.phases.review;
//   const [config, setConfig] = useState(phase.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="CRQ Review Shift"
//             value={config.crqReviewShift}
//             onChange={set("crqReviewShift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="CRQ Review Time (Minutes)"
//             value={config.crqReviewTimeMinutes}
//             onChange={set("crqReviewTimeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save Review", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save Review
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const ImpactAnalysisForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const phase = activity.phases.impactAnalysis;
//   const [config, setConfig] = useState(phase.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Impact Shift"
//             value={config.impactShift}
//             onChange={set("impactShift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Minimum Level"
//             value={config.minimumLevel}
//             onChange={set("minimumLevel")}
//           >
//             {LEVELS.map((l) => (
//               <MenuItem key={l} value={l}>
//                 {l}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Time (Minutes)"
//             value={config.timeMinutes}
//             onChange={set("timeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save Impact Analysis", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save Impact Analysis
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const SchedulingForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const phase = activity.phases.scheduling;
//   const [config, setConfig] = useState(phase.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       {phase.auto && <AutoFields data={phase.auto as Record<string, string>} />}
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Shift"
//             value={config.shift}
//             onChange={set("shift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Level"
//             value={config.level}
//             onChange={set("level")}
//           >
//             {LEVELS.map((l) => (
//               <MenuItem key={l} value={l}>
//                 {l}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Duration (Minutes)"
//             value={config.durationMinutes}
//             onChange={set("durationMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save Scheduling", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save Scheduling
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const MopCreationForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const [config, setConfig] = useState(activity.phases.mopCreation.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Shift"
//             value={config.shift}
//             onChange={set("shift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Minimum Level"
//             value={config.minimumLevel}
//             onChange={set("minimumLevel")}
//           >
//             {LEVELS.map((l) => (
//               <MenuItem key={l} value={l}>
//                 {l}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Time (Minutes)"
//             value={config.timeMinutes}
//             onChange={set("timeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save MOP Creation", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save MOP Creation
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const MopValidationForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const [config, setConfig] = useState(activity.phases.mopValidation.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Shift"
//             value={config.shift}
//             onChange={set("shift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Minimum Level"
//             value={config.minimumLevel}
//             onChange={set("minimumLevel")}
//           >
//             {LEVELS.map((l) => (
//               <MenuItem key={l} value={l}>
//                 {l}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Time (Minutes)"
//             value={config.timeMinutes}
//             onChange={set("timeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save MOP Validation", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save MOP Validation
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const ExecutionForm: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const [config, setConfig] = useState(activity.phases.execution.config);
//   const set =
//     (k: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setConfig((p) => ({ ...p, [k]: e.target.value }));

//   return (
//     <Box>
//       <Grid container spacing={2.5}>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Execution Shift"
//             value={config.executionShift}
//             onChange={set("executionShift")}
//           >
//             {SHIFTS.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Minimum Level"
//             value={config.minimumLevel}
//             onChange={set("minimumLevel")}
//           >
//             {LEVELS.map((l) => (
//               <MenuItem key={l} value={l}>
//                 {l}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Days Margin"
//             value={config.daysMargin}
//             onChange={set("daysMargin")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Reservation Margin"
//             value={config.reservationMargin}
//             onChange={set("reservationMargin")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Activity Time (Minutes)"
//             value={config.activityTimeMinutes}
//             onChange={set("activityTimeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//           <TextField
//             fullWidth
//             size="small"
//             type="number"
//             label="Rollback Time (Minutes)"
//             value={config.rollbackTimeMinutes}
//             onChange={set("rollbackTimeMinutes")}
//           />
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<SaveIcon />}
//               disableElevation
//               onClick={() =>
//                 console.log("Save Execution", activity.activityId, config)
//               }
//               sx={{ textTransform: "none", borderRadius: 1.5 }}
//             >
//               Save Execution
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// // ─── Phase Tab Content router ─────────────────────────────────────────────────

// const PhaseContent: React.FC<{ stageKey: StageKey; activity: Activity }> = ({
//   stageKey,
//   activity,
// }) => {
//   switch (stageKey) {
//     case "review":
//       return <ReviewForm activity={activity} />;
//     case "impactAnalysis":
//       return <ImpactAnalysisForm activity={activity} />;
//     case "scheduling":
//       return <SchedulingForm activity={activity} />;
//     case "mopCreation":
//       return <MopCreationForm activity={activity} />;
//     case "mopValidation":
//       return <MopValidationForm activity={activity} />;
//     case "execution":
//       return <ExecutionForm activity={activity} />;
//     default:
//       return null;
//   }
// };

// // ─── Activity Tabs ────────────────────────────────────────────────────────────

// const ActivityStageTabs: React.FC<{ activity: Activity }> = ({ activity }) => {
//   const [activeTab, setActiveTab] = useState(0);

//   return (
//     <Box sx={{ width: "100%", pb: 2 }}>
//       <Tabs
//         value={activeTab}
//         onChange={(_, val) => setActiveTab(val)}
//         variant="scrollable"
//         scrollButtons="auto"
//         sx={{
//           borderBottom: 1,
//           borderColor: "divider",
//           px: 2,
//           "& .MuiTab-root": {
//             textTransform: "none",
//             fontWeight: 600,
//             fontSize: 13,
//           },
//         }}
//       >
//         {STAGE_KEYS.map((key) => (
//           <Tab key={key} label={STAGE_LABELS[key]} />
//         ))}
//       </Tabs>

//       <Box sx={{ p: 2.5, minHeight: 240 }}>
//         <PhaseContent stageKey={STAGE_KEYS[activeTab]} activity={activity} />
//       </Box>
//     </Box>
//   );
// };

// // ─── Accordion list ───────────────────────────────────────────────────────────

// const ActivityAccordionList: React.FC = () => {
//   const theme = useTheme();
//   const activities = Object.values(STATIC_ACTIVITIES);
//   const [expanded, setExpanded] = useState<string | false>(
//     activities[0].activityId,
//   );

//   const handleChange =
//     (id: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
//       setExpanded(isExpanded ? id : false);
//     };

//   return (
//     <>
//       {activities.map((activity) => {
//         const isOpen = expanded === activity.activityId;
//         return (
//           <Accordion
//             key={activity.activityId}
//             expanded={isOpen}
//             onChange={handleChange(activity.activityId)}
//             variant="outlined"
//             sx={{
//               mb: 2,
//               borderRadius: "8px !important",
//               backgroundColor: "#fff",
//               "&:before": { display: "none" },
//               border: `1px solid ${isOpen ? theme.palette.primary.main : theme.palette.divider}`,
//               boxShadow: isOpen
//                 ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
//                 : "none",
//               transition: "all 0.2s ease-in-out",
//             }}
//           >
//             <AccordionSummary
//               expandIcon={<ExpandMoreIcon />}
//               sx={{
//                 backgroundColor: isOpen
//                   ? alpha(theme.palette.primary.main, 0.04)
//                   : "transparent",
//                 borderRadius: "8px",
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 2,
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   fontWeight={isOpen ? 700 : 500}
//                   color={isOpen ? "primary.main" : "text.primary"}
//                 >
//                   {isOpen ? "▼" : "▶"} {activity.activityName}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   sx={{ pt: 0.3 }}
//                 >
//                   Domain: {activity.basicInfo.domain} &nbsp;|&nbsp; Layer:{" "}
//                   {activity.basicInfo.layer} &nbsp;|&nbsp; Vendor:{" "}
//                   {activity.basicInfo.vendorOEM} &nbsp;|&nbsp; Impact:{" "}
//                   {activity.basicInfo.changeImpact}
//                 </Typography>
//               </Box>
//             </AccordionSummary>

//             <AccordionDetails sx={{ p: 0 }}>
//               <Divider />
//               <ActivityStageTabs activity={activity} />
//             </AccordionDetails>
//           </Accordion>
//         );
//       })}
//     </>
//   );
// };

// // ─── Main Dialog ──────────────────────────────────────────────────────────────

// interface Props {
//   open: boolean;
//   plan: PlanViewRow | null;
//   onClose: () => void;
// }

// export const PlanDetailDialog: React.FC<Props> = ({ open, plan, onClose }) => {
//   const theme = useTheme();

//   if (!plan) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="lg"
//       PaperProps={{ sx: { borderRadius: 2, minHeight: "70vh" } }}
//     >
//       {/* ── Header ── */}
//       <DialogTitle
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           fontWeight: 700,
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           pb: 1.5,
//         }}
//       >
//         <Box>
//           <Typography fontWeight={700} fontSize={16}>
//             {plan.planType}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             Plan #{plan.planId} &nbsp;|&nbsp; Domain: {plan.domain}
//             &nbsp;|&nbsp; Layer: {plan.layer} &nbsp;|&nbsp; Vendor:{" "}
//             {plan.vendorOem}
//             &nbsp;|&nbsp; Impact: {plan.changeImpact}
//           </Typography>
//         </Box>
//         <IconButton
//           onClick={onClose}
//           size="small"
//           sx={{ color: "text.secondary", mt: -0.5 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       {/* ── Body ── */}
//       <DialogContent
//         dividers
//         sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}
//       >
//         <ActivityAccordionList />
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PlanDetailDialog;
