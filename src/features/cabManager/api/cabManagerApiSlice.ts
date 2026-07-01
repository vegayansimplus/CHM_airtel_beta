import { api } from "../../../service/api";
import {
  fetchBaseQuery,
  type FetchArgs,
  type QueryReturnValue,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../app/store";
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
  MOCK_CAB_CHAT,
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
  DelegateCrqPayload,
  EscalationRow,
  ImplementationDetail,
  MyCrqsResponse,
  NewCrqPayload,
  PlanCabPayload,
  ProceedRingPayload,
  RejectCrqPayload,
  RejectionReason,
  ReschedulePayload,
  Role,
  SendChatPayload,
  ServiceApprovalRule,
} from "../types/types";

// ─────────────────────────────────────────────────────────────────────────────
//  CAB Portal — RTK Query slice
// ─────────────────────────────────────────────────────────────────────────────

const USE_MOCK =
  (import.meta as { env?: Record<string, string> }).env?.VITE_CAB_USE_MOCK !==
  "false";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta as { env?: Record<string, string> }).env
    ?.VITE_REACT_APP_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

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
    console.warn("Network request failed, falling back to mock.", result.error);
    return { data: await mockProvider() };
  }

  return result as QueryReturnValue<T, FetchBaseQueryError, FetchBaseQueryMeta>;
};

// ── helpers ─────────────────────────────────────────────────────────────────
const filterCrqs = (rows: Crq[], f: CrqFilters): Crq[] => {
  return rows.filter((r) => {
    if (f.domain && f.domain !== "all" && r.domain !== f.domain) return false;
    if (f.circle && f.circle !== "all" && r.circle !== f.circle) return false;
    if (f.impact && f.impact !== "all" && r.impact !== f.impact) return false;
    if (f.stage && f.stage !== "all" && r.stage !== f.stage) return false;
    if (f.status && f.status !== "all") {
      if (f.status === "active" && r.status !== "pending") return false;
      if (f.status === "rejected" && r.status !== "rejected") return false;
      if (f.status === "delegated" && r.status !== "delegated") return false;
      if (f.status === "escalated" && r.sla < 80) return false;
    }
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !r.id.toLowerCase().includes(q) &&
        !r.activity.toLowerCase().includes(q) &&
        !r.hostname.toLowerCase().includes(q) &&
        !r.approver.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
};

const cleanParams = <T extends Record<string, unknown>>(
  o: T
): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.keys(o).forEach((k) => {
    const v = o[k as keyof T];
    if (v !== undefined && v !== null && v !== "" && v !== "all")
      out[k] = String(v);
  });
  return out;
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
            params: filters ? cleanParams(filters) : {},
          },
          baseQuery,
          async () =>
            await mockDelay(filterCrqs(MOCK_CRQS, (filters ?? {}) as CrqFilters))
        ),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "CabCrq" as const, id: r.id })),
              { type: "CabCrq" as const, id: "LIST" },
            ]
          : [{ type: "CabCrq" as const, id: "LIST" }],
    }),

    getCrqById: builder.query<Crq, string>({
      queryFn: async (id, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: `/cab/crqs/${encodeURIComponent(id)}`, method: "GET" },
          baseQuery,
          async () => {
            const c = MOCK_CRQS.find((r) => r.id === id);
            if (c) return await mockDelay(c);
            throw { status: 404, data: { message: "CRQ not found" } };
          }
        ),
      providesTags: (_r, _e, id) => [{ type: "CabCrq" as const, id }],
    }),

    // ── MY CRQs ───────────────────────────────────────────────────────────
    getMyCrqs: builder.query<MyCrqsResponse, Role>({
      queryFn: async (role, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/crqs/mine", method: "GET", params: { role } },
          baseQuery,
          async () => await mockDelay(buildMyCrqs(role))
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
                chat: MOCK_CAB_CHAT,
              });
            throw { status: 404, data: { message: "Session not found" } };
          }
        ),
      providesTags: (_r, _e, id) => [{ type: "CabSession" as const, id }],
    }),

    // ── IMPLEMENTATION ────────────────────────────────────────────────────
    getImplementation: builder.query<ImplementationDetail, string>({
      queryFn: async (id, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(id)}/implementation`,
            method: "GET",
          },
          baseQuery,
          async () => {
            const impl = buildImplementation(id);
            if (impl) return await mockDelay(impl);
            throw { status: 404, data: { message: "CRQ not found" } };
          }
        ),
      providesTags: (_r, _e, id) => [{ type: "CabImpl" as const, id }],
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

    delegateCrq: builder.mutation<{ ok: boolean }, DelegateCrqPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/crqs/${encodeURIComponent(body.crqId)}/delegate`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [
        { type: "CabCrq", id: b.crqId },
        { type: "CabCrq", id: "MINE" },
        "CabAudit",
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

    planCab: builder.mutation<CabSession, PlanCabPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          { url: "/cab/sessions", method: "POST", body },
          baseQuery,
          async () => {
            const fake: CabSession = {
              id: `CAB-2026-${Math.floor(Math.random() * 900 + 100)}`,
              stage: "CAB Review",
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
              id: `CRQ-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
              stage: "Authorization",
              sla: 100,
              status: "pending",
              approver: "Auto-assigned",
              mop: "MOP-pending",
              raisedBy: "You",
              raisedOn: new Date().toISOString(),
              assignedToMe: false,
              ...body,
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

    sendCabChat: builder.mutation<{ ok: boolean }, SendChatPayload>({
      queryFn: async (body, _apiArg, _extraOptions, baseQuery) =>
        networkOrMock(
          {
            url: `/cab/sessions/${encodeURIComponent(body.sessionId)}/chat`,
            method: "POST",
            body,
          },
          baseQuery,
          async () => await mockDelay({ ok: true })
        ),
      invalidatesTags: (_r, _e, b) => [{ type: "CabSession", id: b.sessionId }],
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
  useApproveCrqMutation,
  useRejectCrqMutation,
  useDelegateCrqMutation,
  useRescheduleCrqMutation,
  useAssignSpocMutation,
  useAssignFeMutation,
  usePlanCabMutation,
  useCreateCrqMutation,
  useProceedRingMutation,
  useBlockRingMutation,
  useSendCabChatMutation,
} = cabPortalApi;