import { api } from "../../../service/api";

// ─────────────────────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────────────────────

export interface RoleModel {
  roleId: number;
  roleCode: string;
}

export interface ModuleModel {
  moduleId: number;
  moduleName: string;
}

export interface SubModuleModel {
  subModuleId: number;
  subModuleCode: string;
  subModuleName: string;
}

export interface PermissionModel {
  permissionId: number;
  permissionName: string;
}

export interface GrantedPermissionItem {
  permission_id: number;
  permission_code: string;
}

export interface RolePermissionViewModel {
  rolePermissionId: number | null;
  moduleId: number;
  moduleName: string;
  subModuleId: number;
  subModuleName: string;
  permissions: string | null;
}

// ─────────────────────────────────────────────────────────────
// Request Models
// ─────────────────────────────────────────────────────────────

export interface UpdatePermissionRequest {
  roleId: number;
  subModuleId: number;
  permissionId: number;
  isGranted: boolean;
}

export interface BulkUpdatePermissionRequest {
  roleId: number;
  subModuleId: number;
  permissionIds: number[];
  isGranted: boolean;
}

export interface PermissionActionRequest {
  roleId: number;
  subModuleId: number;
  permissionId: number;
}

export interface ApiResponse {
  status: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// API Slice
// ─────────────────────────────────────────────────────────────

export const globalSettingApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({

    // ─────────────────────────────────────────
    // Dropdown APIs
    // ─────────────────────────────────────────

    getRoles: builder.query<RoleModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/roles",
        method: "GET",
      }),
    }),

    getModules: builder.query<ModuleModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/modules",
        method: "GET",
      }),
    }),

    getSubModules: builder.query<SubModuleModel[], number>({
      query: (moduleId) => ({
        url: "/global-settings/permissions/dropdown/sub-modules",
        method: "GET",
        params: { moduleId },
      }),
    }),

    getPermissionTypes: builder.query<PermissionModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/permission-types",
        method: "GET",
      }),
    }),

    // ─────────────────────────────────────────
    // Single Permission Update
    // ─────────────────────────────────────────

    updatePermission: builder.mutation<
      ApiResponse,
      UpdatePermissionRequest
    >({
      query: (body) => ({
        url: "/global-settings/permissions/update",
        method: "PATCH",
        body,
      }),
    }),

    // ─────────────────────────────────────────
    // Bulk Permission Update
    // ─────────────────────────────────────────

    bulkUpdatePermissions: builder.mutation<
      ApiResponse,
      BulkUpdatePermissionRequest
    >({
      query: (body) => ({
        url: "/global-settings/permissions/bulk-update",
        method: "PATCH",
        body,
      }),
    }),

    // ─────────────────────────────────────────
    // Reset Permissions
    // ─────────────────────────────────────────

    resetPermissions: builder.mutation<
      ApiResponse,
      {
        roleId: number;
        subModuleId: number;
      }
    >({
      query: ({ roleId, subModuleId }) => ({
        url: `/global-settings/permissions/reset/role/${roleId}/sub-module/${subModuleId}`,
        method: "DELETE",
      }),
    }),

    // ─────────────────────────────────────────
    // Enable Permission
    // ─────────────────────────────────────────

    enablePermission: builder.mutation<
      ApiResponse,
      PermissionActionRequest
    >({
      query: (body) => ({
        url: "/global-settings/permissions/enable",
        method: "POST",
        body,
      }),
    }),

    // ─────────────────────────────────────────
    // Disable Permission
    // ─────────────────────────────────────────

    disablePermission: builder.mutation<
      ApiResponse,
      PermissionActionRequest
    >({
      query: (body) => ({
        url: "/global-settings/permissions/disable",
        method: "POST",
        body,
      }),
    }),

    // ─────────────────────────────────────────
    // Get Role Permissions Matrix
    // ─────────────────────────────────────────

    getAllRolePermissions: builder.query<
      RolePermissionViewModel[],
      {
        roleId: number;
        moduleId: number;
      }
    >({
      query: ({ roleId, moduleId }) => ({
        url: "/global-settings/permissions/role-permissions",
        method: "GET",
        params: {
          roleId,
          moduleId,
        },
      }),

      serializeQueryArgs: ({ queryArgs }) =>
        `getAllRolePermissions-${queryArgs.roleId}-${queryArgs.moduleId}`,
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

export const {
  useGetRolesQuery,
  useGetModulesQuery,
  useGetSubModulesQuery,
  useGetPermissionTypesQuery,

  useUpdatePermissionMutation,
  useBulkUpdatePermissionsMutation,

  useResetPermissionsMutation,

  useEnablePermissionMutation,
  useDisablePermissionMutation,

  useGetAllRolePermissionsQuery,
} = globalSettingApiSlice;