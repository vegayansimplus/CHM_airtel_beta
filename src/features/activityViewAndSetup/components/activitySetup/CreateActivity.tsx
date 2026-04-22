import React, { useState, useCallback } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
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

import { useActivity } from "../../hooks/useActivity";
import { useOrgHierarchyState } from "../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useInsertActivityMutation } from "../../api/acitivityApiSlice";

const LAYER_OPTIONS = [
  "Access",
  "Aggregation",
  "Core",
  "Backhaul",
  "Transmission",
  "IP/MPLS",
];
const PLAN_TYPE_OPTIONS = [
  "Upgrade",
  "Greenfield",
  "Rollout",
  "Migration",
  "Decommission",
  "Maintenance",
];
const VENDOR_OEM_OPTIONS = [
  "Huawei",
  "Nokia",
  "Ericsson",
  "ZTE",
  "Samsung",
  "Cisco",
  "Juniper",
  "STL",
  "Corning",
];
const CHANGE_IMPACT_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

interface FormValues {
  layer: string;
  planType: string;
  activityName: string;
  vendorOem: string;
  changeImpact: string;
}
type FormErrors = Partial<
  Record<keyof FormValues | "chmDomain" | "chmSubDomain" | "domain", string>
>;

const IMPACT_DOT: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
  Critical: "#7c3aed",
};

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: theme.palette.primary.main,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          display="block"
          color="text.disabled"
          sx={{ fontSize: 10, mt: 0.2 }}
        >
          {subtitle}
        </Typography>
      )}
      <Divider
        sx={{ mt: 0.75, borderColor: alpha(theme.palette.primary.main, 0.18) }}
      />
    </Box>
  );
};

const FieldRow: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}> = ({ label, required, children, error, hint }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      alignItems: "flex-start",
      gap: 2,
      minHeight: 40,
    }}
  >
    <Box sx={{ pt: 1.1 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: error ? "error.main" : "text.primary",
          lineHeight: 1.4,
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: "error.main", ml: 0.25 }}>
            *
          </Box>
        )}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: "text.disabled" }}
        >
          {hint}
        </Typography>
      )}
    </Box>
    <Box>
      {children}
      {error && (
        <FormHelperText error sx={{ mt: 0.25, fontSize: 10, ml: 0 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  </Box>
);

const compactSelect = {
  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 34 },
  "& .MuiInputLabel-root": { fontSize: 12 },
};
const compactTextField = {
  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 34 },
  "& .MuiInputLabel-root": { fontSize: 12 },
};

export const CreateActivity: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { goToList, openConfigure } = useActivity();
  const [insertActivity, { isLoading: isSaving }] = useInsertActivityMutation();

  const { values: orgValues, handleChange: handleOrgChange } =
    useOrgHierarchyState();
  const { options: orgOptions } = useOrgHierarchyFilters(orgValues);

  const [form, setForm] = useState<FormValues>({
    layer: "",
    planType: "",
    activityName: "",
    vendorOem: "",
    changeImpact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!orgValues.chmDomain) next.chmDomain = "CHM Domain is required";
    if (!orgValues.subDomain) next.chmSubDomain = "CHM Sub-Domain is required";
    if (!orgValues.domain) next.domain = "Domain is required";
    if (!form.layer) next.layer = "Layer is required";
    if (!form.planType) next.planType = "Plan Type is required";
    if (!form.activityName.trim())
      next.activityName = "Activity Name is required";
    if (!form.vendorOem) next.vendorOem = "Vendor / OEM is required";
    if (!form.changeImpact) next.changeImpact = "Change Impact is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      const domainName =
        orgOptions.domain?.find((d) => d.id === orgValues.domain)?.name ??
        String(orgValues.domain);
      const result = await insertActivity({
        chmDomain: orgValues.chmDomain!,
        chmSubDomain: orgValues.subDomain!,
        domain: domainName,
        layer: form.layer,
        planType: form.planType,
        activityName: form.activityName.trim(),
        vendorOem: form.vendorOem,
        changeImpact: form.changeImpact,
      }).unwrap();

      const newId = result?.activityId ?? result?.id;
      if (newId) {
        // Construct API-like object to pass directly to Redux Configure Screen
        openConfigure({
          activityId: newId,
          activityName: form.activityName.trim(),
          chmDomain: orgValues.chmDomain,
          chmSubDomain: orgValues.subDomain,
          domain: domainName,
          layer: form.layer,
          planType: form.planType,
          vendorOem: form.vendorOem,
          changeImpact: form.changeImpact,
          status: "Draft",
        });
      } else {
        goToList();
      }
    } catch (err: any) {
      setSubmitError(
        err?.data?.message ??
          err?.error ??
          "Failed to create activity. Please try again.",
      );
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
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
            title="Organizational Scope"
            subtitle="Determines which domain hierarchy this activity belongs to"
          />
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <FieldRow label="CHM Domain" required error={errors.chmDomain}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.chmDomain}
                sx={compactSelect}
              >
                <Select
                  value={orgValues.chmDomain ?? ""}
                  displayEmpty
                  onChange={(e) =>
                    handleOrgChange(
                      "chmDomain",
                      Number(e.target.value) || undefined,
                    )
                  }
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select CHM Domain
                  </MenuItem>
                  {orgOptions.chmDomain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            <FieldRow
              label="CHM Sub-Domain"
              required
              error={errors.chmSubDomain}
            >
              <FormControl
                fullWidth
                size="small"
                error={!!errors.chmSubDomain}
                disabled={!orgValues.chmDomain}
                sx={compactSelect}
              >
                <Select
                  value={orgValues.subDomain ?? ""}
                  displayEmpty
                  onChange={(e) =>
                    handleOrgChange(
                      "subDomain",
                      Number(e.target.value) || undefined,
                    )
                  }
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
            <FieldRow label="Domain" required error={errors.domain}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.domain}
                disabled={!orgValues.subDomain}
                sx={compactSelect}
              >
                <Select
                  value={orgValues.domain ?? ""}
                  displayEmpty
                  onChange={(e) =>
                    handleOrgChange(
                      "domain",
                      Number(e.target.value) || undefined,
                    )
                  }
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select Domain
                  </MenuItem>
                  {orgOptions.domain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
          </Stack>

          <SectionHeader
            title="Activity Details"
            subtitle="Define the technical and operational parameters"
          />
          <Stack spacing={1.5}>
            <FieldRow label="Layer" required error={errors.layer}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.layer}
                sx={compactSelect}
              >
                <Select
                  value={form.layer}
                  displayEmpty
                  onChange={(e) => setField("layer", e.target.value)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select Layer
                  </MenuItem>
                  {LAYER_OPTIONS.map((l) => (
                    <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            <FieldRow label="Plan Type" required error={errors.planType}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.planType}
                sx={compactSelect}
              >
                <Select
                  value={form.planType}
                  displayEmpty
                  onChange={(e) => setField("planType", e.target.value)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select Plan Type
                  </MenuItem>
                  {PLAN_TYPE_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: 12 }}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
            <FieldRow
              label="Activity Name"
              required
              error={errors.activityName}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 5G LKF Node Expansion"
                value={form.activityName}
                onChange={(e) => setField("activityName", e.target.value)}
                error={!!errors.activityName}
                inputProps={{ maxLength: 120 }}
                sx={compactTextField}
              />
            </FieldRow>
            <FieldRow label="Vendor / OEM" required error={errors.vendorOem}>
              <Autocomplete
                size="small"
                options={VENDOR_OEM_OPTIONS}
                value={form.vendorOem || null}
                onChange={(_, v) => setField("vendorOem", v ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select or type vendor"
                    error={!!errors.vendorOem}
                    sx={compactTextField}
                  />
                )}
                freeSolo
                renderOption={(props, option) => (
                  <MenuItem {...props} sx={{ fontSize: 12 }}>
                    {option}
                  </MenuItem>
                )}
              />
            </FieldRow>
            <FieldRow
              label="Change Impact"
              required
              error={errors.changeImpact}
              hint="Affects SLA and approval routing"
            >
              <FormControl
                fullWidth
                size="small"
                error={!!errors.changeImpact}
                sx={compactSelect}
              >
                <Select
                  value={form.changeImpact}
                  displayEmpty
                  onChange={(e) => setField("changeImpact", e.target.value)}
                  renderValue={(v) =>
                    v ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: IMPACT_DOT[v] ?? "#9ca3af",
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: 12 }}>{v}</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                        Select Impact Level
                      </Typography>
                    )
                  }
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>
                    Select Impact Level
                  </MenuItem>
                  {CHANGE_IMPACT_OPTIONS.map((impact) => (
                    <MenuItem key={impact} value={impact} sx={{ fontSize: 12 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: IMPACT_DOT[impact],
                            flexShrink: 0,
                          }}
                        />
                        {impact}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
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
            isSaving ? (
              <CircularProgress size={12} color="inherit" />
            ) : (
              <SaveIcon sx={{ fontSize: 13 }} />
            )
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
          {isSaving ? "Saving…" : "Save & Configure Phases"}
        </Button>
      </DialogActions>
    </>
  );
};
