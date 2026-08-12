import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";
import type { Colors } from "../../../types/colorTypes";
import {
  NAME_INTERFACE_PAIR_MAX,
  NODE_NAME_MAX,
} from "../../../types/crqValidation.types";
import {
  InfoTile,
  StatusChip,
  StepSection,
  StepSkeleton,
  formatDateTime,
} from "../reschedule/RescheduleAtoms";
import { stageLabel } from "../reschedule/stageLabel";
import { crqStatusPalette } from "../../../constants/workflowStages";
import { useValidateForm } from "./useValidateForm";

export interface ValidateDialogProps {
  open: boolean;
  onClose: () => void;
  crqNo: string | null;
  colors: Colors;
  /** Fired after a successful save, so the cockpit can refresh if it needs to. */
  onSaved?: () => void;
}

/**
 * Plan & Inventory (VALIDATE stage) "Validate" dialog.
 *
 * Read  -> get_crq_validation_details(crqNo)
 * Write -> update_validation_details(p_Crq_No, p_NodeName, p_NameInterfacePair)
 *
 * Deliberately owns no workflow logic: it never starts, pauses or advances a
 * stage. Current Stage / Validation Status are read-only header context taken
 * straight from CRQ_MASTER_TBL, so opening or saving here cannot move the CRQ.
 *
 * Field state, validation and the save call live in useValidateForm; this file
 * is layout only.
 */
export const ValidateDialog: React.FC<ValidateDialogProps> = ({
  open,
  onClose,
  crqNo,
  colors,
  onSaved,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const form = useValidateForm(crqNo, open);
  const {
    details,
    values,
    errors,
    isLoading,
    isFetching,
    isSaving,
    loadError,
    saveError,
    isNeverValidated,
    isDirty,
    canSave,
  } = form;

  const closeAndReset = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  /** Unsaved edits are worth one confirmation before they're thrown away. */
  const requestClose = useCallback(() => {
    if (isSaving) return;
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    closeAndReset();
  }, [isSaving, isDirty, closeAndReset]);

  const handleSave = useCallback(async () => {
    const ok = await form.save();
    if (!ok) return;
    onSaved?.();
    // Matches the rest of the cockpit's dialogs: a successful submit closes.
    closeAndReset();
  }, [form, onSaved, closeAndReset]);

  const renderBody = () => {
    if (isLoading) return <StepSkeleton rows={4} />;

    if (loadError) {
      return (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ fontSize: 12.5 }}
          action={
            <Button
              size="small"
              onClick={form.refetch}
              startIcon={<RefreshRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      );
    }

    if (!details) {
      return (
        <Alert severity="info" variant="outlined" sx={{ fontSize: 12.5 }}>
          No validation details available for this CRQ.
        </Alert>
      );
    }

    const statusPalette = crqStatusPalette(details.validationStatus, colors);

    return (
      <Fade in timeout={220}>
        <Box>
          {saveError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, fontSize: 12.5, py: 0.4 }}>
              {saveError}
            </Alert>
          )}

          {isNeverValidated && !saveError && (
            <Alert
              severity="info"
              variant="outlined"
              icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{ mb: 2, fontSize: 12.5, py: 0.4 }}
            >
              This CRQ has not been validated yet — fill in both fields below to record its
              validation details.
            </Alert>
          )}

          {/* Header: identity + live workflow context, all read-only. */}
          <StepSection
            icon={<FactCheckRoundedIcon sx={{ fontSize: 14 }} />}
            title="CRQ"
            colors={colors}
          >
            <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              <InfoTile label="CRQ Number" value={details.crqNo} colors={colors} mono />
              <InfoTile
                label="Plan ID"
                value={details.planId ?? "—"}
                colors={colors}
                mono
              />
              <InfoTile
                label="Current Stage"
                value={stageLabel(details.currentStage)}
                colors={colors}
                icon={<TimelineRoundedIcon sx={{ fontSize: 12 }} />}
                accent={colors.accent}
              />
              <InfoTile
                label="Validation Status"
                value={
                  details.validationStatus ? (
                    <StatusChip
                      label={statusPalette.label}
                      fg={statusPalette.fg}
                      bg={statusPalette.bg}
                      border={statusPalette.border}
                    />
                  ) : (
                    "—"
                  )
                }
                colors={colors}
              />
            </Stack>
          </StepSection>

          {/* Editable attributes - two columns on md+, stacked below. */}
          <StepSection
            icon={<HubRoundedIcon sx={{ fontSize: 14 }} />}
            title="Validation Details"
            colors={colors}
            action={
              details.updatedAt ? (
                <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: colors.textDim }}>
                  Last saved {formatDateTime(details.updatedAt)}
                </Typography>
              ) : undefined
            }
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.6}
              useFlexGap
              sx={{ alignItems: "flex-start" }}
            >
              <TextField
                label="Node Name"
                required
                fullWidth
                size="small"
                value={values.nodeName}
                onChange={(e) => form.setValue("nodeName", e.target.value)}
                onBlur={() => form.touch("nodeName")}
                disabled={isSaving}
                error={!!errors.nodeName}
                helperText={
                  errors.nodeName ?? `${values.nodeName.length}/${NODE_NAME_MAX}`
                }
                sx={{ flex: 1, minWidth: 0 }}
              />
              <TextField
                label="Name Interface Pair"
                required
                fullWidth
                size="small"
                multiline
                minRows={1}
                maxRows={3}
                value={values.nameInterfacePair}
                onChange={(e) => form.setValue("nameInterfacePair", e.target.value)}
                onBlur={() => form.touch("nameInterfacePair")}
                disabled={isSaving}
                error={!!errors.nameInterfacePair}
                helperText={
                  errors.nameInterfacePair ??
                  `${values.nameInterfacePair.length}/${NAME_INTERFACE_PAIR_MAX}`
                }
                sx={{ flex: 1, minWidth: 0 }}
              />
            </Stack>
          </StepSection>
        </Box>
      </Fade>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        maxWidth="md"
        fullWidth
        fullScreen={isSmall}
        TransitionComponent={SlideUpTransition}
        PaperProps={{
          elevation: 0,
          sx: {
            height: isSmall ? "100%" : "auto",
            maxHeight: isSmall ? "100%" : "90vh",
            borderRadius: isSmall ? 0 : colors.radiusXL,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.bg,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FactCheckRoundedIcon sx={{ fontSize: 20, color: colors.accent }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: colors.textPrimary }}>
                Validate CRQ
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: colors.textDim }} noWrap>
                {details?.crqNo ?? crqNo ?? ""}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Reload validation details">
              <span>
                <IconButton
                  size="small"
                  onClick={form.refetch}
                  disabled={isSaving || isFetching || !crqNo}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" onClick={requestClose} disabled={isSaving}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* One indeterminate bar for whichever procedure is currently running. */}
        <Box sx={{ height: 3, bgcolor: colors.surface }}>
          {(isFetching || isSaving) && <LinearProgress sx={{ height: 3 }} />}
        </Box>

        <DialogContent
          dividers
          sx={{ px: 2.5, py: 2, bgcolor: colors.bg, borderColor: colors.border }}
        >
          {renderBody()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, gap: 1 }}>
          <Button
            onClick={requestClose}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Tooltip
            title={
              !canSave && !isSaving && !isFetching
                ? isDirty
                  ? "Fix the highlighted fields to save."
                  : "No changes to save yet."
                : ""
            }
          >
            <span>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!canSave}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <SaveRoundedIcon sx={{ fontSize: 17 }} />
                  )
                }
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", px: 2.2 }}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDiscardOpen} onClose={() => setConfirmDiscardOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 15, fontWeight: 800 }}>Discard your changes?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            Node Name and Name Interface Pair have unsaved edits. Closing now leaves the saved
            values unchanged.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            onClick={() => setConfirmDiscardOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Keep editing
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDiscardOpen(false);
              closeAndReset();
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidateDialog;
