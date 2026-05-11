import React, { useState, useCallback, useRef } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Autocomplete,
  Popper,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { useActivity } from "../hooks/useActivity";
import { useInsertActivityMutation } from "../../../../activityViewAndSetup/api/acitivityApiSlice";
import { useOrgHierarchyFilters } from "../../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useOrgHierarchyState } from "../../../../orgHierarchy/hooks/useOrgHierarchyState";

// ─── Constants ────────────────────────────────────────────────────────────────
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
const VENDOR_OEM_SUGGESTIONS = [
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

const CHANGE_IMPACT_OPTIONS = [
  { value: "Low",      color: "#639922", bg: "#EAF3DE", text: "#27500A" },
  { value: "Medium",   color: "#BA7517", bg: "#FAEEDA", text: "#633806" },
  { value: "High",     color: "#E24B4A", bg: "#FCEBEB", text: "#791F1F" },
  { value: "Critical", color: "#534AB7", bg: "#EEEDFE", text: "#3C3489" },
] as const;

type ChangeImpact = (typeof CHANGE_IMPACT_OPTIONS)[number]["value"];

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormValues {
  layer: string;
  planType: string;
  activityName: string;
  vendorOem: string[]; // multi-tag
  changeImpact: ChangeImpact | "";
}

type FormErrors = Partial<Record<keyof FormValues | "chmDomain" | "chmSubDomain" | "domain", string>>;

// ─── Sub-components ───────────────────────────────────────────────────────────

const sx = {
  compactSelect: {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 34 },
  },
  compactInput: {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 12, height: 34 },
  },
} as const;

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "success.main",
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontSize: 10, color: "text.disabled", mt: 0.25 }}>
        {subtitle}
      </Typography>
    )}
    <Divider sx={{ mt: 0.75, borderColor: (t) => alpha(t.palette.success.main, 0.2) }} />
  </Box>
);

const FieldRow: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, error, children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "160px minmax(0,1fr)",
      alignItems: "flex-start",
      gap: 1.5,
      mb: 1.25,
      minHeight: 34,
    }}
  >
    <Box sx={{ pt: "9px" }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: error ? "error.main" : "text.primary",
          lineHeight: 1.4,
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: "error.main", ml: 0.25 }}>*</Box>
        )}
      </Typography>
      {hint && (
        <Typography sx={{ fontSize: 10, color: "text.disabled", mt: 0.25 }}>
          {hint}
        </Typography>
      )}
    </Box>
    <Box>
      {children}
      {error && (
        <Typography sx={{ fontSize: 10, color: "error.main", mt: 0.25, display: "flex", alignItems: "center", gap: 0.4 }}>
          <ErrorOutlineIcon sx={{ fontSize: 11 }} /> {error}
        </Typography>
      )}
    </Box>
  </Box>
);

// ─── Vendor multi-tag input ───────────────────────────────────────────────────
const VendorTagInput: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  error?: boolean;
}> = ({ value, onChange, error }) => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,+$/, "");
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal("");
  };

  const removeTag = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <Box
      onClick={() => inputRef.current?.focus()}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.5,
        minHeight: 34,
        px: 1,
        py: 0.5,
        border: "1px solid",
        borderColor: error ? "error.main" : "divider",
        borderRadius: 1.5,
        bgcolor: "background.paper",
        cursor: "text",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.12)}`,
        },
      }}
    >
      {value.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          onDelete={() => removeTag(tag)}
          sx={{
            height: 22,
            fontSize: 11,
            bgcolor: "info.50",
            color: "info.800",
            "& .MuiChip-deleteIcon": { fontSize: 13, color: "info.600" },
          }}
        />
      ))}
      <Autocomplete
        freeSolo
        options={VENDOR_OEM_SUGGESTIONS.filter((s) => !value.includes(s))}
        inputValue={inputVal}
        onInputChange={(_, v) => setInputVal(v)}
        onChange={(_, v) => { if (v) { addTag(v as string); } }}
        PopperComponent={(props) => (
          <Popper {...props} style={{ width: 220, zIndex: 1400 }} />
        )}
        PaperComponent={(props) => (
          <Paper {...props} sx={{ fontSize: 12, borderRadius: 1.5, mt: 0.5 }} />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            variant="standard"
            placeholder={value.length === 0 ? "Type vendor, press Enter" : "Add more…"}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
                e.preventDefault();
                addTag(inputVal);
              } else if (e.key === "Backspace" && inputVal === "" && value.length) {
                onChange(value.slice(0, -1));
              }
            }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              sx: { fontSize: 12, minWidth: 80 },
            }}
          />
        )}
        sx={{ flex: 1, minWidth: 80 }}
      />
    </Box>
  );
};

// ─── Change impact selector ───────────────────────────────────────────────────
const ImpactSelect: React.FC<{
  value: ChangeImpact | "";
  onChange: (v: ChangeImpact) => void;
  error?: boolean;
}> = ({ value, onChange, error }) => {
  const selected = CHANGE_IMPACT_OPTIONS.find((o) => o.value === value);

  return (
    <FormControl fullWidth size="small" error={error} sx={sx.compactSelect}>
      <Select
        value={value}
        displayEmpty
        onChange={(e) => onChange(e.target.value as ChangeImpact)}
        renderValue={(v) =>
          v && selected ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: selected.color,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 12 }}>{v}</Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              Select impact level
            </Typography>
          )
        }
      >
        <MenuItem value="" disabled sx={{ fontSize: 12 }}>
          Select impact level
        </MenuItem>
        {CHANGE_IMPACT_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: opt.color,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 12 }}>{opt.value}</Typography>
              <Chip
                label={opt.value === "Critical" ? "P0" : opt.value === "High" ? "P1" : opt.value === "Medium" ? "P2" : "P3"}
                size="small"
                sx={{
                  height: 16,
                  fontSize: 10,
                  bgcolor: opt.bg,
                  color: opt.text,
                  "& .MuiChip-label": { px: 0.75 },
                  ml: "auto",
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const CreateActivity: React.FC = () => {
  const { goToList, openConfigure } = useActivity();
  const [insertActivity, { isLoading: isSaving }] = useInsertActivityMutation();

  const { values: orgValues, handleChange: handleOrgChange } = useOrgHierarchyState();
  const { options: orgOptions } = useOrgHierarchyFilters(orgValues);

  const [form, setForm] = useState<FormValues>({
    layer: "",
    planType: "",
    activityName: "",
    vendorOem: [],
    changeImpact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const clearOrgError = (key: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!orgValues.chmDomain)       next.chmDomain    = "Required";
    if (!orgValues.subDomain)       next.chmSubDomain  = "Required";
    if (!orgValues.domain)          next.domain        = "Required";
    if (!form.layer)                next.layer         = "Required";
    if (!form.planType)             next.planType      = "Required";
    if (!form.activityName.trim())  next.activityName  = "Activity name is required";
    if (form.vendorOem.length === 0) next.vendorOem    = "Add at least one vendor";
    if (!form.changeImpact)         next.changeImpact  = "Required";
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
        chmDomain:    orgValues.chmDomain!,
        chmSubDomain: orgValues.subDomain!,
        domain:       domainName,
        layer:        form.layer,
        planType:     form.planType,
        activityName: form.activityName.trim(),
        vendorOem:    form.vendorOem.join("/"),
        changeImpact: form.changeImpact,
      }).unwrap();

      const newId = result?.activityId ?? result?.id;
      if (newId) {
        openConfigure({
          activityId:   newId,
          activityName: form.activityName.trim(),
          chmDomain:    orgValues.chmDomain,
          chmSubDomain: orgValues.subDomain,
          domain:       domainName,
          layer:        form.layer,
          planType:     form.planType,
          vendorOem:    form.vendorOem.join("/"),
          changeImpact: form.changeImpact,
          status:       "Draft",
        });
      } else {
        goToList();
      }
    } catch (err: any) {
      setSubmitError(
        err?.data?.message ?? err?.error ?? "Failed to create activity. Please try again."
      );
    }
  };

  const actNameLen = form.activityName.length;

  return (
    <>
      <DialogTitle
        sx={{
          m: 0,
          px: 2.5,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              bgcolor: (t) => alpha(t.palette.success.main, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon sx={{ fontSize: 16, color: "success.main" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Create activity</Typography>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
              Define a new activity and configure its phases
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={goToList} sx={{ borderRadius: 1.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 2.5,
          bgcolor: (t) => alpha(t.palette.success.main, 0.025),
        }}
      >
        {submitError && (
          <Alert
            severity="error"
            onClose={() => setSubmitError(null)}
            sx={{ mb: 2, borderRadius: 1.5, fontSize: 12 }}
          >
            {submitError}
          </Alert>
        )}

        <Stack spacing={0}>
          {/* ── Section 1: Org scope ── */}
          <SectionHeader
            title="Organizational scope"
            subtitle="Determines which domain hierarchy this activity belongs to"
          />
          <Stack spacing={0} sx={{ mb: 2.5 }}>
            <FieldRow label="CHM domain" required error={errors.chmDomain}>
              <FormControl fullWidth size="small" error={!!errors.chmDomain} sx={sx.compactSelect}>
                <Select
                  value={orgValues.chmDomain ?? ""}
                  displayEmpty
                  onChange={(e) => {
                    handleOrgChange("chmDomain", Number(e.target.value) || undefined);
                    clearOrgError("chmDomain");
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select CHM domain</MenuItem>
                  {orgOptions.chmDomain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>{opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>

            <FieldRow label="CHM sub-domain" required error={errors.chmSubDomain}>
              <FormControl
                fullWidth size="small"
                error={!!errors.chmSubDomain}
                disabled={!orgValues.chmDomain}
                sx={sx.compactSelect}
              >
                <Select
                  value={orgValues.subDomain ?? ""}
                  displayEmpty
                  onChange={(e) => {
                    handleOrgChange("subDomain", Number(e.target.value) || undefined);
                    clearOrgError("chmSubDomain");
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select CHM sub-domain</MenuItem>
                  {orgOptions.subDomain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>{opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>

            <FieldRow label="Domain" required error={errors.domain}>
              <FormControl
                fullWidth size="small"
                error={!!errors.domain}
                disabled={!orgValues.subDomain}
                sx={sx.compactSelect}
              >
                <Select
                  value={orgValues.domain ?? ""}
                  displayEmpty
                  onChange={(e) => {
                    handleOrgChange("domain", Number(e.target.value) || undefined);
                    clearOrgError("domain");
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select domain</MenuItem>
                  {orgOptions.domain?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: 12 }}>{opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
          </Stack>

          {/* ── Section 2: Activity details ── */}
          <SectionHeader
            title="Activity details"
            subtitle="Technical and operational parameters"
          />
          <Stack spacing={0}>
            <FieldRow label="Layer" required error={errors.layer}>
              <FormControl fullWidth size="small" error={!!errors.layer} sx={sx.compactSelect}>
                <Select
                  value={form.layer}
                  displayEmpty
                  onChange={(e) => setField("layer", e.target.value)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select layer</MenuItem>
                  {LAYER_OPTIONS.map((l) => (
                    <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>

            <FieldRow label="Plan type" required error={errors.planType}>
              <FormControl fullWidth size="small" error={!!errors.planType} sx={sx.compactSelect}>
                <Select
                  value={form.planType}
                  displayEmpty
                  onChange={(e) => setField("planType", e.target.value)}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select plan type</MenuItem>
                  {PLAN_TYPE_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: 12 }}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>

            <FieldRow label="Activity name" required error={errors.activityName}>
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 5G LKF node expansion"
                  value={form.activityName}
                  onChange={(e) => setField("activityName", e.target.value)}
                  error={!!errors.activityName}
                  inputProps={{ maxLength: 120 }}
                  sx={sx.compactInput}
                />
                <Typography
                  sx={{
                    fontSize: 10,
                    color: actNameLen > 100 ? "warning.main" : "text.disabled",
                    textAlign: "right",
                    mt: 0.25,
                  }}
                >
                  {actNameLen}/120
                </Typography>
              </Box>
            </FieldRow>

            <FieldRow label="Vendor / OEM" required error={errors.vendorOem}>
              <Box>
                <VendorTagInput
                  value={form.vendorOem}
                  onChange={(v) => setField("vendorOem", v)}
                  error={!!errors.vendorOem}
                />
                <Typography sx={{ fontSize: 10, color: "text.disabled", mt: 0.25 }}>
                  Multiple vendors allowed — press Enter or comma to add
                </Typography>
              </Box>
            </FieldRow>

            <FieldRow
              label="Change impact"
              required
              hint="Affects SLA and approval routing"
              error={errors.changeImpact}
            >
              <ImpactSelect
                value={form.changeImpact}
                onChange={(v) => setField("changeImpact", v)}
                error={!!errors.changeImpact}
              />
            </FieldRow>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
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
            isSaving
              ? <CircularProgress size={12} color="inherit" />
              : <SaveIcon sx={{ fontSize: 14 }} />
          }
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            fontSize: 12,
            textTransform: "none",
            borderRadius: 1.5,
            fontWeight: 500,
            px: 2.5,
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" },
          }}
        >
          {isSaving ? "Saving…" : "Save & configure phases"}
        </Button>
      </DialogActions>
    </>
  );
};