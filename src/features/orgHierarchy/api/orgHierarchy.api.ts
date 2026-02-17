import { api } from "../../../service/api";
import type { OrgHierarchyResponse } from "../types/orgHierarchy.types";
import type { EmployeeDto } from "../../teamManagement/types/employee.types";

/* ============================================================
   SPRING PAGINATION RESPONSE (MATCHES YOUR BACKEND EXACTLY)
============================================================ */

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

/* ============================================================
   API
============================================================ */

export const orgHierarchyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= ORG HIERARCHY ================= */

    getOrgHierarchyByUser: builder.query<OrgHierarchyResponse, void>({
      query: () => ({
        url: "/users/V1/getOrgHierarchyByUser",
        method: "GET",
      }),

      keepUnusedDataFor: 300, // cache 5 minutes
      providesTags: ["ORG_HIERARCHY"],
    }),

    /* ================= EMPLOYEES (SERVER PAGINATION) ================= */

    getEmployeesBySubDomain: builder.query<
      PaginatedResponse<EmployeeDto>,
      {
        subDomainId: number;
        employeeStatus: "ACTIVE" | "INACTIVE";
        page: number;
        size: number;
      }
    >({
      query: ({ subDomainId, employeeStatus, page, size }) => ({
        url: "/users/v2/getemployeesbysubdomain",
        method: "GET",
        params: {
          subDomainId,
          employeeStatus,
          page,
          size,
        },
      }),

      keepUnusedDataFor: 120,

      providesTags: (result, error, arg) => [
        { type: "EMPLOYEES", id: `${arg.subDomainId}-${arg.employeeStatus}` },
      ],
    }),
    getEmpCountBySubDomainId: builder.query<
      {
        l1Count: number;
        l2Count: number;
        l3Count: number;
        l4Count: number;
        teamLead: string;
        totalCount: number;
      }[],
      { subDomainId: number }
    >({
      query: ({ subDomainId }) => ({
        url: "/teamoverview/getempcountbysubdomainid",
        method: "GET",
        params: { subDomainId },
      }),
      keepUnusedDataFor: 120,
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetOrgHierarchyByUserQuery,
  useGetEmployeesBySubDomainQuery,
  useGetEmpCountBySubDomainIdQuery,
} = orgHierarchyApi;

// import { api } from "../../../service/api";
// import type { OrgHierarchyResponse } from "../types/orgHierarchy.types";
// import type { EmployeeDto } from "../../teamManagement/types/employee.types";

// export const orgHierarchyApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     // Org hierarchy
//     getOrgHierarchyByUser: builder.query<OrgHierarchyResponse, void>({
//       query: () => ({
//         // url: "/users/getOrgHierarchyByUser",
//         url: "/users/V1/getOrgHierarchyByUser",
//         method: "GET",
//       }),
//     }),

//     //  Employees by sub-domain
//     getEmployeesBySubDomain: builder.query<
//       EmployeeDto[],
//       { subDomainId: number }
//     >({
//       query: ({ subDomainId }) => ({
//         url: "/users/getEmployeesBySubDomain",
//         method: "GET",
//         params: { subDomainId },
//       }),
//     }),
//   }),

//   overrideExisting: false,
// });

// export const {
//   useGetOrgHierarchyByUserQuery,
//   useGetEmployeesBySubDomainQuery,
// } = orgHierarchyApi;
