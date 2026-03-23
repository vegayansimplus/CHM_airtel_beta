import { api } from "../../../service/api";

export interface RosterDay {
  assignActCount: number;
  availableMins: number;
  shiftDisplay: string;
  workMode: string | null;
}

export interface UserRoster {
  userId: number;
  olmid: string;
  roster: Record<string, RosterDay>;
}

export interface MonthlyRosterResponse {
  data: UserRoster[];
  startDate: string;
  endDate: string;
  success: boolean;
  totalUsers: number;
}

export const userMonthlyRosterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserMonthlyRoster: builder.query<
      MonthlyRosterResponse,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: `/monthlyrosterview/userroster`,
        params: { startDate, endDate },
      }),
    }),
  }),
});

export const { useGetUserMonthlyRosterQuery } = userMonthlyRosterApi;