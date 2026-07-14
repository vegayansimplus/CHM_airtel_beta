import { api } from "../../../service/api";
import type {
  ActivityPhaseView,
  ActivityViewRow,
  InsertActivityPayload,
  PlanOption,
} from "../types/activity.types";

export interface PlanViewQueryParams {
  verticalId?: number;
  functionId?: number;
  domainId?: number;
  subDomainId?: number;
  page?: number;
  size?: number;
}

export const activityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivityView: builder.query<ActivityViewRow[], { subDomainID?: number }>({
      query: ({ subDomainID }) => ({
        url: "/activity/view",
        method: "GET",
        params: { subDomainID },
      }),
      providesTags: ["Activity"],
    }),

    getActivityPhaseView: builder.query<ActivityPhaseView, { planId: number }>({
      query: ({ planId }) => ({
        url: "/activity/phase-view",
        method: "GET",
        params: { planId },
      }),
      providesTags: ["ActivityPhase"],
    }),

    getPlanOptions: builder.query<PlanOption[], PlanViewQueryParams>({
      query: (params) => ({ url: "/plan/view", method: "GET", params }),
      providesTags: ["Plan"],
    }),

    // Full flat payload matching ActivityInsertRequestDTO (planId + activityName + all 6 phases)
    insertActivity: builder.mutation<
      { status?: string; message?: string },
      InsertActivityPayload
    >({
      query: (body) => ({
        url: "/activity/insert",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Activity", "ActivityPhase"],
    }),
  }),
});

export const {
  useGetActivityViewQuery,
  useGetActivityPhaseViewQuery,
  useGetPlanOptionsQuery,
  useInsertActivityMutation,
} = activityApi;
