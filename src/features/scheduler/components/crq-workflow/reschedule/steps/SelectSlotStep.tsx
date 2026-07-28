import React from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import type { Colors } from "../../../../types/colorTypes";
import type { RescheduleWizard } from "../useRescheduleWizard";
import { StepError, StepSection, StepSkeleton, formatDateOnly } from "../RescheduleAtoms";
import { SlotCard } from "../SlotCard";

/**
 * Step 4 - pick one of the offered engineer slots.
 *
 * The slots arrive with the move-stage response, so reaching this step costs no
 * request. Refresh re-runs CRQ_SP_RESCHEDULE_GET_SLOTS alone: the stage move is
 * already committed, so re-cutting the offer window never repeats an earlier
 * step. Nothing is reserved here - the slot is only held at Confirm.
 */
export const SelectSlotStep: React.FC<{ wizard: RescheduleWizard; colors: Colors }> = ({
  wizard,
  colors,
}) => {
  const {
    slots,
    slotsMessage,
    isSlotsLoading,
    slotsError,
    refreshSlots,
    selectedSlotLabel,
    setSelectedSlotLabel,
    desiredDate,
    chooseAnotherDate,
  } = wizard;

  const refreshButton = (
    <Stack direction="row" spacing={0.5}>
      {/* The stage move is already committed, so the only way out of an empty
          window is a different date - not a repeat of the previous step. */}
      <Button
        size="small"
        onClick={chooseAnotherDate}
        disabled={isSlotsLoading}
        startIcon={<EditCalendarRoundedIcon sx={{ fontSize: 15 }} />}
        sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700 }}
      >
        Change Date
      </Button>
      <Button
        size="small"
        onClick={() => refreshSlots()}
        disabled={isSlotsLoading}
        startIcon={<RefreshRoundedIcon sx={{ fontSize: 15 }} />}
        sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700 }}
      >
        Refresh Slots
      </Button>
    </Stack>
  );

  return (
    <Box>
      <StepError message={wizard.stepError} />

      <StepSection
        icon={<EngineeringRoundedIcon sx={{ fontSize: 14 }} />}
        title={`Available Slots${desiredDate ? ` — ${formatDateOnly(desiredDate)}` : ""}`}
        colors={colors}
        action={refreshButton}
      >
        {isSlotsLoading ? (
          <StepSkeleton rows={4} height={92} />
        ) : slotsError ? (
          <Alert severity="error" sx={{ fontSize: 12.5 }}>
            {slotsError}
          </Alert>
        ) : slots.length === 0 ? (
          <Alert severity="warning" sx={{ fontSize: 12.5 }}>
            {slotsMessage ??
              "No engineer slots are available for the selected date. Refresh, or cancel and try another date."}
          </Alert>
        ) : (
          <>
            <Typography sx={{ fontSize: 11.5, color: colors.textDim, mb: 1 }}>
              {slots.length} slot{slots.length === 1 ? "" : "s"} offered
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                gap: 1.2,
              }}
            >
              {slots.map((slot) => (
                <SlotCard
                  key={slot.label}
                  slot={slot}
                  selected={selectedSlotLabel === slot.label}
                  onSelect={setSelectedSlotLabel}
                  colors={colors}
                />
              ))}
            </Box>
          </>
        )}
      </StepSection>
    </Box>
  );
};

export default SelectSlotStep;
