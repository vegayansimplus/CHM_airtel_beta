import type {  LoginResponse, LogoutResponse } from '../../features/auth/types/auth.types';
import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, void>({
      query: (body) => ({
        url: '/usermanagement/v2/signin',
        method: 'POST',
        body
      })
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: (body) => ({
        url: `/usermanagement/v1/logout`,
        method: 'POST',
        body
      })
    })
  })
})

export const { useLoginMutation, useLogoutMutation } = authApi
