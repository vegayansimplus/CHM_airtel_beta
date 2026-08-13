import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Step,
  StepButton,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
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
 *
 * All 5 phases stay reachable from the stepper for the life of the dialog -
 * clicking a phase jumps straight to it (never ahead of what has actually
 * been reached, since later phases depend on data only fetched once their
 * own procedure has run). Closing the dialog mid-flow does not cancel the
 * attempt; reopening it always starts again from Reschedule Details.
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

  const wizard = useRescheduleWizard({ open, crqId, onCompleted });
  const { step, isBusy, context, furthestStep } = wizard;

  const isSuccess = step === STEP_SUCCESS;

  /** Continue is only enabled once the current step has what its call needs. */
  const canContinue = (() => {
    switch (step) {
      case STEP_DETAILS:
        return !!context?.canReschedule;
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
    <Dialog
      open={open}
      onClose={onClose}
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
          <IconButton size="small" onClick={onClose} disabled={isBusy}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ px: 2.5, pt: 2, pb: 0.5, bgcolor: colors.surface }}>
        <Stepper
          activeStep={isSuccess ? RESCHEDULE_STEPS.length : step}
          alternativeLabel={!isSmall}
          orientation={isSmall ? "vertical" : "horizontal"}
          nonLinear
        >
          {RESCHEDULE_STEPS.map((label, index) => {
            // Full stage access: every phase is clickable at any time, in
            // any order - no forced step-by-step Continue.
            const canJump = !isSuccess && !isBusy && index !== step;
            return (
              <Step key={label} completed={!isSuccess && index < furthestStep}>
                <StepButton
                  onClick={canJump ? () => wizard.jumpToStep(index) : undefined}
                  disabled={!canJump}
                  sx={{
                    "& .MuiStepLabel-label": { fontSize: 11.5, fontWeight: 700 },
                    "& .MuiStepLabel-label.Mui-active": { color: colors.accent },
                  }}
                >
                  {label}
                </StepButton>
              </Step>
            );
          })}
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
            <Box sx={{ flex: 1 }} />
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
  );
};

export default RescheduleDialog;
