import { api } from "../../../service/api";
import type { EmployeeDto } from "../../teamManagement/types/employee.types";

export const orgHierarchyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeesBySubDomain: builder.query<
      EmployeeDto[],
      { subDomainId: number }
    >({
      query: ({ subDomainId }) => ({
        url: "/users/getEmployeesBySubDomain",
        method: "GET",
        params: { subDomainId },
      }),
    }),
  }),

  overrideExisting: false,
});

export const { useGetEmployeesBySubDomainQuery } = orgHierarchyApi;
