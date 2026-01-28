import { api } from "../../../service/api";
import type { OrgHierarchyResponse } from "../types/orgHierarchy.types";
import type { EmployeeDto } from "../../teamManagement/types/employee.types";

export const orgHierarchyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Org hierarchy
    getOrgHierarchyByUser: builder.query<
      OrgHierarchyResponse,
      { userId: number; roleName: string }
    >({
      query: ({ userId, roleName }) => ({
        url: "/users/getOrgHierarchyByUser",
        method: "GET",
        params: { userId, roleName },
      }),
    }),

    // ✅ Employees by sub-domain
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

export const {
  useGetOrgHierarchyByUserQuery,
  useGetEmployeesBySubDomainQuery,
} = orgHierarchyApi;


// import { api } from "../../../service/api";
// import type { OrgHierarchyResponse } from "../types/orgHierarchy.types";

// export const orgHierarchyApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     getOrgHierarchyByUser: builder.query<
//       OrgHierarchyResponse,
//       { userId: number; roleName: string }
//     >({
//       query: ({ userId, roleName }) => ({
//         url: "/users/getOrgHierarchyByUser",
//         method: "GET",
//         params: {
//           userId,
//           roleName,
//         },
//       }),
//       providesTags: (_result, _error, arg) => [
//         {
//           type: "ORG_HIERARCHY",
//           id: `${arg.userId}_${arg.roleName}`,
//         },
//       ],
//     }),
//   }),

//   overrideExisting: false,
// });

// export const {
//   useGetOrgHierarchyByUserQuery,
//   useLazyGetOrgHierarchyByUserQuery,
// } = orgHierarchyApi;
