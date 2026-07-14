import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Add,
  Close,
  LightMode,
  NightsStay,
  Save,
  Schedule,
  WbSunny,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import { useAddActivityMutation, type PlanViewRow } from "../api/planApiSlice";
import ActivityPhaseSection from "./ActivityPhaseSection";

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_PHASE_SLIM = {
  shift: "",
  minimumLevelRequirement: "",
  requiredTimeMinutes: 0,
  assignedToTeam: 0,
};

const INITIAL_PHASE_FULL = {
  ...INITIAL_PHASE_SLIM,
  daysMargin: 0,
  reservationMargin: 0,
  rollbackTime: 0,
};

const PHASES = [
  { key: "crqReview",      label: "CRQ Review",       variant: "slim" },
  { key: "impactAnalysis",  label: "Impact Analysis",  variant: "slim" },
  { key: "scheduling",      label: "Scheduling",       variant: "slim" },
  { key: "mopCreate",       label: "MOP Create",       variant: "slim" },
  { key: "mopValidate",     label: "MOP Validate",     variant: "slim" },
  { key: "crqExecution",    label: "CRQ Execution",    variant: "full" },
] as const;

type PhaseKey = (typeof PHASES)[number]["key"];

const INITIAL_FORM = {
  activityName: "",
  crqReview:      { ...INITIAL_PHASE_SLIM },
  impactAnalysis:  { ...INITIAL_PHASE_SLIM },
  scheduling:      { ...INITIAL_PHASE_SLIM },
  mopCreate:       { ...INITIAL_PHASE_SLIM },
  mopValidate:     { ...INITIAL_PHASE_SLIM },
  crqExecution:    { ...INITIAL_PHASE_FULL },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  plan: PlanViewRow;
  onClose: () => void;
  /** Existing activity names on this plan, for a friendly duplicate-name check. */
  existingActivityNames?: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const AddActivityDialog: React.FC<Props> = ({
  open,
  plan,
  onClose,
  existingActivityNames = [],
}) => {
  const [addActivity, { isLoading }] = useAddActivityMutation();

  const [form, setForm] = useState(INITIAL_FORM);

  const [activityNameError, setActivityNameError] = useState<string | null>(null);
  const [phaseShiftErrors, setPhaseShiftErrors] = useState<Set<PhaseKey>>(new Set());
  const [phaseTeamErrors, setPhaseTeamErrors] = useState<Set<PhaseKey>>(new Set());

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Stable across renders (functional setState) so memoized phase sections
   *  don't re-render just because a sibling phase or the activity name changed. */
  const updatePhase = useCallback((phase: PhaseKey, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [field]: value,
      },
    }));
    if (field === "shift" && value) {
      setPhaseShiftErrors((prev) => {
        if (!prev.has(phase)) return prev;
        const next = new Set(prev);
        next.delete(phase);
        return next;
      });
    }
    if (field === "assignedToTeam" && value) {
      setPhaseTeamErrors((prev) => {
        if (!prev.has(phase)) return prev;
        const next = new Set(prev);
        next.delete(phase);
        return next;
      });
    }
  }, []);

  // One stable onChange callback per phase, created once, so each
  // ActivityPhaseSection's props stay referentially identical across
  // renders that don't touch that phase - this is what lets React.memo
  // actually skip re-rendering the other 5 phases while one is being edited.
  const phaseOnChangeHandlers = useMemo(
    () =>
      Object.fromEntries(
        PHASES.map(({ key }) => [
          key,
          (field: string, value: any) => updatePhase(key, field, value),
        ]),
      ) as Record<PhaseKey, (field: string, value: any) => void>,
    [updatePhase],
  );

  /** Matches ActivityInsertRequestDTO's @NotBlank/@NotNull on every phase's shift + team + activityName */
  const validateForm = (): boolean => {
    const missingShifts = new Set(
      PHASES.filter(({ key }) => !form[key].shift).map(({ key }) => key),
    );
    const missingTeams = new Set(
      PHASES.filter(({ key }) => !form[key].assignedToTeam).map(({ key }) => key),
    );
    const trimmedName = form.activityName.trim();
    const isDuplicate = existingActivityNames.some(
      (name) => name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    let nameError: string | null = null;
    if (!trimmedName) nameError = "Activity Name is required";
    else if (isDuplicate) nameError = "An activity with this name already exists on this plan";

    setActivityNameError(nameError);
    setPhaseShiftErrors(missingShifts);
    setPhaseTeamErrors(missingTeams);

    return !nameError && missingShifts.size === 0 && missingTeams.size === 0;
  };

  const applyShiftToAll = useCallback((_: React.MouseEvent, shift: string | null) => {
    if (!shift) return;
    setForm((prev) => {
      const updated = { ...prev };
      PHASES.forEach(({ key }) => {
        updated[key] = { ...prev[key], shift };
      });
      return updated;
    });
  }, []);

  // ── Build API payload with prefixed param names ────────────────────────────

  const buildPayload = () => {
    const payload: Record<string, any> = {
      planId: plan.planId,
      activityName: form.activityName.trim(),
    };

    PHASES.forEach(({ key, variant }) => {
      const phase = form[key];

      // 4 common fields — always sent
      payload[`${key}Shift`]                   = phase.shift;
      payload[`${key}MinimumLevelRequirement`] = phase.minimumLevelRequirement;
      payload[`${key}RequiredTimeMinutes`]      = phase.requiredTimeMinutes;
      payload[`${key}AssignedToTeam`]           = phase.assignedToTeam;

      // 3 extra fields — only for crqExecution
      if (variant === "full") {
        const full = phase as typeof INITIAL_PHASE_FULL;
        payload[`${key}DaysMargin`]        = full.daysMargin;
        payload[`${key}ReservationMargin`] = full.reservationMargin;
        payload[`${key}RollbackTime`]      = full.rollbackTime;
      }
    });

    return payload;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in the required fields highlighted below.");
      return;
    }
    try {
      await addActivity(buildPayload()).unwrap();
      toast.success("Activity added successfully!");
      setForm(INITIAL_FORM);
      setActivityNameError(null);
      setPhaseShiftErrors(new Set());
      setPhaseTeamErrors(new Set());
      onClose();
    } catch (err) {
      console.error(err);
      const msg =
        (err as any)?.data?.message || (err as any)?.message || "Failed to add activity. Please try again.";
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setActivityNameError(null);
    setPhaseShiftErrors(new Set());
    setPhaseTeamErrors(new Set());
    onClose();
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const configuredCount = PHASES.filter(
    ({ key }) =>
      form[key].shift !== "" || form[key].minimumLevelRequirement !== "",
  ).length;
  const progress = Math.round((configuredCount / PHASES.length) * 100);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          py: 2, px: 3, borderBottom: "1px solid", borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2,
            bgcolor: "primary.main", display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "primary.contrastText", flexShrink: 0,
          }}
        >
          <Add />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Add New Activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Plan #{plan.planId} · Configure all six phases for this activity
          </Typography>
        </Box>
        <Chip
          label={`${configuredCount}/${PHASES.length} configured`}
          size="small"
          color={configuredCount === PHASES.length ? "success" : "default"}
          variant="outlined"
        />
        <IconButton size="small" onClick={handleCancel} sx={{ ml: 1 }} disabled={isLoading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 3 }}
      />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Activity Name"
            placeholder="e.g. Network Maintenance Upgrade"
            value={form.activityName}
            onChange={(e) => {
              const next = e.target.value;
              setForm((prev) => ({ ...prev, activityName: next }));
              if (activityNameError && next.trim()) setActivityNameError(null);
            }}
            error={!!activityNameError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Add color="action" />
                </InputAdornment>
              ),
            }}
            helperText={
              activityNameError ??
              "Enter a descriptive name that identifies this activity"
            }
          />

          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              p: 1.5, bgcolor: "action.hover", borderRadius: 2, flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
              Apply shift to all phases:
            </Typography>
            <ToggleButtonGroup
              exclusive size="small" onChange={applyShiftToAll}
              sx={{ bgcolor: "background.paper", borderRadius: 1.5 }}
            >
              <ToggleButton value="General" sx={{ px: 1.5, fontSize: 12 }}>
                <Schedule sx={{ fontSize: 14, mr: 0.5 }} /> General
              </ToggleButton>
              <ToggleButton value="Morning" sx={{ px: 1.5, fontSize: 12 }}>
                <WbSunny sx={{ fontSize: 14, mr: 0.5 }} /> Morning
              </ToggleButton>
              <ToggleButton value="Evening" sx={{ px: 1.5, fontSize: 12 }}>
                <LightMode sx={{ fontSize: 14, mr: 0.5 }} /> Evening
              </ToggleButton>
              <ToggleButton value="Night" sx={{ px: 1.5, fontSize: 12 }}>
                <NightsStay sx={{ fontSize: 14, mr: 0.5 }} /> Night
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PHASE CONFIGURATION
            </Typography>
          </Divider>

          {PHASES.map(({ key, label, variant }, idx) => (
            <ActivityPhaseSection
              key={key}
              title={label}
              variant={variant}
              value={form[key]}
              onChange={phaseOnChangeHandlers[key]}
              phaseIndex={idx}
              shiftError={phaseShiftErrors.has(key)}
              teamError={phaseTeamErrors.has(key)}
            />
          ))}
        </Stack>
      </DialogContent>

      <Box
        sx={{
          p: 2.5, px: 3, display: "flex",
          justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid", borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {configuredCount === 0
            ? "No phases configured yet"
            : `${configuredCount} of ${PHASES.length} phases configured`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" color="inherit" onClick={handleCancel}
            startIcon={<Close />} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={isLoading || !form.activityName.trim()}
            startIcon={<Save />} sx={{ minWidth: 140 }}>
            {isLoading ? "Saving…" : "Save Activity"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddActivityDialog;
