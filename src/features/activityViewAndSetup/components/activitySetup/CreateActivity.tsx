import React, { useState } from "react";
import {
  Box,
  Button,
  Breadcrumbs,
  Divider,
  Grid,
  Link,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import { useActivity } from "../../hooks/useActivity";
import { FormSelect } from "./shared/ActivityShared";
import {
  CHM_DOMAIN_OPTIONS,
  CHM_SUBDOMAIN_OPTIONS,
  DOMAIN_OPTIONS,
  LAYER_OPTIONS,
  PLAN_TYPE_OPTIONS,
  VENDOR_OPTIONS,
  CHANGE_IMPACT_OPTIONS,
} from "../../data/activity.mock";
import type { CreateActivityForm } from "../../types/activity.types";

// ─────────────────────────────────────────────
//  Default form state
// ─────────────────────────────────────────────

const DEFAULT_FORM: CreateActivityForm = {
  activityName: "",
  chmDomain: "",
  chmSubDomain: "",
  domain: "",
  layer: "",
  planType: "",
  vendorOEM: "",
  changeImpact: "Low",
};

// ─────────────────────────────────────────────
//  Create Activity Form
// ─────────────────────────────────────────────

export const CreateActivity: React.FC = () => {
  const { goToList, handleCreate } = useActivity();
  const theme = useTheme();

  const [form, setForm] = useState<CreateActivityForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateActivityForm, string>>
  >({});

  const set = <K extends keyof CreateActivityForm>(
    key: K,
    val: CreateActivityForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: val,
      // Reset sub-domain when domain changes
      ...(key === "chmDomain" ? { chmSubDomain: "" } : {}),
    }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const required: (keyof CreateActivityForm)[] = [
      "activityName",
      "chmDomain",
      "chmSubDomain",
      "domain",
      "layer",
      "planType",
      "vendorOEM",
      "changeImpact",
    ];
    const newErrors: typeof errors = {};
    required.forEach((k) => {
      if (!form[k]) newErrors[k] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    handleCreate(form);
    // slice auto-navigates to configure
  };

  const subDomainOptions = form.chmDomain
    ? (CHM_SUBDOMAIN_OPTIONS[form.chmDomain] ?? [])
    : [];

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 1.5 }} separator="›">
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={goToList}
          sx={{ fontSize: 13 }}
        >
          Activities
        </Link>
        <Typography color="text.primary" sx={{ fontSize: 13 }}>
          Create activity
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Create activity
        </Typography>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={goToList}
          variant="text"
        >
          Back to list
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
        {/* Section title */}
        <Typography
          variant="overline"
          sx={{
            display: "block",
            mb: 2,
            color: theme.palette.text.secondary,
            fontWeight: 600,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 0.5,
          }}
        >
          Basic activity information
        </Typography>

        <Grid container spacing={2}>
          {/* CHM Domain */}
          <Grid
            // item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="CHM Domain *"
              value={form.chmDomain}
              options={CHM_DOMAIN_OPTIONS}
              onChange={(v) => set("chmDomain", v)}
              required
            />
            {errors.chmDomain && (
              <Typography variant="caption" color="error">
                {errors.chmDomain}
              </Typography>
            )}
          </Grid>

          {/* CHM Sub-Domain */}
          <Grid
            // item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="CHM Sub-Domain *"
              value={form.chmSubDomain}
              options={subDomainOptions}
              onChange={(v) => set("chmSubDomain", v)}
              required
              disabled={!form.chmDomain}
            />
            {errors.chmSubDomain && (
              <Typography variant="caption" color="error">
                {errors.chmSubDomain}
              </Typography>
            )}
          </Grid>

          {/* Domain */}
          <Grid
            // item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="Domain *"
              value={form.domain}
              options={DOMAIN_OPTIONS}
              onChange={(v) => set("domain", v)}
              required
            />
            {errors.domain && (
              <Typography variant="caption" color="error">
                {errors.domain}
              </Typography>
            )}
          </Grid>

          {/* Layer */}
          <Grid
            //  item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="Layer *"
              value={form.layer}
              options={LAYER_OPTIONS}
              onChange={(v) => set("layer", v)}
              required
            />
            {errors.layer && (
              <Typography variant="caption" color="error">
                {errors.layer}
              </Typography>
            )}
          </Grid>

          {/* Plan Type */}
          <Grid
            //  item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="Plan Type *"
              value={form.planType}
              options={PLAN_TYPE_OPTIONS}
              onChange={(v) => set("planType", v)}
              required
            />
            {errors.planType && (
              <Typography variant="caption" color="error">
                {errors.planType}
              </Typography>
            )}
          </Grid>

          {/* Vendor OEM */}
          <Grid
            //  item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="Vendor OEM *"
              value={form.vendorOEM}
              options={VENDOR_OPTIONS}
              onChange={(v) => set("vendorOEM", v)}
              required
            />
            {errors.vendorOEM && (
              <Typography variant="caption" color="error">
                {errors.vendorOEM}
              </Typography>
            )}
          </Grid>

          {/* Activity Name (full width) */}
          <Grid
            // item xs={12}
            size={{ xs: 12 }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Activity Name *
              </Typography>
              <input
                type="text"
                value={form.activityName}
                placeholder="Enter activity name"
                onChange={(e) => set("activityName", e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: "8px 12px",
                  fontSize: 14,
                  border: `1px solid ${errors.activityName ? "#d32f2f" : theme.palette.divider}`,
                  borderRadius: 4,
                  outline: "none",
                  background: "transparent",
                  color: theme.palette.text.primary,
                  boxSizing: "border-box",
                }}
              />
              {errors.activityName && (
                <Typography variant="caption" color="error">
                  {errors.activityName}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Change Impact */}
          <Grid
            // item xs={12} sm={6} md={4}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <FormSelect
              label="Change Impact *"
              value={form.changeImpact}
              options={CHANGE_IMPACT_OPTIONS}
              onChange={(v) =>
                set("changeImpact", v as CreateActivityForm["changeImpact"])
              }
              required
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSubmit}
          >
            Save & configure phases
          </Button>
          <Button variant="outlined" onClick={goToList}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
