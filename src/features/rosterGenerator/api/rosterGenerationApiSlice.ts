// ─────────────────────────────────────────────────────────
// store/rosterGenerationApiSlice.ts
// ─────────────────────────────────────────────────────────
import { api } from "../../../service/api";
import type {
  GoldenSetApiResponse,
  GoldenSetQueryParams,
} from "../types/goldenSet.types";

export const rosterGenerationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getGoldenSet: builder.query<GoldenSetApiResponse, GoldenSetQueryParams>({
      query: ({ subDomainId }) => ({
        url: `goldenset?subDomainId=${subDomainId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetGoldenSetQuery, useLazyGetGoldenSetQuery } =
  rosterGenerationApiSlice;
