import { api } from "../../../../../service/api";

// ─── Plan Types ───────────────────────────────────────────────────────────────

export interface PlanViewRow {
  changeImpact: string;
  chmDomain: string;
  chmDomainId?: number;
  chmSubDomain: string | null;
  chmSubDomainId?: number;
  layer: string;
  networkDomain: string;
  planId: number;
  planType: string;
  planVendor: string;
  status: string;
}

export interface UpdatePlanRequest {
  actorUserId: number;
  planId: number;
  planType: string;
  status: string;
  chmDomainId: number;
  chmSubDomain: number;
  networkDomain: string;
  layer: string;
  planVendor: string;
  changeImpact: string;
}

export interface PlanViewQueryParams {
  verticalId?: number;
  functionId?: number;
  domainId?: number;
  subDomainId?: number;
  page?: number;
  size?: number;
}

export interface AddPlanRequest {
  chmDomain: number;
  chmSubDomain: number;
  networkDomain: string;
  layer: string;
  planType: string;
  vendorOem: string;
  changeImpact: string;
}

// ─── Activity Phase View Types (GET response) ─────────────────────────────────

export interface PhaseConfig {
  assignTeam?: string | null;
  minimumLevelRequirement?: string | null;
  shift?: string | null;
  time?: number | null;
}

export interface ExecutionConfig {
  assignTeam?: string | null;
  daysMargin?: number | null;
  minimumLevelRequirement?: string | null;
  reservationMargin?: number | null;
  rollbackTime?: number | null;
  shift?: string | null;
  time?: number | null;
}

export interface ActivityEntry {
  activityId: string;
  activityName: string;
  execution: ExecutionConfig;
  phases: {
    review?: PhaseConfig | null;
    impactAnalysis?: PhaseConfig | null;
    scheduling?: PhaseConfig | null;
    mopCreation?: PhaseConfig | null;
    mopValidation?: PhaseConfig | null;
  };
}

export interface ActivityPhaseView {
  activities: ActivityEntry[];
  basicInfo: {
    chmDomain: string;
    chmSubDomain: string;
    domain: string;
    layer: string;
    planType: string;
    vendorOem: string;
    changeImpact: string;
  };
}

// ─── Activity Insert Types (POST payload) ─────────────────────────────────────

/** Base: 4 fields used by crqReview, impactAnalysis, scheduling, mopCreate, mopValidate */
export interface InsertPhaseConfig {
  shift: string;
  minimumLevelRequirement: string;
  requiredTimeMinutes: number;
  assignedToTeam: number;
}

/** Extended: 7 fields used only by crqExecution */
export interface InsertExecutionPhaseConfig extends InsertPhaseConfig {
  daysMargin: number;
  reservationMargin: number;
  rollbackTime: number;
}

/** Flat payload sent to /activity/insert */
export interface AddActivityRequest {
  actorUserId: number;
  planId: number;
  activityName: string;
  [key: string]: string | number;
}

// ─── Shift Dropdown ───────────────────────────────────────────────────────────

export interface ShiftDropdown {
  shiftId: number;
  shiftRange: string;
}

// ─── API Endpoints ────────────────────────────────────────────────────────────

export const planApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlanView: builder.query<PlanViewRow[], PlanViewQueryParams>({
      query: (params) => ({ url: "/plan/view", method: "GET", params }),
      providesTags: ["Plan"],
    }),
    getActivityPhaseView: builder.query<ActivityPhaseView, { planId: number }>({
      query: ({ planId }) => ({
        url: "/activity/phase-view",
        method: "GET",
        params: { planId },
      }),
      providesTags: ["ActivityPhase"],
    }),
    getShiftDropdowns: builder.query<ShiftDropdown[], void>({
      query: () => ({
        url: "/monthlyrosterview/shiftdropdowns",
        method: "GET",
      }),
      providesTags: ["ShiftDropdown"],
    }),
    addActivity: builder.mutation<void, AddActivityRequest>({
      query: (body) => ({
        url: "/activity/insert",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ActivityPhase"],
    }),
    updatePlan: builder.mutation<void, UpdatePlanRequest>({
      query: (body) => ({
        url: "/activity/updateplan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),
    addPlan: builder.mutation<void, AddPlanRequest>({
      query: (body) => ({
        url: "/insertplan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useGetPlanViewQuery,
  useGetActivityPhaseViewQuery,
  useGetShiftDropdownsQuery,
  useAddActivityMutation,
  useUpdatePlanMutation,
  useAddPlanMutation,
} = planApi;

// import { api } from "../../../../../service/api";

// export interface PlanViewRow {
//   changeImpact: string;
//   chmDomain: string;
//   chmDomainId?: number;
//   chmSubDomain: string | null;
//   chmSubDomainId?: number;
//   layer: string;
//   networkDomain: string;
//   planId: number;
//   planType: string;
//   planVendor: string;
//   status: string;
// }

// export interface UpdatePlanRequest {
//   actorUserId: number;
//   planId: number;
//   planType: string;
//   status: string;
//   chmDomainId: number;
//   chmSubDomain: number;
//   networkDomain: string;
//   layer: string;
//   planVendor: string;
//   changeImpact: string;
// }

// export interface PlanViewQueryParams {
//   verticalId?: number;
//   functionId?: number;
//   domainId?: number;
//   subDomainId?: number;
//   page?: number;
//   size?: number;
// }

// export interface PhaseConfig {
//   assignTeam?: string | null;
//   minimumLevelRequirement?: string | null;
//   shift?: string | null;
//   time?: number | null;
// }

// export interface ExecutionConfig {
//   assignTeam?: string | null;
//   daysMargin?: number | null;
//   minimumLevelRequirement?: string | null;
//   reservationMargin?: number | null;
//   rollbackTime?: number | null;
//   shift?: string | null;
//   time?: number | null;
// }

// export interface ActivityEntry {
//   activityId: string;
//   activityName: string;
//   execution: ExecutionConfig;
//   phases: {
//     review?: PhaseConfig | null;
//     impactAnalysis?: PhaseConfig | null;
//     scheduling?: PhaseConfig | null;
//     mopCreation?: PhaseConfig | null;
//     mopValidation?: PhaseConfig | null;
//   };
// }

// export interface ActivityPhaseView {
//   activities: ActivityEntry[];
//   basicInfo: {
//     chmDomain: string;
//     chmSubDomain: string;
//     domain: string;
//     layer: string;
//     planType: string;
//     vendorOem: string;
//     changeImpact: string;
//   };
// }

// export interface InsertPhaseConfig {
//   shift: string;
//   minimumLevelRequirement: string;
//   requiredTimeMinutes: number;
//   daysMargin: number;
//   reservationMargin: number;
//   rollbackTime: number;
//   assignedToTeam: number;
// }

// export interface AddActivityRequest {
//   planId: number;
//   activityName: string;

//   crqReview: InsertPhaseConfig;
//   impactAnalysis: InsertPhaseConfig;
//   scheduling: InsertPhaseConfig;
//   mopCreate: InsertPhaseConfig;
//   mopValidate: InsertPhaseConfig;
//   crqExecution: InsertPhaseConfig;
// }

// export interface AddPlanRequest {
//   chmDomain: number;
//   chmSubDomain: number;
//   networkDomain: string;
//   layer: string;
//   planType: string;
//   vendorOem: string;
//   changeImpact: string;
// }

// export interface ShiftDropdown {
//   shiftId: number;
//   shiftRange: string;
// }

// export const planApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     getPlanView: builder.query<PlanViewRow[], PlanViewQueryParams>({
//       query: (params) => ({ url: "/plan/view", method: "GET", params }),
//       providesTags: ["Plan"],
//     }),
//     getActivityPhaseView: builder.query<ActivityPhaseView, { planId: number }>({
//       query: ({ planId }) => ({
//         url: "/activity/phase-view",
//         method: "GET",
//         params: { planId },
//       }),
//       providesTags: ["ActivityPhase"],
//     }),
//     getShiftDropdowns: builder.query<ShiftDropdown[], void>({
//       query: () => ({ url: "/monthlyrosterview/shiftdropdowns", method: "GET" }),
//       providesTags: ["ShiftDropdown"],
//     }),
//     addActivity: builder.mutation<any, AddActivityRequest>({
//       query: (body) => ({
//         url: "/activity/insert",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["ActivityPhase"],
//     }),
//     updatePlan: builder.mutation<any, UpdatePlanRequest>({
//       query: (body) => ({
//         url: "/activity/updateplan",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Plan"],
//     }),
//     addPlan: builder.mutation<any, AddPlanRequest>({
//       query: (body) => ({
//         url: "/insertplan",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Plan"],
//     }),
//   }),
// });

// export const {
//   useGetPlanViewQuery,
//   useGetActivityPhaseViewQuery,
//   useGetShiftDropdownsQuery,
//   useAddActivityMutation,
//   useUpdatePlanMutation,
//   useAddPlanMutation,
// } = planApi;
