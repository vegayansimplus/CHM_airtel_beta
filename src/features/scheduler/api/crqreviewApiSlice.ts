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
  }),
});

export const { useGetCrqReviewQuery } = rosterApiSlice;
