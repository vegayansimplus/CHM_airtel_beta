import { api } from "../../../service/api";
import type { CrqReviewResponse } from "../types/crqWorkflow.types";

export const rosterApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getCrqReview: builder.query<
      CrqReviewResponse,
      {
        domainId: number;
        subDomainId: number;
      }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/crqworkflow/crqreview",
        method: "GET",
        params: {
          domainId,
          subDomainId,
        },
      }),
      providesTags: ["CrqReview"],
    }),

    // GET /crqworkflow/overview - every CRQ regardless of stage, with full
    // per-stage history[]. Backs the "View Selected CRQ" cockpit.
    getCrqWorkflowOverview: builder.query<
      CrqReviewResponse,
      {
        domainId: number;
        subDomainId: number;
      }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/crqworkflow/overview",
        method: "GET",
        params: {
          domainId,
          subDomainId,
        },
      }),
      providesTags: ["CrqReview"],
    }),

    // POST /crqworkflow/updatecrqreview/start|pause?crqNo=&crqId=
    updateCrqReviewStatus: builder.mutation<
      { message?: string },
      {
        crqNo: string;
        crqId: number | string;
        action: "start" | "pause";
      }
    >({
      query: ({ crqNo, crqId, action }) => ({
        url: `/crqworkflow/updatecrqreview/${action}`,
        method: "POST",
        params: {
          crqNo,
          crqId,
        },
      }),
      invalidatesTags: ["CrqReview"],
    }),

    // POST /crqworkflow/updatecrqreview/done - completes (or fails) the
    // Plan & Inventory review; on "DONE" the backend advances the CRQ to
    // Impact Analysis in a single transaction.
    submitCrqReviewDone: builder.mutation<
      { message?: string },
      {
        crqNo: string;
        crqId: number | string;
        localStatus: string;
        remark?: string;
        olmId?: string;
      }
    >({
      query: ({ crqNo, crqId, localStatus, remark, olmId }) => ({
        url: "/crqworkflow/updatecrqreview/done",
        method: "POST",
        params: {
          crqNo,
          crqId,
          localStatus,
          remark: remark ?? "",
          ...(olmId ? { olmId } : {}),
        },
      }),
      invalidatesTags: ["CrqReview", { type: "StageWorkflow", id: "impactanalysis" }],
    }),
  }),
});

export const {
  useGetCrqReviewQuery,
  useGetCrqWorkflowOverviewQuery,
  useUpdateCrqReviewStatusMutation,
  useSubmitCrqReviewDoneMutation,
} = rosterApiSlice;
