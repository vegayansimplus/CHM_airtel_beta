import React, { useState } from "react";
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

const INITIAL_PHASE = {
  shift: "",
  minimumLevelRequirement: "",
  requiredTimeMinutes: 0,
  daysMargin: 0,
  reservationMargin: 0,
  rollbackTime: 0,
  assignedToTeam: 0,
};

const PHASES = [
  { key: "crqReview", label: "CRQ Review" },
  { key: "impactAnalysis", label: "Impact Analysis" },
  { key: "scheduling", label: "Scheduling" },
  { key: "mopCreate", label: "MOP Create" },
  { key: "mopValidate", label: "MOP Validate" },
  { key: "crqExecution", label: "CRQ Execution" },
] as const;

type PhaseKey = (typeof PHASES)[number]["key"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  plan: PlanViewRow;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AddActivityDialog: React.FC<Props> = ({ open, plan, onClose }) => {
  const [addActivity, { isLoading }] = useAddActivityMutation();

  const [form, setForm] = useState({
    activityName: "",
    crqReview: { ...INITIAL_PHASE },
    impactAnalysis: { ...INITIAL_PHASE },
    scheduling: { ...INITIAL_PHASE },
    mopCreate: { ...INITIAL_PHASE },
    mopValidate: { ...INITIAL_PHASE },
    crqExecution: { ...INITIAL_PHASE },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updatePhase = (phase: keyof typeof form, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [phase]: {
        ...(prev as any)[phase],
        [field]: value,
      },
    }));
  };

  const applyShiftToAll = (_: React.MouseEvent, shift: string | null) => {
    if (!shift) return;
    setForm((prev) => {
      const updated = { ...prev };
      PHASES.forEach(({ key }) => {
        updated[key] = { ...(prev[key] as any), shift };
      });
      return updated;
    });
  };

  // ── Submit (original RTK Query logic) ─────────────────────────────────────

  const handleSubmit = async () => {
    try {
      await addActivity({
        planId: plan.planId,
        ...form,
      }).unwrap();

      toast.success("Activity added successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add activity. Please try again.");
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const configuredCount = PHASES.filter(
    ({ key }) =>
      (form[key] as any).shift !== "" ||
      (form[key] as any).minimumLevelRequirement !== "",
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
    >
      {/* Title bar */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.contrastText",
          }}
        >
          <Add />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Add New Activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configure all phases for this activity
          </Typography>
        </Box>

        <Chip
          label={`${configuredCount}/${PHASES.length} configured`}
          size="small"
          color={configuredCount === PHASES.length ? "success" : "default"}
          variant="outlined"
        />

        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{pt:2}}>
          {/* Activity Name */}
          <TextField
            fullWidth
            label="Activity Name"
            placeholder="e.g. Network Maintenance Upgrade"
            value={form.activityName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, activityName: e.target.value }))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Add color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Enter a descriptive name that identifies this activity"
          />

          {/* Global Shift Setter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
              Apply shift to all phases:
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              onChange={applyShiftToAll}
              sx={{ bgcolor: "background.paper", borderRadius: 1.5 }}
            >
              <ToggleButton value="General" sx={{ px: 1.5, fontSize: 12 }}>
                <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                General
              </ToggleButton>
              <ToggleButton value="Morning" sx={{ px: 1.5, fontSize: 12 }}>
                <WbSunny sx={{ fontSize: 14, mr: 0.5 }} />
                Morning
              </ToggleButton>
              <ToggleButton value="Evening" sx={{ px: 1.5, fontSize: 12 }}>
                <LightMode sx={{ fontSize: 14, mr: 0.5 }} />
                Evening
              </ToggleButton>
              <ToggleButton value="Night" sx={{ px: 1.5, fontSize: 12 }}>
                <NightsStay sx={{ fontSize: 14, mr: 0.5 }} />
                Night
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              PHASE CONFIGURATION
            </Typography>
          </Divider>

          {/* Phase sections */}
          {PHASES.map(({ key, label }, idx) => (
            <ActivityPhaseSection
              key={key}
              title={label}
              value={(form as any)[key]}
              onChange={(f, v) => updatePhase(key, f, v)}
              phaseIndex={idx}
            />
          ))}
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          p: 2.5,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {configuredCount === 0
            ? "No phases configured yet"
            : `${configuredCount} of ${PHASES.length} phases configured`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            startIcon={<Close />}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || !form.activityName.trim()}
            startIcon={<Save />}
            sx={{ minWidth: 140 }}
          >
            {isLoading ? "Saving…" : "Save Activity"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddActivityDialog;
