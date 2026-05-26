import { api } from "../../../../../service/api";

export interface PlanViewRow {
  changeImpact: string;
  chmDomain: string;
  chmSubDomain: string;
  createdAt: string;
  createdBy: string;
  domain: string;
  layer: string;
  planId: number;
  planType: string;
  status: string;
  vendorOem: string;
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
  }),
});

export const { useGetPlanViewQuery, useGetActivityPhaseViewQuery, useAddActivityMutation } = planApi;
