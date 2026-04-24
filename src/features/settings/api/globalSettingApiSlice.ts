import { api } from "../../../service/api";

export interface Holiday {
  holidayId?: number; // Optional for creating new ones
  holidayDate: string;
  holidayDay: string;
  holidayOccasion: string;
  location: string;
}

export const globalSettingApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getHolidayData: builder.query<Holiday[], void>({
      query: () => ({
        url: "/networkfreez/holiday/view",
        method: "GET",
      }),
      providesTags: ["Holiday"], // Enables auto-refresh
    }),

    // Add Holiday (Assuming standard POST endpoint based on your API pattern)
    addHoliday: builder.mutation<{ status: string; message: string }, Partial<Holiday>>({
      query: (newHoliday) => ({
        url: "/networkfreez/holiday/add", 
        method: "POST",
        body: newHoliday,
      }),
      invalidatesTags: ["Holiday"],
    }),

    // Update Holiday (Matches your exact cURL with query params)
    updateHoliday: builder.mutation<{ status: string; message: string }, Partial<Holiday>>({
      query: (holiday) => ({
        url: "/networkfreez/holiday/update",
        method: "PATCH",
        params: {
          location: holiday.location,
          holidayDate: holiday.holidayDate,
          holidayOccasion: holiday.holidayOccasion,
          holidayId: holiday.holidayId, // Sending ID just in case backend requires it
        },
      }),
      invalidatesTags: ["Holiday"],
    }),

    // Delete Holiday (Matches your cURL with path variable)
    deleteHoliday: builder.mutation<{ status: string; message: string }, number>({
      query: (id) => ({
        url: `/networkfreez/holiday/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

export const {
  useGetHolidayDataQuery,
  useAddHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = globalSettingApiSlice;