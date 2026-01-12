import { api } from "../../../service/api";
import type { LoggedUserApiResponse, LoginResponse } from "../types/auth.types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { olmId: string; password: string }>(
      {
        query: (body) => ({
          url: "/usermanagement/v2/signin",
          method: "POST",
          body,
        }),
      }
    ),

    getLoggedUser: builder.query<LoggedUserApiResponse[], void>({
      query: () => "/usermanagement/v2/getloggeduserdetails",
    }),

    forceLogout: builder.mutation<void, { olmId: string }>({
      query: (body) => ({
        url: `/usermanagement/v1/logout`,
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, { olmId: string }>({
      query: (body) => ({
        url: "/usermanagement/v1/logout",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLazyGetLoggedUserQuery,
  useForceLogoutMutation,
  useLogoutMutation,
} = authApi;
