import { api } from "../../../service/api";
import type {
  ApiResponse,
  CreateEmployeeRequest,
} from "../types/createUser.types";
import type { UpdateEmployeeRequest } from "../types/updateUser.types";
import type { UpdateUserStatusRequest } from "../types/updateUserStatus.types";

export interface CreateUserDropdownResponse {
  employmentTypes: string[];
  vendorCompanies: string[];
  designations: string[];
  jobLevels: string[];
  officeLocations: string[];
  deviceVendorCapabilities: string[];
  roleCode: string[];
}

export const orgHierarchyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addNewEmployee: builder.mutation<ApiResponse, CreateEmployeeRequest>({
      query: (body) => ({
        url: "/teamoverview/v1/addnewemp",
        method: "PUT",
        body,
      }),

      invalidatesTags: ["EMPLOYEES"],
    }),
    getCreateUserDropdowns: builder.query<CreateUserDropdownResponse, void>({
      query: () => ({
        url: "/teamoverview/getcreateuserdropdowns",
        method: "GET",
      }),
      keepUnusedDataFor: 6,
    }),
    // useUpdateEmployeeMutation
    updateEmployee: builder.mutation<
      { status: string; message: string },
      UpdateEmployeeRequest
    >({
      query: (body) => ({
        url: "/teamoverview/v1/updateemp",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["EMPLOYEES"],
    }),
    updateUserStatus: builder.mutation<
      { status: string; message: string },
      UpdateUserStatusRequest
    >({
      query: (body) => ({
        url: "/teamoverview/v1/updateuserstatus",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["EMPLOYEES"],
    }),
    uploadEmployeesFromExcel: builder.mutation<
      {
        rowNumber: number;
        olmid: string;
        status: "SUCCESS" | "FAILED";
        message: string;
      }[],
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/teamoverview/v1/upload-employees",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["EMPLOYEES"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useAddNewEmployeeMutation,
  useGetCreateUserDropdownsQuery,
  useUpdateEmployeeMutation,
  useUpdateUserStatusMutation,
  useUploadEmployeesFromExcelMutation
} = orgHierarchyApi;
