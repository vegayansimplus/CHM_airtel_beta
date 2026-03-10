import { api } from "../../../service/api";
import type {
  CurrentShiftCount,
  RosterViewParams,
  RosterViewResponse,
} from "../types/monthlyRoster.type";

export const rosterApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getRosterView: builder.query<RosterViewResponse, RosterViewParams>({
      query: ({ domainId, subDomainId, startDate, endDate }) => ({
        url: "/monthlyrosterview",
        method: "GET",
        params: {
          domainId,
          subDomainId,
          startDate,
          endDate,
        },
      }),

      keepUnusedDataFor: 6,
      providesTags: ["RosterVIew"],
    }),
    getCurrentShiftCount: builder.query<
      CurrentShiftCount[],
      { domainId: number; subDomainId: number }
    >({
      query: ({ domainId, subDomainId }) => ({
        url: "/monthlyrosterview/currentshiftcount",
        method: "GET",
        params: { domainId, subDomainId },
      }),
    }),

    // mutation for changing a shift using query parameters as per API
    changeShift: builder.mutation<
      { status: string; message: string },
      ChangeShiftParams
    >({
      query: (params) => ({
        url: "/monthlyrosterview/changeshift",
        method: "POST",
        params,
      }),
    }),

    getShiftDropdown: builder.query<
      { shiftId: number; shiftRange: string }[],
      { subDomainId: number }
    >({
      query: ({ subDomainId }) => ({
        url: "/monthlyrosterview/shiftdropdowns",
        method: "GET",
        params: { subDomainId },
      }),
    }),
  }),
});

export const {
  useGetRosterViewQuery,
  useGetCurrentShiftCountQuery,
  useChangeShiftMutation,
  useGetShiftDropdownQuery,
} = rosterApiSlice;

// types for the mutation input
export interface ChangeShiftParams {
  affectedUserId: string | number;
  newShiftRange: string;
  newAssignActivity?: number;
  newAvailableMinutes?: number;
  shiftDate: string;
  newShiftId?: number;
  reason?: string;
}
