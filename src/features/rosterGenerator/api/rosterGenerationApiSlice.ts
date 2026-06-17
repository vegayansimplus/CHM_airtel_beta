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

// ── Daily Golden Set types ────────────────────────────────────────────────────
export interface DailyGoldenSetPayload {
  userId: number;
  W1D1: number; W1D2: number; W1D3: number; W1D4: number; W1D5: number; W1D6: number; W1D7: number;
  W2D1: number; W2D2: number; W2D3: number; W2D4: number; W2D5: number; W2D6: number; W2D7: number;
  W3D1: number; W3D2: number; W3D3: number; W3D4: number; W3D5: number; W3D6: number; W3D7: number;
  W4D1: number; W4D2: number; W4D3: number; W4D4: number; W4D5: number; W4D6: number; W4D7: number;
  W5D1: number; W5D2: number; W5D3: number; W5D4: number; W5D5: number; W5D6: number; W5D7: number;
  W6D1: number; W6D2: number; W6D3: number; W6D4: number; W6D5: number; W6D6: number; W6D7: number;
}

export interface DailyGoldenSetResponse {
  success: boolean;
  message?: string;
}

// ── API slice ─────────────────────────────────────────────────────────────────
export const rosterGenerationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Golden Set ────────────────────────────────────────────────────────────
    getGoldenSet: builder.query<GoldenSetApiResponse, GoldenSetQueryParams>({
      query: ({ subDomainId }) => ({
        url: `goldenset?subDomainId=${subDomainId}`,
        method: "GET",
      }),
    }),

    // ── Daily Golden Set (shift save) ─────────────────────────────────────────
    updateDailyGoldenSet: builder.mutation<
      DailyGoldenSetResponse,
      DailyGoldenSetPayload[]
    >({
      query: (rows) => ({
        url: `goldenset/dailygoldenset`,
        method: "POST",
        body: rows,
        headers: { "Content-Type": "application/json" },
      }),
    }),

    // ── Future Week ───────────────────────────────────────────────────────────
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
  useUpdateDailyGoldenSetMutation,
} = rosterGenerationApiSlice;
