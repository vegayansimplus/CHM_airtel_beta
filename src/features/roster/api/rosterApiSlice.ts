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
  }),
});

export const { useGetRosterViewQuery, useGetCurrentShiftCountQuery } =
  rosterApiSlice;
