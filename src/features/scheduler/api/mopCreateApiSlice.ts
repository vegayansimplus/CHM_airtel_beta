import { api } from "../../../service/api";
import type { CrqReviewResponse } from "../types/crqWorkflow.types";

export const rosterApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getMopCreate: builder.query<
      CrqReviewResponse,
      {
        domainId: number;
        subDomainId: number;
      }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/crqworkflow/mopcreate",
        method: "GET",
        params: {
          domainId,
          subDomainId,
        },
      }),
      providesTags: ["MopCreateView"],
    }),
  }),
});

export const { useGetMopCreateQuery } = rosterApiSlice;
