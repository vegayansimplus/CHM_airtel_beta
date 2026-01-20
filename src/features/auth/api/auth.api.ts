import { api } from "../../../service/api";
import type { LoggedUserApiResponse, LoginResponse } from "../types/auth.types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { olmId: string; password: string }>(
      {
        query: (body) => ({
          url: "/auth/v1/signin",
          method: "POST",
          body,
        }),
      }
    ),

    getLoggedUser: builder.query<LoggedUserApiResponse[], void>({
      query: () => "/users/v1/getloggeduserdetails",
    }),

    forceLogout: builder.mutation<void, { olmId: string }>({
      query: (body) => ({
        url: `/auth/v1/logout`,
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, { olmId: string }>({
      query: (body) => ({
        url: "/auth/v1/logout",
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
