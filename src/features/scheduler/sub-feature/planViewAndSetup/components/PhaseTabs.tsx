import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// import { useActivity } from "../../../hooks/useActivity";
import { ReadonlyAutoFields } from "./shared/ActivityShared";
import type { Activity } from "../types/activity.types";
import { useActivity } from "../hooks/useActivity";
// import type { Activity } from "../../../types/activity.types";

// --- Shared Constants ---
const SHIFT_OPTIONS = [
  "Morning (06:00 - 14:00)",
  "Evening (14:00 - 22:00)",
  "Night (22:00 - 06:00)",
];
const LEVEL_OPTIONS = ["L1", "L2", "L3"];

const compactSelect = {
  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 36 },
};
const compactInput = {
  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 36 },
};

// --- Reusable Form Wrapper ---
interface PhaseWrapperProps {
  title: string;
  onSave: () => void;
  children: React.ReactNode;
}

const PhaseWrapper: React.FC<PhaseWrapperProps> = ({
  title,
  onSave,
  children,
}) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: theme.palette.primary.main,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </Typography>

      {children}

      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
          onClick={onSave}
          sx={{ fontSize: 12, borderRadius: 1.5, px: 3, fontWeight: 600 }}
        >
          Save {title}
        </Button>
      </Box>
    </Box>
  );
};

// --- Field Row Helper ---
const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      sx={{ fontSize: 12, fontWeight: 500, mb: 0.5, color: "text.primary" }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

// ==========================================
// WIREFRAME 4: Review Phase Tab
// ==========================================
export const ReviewPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.review as any);

  const save = () => handleSavePhase(activity.id, "review", form);

  return (
    <PhaseWrapper title="Review Phase" onSave={save}>
      <ReadonlyAutoFields
        fields={[
          { label: "CHM Domain", value: activity.chmDomain },
          { label: "Domain", value: activity.domain },
          { label: "Plan Type", value: activity.planType },
          { label: "Vendor OEM", value: activity.vendorOEM || "—" },
          { label: "Change Impact", value: activity.changeImpact },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="CRQ Review Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.crqReviewShift || ""}
                onChange={(e) =>
                  setForm({ ...form, crqReviewShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Minimum Level Requirement">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.crqReviewMinLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, crqReviewMinLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="CRQ Review Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 30"
              value={form.crqReviewTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, crqReviewTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};

// ==========================================
// WIREFRAME 5: Impact Analysis Phase Tab
// ==========================================
export const ImpactAnalysisPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.impactAnalysis as any);
  const save = () => handleSavePhase(activity.id, "impactAnalysis", form);

  return (
    <PhaseWrapper title="Impact Analysis Phase" onSave={save}>
      <ReadonlyAutoFields
        fields={[
          { label: "CHM Domain", value: activity.chmDomain },
          { label: "Domain", value: activity.domain },
          { label: "Plan Type", value: activity.planType },
          { label: "Vendor OEM", value: activity.vendorOEM || "—" },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="Impact Analysis Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.impactAnalysisShift || ""}
                onChange={(e) =>
                  setForm({ ...form, impactAnalysisShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Minimum Level Requirement">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.impactAnalysisMinLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, impactAnalysisMinLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Impact Analysis Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 45"
              value={form.impactAnalysisTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, impactAnalysisTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};

// ==========================================
// WIREFRAME 6: Scheduling Phase Tab
// ==========================================
export const SchedulingPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.scheduling as any);
  const save = () => handleSavePhase(activity.id, "scheduling", form);

  return (
    <PhaseWrapper title="Scheduling & Approval Phase" onSave={save}>
      <ReadonlyAutoFields
        fields={[
          { label: "Domain", value: activity.domain },
          { label: "Layer", value: activity.layer },
          { label: "Vendor OEM", value: activity.vendorOEM || "—" },
          { label: "Plan Type", value: activity.planType },
          { label: "Change Impact", value: activity.changeImpact },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="Scheduling Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.schedulingShift || ""}
                onChange={(e) =>
                  setForm({ ...form, schedulingShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Scheduling Level">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.schedulingLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, schedulingLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Scheduling Duration (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 60"
              value={form.schedulingDurationMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, schedulingDurationMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};

// ==========================================
// WIREFRAME 7: MOP Creation Phase Tab
// ==========================================
export const MOPCreationPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.mopCreation as any);
  const save = () => handleSavePhase(activity.id, "mopCreation", form);

  return (
    <PhaseWrapper title="MOP Creation Phase" onSave={save}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="MOP Creation Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.mopCreationShift || ""}
                onChange={(e) =>
                  setForm({ ...form, mopCreationShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Minimum Level Requirement">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.mopCreationMinLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, mopCreationMinLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="MOP Creation Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 120"
              value={form.mopCreationTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, mopCreationTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};

// ==========================================
// WIREFRAME 8: MOP Validation Phase Tab
// ==========================================
export const MOPValidationPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.mopValidation as any);
  const save = () => handleSavePhase(activity.id, "mopValidation", form);

  return (
    <PhaseWrapper title="MOP Validation Phase" onSave={save}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="MOP Validation Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.mopValidationShift || ""}
                onChange={(e) =>
                  setForm({ ...form, mopValidationShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Minimum Level Requirement">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.mopValidationMinLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, mopValidationMinLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="MOP Validation Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 45"
              value={form.mopValidationTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, mopValidationTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};

// ==========================================
// WIREFRAME 9: Execution Phase Tab
// ==========================================
export const ExecutionPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const [form, setForm] = useState(activity.phases.execution as any);
  const save = () => handleSavePhase(activity.id, "execution", form);

  return (
    <PhaseWrapper title="Execution Phase" onSave={save}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormField label="Activity NW Exec Shift">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.activityNWExecShift || ""}
                onChange={(e) =>
                  setForm({ ...form, activityNWExecShift: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shift
                </MenuItem>
                {SHIFT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Days Margin (Days)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 2"
              value={form.daysMargin || ""}
              onChange={(e) => setForm({ ...form, daysMargin: e.target.value })}
            />
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Reservation Margin (Days)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 5"
              value={form.reservationMargin || ""}
              onChange={(e) =>
                setForm({ ...form, reservationMargin: e.target.value })
              }
            />
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Activity Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 180"
              value={form.activityTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, activityTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Execution Minimum Level">
            <FormControl fullWidth sx={compactSelect}>
              <Select
                value={form.executionMinLevel || ""}
                onChange={(e) =>
                  setForm({ ...form, executionMinLevel: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Level
                </MenuItem>
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label="Rollback Time (Minutes)">
            <TextField
              fullWidth
              type="number"
              sx={compactInput}
              placeholder="e.g. 60"
              value={form.rollbackTimeMinutes || ""}
              onChange={(e) =>
                setForm({ ...form, rollbackTimeMinutes: e.target.value })
              }
            />
          </FormField>
        </Grid>
      </Grid>
    </PhaseWrapper>
  );
};
