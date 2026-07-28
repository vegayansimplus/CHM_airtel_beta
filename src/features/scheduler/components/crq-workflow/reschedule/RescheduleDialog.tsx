import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import type { Colors } from "../../../types/colorTypes";
import {
  RESCHEDULE_STEPS,
  STEP_CONFIRM,
  STEP_DATE,
  STEP_DETAILS,
  STEP_SLOT,
  STEP_STAGE,
  STEP_SUCCESS,
  useRescheduleWizard,
} from "./useRescheduleWizard";
import { DetailsStep } from "./steps/DetailsStep";
import { SelectDateStep } from "./steps/SelectDateStep";
import { MoveStageStep } from "./steps/MoveStageStep";
import { SelectSlotStep } from "./steps/SelectSlotStep";
import { ConfirmStep } from "./steps/ConfirmStep";
import { SuccessStep } from "./steps/SuccessStep";

export interface RescheduleDialogProps {
  open: boolean;
  onClose: () => void;
  crqId: number | null;
  crqNo?: string | null;
  colors: Colors;
  /** Fired once the reschedule is confirmed, so the cockpit can refresh. */
  onCompleted?: () => void;
}

/**
 * Five-step Reschedule wizard over the CRQ_SP_RESCHEDULE_* procedures.
 *
 * Step 1 Details  -> CRQ_SP_RESCHEDULE_CONTEXT + CRQ_SP_RESCHEDULE_INITIATE
 * Step 2 Date     -> Get_Predicted_SlotDates_Reschedule + CRQ_SP_RESCHEDULE_SAVE_DATE
 * Step 3 Stage    -> CRQ_SP_RESCHEDULE_MOVE_STAGE
 * Step 4 Slot     -> CRQ_SP_RESCHEDULE_GET_SLOTS
 * Step 5 Confirm  -> CRQ_SP_RESCHEDULE_CONFIRM_SLOT
 * Cancel (any step before confirm) -> CRQ_SP_RESCHEDULE_CANCEL
 *
 * The workflow itself is untouched: this dialog never writes to CRQ_MASTER_TBL
 * or the stage tables directly, it only calls the procedures above.
 */
export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  open,
  onClose,
  crqId,
  crqNo,
  colors,
  onCompleted,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const wizard = useRescheduleWizard({ open, crqId, onCompleted, onClose });
  const { step, isBusy, context } = wizard;

  const isSuccess = step === STEP_SUCCESS;

  /** Continue is only enabled once the current step has what its call needs. */
  const canContinue = (() => {
    switch (step) {
      case STEP_DETAILS:
        return !!context?.canReschedule && !!wizard.reason.trim();
      case STEP_DATE:
        return !!wizard.desiredDate;
      case STEP_STAGE:
        return !!wizard.toStage;
      case STEP_SLOT:
        return !!wizard.selectedSlotLabel;
      case STEP_CONFIRM:
        return !!wizard.selectedSlotLabel;
      default:
        return false;
    }
  })();

  const primaryAction = () => {
    switch (step) {
      case STEP_DETAILS:
        return wizard.submitDetails();
      case STEP_DATE:
        return wizard.submitDate();
      case STEP_STAGE:
        return wizard.submitStage();
      case STEP_SLOT:
        return wizard.submitSlot();
      case STEP_CONFIRM:
        return wizard.submitConfirm();
      default:
        return undefined;
    }
  };

  const primaryLabel = step === STEP_CONFIRM ? "Confirm Reschedule" : "Continue";

  /**
   * Closing mid-flow is the same decision as pressing Cancel: an attempt row
   * may already exist and CRQ_SP_RESCHEDULE_CANCEL is what releases it.
   */
  const requestClose = () => {
    if (isSuccess || !wizard.rescheduleId) {
      onClose();
      return;
    }
    setConfirmCancelOpen(true);
  };

  const renderStep = () => {
    switch (step) {
      case STEP_DETAILS:
        return <DetailsStep wizard={wizard} colors={colors} />;
      case STEP_DATE:
        return <SelectDateStep wizard={wizard} colors={colors} />;
      case STEP_STAGE:
        return <MoveStageStep wizard={wizard} colors={colors} />;
      case STEP_SLOT:
        return <SelectSlotStep wizard={wizard} colors={colors} />;
      case STEP_CONFIRM:
        return <ConfirmStep wizard={wizard} colors={colors} />;
      case STEP_SUCCESS:
        return <SuccessStep wizard={wizard} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        maxWidth="md"
        fullWidth
        fullScreen={isSmall}
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
            <EventRepeatRoundedIcon sx={{ fontSize: 20, color: colors.accent }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: colors.textPrimary }}>
                Reschedule CRQ
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: colors.textDim }} noWrap>
                {context?.crqNo ?? crqNo ?? ""}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={requestClose} disabled={isBusy}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Box sx={{ px: 2.5, pt: 2, pb: 0.5, bgcolor: colors.surface }}>
          <Stepper
            activeStep={isSuccess ? RESCHEDULE_STEPS.length : step}
            alternativeLabel={!isSmall}
            orientation={isSmall ? "vertical" : "horizontal"}
          >
            {RESCHEDULE_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": { fontSize: 11.5, fontWeight: 700 },
                    "& .MuiStepLabel-label.Mui-active": { color: colors.accent },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* One indeterminate bar for whichever procedure is currently running. */}
        <Box sx={{ height: 3, bgcolor: colors.surface }}>
          {isBusy && <LinearProgress sx={{ height: 3 }} />}
        </Box>

        <DialogContent
          dividers
          sx={{ px: 2.5, py: 2, bgcolor: colors.bg, borderColor: colors.border }}
        >
          {renderStep()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, gap: 1 }}>
          {isSuccess ? (
            <Button
              variant="contained"
              onClick={onClose}
              startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                onClick={requestClose}
                disabled={isBusy}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: colors.danger,
                  borderRadius: "8px",
                }}
              >
                Cancel Reschedule
              </Button>
              <Box sx={{ flex: 1 }} />
              {step > STEP_SLOT && (
                <Button
                  onClick={wizard.goBack}
                  disabled={isBusy}
                  startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={primaryAction}
                disabled={!canContinue || isBusy}
                endIcon={
                  step === STEP_CONFIRM ? undefined : (
                    <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "8px",
                  px: 2.2,
                }}
              >
                {primaryLabel}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 15, fontWeight: 800 }}>Cancel this reschedule?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            The reschedule attempt will be marked cancelled, the previous engineer reservation
            restored and the offered slots expired. Any stage change already applied stays in the
            CRQ history.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            onClick={() => setConfirmCancelOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Keep going
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isBusy}
            onClick={async () => {
              setConfirmCancelOpen(false);
              await wizard.abandon();
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RescheduleDialog;
