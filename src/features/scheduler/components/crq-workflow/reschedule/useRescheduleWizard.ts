import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  useCancelRescheduleMutation,
  useConfirmRescheduleSlotMutation,
  useGetRescheduleCalendarQuery,
  useGetRescheduleContextQuery,
  useGetRescheduleSlotsQuery,
  useInitiateRescheduleMutation,
  useMoveRescheduleStageMutation,
  useSaveRescheduleDateMutation,
} from "../../../api/rescheduleApiSlice";
import type {
  CrqStageEnum,
  RescheduleAttemptStatus,
  RescheduleCalendarModel,
  RescheduleConfirmResponse,
} from "../../../types/reschedule.types";

/** Wizard steps, in the order the stepper renders them. */
export const RESCHEDULE_STEPS = [
  "Reschedule Details",
  "Select Date",
  "Move Stage",
  "Engineer Slot",
  "Confirmation",
] as const;

export const STEP_DETAILS = 0;
export const STEP_DATE = 1;
export const STEP_STAGE = 2;
export const STEP_SLOT = 3;
export const STEP_CONFIRM = 4;
/** Not a stepper entry - the terminal screen shown after confirm succeeds. */
export const STEP_SUCCESS = 5;

/**
 * Where an attempt that was left in flight should re-open. Mirrors the
 * procedures' own guards: SAVE_DATE only accepts INITIATED/DATE_SELECTED,
 * MOVE_STAGE only DATE_SELECTED, GET_SLOTS/CONFIRM_SLOT only STAGE_MOVED.
 */
const resumeStep = (
  status: RescheduleAttemptStatus | null,
  desiredDate: string | null,
): number => {
  if (status === "STAGE_MOVED") return STEP_SLOT;
  // DATE_SELECTED without a stored date is an inconsistent row - send the user
  // back to pick one rather than into a move that would be rejected.
  if (status === "DATE_SELECTED" && desiredDate) return STEP_STAGE;
  return STEP_DATE;
};

const splitDates = (csv: string | null | undefined): Set<string> =>
  new Set(
    (csv ?? "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
  );

const errorMessage = (err: unknown, fallback: string): string =>
  (err as { data?: { message?: string } })?.data?.message || fallback;

interface UseRescheduleWizardArgs {
  open: boolean;
  crqId: number | null;
  onCompleted?: () => void;
  onClose: () => void;
}

/**
 * Owns every piece of reschedule wizard state and the order the procedures run
 * in. The dialog and its five step components stay presentational, so a step
 * can be reordered or re-styled without touching the call sequence.
 *
 * Each of the three lazily-loaded reads (context / calendar / slots) is gated
 * behind the step that needs it, so opening the dialog costs exactly one
 * request and nothing is fetched for a step the user never reaches.
 */
export function useRescheduleWizard({ open, crqId, onCompleted, onClose }: UseRescheduleWizardArgs) {
  const [step, setStep] = useState<number>(STEP_DETAILS);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [desiredDate, setDesiredDate] = useState<string | null>(null);
  const [toStage, setToStage] = useState<CrqStageEnum | null>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<RescheduleConfirmResponse | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);

  const resetAll = useCallback(() => {
    setStep(STEP_DETAILS);
    setReason("");
    setReasonTouched(false);
    setRescheduleId(null);
    setDesiredDate(null);
    setToStage(null);
    setSelectedSlotLabel(null);
    setConfirmation(null);
    setStepError(null);
    setResumed(false);
  }, []);

  // A fresh open always starts from a clean slate; the resume effect below
  // then re-seeds it from whatever the backend says is still in flight.
  useEffect(() => {
    if (open) resetAll();
  }, [open, resetAll]);

  /* ── Step 1 (read): CRQ_SP_RESCHEDULE_CONTEXT ─────────────────────────── */
  const {
    data: context,
    isFetching: isContextLoading,
    isError: isContextError,
    error: contextError,
  } = useGetRescheduleContextQuery({ crqId: crqId as number }, { skip: !open || !crqId });

  // Adopt an attempt that a previous session left open instead of creating a
  // second one - CRQ_SP_RESCHEDULE_INITIATE would happily insert another row.
  // Gated on still being on the opening step: every later write invalidates the
  // context query, and a refetch must never yank the user back a step.
  useEffect(() => {
    if (!open || resumed || step !== STEP_DETAILS || !context?.activeRescheduleId) return;
    setRescheduleId(context.activeRescheduleId);
    setDesiredDate(context.activeDesiredDate ?? null);
    setToStage(context.activeToStage ?? null);
    setStep(resumeStep(context.activeRescheduleStatus, context.activeDesiredDate));
    setResumed(true);
  }, [open, resumed, step, context]);

  /* ── Step 2 (read): Get_Predicted_SlotDates_Reschedule ────────────────── */
  const {
    data: calendarRaw,
    isFetching: isCalendarLoading,
    isError: isCalendarError,
    error: calendarError,
    refetch: refetchCalendar,
  } = useGetRescheduleCalendarQuery(
    { rescheduleId: rescheduleId as number },
    { skip: !open || !rescheduleId || step < STEP_DATE },
  );

  const calendar: RescheduleCalendarModel | null = useMemo(() => {
    if (!calendarRaw) return null;
    return {
      message: calendarRaw.message,
      startDate: calendarRaw.startDate,
      endDate: calendarRaw.endDate,
      busyDates: splitDates(calendarRaw.busyDates),
      weekendDates: splitDates(calendarRaw.weekendDates),
      holidayDates: splitDates(calendarRaw.holidayDates),
      networkFreezeDates: splitDates(calendarRaw.networkFreeDates),
    };
  }, [calendarRaw]);

  /* ── Step 4 (read): CRQ_SP_RESCHEDULE_GET_SLOTS ───────────────────────── */
  const {
    data: slotsResponse,
    isFetching: isSlotsLoading,
    isError: isSlotsError,
    error: slotsError,
    refetch: refetchSlots,
  } = useGetRescheduleSlotsQuery(
    { rescheduleId: rescheduleId as number },
    { skip: !open || !rescheduleId || step < STEP_SLOT },
  );

  const slots = slotsResponse?.slots ?? [];
  const selectedSlot = useMemo(
    () => slots.find((s) => s.label === selectedSlotLabel) ?? null,
    [slots, selectedSlotLabel],
  );

  /* ── Writes ───────────────────────────────────────────────────────────── */
  const [initiate, { isLoading: isInitiating }] = useInitiateRescheduleMutation();
  const [saveDate, { isLoading: isSavingDate }] = useSaveRescheduleDateMutation();
  const [moveStage, { isLoading: isMovingStage }] = useMoveRescheduleStageMutation();
  const [confirmSlot, { isLoading: isConfirming }] = useConfirmRescheduleSlotMutation();
  const [cancelAttempt, { isLoading: isCancelling }] = useCancelRescheduleMutation();

  const isBusy =
    isInitiating || isSavingDate || isMovingStage || isConfirming || isCancelling;

  /** Step 1 -> 2. Reuses the resumed attempt rather than opening a second one. */
  const submitDetails = useCallback(async () => {
    if (!crqId) return;
    setReasonTouched(true);
    if (!reason.trim()) return;
    setStepError(null);

    if (rescheduleId) {
      setStep(STEP_DATE);
      return;
    }
    try {
      const res = await initiate({ crqId, reason: reason.trim() }).unwrap();
      if (!res.rescheduleId) {
        // "blocked" never reaches here (the backend raises it), so a missing id
        // means the procedure answered without creating an attempt.
        setStepError(res.message || "Reschedule could not be initiated.");
        return;
      }
      setRescheduleId(res.rescheduleId);
      setStep(STEP_DATE);
      if (res.status === "partial" && res.message) toast.warn(res.message);
    } catch (err) {
      const msg = errorMessage(err, "Reschedule could not be initiated.");
      setStepError(msg);
      toast.error(msg);
    }
  }, [crqId, reason, rescheduleId, initiate]);

  /** Step 2 -> 3. CRQ_SP_RESCHEDULE_SAVE_DATE re-validates the future date. */
  const submitDate = useCallback(async () => {
    if (!rescheduleId || !desiredDate) return;
    setStepError(null);
    try {
      await saveDate({ rescheduleId, desiredDate }).unwrap();
      setStep(STEP_STAGE);
    } catch (err) {
      const msg = errorMessage(err, "The selected date could not be saved.");
      setStepError(msg);
      toast.error(msg);
    }
  }, [rescheduleId, desiredDate, saveDate]);

  /** Step 3 -> 4. Moves the CRQ and computes the offer window in one call. */
  const submitStage = useCallback(async () => {
    if (!rescheduleId || !toStage || !crqId) return;
    setStepError(null);
    try {
      const res = await moveStage({ rescheduleId, toStage, crqId }).unwrap();
      setStep(STEP_SLOT);
      // The stage move committed even when the slot computation behind it did
      // not; the Slot step's own Refresh retries just that half.
      if (res.status === "partial" && res.message) toast.warn(res.message);
    } catch (err) {
      const msg = errorMessage(err, "The CRQ stage could not be moved.");
      setStepError(msg);
      toast.error(msg);
    }
  }, [rescheduleId, toStage, crqId, moveStage]);

  /** Step 4 -> 5. Purely local: nothing is reserved until Confirm. */
  const submitSlot = useCallback(() => {
    if (!selectedSlotLabel) return;
    setStepError(null);
    setStep(STEP_CONFIRM);
  }, [selectedSlotLabel]);

  /** Step 5 -> Success. CRQ_SP_RESCHEDULE_CONFIRM_SLOT does all the writes. */
  const submitConfirm = useCallback(async () => {
    if (!rescheduleId || !selectedSlotLabel || !crqId) return;
    setStepError(null);
    try {
      const res = await confirmSlot({ rescheduleId, slotLabel: selectedSlotLabel, crqId }).unwrap();
      setConfirmation(res);
      setStep(STEP_SUCCESS);
      onCompleted?.();
    } catch (err) {
      const msg = errorMessage(err, "The reschedule could not be confirmed.");
      setStepError(msg);
      toast.error(msg);
    }
  }, [rescheduleId, selectedSlotLabel, crqId, confirmSlot, onCompleted]);

  /**
   * Abandons the attempt. Only calls the procedure when an attempt row exists -
   * backing out of Step 1 has written nothing yet.
   */
  const abandon = useCallback(async () => {
    if (!rescheduleId || !crqId) {
      onClose();
      return;
    }
    try {
      await cancelAttempt({ rescheduleId, reason: reason.trim() || undefined, crqId }).unwrap();
      toast.info("Reschedule cancelled.");
    } catch (err) {
      toast.error(errorMessage(err, "The reschedule could not be cancelled."));
    } finally {
      onClose();
    }
  }, [rescheduleId, crqId, reason, cancelAttempt, onClose]);

  const goBack = useCallback(() => {
    setStepError(null);
    // Steps 1-3 each committed a procedure call, so the only backwards move
    // that cannot contradict the database is within the read-only tail.
    setStep((s) => (s > STEP_SLOT ? s - 1 : s));
  }, []);

  return {
    // step state
    step,
    stepError,
    isBusy,
    // step 1
    context,
    isContextLoading,
    contextError: isContextError ? errorMessage(contextError, "Could not load CRQ details.") : null,
    reason,
    setReason,
    reasonTouched,
    // step 2
    calendar,
    isCalendarLoading,
    calendarError: isCalendarError
      ? errorMessage(calendarError, "Could not load the scheduling calendar.")
      : null,
    refetchCalendar,
    desiredDate,
    setDesiredDate,
    // step 3
    toStage,
    setToStage,
    // step 4
    slots,
    slotsMessage: slotsResponse?.message ?? null,
    isSlotsLoading,
    slotsError: isSlotsError ? errorMessage(slotsError, "Could not load engineer slots.") : null,
    refetchSlots,
    selectedSlotLabel,
    setSelectedSlotLabel,
    selectedSlot,
    // step 5 / success
    confirmation,
    // actions
    submitDetails,
    submitDate,
    submitStage,
    submitSlot,
    submitConfirm,
    abandon,
    goBack,
    rescheduleId,
  };
}

export type RescheduleWizard = ReturnType<typeof useRescheduleWizard>;
