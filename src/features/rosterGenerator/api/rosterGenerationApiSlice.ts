// store/rosterGenerationApiSlice.ts
import { api } from "../../../service/api";
import type {
  GoldenSetApiResponse,
  GoldenSetQueryParams,
} from "../types/goldenSet.types";

// ── FutureWeek types ──────────────────────────────────────────────────────────
export interface FutureWeekRow {
  W7D1: string;
  W7D2: string;
  W7D3: string;
  W7D4: string;
  W7D5: string;
  W7D6: string;
  W7D7: string;
  employeeName: string;
  id: number;
  isoWeek: number;
  isoYear: number;
  jobLevel: string;
  olmid: string;
  roleCode: string;
  userId: number;
}

/** Matches FutureWeekResponseDto from Spring */
export interface FutureWeekApiResponse {
  success: boolean;
  totalEmployees: number;
  isoYear: number;
  isoWeek: number;
  data: FutureWeekRow[];
}

export interface FutureWeekQueryParams {
  subDomainId: number;
  pageNumber: number;
  pageSize: number;
}

// ── Golden-set types (unchanged) ─────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

export const rosterGenerationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Existing ──────────────────────────────────────────────────────────────
    getGoldenSet: builder.query<GoldenSetApiResponse, GoldenSetQueryParams>({
      query: ({ subDomainId }) => ({
        url: `goldenset?subDomainId=${subDomainId}`,
        method: "GET",
      }),
    }),

    // ── FutureWeek — lazy only; GridscreenMain drives fetching manually ───────
    getFutureWeek: builder.query<FutureWeekApiResponse, FutureWeekQueryParams>({
      query: ({ subDomainId, pageNumber, pageSize }) => ({
        url:
          `rostergenration/futureweek` +
          `?subDomainId=${subDomainId}` +
          `&pageNumber=${pageNumber}` +
          `&pageSize=${pageSize}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetGoldenSetQuery,
  useLazyGetGoldenSetQuery,
  // Do NOT export useGetFutureWeekQuery — always use the lazy version
  // so usePaginatedFutureWeek controls every fetch.
  useLazyGetFutureWeekQuery,
  
  useGetFutureWeekQuery
} = rosterGenerationApiSlice;
