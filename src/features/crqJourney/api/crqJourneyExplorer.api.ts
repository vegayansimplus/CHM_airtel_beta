import { api } from "../../../service/api";
import type {
  CrqJourneySearchRow,
  CrqJourneyPageResponse,
  CrqDetailsResponse,
} from "../types/crqJourney.types";

// ─────────────────────────────────────────────────────────────────────────────
//  CRQ Journey Explorer — RTK Query endpoints
//  Backs:
//   • /cabmanager/journey    → getCrqsBySubDomain + getCrqJourneyStages
//   • /scheduler/crqjourney  → getCrqsBySubDomain + getCrqDetails
//  See CrqJourneyExplorerController (backend) for the underlying procs.
// ─────────────────────────────────────────────────────────────────────────────
export const crqJourneyExplorerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCrqsBySubDomain: builder.query<CrqJourneySearchRow[], number>({
      query: (subDomainId) => ({
        url: "/crqworkflow/journey-explorer/crqs",
        method: "GET",
        params: { subDomainId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "CrqReview" as const, id: `JOURNEY-SEARCH-${r.crqNo}` })),
              { type: "CrqReview" as const, id: "JOURNEY-SEARCH-LIST" },
            ]
          : [{ type: "CrqReview" as const, id: "JOURNEY-SEARCH-LIST" }],
    }),

    /**
     * One call, three result sets: the journey stage rows, the pending CAB
     * services with their configured approver, and the CRQ's domain scope.
     * Returned a bare stage array until the proc was re-authored live on
     * 2026-08-24 — the extra two result sets were reaching the backend and
     * being discarded there.
     */
    getCrqJourneyStages: builder.query<CrqJourneyPageResponse, string>({
      query: (crqNo) => ({
        url: `/crqworkflow/journey-explorer/${encodeURIComponent(crqNo)}`,
        method: "GET",
      }),
      providesTags: (_r, _e, crqNo) => [{ type: "CrqReview" as const, id: `JOURNEY-STAGES-${crqNo}` }],
    }),

    getCrqDetails: builder.query<CrqDetailsResponse, string>({
      query: (crqNo) => ({
        url: `/crqworkflow/journey-explorer/${encodeURIComponent(crqNo)}/details`,
        method: "GET",
      }),
      providesTags: (_r, _e, crqNo) => [{ type: "CrqReview" as const, id: `JOURNEY-DETAILS-${crqNo}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCrqsBySubDomainQuery,
  useLazyGetCrqsBySubDomainQuery,
  useGetCrqJourneyStagesQuery,
  useGetCrqDetailsQuery,
} = crqJourneyExplorerApi;
