import { api } from "../../../service/api";
import type { CrqReviewResponse } from "../types/crqWorflow.types";

// use this api:/crqworkflow/impactanalysis?domainId=1&subDomainId=1
export const rosterApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getImpactAnalysis: builder.query<
      CrqReviewResponse,
      {
        domainId: number;
        subDomainId: number;
      }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/crqworkflow/impactanalysis",
        method: "GET",
        params: {
          domainId,
          subDomainId,
        },
      }),
      providesTags: ["RosterVIew"],
    }),
    getCurrentShiftCount: builder.query<number, void>({
      query: () => ({
        url: "/shift/count",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetImpactAnalysisQuery,
  useGetCurrentShiftCountQuery,
} = rosterApiSlice;