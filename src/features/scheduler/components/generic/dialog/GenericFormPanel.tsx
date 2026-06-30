import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
// import type { StageConfig } from "../../../types/stageWorkflow.types";
import { FieldRenderer } from "./FieldRenderer";
import type { StageConfig } from "../../../types/stageWorkflow.types";

interface GenericFormPanelProps {
  crq: any;
  stageConfig: StageConfig;
  isCancelled: boolean;
  panelOpen: boolean;
  colors: any;
  setPanelOpen: (v: boolean) => void;
  onClose: () => void;
  onSubmitDone: (values: Record<string, any>, crq: any) => Promise<{ success: boolean }>;
}

/**
 * One form panel, driven entirely by `stageConfig.statusOptions` and
 * `stageConfig.fields`. This single component replaces the bespoke
 * `FormPanel` that previously existed only for the Impact Analysis stage -
 * every other stage now reuses it as-is.
 */
export const GenericFormPanel: React.FC<GenericFormPanelProps> = ({
  crq,
  stageConfig,
  isCancelled,
  panelOpen,
  colors,
  setPanelOpen,
  onClose,
  onSubmitDone,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Record<string, any>>({
    defaultValues: { status: undefined, remark: "" },
  });

  const values = useWatch({ control }) as Record<string, any>;

  const handleFormSubmit = async (formValues: Record<string, any>) => {
    if (!crq?.crqNo || !crq?.crqId || !formValues.status) return;
    setIsSubmitting(true);
    const result = await onSubmitDone(formValues, crq);
    setIsSubmitting(false);
    if (result.success) onClose();
  };

  const paletteColor: Record<string, string> = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
  };

  return (
    <Box
      component="aside"
      sx={{
        width: panelOpen ? { xs: "100%", md: "360px" } : "0px",
        minWidth: panelOpen ? { xs: "100%", md: "360px" } : "0px",
        transition: "width 280ms ease, min-width 280ms ease, opacity 200ms ease",
        opacity: panelOpen ? 1 : 0,
        borderRight: panelOpen ? `1px solid ${colors.border}` : "none",
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.surface,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {panelOpen && (
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: colors.textSecondary,
            }}
          >
            {stageConfig.label} Action
          </Box>

          <DialogContent sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
            <Stack spacing={2.5}>
              <Collapse in={isCancelled} unmountOnExit>
                <Alert severity="error" icon={<WarningAmberRoundedIcon fontSize="small" />}>
                  This CRQ is <strong>Cancelled</strong>. All actions are disabled.
                </Alert>
              </Collapse>

              {/* Outcome selector, built from stageConfig.statusOptions */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 12, mb: 1, display: "block" }}
                >
                  Select outcome *
                </Typography>
                <Stack spacing={1} role="radiogroup">
                  {stageConfig.statusOptions.map((opt) => {
                    const color = paletteColor[opt.palette];
                    const Icon = opt.icon;
                    const selected = values.status === opt.value;
                    return (
                      <Box
                        key={opt.value}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => !isCancelled && setValue("status", opt.value, { shouldDirty: true, shouldValidate: true })}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1.5px solid",
                          borderColor: selected ? color : colors.border,
                          bgcolor: selected ? alpha(color, 0.06) : colors.surface,
                          cursor: isCancelled ? "not-allowed" : "pointer",
                          opacity: isCancelled ? 0.5 : 1,
                        }}
                      >
                        <Icon sx={{ fontSize: 18, color: selected ? color : colors.textSecondary }} />
                        <Box>
                          <Typography sx={{ fontSize: 13.5, fontWeight: selected ? 700 : 500, color: selected ? color : colors.textPrimary }}>
                            {opt.label}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>
                            {opt.description}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
                {errors.status && (
                  <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, fontSize: 12 }}>
                    {(errors.status as any)?.message}
                  </Alert>
                )}
              </Box>

              {/* Remaining config-driven fields (cancellation block, remarks, etc) */}
              {stageConfig.fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  control={control}
                  errors={errors}
                  values={values}
                  disabled={isCancelled}
                />
              ))}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 2, py: 1.25, borderTop: `1px solid ${colors.border}` }}>
            <Button
              size="small"
              onClick={() => setPanelOpen(false)}
              startIcon={<ChevronLeftIcon sx={{ fontSize: "16px !important" }} />}
              sx={{ color: colors.textSecondary, textTransform: "none" }}
            >
              Hide Panel
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !isDirty || isCancelled}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckCircleOutlineIcon sx={{ fontSize: "17px !important" }} />
                )
              }
              sx={{ textTransform: "none", bgcolor: colors.accent }}
            >
              {isSubmitting ? "Submitting…" : `Submit ${stageConfig.label}`}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Box>
  );
};

export default GenericFormPanel;
