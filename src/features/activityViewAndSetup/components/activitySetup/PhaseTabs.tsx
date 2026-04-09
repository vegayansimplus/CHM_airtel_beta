import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import {
  AutoReadonlyField,
  FormNumberInput,
  FormSelect,
  LevelToggle,
  MetaInfoBanner,
  SectionTitle,
} from "./shared/ActivityShared";
import { SHIFT_OPTIONS } from "../../data/activity.mock";
import type {
  Activity,
  LevelRequirement,
  ShiftType,
} from "../../types/activity.types";
import { useActivity } from "../../hooks/useActivity";

// ─────────────────────────────────────────────
//  Shared Save Button
// ─────────────────────────────────────────────

const SaveButton: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <Box sx={{ mt: 3, display: "flex", gap: 1.5 }}>
    <Button variant="contained" startIcon={<SaveIcon />} onClick={onClick}>
      {label}
    </Button>
  </Box>
);

// ─────────────────────────────────────────────
//  Auto fields banner derived from activity
// ─────────────────────────────────────────────

const AutoBanner: React.FC<{ activity: Activity; extended?: boolean }> = ({
  activity,
  extended = false,
}) => {
  const base = [
    { label: "CHM Domain", value: activity.chmDomain },
    { label: "Domain", value: activity.domain },
    { label: "Plan Type", value: activity.planType },
    { label: "Vendor OEM", value: activity.vendorOEM },
  ];
  const extra = extended
    ? [
        { label: "Layer", value: activity.layer },
        {
          label: "Change Impact",
          value: activity.changeImpact,
        },
      ]
    : [];
  return <MetaInfoBanner items={[...base, ...extra]} />;
};

// ═════════════════════════════════════════════
//  1. REVIEW PHASE
// ═════════════════════════════════════════════

export const ReviewPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const init = activity.phases.review;

  const [shift, setShift] = useState<ShiftType | "">(init.crqReviewShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.crqReviewMinLevel,
  );
  const [time, setTime] = useState<number | "">(init.crqReviewTimeMinutes);

  useEffect(() => {
    setShift(activity.phases.review.crqReviewShift);
    setLevel(activity.phases.review.crqReviewMinLevel);
    setTime(activity.phases.review.crqReviewTimeMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "review", {
      crqReviewShift: shift,
      crqReviewMinLevel: level,
      crqReviewTimeMinutes: time,
    });

  return (
    <Box>
      <SectionTitle>Auto-populated fields</SectionTitle>
      <AutoBanner activity={activity} />

      <SectionTitle>Review phase configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid
          // item xs={12} sm={4}
          size={{ xs: 12, sm: 4 }}
        >
          <AutoReadonlyField
            label="Change Impact"
            value={activity.changeImpact}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelect
            label="CRQ Review Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormNumberInput
            label="CRQ Review Time"
            value={time}
            onChange={(v) => setTime(v)}
            suffix="min"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            CRQ Review Minimum Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={(v) => setLevel(v)} />
          </Box>
        </Grid>
      </Grid>
      <SaveButton label="Save review phase" onClick={save} />
    </Box>
  );
};

// ═════════════════════════════════════════════
//  2. IMPACT ANALYSIS PHASE
// ═════════════════════════════════════════════

export const ImpactAnalysisPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const init = activity.phases.impactAnalysis;

  const [shift, setShift] = useState<ShiftType | "">(init.impactAnalysisShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.impactAnalysisMinLevel,
  );
  const [time, setTime] = useState<number | "">(init.impactAnalysisTimeMinutes);

  useEffect(() => {
    setShift(activity.phases.impactAnalysis.impactAnalysisShift);
    setLevel(activity.phases.impactAnalysis.impactAnalysisMinLevel);
    setTime(activity.phases.impactAnalysis.impactAnalysisTimeMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "impactAnalysis", {
      impactAnalysisShift: shift,
      impactAnalysisMinLevel: level,
      impactAnalysisTimeMinutes: time,
    });

  return (
    <Box>
      <SectionTitle>Auto-populated fields</SectionTitle>
      <AutoBanner activity={activity} />

      <SectionTitle>Impact analysis configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            label="Impact Analysis Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormNumberInput
            label="Impact Analysis Time"
            value={time}
            onChange={(v) => setTime(v)}
            suffix="min"
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Impact Analysis Minimum Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={setLevel} />
          </Box>
        </Grid>
      </Grid>
      <SaveButton label="Save impact analysis" onClick={save} />
    </Box>
  );
};

// ═════════════════════════════════════════════
//  3. SCHEDULING PHASE
// ═════════════════════════════════════════════

export const SchedulingPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const init = activity.phases.scheduling;

  const [shift, setShift] = useState<ShiftType | "">(init.schedulingShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.schedulingLevel,
  );
  const [duration, setDuration] = useState<number | "">(
    init.schedulingDurationMinutes,
  );

  useEffect(() => {
    setShift(activity.phases.scheduling.schedulingShift);
    setLevel(activity.phases.scheduling.schedulingLevel);
    setDuration(activity.phases.scheduling.schedulingDurationMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "scheduling", {
      schedulingShift: shift,
      schedulingLevel: level,
      schedulingDurationMinutes: duration,
    });

  return (
    <Box>
      <SectionTitle>Auto-populated fields</SectionTitle>
      <AutoBanner activity={activity} extended />

      <SectionTitle>Scheduling & approval configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid
          //  item xs={12} sm={6}
          size={{ xs: 12, sm: 6 }}
        >
          <FormSelect
            label="Scheduling Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid
          // item xs={12} sm={6}
          size={{ xs: 12, sm: 6 }}
        >
          <FormNumberInput
            label="Scheduling Duration"
            value={duration}
            onChange={setDuration}
            suffix="min"
            required
          />
        </Grid>
        <Grid
          //  item xs={12}
          size={{ xs: 12 }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Scheduling Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={setLevel} />
          </Box>
        </Grid>
      </Grid>
      <SaveButton label="Save scheduling phase" onClick={save} />
    </Box>
  );
};

// ═════════════════════════════════════════════
//  4. MOP CREATION PHASE
// ═════════════════════════════════════════════

export const MOPCreationPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const init = activity.phases.mopCreation;

  const [shift, setShift] = useState<ShiftType | "">(init.mopCreationShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.mopCreationMinLevel,
  );
  const [time, setTime] = useState<number | "">(init.mopCreationTimeMinutes);

  useEffect(() => {
    setShift(activity.phases.mopCreation.mopCreationShift);
    setLevel(activity.phases.mopCreation.mopCreationMinLevel);
    setTime(activity.phases.mopCreation.mopCreationTimeMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "mopCreation", {
      mopCreationShift: shift,
      mopCreationMinLevel: level,
      mopCreationTimeMinutes: time,
    });

  return (
    <Box>
      <SectionTitle>MOP creation configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid
          // item xs={12} sm={6}
          size={{ xs: 12, sm: 6 }}
        >
          <FormSelect
            label="MOP Creation Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid
          // item xs={12} sm={6}
          size={{ xs: 12, sm: 6 }}
        >
          <FormNumberInput
            label="MOP Creation Time"
            value={time}
            onChange={setTime}
            suffix="min"
            required
          />
        </Grid>
        <Grid
          // item xs={12}
          size={{ xs: 12 }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            MOP Creation Minimum Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={setLevel} />
          </Box>
        </Grid>
      </Grid>
      <SaveButton label="Save MOP creation" onClick={save} />
    </Box>
  );
};

// ═════════════════════════════════════════════
//  5. MOP VALIDATION PHASE
// ═════════════════════════════════════════════

export const MOPValidationPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase } = useActivity();
  const init = activity.phases.mopValidation;

  const [shift, setShift] = useState<ShiftType | "">(init.mopValidationShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.mopValidationMinLevel,
  );
  const [time, setTime] = useState<number | "">(init.mopValidationTimeMinutes);

  useEffect(() => {
    setShift(activity.phases.mopValidation.mopValidationShift);
    setLevel(activity.phases.mopValidation.mopValidationMinLevel);
    setTime(activity.phases.mopValidation.mopValidationTimeMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "mopValidation", {
      mopValidationShift: shift,
      mopValidationMinLevel: level,
      mopValidationTimeMinutes: time,
    });

  return (
    <Box>
      <SectionTitle>MOP validation configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            label="MOP Validation Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormNumberInput
            label="MOP Validation Time"
            value={time}
            onChange={setTime}
            suffix="min"
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            MOP Validation Minimum Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={setLevel} />
          </Box>
        </Grid>
      </Grid>
      <SaveButton label="Save MOP validation" onClick={save} />
    </Box>
  );
};

// ═════════════════════════════════════════════
//  6. EXECUTION PHASE
// ═════════════════════════════════════════════

export const ExecutionPhaseTab: React.FC<{ activity: Activity }> = ({
  activity,
}) => {
  const { handleSavePhase, goToList } = useActivity();
  const init = activity.phases.execution;

  const [shift, setShift] = useState<ShiftType | "">(init.activityNWExecShift);
  const [level, setLevel] = useState<LevelRequirement | "">(
    init.executionMinLevel,
  );
  const [daysMargin, setDaysMargin] = useState<number | "">(init.daysMargin);
  const [resvMargin, setResvMargin] = useState<number | "">(
    init.reservationMargin,
  );
  const [actTime, setActTime] = useState<number | "">(init.activityTimeMinutes);
  const [rollback, setRollback] = useState<number | "">(
    init.rollbackTimeMinutes,
  );

  useEffect(() => {
    const ex = activity.phases.execution;
    setShift(ex.activityNWExecShift);
    setLevel(ex.executionMinLevel);
    setDaysMargin(ex.daysMargin);
    setResvMargin(ex.reservationMargin);
    setActTime(ex.activityTimeMinutes);
    setRollback(ex.rollbackTimeMinutes);
  }, [activity.id]);

  const save = () =>
    handleSavePhase(activity.id, "execution", {
      activityNWExecShift: shift,
      executionMinLevel: level,
      daysMargin,
      reservationMargin: resvMargin,
      activityTimeMinutes: actTime,
      rollbackTimeMinutes: rollback,
    });

  return (
    <Box>
      <SectionTitle>Execution phase configuration</SectionTitle>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormSelect
            label="Activity NW Exec Shift"
            value={shift}
            options={SHIFT_OPTIONS}
            onChange={(v) => setShift(v as ShiftType)}
            required
          />
        </Grid>
        <Grid
          // item  size={{ xs: 12, sm: 6 , md:4}}
          size={{ xs: 12, sm: 6, md: 4 }}
        >
          <FormNumberInput
            label="Activity Time"
            value={actTime}
            onChange={setActTime}
            suffix="min"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormNumberInput
            label="Rollback Time"
            value={rollback}
            onChange={setRollback}
            suffix="min"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormNumberInput
            label="Days Margin"
            value={daysMargin}
            onChange={setDaysMargin}
            suffix="days"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormNumberInput
            label="Reservation Margin"
            value={resvMargin}
            onChange={setResvMargin}
            suffix="days"
            required
          />
        </Grid>
        <Grid
        // item xs={12}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Execution Minimum Level *
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <LevelToggle value={level} onChange={setLevel} />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>
          Save execution phase
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            save();
            goToList();
          }}
        >
          Finish & return to list ✓
        </Button>
      </Box>
    </Box>
  );
};
