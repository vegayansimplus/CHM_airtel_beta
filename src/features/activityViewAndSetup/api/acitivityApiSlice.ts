import { api } from "../../../service/api";

export const activityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivityView: builder.query<any[], { subDomainID?: number }>({
      query: ({ subDomainID }) => ({
        url: "/activity/view",
        method: "GET",
        params: {
          subDomainID,
        },
      }),
      providesTags: ["Activity"],
    }),

    // NEW: Insert Activity API
    insertActivity: builder.mutation<any, {
      chmDomain: number;
      chmSubDomain: number;
      domain: string;
      layer: string;
      planType: string;
      activityName: string;
      vendorOem: string;
      changeImpact: string;
    }>({
      query: (payload) => ({
        url: "/activity/insert",
        method: "POST", 
        params: payload, 
      }),
      invalidatesTags: ["Activity"],
    }),
  }),
});

export const {
  useGetActivityViewQuery,
  useInsertActivityMutation,
} = activityApi;