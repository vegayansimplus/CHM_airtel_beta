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
  }),
});

export const { useGetCrqReviewQuery, useUpdateCrqReviewStatusMutation } =
  rosterApiSlice;
