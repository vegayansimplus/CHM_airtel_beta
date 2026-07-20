import {
  type FetchArgs,
  type QueryReturnValue,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import {
  buildAgenda,
  buildAnalytics,
  buildCabPlanDates,
  buildCabQueue,
  buildDashboard,
  buildImplementation,
  buildJourney,
  buildMyCrqs,
  MOCK_ADMIN_USERS,
  MOCK_ASSIGN_MATRIX,
  MOCK_ASSIGN_RULES,
  MOCK_AUDIT_LOG,
  MOCK_CAB_SESSIONS,
  MOCK_CRQS,
  MOCK_ESCALATION_MATRIX,
  MOCK_REJECTION_REASONS,
  MOCK_SERVICE_RULES,
  mockDelay,
} from "../data/cabManager.mock";
import type {
  AdminAnalytics,
  AdminUser,
  ApproveCrqPayload,
  AssignFePayload,
  AssignMatrixCell,
  AssignRule,
  AssignSpocPayload,
  AuditEntry,
  BlockRingPayload,
  CabPlanDate,
  CabQueueRow,
  CabSession,
  CabSessionDetail,
  Crq,
  CrqFilters,
  CrqJourney,
  DashboardData,
  EscalationRow,
  ImplementationDetail,
  MyCrqsResponse,
  NewCrqPayload,
  PlanCabPayload,
  ProceedRingPayload,
  RejectCrqPayload,
  RejectionReason,
  ReschedulePayload,
  ServiceApprovalRule,
} from "../types/types";
import { api } from "../../../service/api";


// ─────────────────────────────────────────────────────────────────────────────
//  CAB Portal — RTK Query slice
// ─────────────────────────────────────────────────────────────────────────────

const USE_MOCK =
  (import.meta as { env?: Record<string, string> }).env?.VITE_CAB_USE_MOCK ===
  "true";


const networkOrMock = async <T>(
  request: FetchArgs,
  baseQuery: any, // Typed generically to accept RTK Query's injected baseQuery
  mockProvider: () => Promise<T> | T
): Promise<QueryReturnValue<T, FetchBaseQueryError, FetchBaseQueryMeta>> => {
  if (USE_MOCK) {
    return { data: await mockProvider() };
  }

  const result = await baseQuery(request);

  if ("error" in result) {
    console.warn("Network request failed; returning error instead of mock fallback.", result.error);
    return result as QueryReturnValue<T, FetchBaseQueryError, FetchBaseQueryMeta>;
  }

  return result as QueryReturnValue<T, FetchBaseQueryError, FetchBaseQueryMeta>;
};

// ── helpers ─────────────────────────────────────────────────────────────────
const filterCrqs = (rows: Crq[], f: CrqFilters): Crq[] => {
  return rows.filter((r) => {
    if (f.domain && f.domain !== "All Domains" && r.domainName !== f.domain) return false;
    if (f.circle && f.circle !== "All Circles" && r.circleCode !== f.circle) return false;
    if (f.stage && f.stage !== "All Stages" && r.currentStage !== f.stage) return false;
    if (f.status && f.status !== "All Status") {
      if (f.status === "active" && r.currentStatus !== "pending") return false;
      if (f.status === "rejected" && r.currentStatus !== "rejected") return false;
      if (f.status === "delegated" && r.currentStatus !== "delegated") return false;
      if (f.status === "escalated" && r.slaPercentage < 80) return false;
    }
    if (f.search && f.search !== "All Search") {
      const q = f.search.toLowerCase();
      if (
        !r.crqNo.toLowerCase().includes(q) &&
        !r.approverName.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  Endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const cabPortalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // ── DASHBOARD ─────────────────────────────────────────────────────────
    getDashboard: builder.query<DashboardData, void>({
      queryFn: (_arg, _api, _extraOptions, baseQuery) =>
        networkOrMock<DashboardData>(
          { url: "/cab/dashboard", method: "GET" },
          baseQuery,
          () => mockDelay(buildDashboard())
        ),
      providesTags: ["CabDashboard"],
    }),

    // ── ALL CRQs ──────────────────────────────────────────────────────────
    getAllCrqs: builder.query<Crq[], CrqFilters | void>({
      queryFn: async (filters, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: "/cab/crqs",
            method: "GET",
            params: (filters ?? {}) as Record<string, string>,
          },
          baseQuery,
          async () =>
            await mockDelay(filterCrqs(MOCK_CRQS, (filters ?? {}) as CrqFilters))
        ),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "CabCrq" as const, id: r.crqNo })),
              { type: "CabCrq" as const, id: "LIST" },
            ]
          : [{ type: "CabCrq" as const, id: "LIST" }],
    }),

    getCrqById: builder.query<Crq, string>({
      queryFn: async (id, _apiArg, _extraOptions, baseQuery) => {
        const result = await networkOrMock(
          { url: `/cab/crqs/${encodeURIComponent(id)}`, method: "GET" },
          baseQuery,
          async () => {
            const c = MOCK_CRQS.find((r) => r.crqNo === id);
            if (c) return await mockDelay(c);
            throw { status: 404, data: { message: "CRQ not found" } };
          }
        );
        // Defensive: some deployments return the row wrapped in a single-item
        // array (e.g. list-endpoint shape) instead of a bare object.
        if ("data" in result && Array.isArray(result.data)) {
          return { ...result, data: result.data[0] };
        }
        return result;
      },
      providesTags: (_r, _e, id) => [{ type: "CabCrq" as const, id }],
    }),

    // ── MY CRQs ───────────────────────────────────────────────────────────
    getMyCrqs: builder.query<MyCrqsResponse, void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/crqs/mine", method: "GET" },
          baseQuery,
          async () => await mockDelay(buildMyCrqs())
        ),
      providesTags: [{ type: "CabCrq", id: "MINE" }],
    }),

    // ── CRQ JOURNEY ───────────────────────────────────────────────────────
    getCrqJourney: builder.query<CrqJourney, string>({
      queryFn: async (id, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: `/cab/crqs/${encodeURIComponent(id)}/journey`, method: "GET" },
          baseQuery,
          async () => {
            const j = buildJourney(id);
            if (j) return await mockDelay(j);
            throw { status: 404, data: { message: "CRQ not found" } };
          }
        ),
      providesTags: (_r, _e, id) => [
        { type: "CabCrq" as const, id: `JOURNEY-${id}` },
      ],
    }),

    // ── CAB PLANNING ──────────────────────────────────────────────────────
    getCabQueue: builder.query<CabQueueRow[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock({ url: "/cab/planning/queue", method: "GET" }, baseQuery, async () =>
          await mockDelay(buildCabQueue())
        ),
      providesTags: ["CabQueue"],
    }),

    getCabPlanDates: builder.query<CabPlanDate[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock({ url: "/cab/planning/dates", method: "GET" }, baseQuery, async () =>
          await mockDelay(buildCabPlanDates())
        ),
      providesTags: ["CabQueue"],
    }),

    // ── CAB SESSIONS ──────────────────────────────────────────────────────
    getCabSessions: builder.query<CabSession[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock({ url: "/cab/sessions", method: "GET" }, baseQuery, async () =>
          await mockDelay(MOCK_CAB_SESSIONS)
        ),
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: "CabSession" as const, id: s.id })),
              { type: "CabSession" as const, id: "LIST" },
            ]
          : [{ type: "CabSession" as const, id: "LIST" }],
    }),

    getCabSessionDetail: builder.query<CabSessionDetail, string>({
      queryFn: async (id, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: `/cab/sessions/${encodeURIComponent(id)}`, method: "GET" },
          baseQuery,
          async () => {
            const session = MOCK_CAB_SESSIONS.find((s) => s.id === id);
            if (session)
              return await mockDelay({
                session,
                agenda: buildAgenda(session),
              });
            throw { status: 404, data: { message: "Session not found" } };
          }
        ),
      providesTags: (_r, _e, id) => [{ type: "CabSession" as const, id }],
    }),

    // ── IMPLEMENTATION ────────────────────────────────────────────────────
getImplementation: builder.query<ImplementationDetail, void>({
  queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
    networkOrMock(
      {
        url: "/cab/crqs/implementation",
        method: "GET",
      },
      baseQuery,
      async () => {
        // Use any fixed dummy CRQ ID
        const impl = buildImplementation("CRQ-2026-0418");

        if (impl) return await mockDelay(impl);

        throw {
          status: 404,
          data: { message: "Mock data not found" },
        };
      }
    ),

  providesTags: [{ type: "CabImpl", id: "MOCK" }],
}),

    // ── ADMIN ─────────────────────────────────────────────────────────────
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/admin/analytics", method: "GET" },
          baseQuery,
          async () => await mockDelay(buildAnalytics())
        ),
      providesTags: ["CabAdmin"],
    }),

    getAssignMatrix: builder.query<AssignMatrixCell[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/admin/assign-matrix", method: "GET" },
          baseQuery,
          async () => await mockDelay(MOCK_ASSIGN_MATRIX)
        ),
      providesTags: ["CabAdmin"],
    }),

    getAssignRules: builder.query<AssignRule[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/admin/assign-rules", method: "GET" },
          baseQuery,
          async () => await mockDelay(MOCK_ASSIGN_RULES)
        ),
      providesTags: ["CabAdmin"],
    }),

    getServiceRules: builder.query<ServiceApprovalRule[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/admin/service-rules", method: "GET" },
          baseQuery,
          async () => await mockDelay(MOCK_SERVICE_RULES)
        ),
      providesTags: ["CabAdmin"],
    }),

    getRejectionReasons: builder.query<RejectionReason[], string | void>({
      queryFn: async (stage, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: "/cab/admin/rejection-reasons",
            method: "GET",
            params: stage ? { stage } : {},
          },
          baseQuery,
          async () => await mockDelay(MOCK_REJECTION_REASONS)
        ),
      providesTags: ["CabAdmin"],
    }),

    getEscalationMatrix: builder.query<EscalationRow[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/admin/escalation-matrix", method: "GET" },
          baseQuery,
          async () => await mockDelay(MOCK_ESCALATION_MATRIX)
        ),
      providesTags: ["CabAdmin"],
    }),

    getAdminUsers: builder.query<AdminUser[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock({ url: "/cab/admin/users", method: "GET" }, baseQuery, async () =>
          await mockDelay(MOCK_ADMIN_USERS)
        ),
      providesTags: ["CabAdmin"],
    }),

    getAuditLog: builder.query<AuditEntry[], void>({
      queryFn: async (_arg, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock({ url: "/cab/admin/audit", method: "GET" }, baseQuery, async () =>
          await mockDelay(MOCK_AUDIT_LOG)
        ),
      providesTags: ["CabAudit"],
    }),

    // ── Mutations ─────────────────────────────────────────────────────────
    planCab: builder.mutation<CabSession, PlanCabPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/sessions", method: "POST", body },
          baseQuery,
          async () => {
            const fake: CabSession = {
              id: `CAB-2026-${Math.floor(Math.random() * 900 + 100)}`,
              stage: "MOP_CREATION",
              host: body.host,
              date: body.date,
              time: "16:00 IST",
              status: "scheduled",
              type: body.type,
              crqIds: body.crqIds,
            };
            return await mockDelay(fake);
          }
        ),
      invalidatesTags: [
        "CabQueue",
        { type: "CabSession", id: "LIST" },
        "CabDashboard",
      ],
    }),

    createCrq: builder.mutation<Crq, NewCrqPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/crqs", method: "POST", body },
          baseQuery,
          async () => {
            const fake: Crq = {
              crqNo: `CRQ-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
              planId: `PLAN-2026-${Math.floor(Math.random() * 900 + 100)}`,
              domainName: body.domain,
              circleCode: body.circle,
              currentStage: "VALIDATE",
              approverName: "Auto-assigned",
              assignStartTime: body.scheduled,
              currentStatus: "pending",
              slaPercentage: 100,
              assignedToMe: false,
              raisedBy: "You",
            };
            return await mockDelay(fake);
          }
        ),
      invalidatesTags: [{ type: "CabCrq", id: "LIST" }, "CabDashboard"],
    }),

    proceedRing: builder.mutation<{ ok: boolean }, ProceedRingPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/rings/${
              body.ringId
            }/proceed`,
            method: "POST",
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [{ type: "CabImpl", id: b.crqId }],
    }),

    blockRing: builder.mutation<{ ok: boolean }, BlockRingPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/rings/${
              body.ringId
            }/block`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [{ type: "CabImpl", id: b.crqId }],
    }),

    approveCrq: builder.mutation<{ ok: boolean }, ApproveCrqPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/approve`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "LIST" },
        { type: "CabCrq", id: "MINE" },
        "CabDashboard",
      ],
    }),

    rejectCrq: builder.mutation<{ ok: boolean }, RejectCrqPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/reject`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "LIST" },
        { type: "CabCrq", id: "MINE" },
        "CabDashboard",
      ],
    }),

    rescheduleCrq: builder.mutation<{ ok: boolean }, ReschedulePayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/reschedule`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "LIST" },
      ],
    }),

    assignSpoc: builder.mutation<{ ok: boolean }, AssignSpocPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/assign-spoc`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "MINE" },
      ],
    }),

    assignFe: builder.mutation<{ ok: boolean }, AssignFePayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/assign-fe`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "MINE" },
      ],
    }),
  }),
  overrideExisting: false,
});

// ── Auto-generated hooks ────────────────────────────────────────────────────
export const {
  // queries
  useGetDashboardQuery,
  useGetAllCrqsQuery,
  useGetCrqByIdQuery,
  useGetMyCrqsQuery,
  useGetCrqJourneyQuery,
  useGetCabQueueQuery,
  useGetCabPlanDatesQuery,
  useGetCabSessionsQuery,
  useGetCabSessionDetailQuery,
  useGetImplementationQuery,
  useGetAdminAnalyticsQuery,
  useGetAssignMatrixQuery,
  useGetAssignRulesQuery,
  useGetServiceRulesQuery,
  useGetRejectionReasonsQuery,
  useGetEscalationMatrixQuery,
  useGetAdminUsersQuery,
  useGetAuditLogQuery,
  // mutations
  usePlanCabMutation,
  useCreateCrqMutation,
  useProceedRingMutation,
  useBlockRingMutation,
  useApproveCrqMutation,
  useRejectCrqMutation,
  useRescheduleCrqMutation,
  useAssignSpocMutation,
  useAssignFeMutation,
} = cabPortalApi;