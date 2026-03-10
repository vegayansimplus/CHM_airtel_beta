
import { api } from "../../../../service/api"
import type {
  LeaveRequest,
  CreateLeavePayload,
} from "../types/leave.types"



export const leaveApiSlice = api.injectEndpoints({

  endpoints: (builder) => ({

    getPendingLeaves: builder.query<LeaveRequest[], void>({
      query: () => ({
        url: "/leaves/pending",
        method: "GET",
      }),

      keepUnusedDataFor: 60,

      providesTags: ["Leave"],
    }),


    getLeaveHistory: builder.query<LeaveRequest[], void>({
      query: () => ({
        url: "/leaves/history",
        method: "GET",
      }),

      keepUnusedDataFor: 60,

      providesTags: ["Leave"],
    }),


    applyLeave: builder.mutation<void, CreateLeavePayload>({
      query: (body) => ({
        url: "/leaves",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Leave"],
    }),

  }),

  overrideExisting: false,
})



export const {
  useGetPendingLeavesQuery,
  useGetLeaveHistoryQuery,
  useApplyLeaveMutation,
} = leaveApiSlice