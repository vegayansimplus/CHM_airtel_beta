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
  }),
});

export const { useGetPlanViewQuery } = planApi;