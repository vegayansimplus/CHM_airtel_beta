import { api } from "../../../service/api";
import type {
  RescheduleCalendar,
  RescheduleConfirmResponse,
  RescheduleContext,
  RescheduleInitiateResponse,
  RescheduleSlotsResponse,
  RescheduleStatusResponse,
} from "../types/reschedule.types";

/**
 * The reschedule wizard's six procedure calls, one endpoint each
 * (CrqRescheduleController -> CRQ_SP_RESCHEDULE_*).
 *
 * Only the two reads are queries; every step that writes is a mutation, so the
 * wizard can never fire one twice by re-rendering. `context` and `calendar` are
 * cached per CRQ / per attempt and invalidated by the writes that actually
 * change them, which is what lets Step 2 re-open without refetching and the
 * cockpit refresh itself once a reschedule lands.
 */
export const rescheduleApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /crqworkflow/reschedule/context?crqId=
    getRescheduleContext: builder.query<RescheduleContext, { crqId: number }>({
      query: ({ crqId }) => ({
        url: "/crqworkflow/reschedule/context",
        method: "GET",
        params: { crqId },
      }),
      providesTags: (_r, _e, arg) => [{ type: "CrqReschedule", id: `ctx-${arg.crqId}` }],
    }),

    // POST /crqworkflow/reschedule/initiate
    initiateReschedule: builder.mutation<
      RescheduleInitiateResponse,
      { crqId: number; reason: string }
    >({
      query: (body) => ({
        url: "/crqworkflow/reschedule/initiate",
        method: "POST",
        body,
      }),
      // A new attempt row changes what /context reports as in-flight.
      invalidatesTags: (_r, _e, arg) => [{ type: "CrqReschedule", id: `ctx-${arg.crqId}` }],
    }),

    // GET /crqworkflow/reschedule/calendar?rescheduleId=
    getRescheduleCalendar: builder.query<RescheduleCalendar, { rescheduleId: number }>({
      query: ({ rescheduleId }) => ({
        url: "/crqworkflow/reschedule/calendar",
        method: "GET",
        params: { rescheduleId },
      }),
      providesTags: (_r, _e, arg) => [{ type: "CrqReschedule", id: `cal-${arg.rescheduleId}` }],
    }),

    // POST /crqworkflow/reschedule/save-date
    saveRescheduleDate: builder.mutation<
      RescheduleStatusResponse,
      { rescheduleId: number; desiredDate: string }
    >({
      query: (body) => ({
        url: "/crqworkflow/reschedule/save-date",
        method: "POST",
        body,
      }),
    }),

    // POST /crqworkflow/reschedule/move-stage
    moveRescheduleStage: builder.mutation<
      RescheduleStatusResponse,
      { rescheduleId: number; toStage: string; crqId: number }
    >({
      query: ({ rescheduleId, toStage }) => ({
        url: "/crqworkflow/reschedule/move-stage",
        method: "POST",
        body: { rescheduleId, toStage },
      }),
      // The CRQ's current stage and reschedule_count have both changed, so the
      // cockpit's overview and this CRQ's context are now stale.
      invalidatesTags: (_r, _e, arg) => [
        { type: "CrqReschedule", id: `ctx-${arg.crqId}` },
        { type: "CrqReschedule", id: `slots-${arg.rescheduleId}` },
        "CrqReview",
      ],
    }),

    // GET /crqworkflow/reschedule/slots?rescheduleId=
    getRescheduleSlots: builder.query<RescheduleSlotsResponse, { rescheduleId: number }>({
      query: ({ rescheduleId }) => ({
        url: "/crqworkflow/reschedule/slots",
        method: "GET",
        params: { rescheduleId },
      }),
      providesTags: (_r, _e, arg) => [{ type: "CrqReschedule", id: `slots-${arg.rescheduleId}` }],
    }),

    // POST /crqworkflow/reschedule/confirm-slot
    confirmRescheduleSlot: builder.mutation<
      RescheduleConfirmResponse,
      { rescheduleId: number; slotLabel: string; crqId: number }
    >({
      query: ({ rescheduleId, slotLabel }) => ({
        url: "/crqworkflow/reschedule/confirm-slot",
        method: "POST",
        body: { rescheduleId, slotLabel },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "CrqReschedule", id: `ctx-${arg.crqId}` },
        { type: "CrqReschedule", id: `slots-${arg.rescheduleId}` },
        "CrqReview",
      ],
    }),

    // POST /crqworkflow/reschedule/cancel
    cancelReschedule: builder.mutation<
      RescheduleStatusResponse,
      { rescheduleId: number; reason?: string; crqId: number }
    >({
      query: ({ rescheduleId, reason }) => ({
        url: "/crqworkflow/reschedule/cancel",
        method: "POST",
        body: { rescheduleId, reason },
      }),
      // Cancelling after the stage move leaves the CRQ on its new stage (that
      // decision is already in history), so the cockpit still needs refreshing.
      invalidatesTags: (_r, _e, arg) => [
        { type: "CrqReschedule", id: `ctx-${arg.crqId}` },
        { type: "CrqReschedule", id: `slots-${arg.rescheduleId}` },
        "CrqReview",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRescheduleContextQuery,
  useInitiateRescheduleMutation,
  useGetRescheduleCalendarQuery,
  useSaveRescheduleDateMutation,
  useMoveRescheduleStageMutation,
  useGetRescheduleSlotsQuery,
  useConfirmRescheduleSlotMutation,
  useCancelRescheduleMutation,
} = rescheduleApiSlice;
