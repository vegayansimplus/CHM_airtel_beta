import { api } from "../../../service/api";
import type {
  FutureWeekApiResponse,
  FutureWeekQueryParams,
} from "../types/Futureweek.types";
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

// ── Batch update — one item per changed row ───────────────────────────────────
export interface UpdateRowPayload {
  /** employee's userId (from NormalisedEmployee.userId) */
  userId: number;
  year: number;
  week: number;
  W7D1: string;
  W7D2: string;
  W7D3: string;
  W7D4: string;
  W7D5: string;
  W7D6: string;
  W7D7: string;
}

export interface UpdateCellResponse {
  success: boolean;
  message?: string;
}

export const rosterGenerationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Existing ──────────────────────────────────────────────────────────────
    getGoldenSet: builder.query<GoldenSetApiResponse, GoldenSetQueryParams>({
      query: ({ subDomainId }) => ({
        url: `goldenset?subDomainId=${subDomainId}`,
        method: "GET",
      }),
    }),

    getFutureWeek: builder.query<FutureWeekApiResponse, FutureWeekQueryParams>({
      query: ({ subDomainId, pageNumber = 1, pageSize = 50 }) => ({
        url:
          `rostergenration/futureweek` +
          `?subDomainId=${subDomainId}` +
          `&pageNumber=${pageNumber}` +
          `&pageSize=${pageSize}`,
        method: "GET",
      }),
    }),

    updateFutureWeekBatch: builder.mutation<
      UpdateCellResponse,
      UpdateRowPayload[]
    >({
      query: (rows) => ({
        url: `rostergenration/futureweek/update`,
        method: "POST",
        body: rows,
        headers: { "Content-Type": "application/json" },
      }),
    }),
  }),
});

export const {
  useGetGoldenSetQuery,
  useLazyGetGoldenSetQuery,
  useLazyGetFutureWeekQuery,
  useGetFutureWeekQuery,
  useUpdateFutureWeekBatchMutation,
} = rosterGenerationApiSlice;


