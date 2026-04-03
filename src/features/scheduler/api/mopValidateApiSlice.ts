import { api } from "../../../service/api";
import type { CrqReviewResponse } from "../types/crqWorkflow.types";

export const rosterApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getMopValidateView: builder.query<
      CrqReviewResponse,
      {
        domainId: number;
        subDomainId: number;
      }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/crqworkflow/mopvalidate",
        method: "GET",
        params: {
          domainId,
          subDomainId,
        },
      }),
      providesTags: ["MopValidateView"],
    }),
  }),
});

export const { useGetMopValidateViewQuery } = rosterApiSlice;
