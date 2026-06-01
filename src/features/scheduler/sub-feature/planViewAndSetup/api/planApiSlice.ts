import { api } from "../../../../../service/api";

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

export interface PhaseConfig {
  shift?: string | null;
  minimumLevelRequirement?: string | null;
  requiredTimeMinutes?: number | null;
  daysMargin?: number | null;
  reservationMargin?: number | null;
  rollbackTime?: number | null;
}

export interface ActivityEntry {
  activityId: string;
  activityName: string;
  phases: {
    review?: PhaseConfig | null;
    impactAnalysis?: PhaseConfig | null;
    scheduling?: PhaseConfig | null;
    mopCreation?: PhaseConfig | null;
    mopValidation?: PhaseConfig | null;
    execution?: PhaseConfig | null;
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

export interface InsertPhaseConfig {
  shift: string;
  minimumLevelRequirement: string;
  requiredTimeMinutes: number;
  daysMargin: number;
  reservationMargin: number;
  rollbackTime: number;
  assignedToTeam: number;
}

export interface AddActivityRequest {
  planId: number;
  activityName: string;

  crqReview: InsertPhaseConfig;
  impactAnalysis: InsertPhaseConfig;
  scheduling: InsertPhaseConfig;
  mopCreate: InsertPhaseConfig;
  mopValidate: InsertPhaseConfig;
  crqExecution: InsertPhaseConfig;
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
    addActivity: builder.mutation<any, AddActivityRequest>({
      query: (body) => ({
        url: "/activity/insert",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ActivityPhase"],
    }),
    updatePlan: builder.mutation<any, UpdatePlanRequest>({
      query: (body) => ({
        url: "/activity/updateplan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),
    addPlan: builder.mutation<any, AddPlanRequest>({
      query: (body) => ({
        url: "/insertplan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const { useGetPlanViewQuery, useGetActivityPhaseViewQuery, useAddActivityMutation, useUpdatePlanMutation, useAddPlanMutation } = planApi;
