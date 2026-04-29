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
  shift?: string;
  minimumLevelRequirement?: string;
  requiredTimeMinutes?: number;
  daysMargin?: number;
  reservationMargin?: number;
  rollbackTime?: number;
}

export interface ActivityPhaseView {
  activityId: string;
  activityName: string;

  basicInfo: {
    domain: string;
    layer: string;
    planType: string;
    vendorOem: string;
    changeImpact: string;
  };

  phases: {
    review?: PhaseConfig;
    impactAnalysis?: PhaseConfig;
    scheduling?: PhaseConfig;
    mopCreation?: PhaseConfig;
    mopValidation?: PhaseConfig;
    execution?: PhaseConfig;
  };
}
export const planApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlanView: builder.query<PlanViewRow[], PlanViewQueryParams>({
      query: (params) => ({
        url: "/plan/view",
        method: "GET",
        params,
      }),
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
  }),
});

export const { useGetPlanViewQuery, useGetActivityPhaseViewQuery } = planApi;
