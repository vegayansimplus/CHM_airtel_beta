import { api } from "../../../service/api";
import type {
  EmpWorkLocationRow,
  EmployeeOnLeaveRow,
  EngineerDailyAssignmentRow,
  UpcomingHolidayRow,
} from "../types/dashboard.types";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUpcomingHolidays: builder.query<UpcomingHolidayRow[], void>({
      query: () => "/dashboard/upcomingholidays",
    }),
    getEmployeesOnLeave: builder.query<EmployeeOnLeaveRow[], void>({
      query: () => "/dashboard/employeesonleave",
    }),
    getDailyAssignments: builder.query<EngineerDailyAssignmentRow[], { date: string }>({
      query: ({ date }) => ({
        url: `/dashboard/dailyassignments`,
        params: { date },
      }),
    }),
    getWorkLocation: builder.query<EmpWorkLocationRow[], { date: string }>({
      query: ({ date }) => ({
        url: `/dashboard/worklocation`,
        params: { date },
      }),
    }),
  }),
});

export const {
  useGetUpcomingHolidaysQuery,
  useGetEmployeesOnLeaveQuery,
  useGetDailyAssignmentsQuery,
  useGetWorkLocationQuery,
} = dashboardApi;
