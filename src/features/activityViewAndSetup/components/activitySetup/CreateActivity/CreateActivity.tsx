import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";

import { useActivity } from "../../../hooks/useActivity";
import { useOrgHierarchyState } from "../../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useGetPlanOptionsQuery, useInsertActivityMutation } from "../../../api/acitivityApiSlice";
import type { InsertActivityPayload } from "../../../types/activity.types";
import { FieldRow } from "../shared/FieldRow";
import { SectionHeader } from "../shared/SectionHeader";
import { compactSelect, compactTextField } from "../shared/formStyles";
import { PHASE_CONFIGS } from "../shared/phaseFieldConfigs";
import PhaseConfigSection, { type PhaseFormValue } from "./PhaseConfigSection";

const EMPTY_SLIM: PhaseFormValue = {
  shift: "",
  minimumLevelRequirement: "",
  requiredTimeMinutes: 0,
  assignedToTeam: 0,
};

const EMPTY_FULL: PhaseFormValue = {
  ...EMPTY_SLIM,
  daysMargin: 0,
  reservationMargin: 0,
  rollbackTime: 0,
};

const initialPhaseState = (): Record<string, PhaseFormValue> =>
  Object.fromEntries(
    PHASE_CONFIGS.map(({ insertKey, variant }) => [
      insertKey,
      variant === "full" ? { ...EMPTY_FULL } : { ...EMPTY_SLIM },
    ]),
  );

export const CreateActivity: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { goToList, notify } = useActivity();
  const [insertActivity, { isLoading: isSaving }] = useInsertActivityMutation();

  const { values: orgValues, handleChange: handleOrgChange } = useOrgHierarchyState();
  const { options: orgOptions } = useOrgHierarchyFilters(orgValues);

  const { data: planOptions = [], isFetching: isLoadingPlans } = useGetPlanOptionsQuery(
    {
      verticalId: orgValues.vertical,
      functionId: orgValues.teamFunction,
      domainId: orgValues.domain,
      subDomainId: orgValues.subDomain,
    },
    { skip: orgValues.subDomain === undefined },
  );

  const activePlans = useMemo(
    () => planOptions.filter((p) => p.status === "Active"),
    [planOptions],
  );

  const [planId, setPlanId] = useState<number | "">("");
  const [activityName, setActivityName] = useState("");
  const [phases, setPhases] = useState<Record<string, PhaseFormValue>>(initialPhaseState);
  const [errors, setErrors] = useState<{ planId?: string; activityName?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPlan = activePlans.find((p) => p.planId === planId);

  const updatePhase = (insertKey: string, field: keyof PhaseFormValue, value: string | number) => {
    setPhases((prev) => ({ ...prev, [insertKey]: { ...prev[insertKey], [field]: value } }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!planId) next.planId = "Plan is required";
    if (!activityName.trim()) next.activityName = "Activity Name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!validate() || !planId) return;

    const payload: InsertActivityPayload = {
      planId,
      activityName: activityName.trim(),
    };

    PHASE_CONFIGS.forEach(({ insertKey, variant }) => {
      const phase = phases[insertKey];
      payload[`${insertKey}Shift`] = phase.shift;
      payload[`${insertKey}MinimumLevelRequirement`] = phase.minimumLevelRequirement;
      payload[`${insertKey}RequiredTimeMinutes`] = phase.requiredTimeMinutes;
      payload[`${insertKey}AssignedToTeam`] = phase.assignedToTeam;
      if (variant === "full") {
        payload[`${insertKey}DaysMargin`] = phase.daysMargin ?? 0;
        payload[`${insertKey}ReservationMargin`] = phase.reservationMargin ?? 0;
        payload[`${insertKey}RollbackTime`] = phase.rollbackTime ?? 0;
      }
    });

    try {
      const result = await insertActivity(payload).unwrap();
      notify(result?.message ?? "Activity created successfully.", "success");
      goToList();
    } catch (err) {
      const fetchErr = err as {
        data?: { message?: string; error_message?: string };
        error?: string;
      };
      setSubmitError(
        fetchErr?.data?.message ??
          fetchErr?.data?.error_message ??
          fetchErr?.error ??
          "Failed to create activity. Please try again.",
      );
    }
  };

  return (
    <>
      <DialogTitle
        sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ fontSize: 20, color: "success.main" }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Create Activity
          </Typography>
        </Box>
        <IconButton size="small" onClick={goToList}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          backgroundColor: isDark
            ? alpha(theme.palette.success.main, 0.04)
            : alpha(theme.palette.success.main, 0.02),
        }}
      >
        {submitError && (
          <Alert
            severity="error"
            onClose={() => setSubmitError(null)}
            sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}
          >
            {submitError}
          </Alert>
        )}

        <Stack spacing={0}>
          <SectionHeader
            title="Plan"
            subtitle="Activities are created under an existing, active plan"
          />
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <FieldRow label="CHM Domain" required>
              <FormControl fullWidth size="small" sx={compactSelect}>
                <Select
                  value={orgValues.domain ?? ""}
                  displayEmpty
                  onChange={(e) => handleOrgChange("domain", Number(e.target.value) || undefined)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select CHM Domain
                  </MenuItem>
                  {orgOptions.domain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            <FieldRow label="CHM Sub-Domain" required>
              <FormControl
                fullWidth
                size="small"
                disabled={!orgValues.domain}
                sx={compactSelect}
              >
                <Select
                  value={orgValues.subDomain ?? ""}
                  displayEmpty
                  onChange={(e) => handleOrgChange("subDomain", Number(e.target.value) || undefined)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select CHM Sub-Domain
                  </MenuItem>
                  {orgOptions.subDomain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            <FieldRow label="Plan" required error={errors.planId}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.planId}
                disabled={!orgValues.subDomain}
                sx={compactSelect}
              >
                <Select
                  value={planId}
                  displayEmpty
                  onChange={(e) => setPlanId(Number(e.target.value) || "")}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    {isLoadingPlans ? "Loading plans…" : "Select Plan"}
                  </MenuItem>
                  {activePlans.map((p) => (
                    <MenuItem key={p.planId} value={p.planId} sx={{ fontSize: 12 }}>
                      #{p.planId} · {p.domain} / {p.layer} / {p.planType} · {p.vendorOem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            {selectedPlan && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, pl: "180px" }}>
                {[
                  ["Vendor", selectedPlan.vendorOem],
                  ["Impact", selectedPlan.changeImpact],
                  ["Status", selectedPlan.status],
                ].map(([label, val]) => (
                  <Typography key={label} variant="caption" color="text.secondary">
                    {label}: <b>{val}</b>
                  </Typography>
                ))}
              </Box>
            )}
          </Stack>

          <SectionHeader title="Activity Details" />
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <FieldRow label="Activity Name" required error={errors.activityName}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 5G LKF Node Expansion"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                error={!!errors.activityName}
                inputProps={{ maxLength: 30 }}
                sx={compactTextField}
              />
            </FieldRow>
          </Stack>

          <Divider>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PHASE CONFIGURATION
            </Typography>
          </Divider>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {PHASE_CONFIGS.map(({ insertKey, label, variant }, idx) => (
              <PhaseConfigSection
                key={insertKey}
                title={label}
                variant={variant}
                value={phases[insertKey]}
                onChange={(field, value) => updatePhase(insertKey, field, value)}
                phaseIndex={idx}
              />
            ))}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: isDark
            ? alpha(theme.palette.background.default, 0.4)
            : theme.palette.grey[50],
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={goToList}
          sx={{ fontSize: 12, textTransform: "none", borderRadius: 1.5, px: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={
            isSaving ? <CircularProgress size={12} color="inherit" /> : <SaveIcon sx={{ fontSize: 13 }} />
          }
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            fontSize: 12,
            textTransform: "none",
            borderRadius: 1.5,
            fontWeight: 600,
            px: 2.5,
            backgroundColor: "success.main",
            "&:hover": { backgroundColor: "success.dark" },
          }}
        >
          {isSaving ? "Saving…" : "Save Activity"}
        </Button>
      </DialogActions>
    </>
  );
};
