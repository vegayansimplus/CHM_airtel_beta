import { api } from "../../../service/api";

// ─────────────────────────────────────────────────────────────
//  Response shapes  (match SP column names exactly)
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

// ─────────────────────────────────────────────────────────────
//  Mutation payloads
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

export interface ApiResponse {
  status: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
//  Slice
// ─────────────────────────────────────────────────────────────

export const globalSettingApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── sp_get_roles() ───────────────────────────────────────
    getRoles: builder.query<RoleModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/roles",
        method: "GET",
      }),
    }),

    // ── sp_get_module_dropdown() ─────────────────────────────
    getModules: builder.query<ModuleModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/modules",
        method: "GET",
      }),
    }),

    // ── sp_get_sub_module_dropdown(moduleId) ─────────────────
    getSubModules: builder.query<SubModuleModel[], number>({
      query: (moduleId) => ({
        url: "/global-settings/permissions/dropdown/sub-modules",
        method: "GET",
        params: { moduleId },
      }),
    }),

    // ── sp_get_permission_dropdown() ─────────────────────────
    getPermissionTypes: builder.query<PermissionModel[], void>({
      query: () => ({
        url: "/global-settings/permissions/dropdown/permission-types",
        method: "GET",
      }),
    }),

    // ── sp_update_global_settings_permission(…) ──────────────
    updatePermission: builder.mutation<ApiResponse, UpdatePermissionRequest>({
      query: (body) => ({
        url: "/global-settings/permissions/update",
        method: "PATCH",
        body,
      }),
    }),

    // ── sp_bulk_update_global_settings_permissions(…) ────────
    bulkUpdatePermissions: builder.mutation<ApiResponse, BulkUpdatePermissionRequest>({
      query: (body) => ({
        url: "/global-settings/permissions/bulk-update",
        method: "PATCH",
        body,
      }),
    }),

    // ── sp_reset_role_submodule_permissions(…) ───────────────
    resetPermissions: builder.mutation<
      ApiResponse,
      { roleId: number; subModuleId: number }
    >({
      query: ({ roleId, subModuleId }) => ({
        url: `/global-settings/permissions/reset/role/${roleId}/sub-module/${subModuleId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetModulesQuery,
  useGetSubModulesQuery,
  useGetPermissionTypesQuery,
  useUpdatePermissionMutation,
  useBulkUpdatePermissionsMutation,
  useResetPermissionsMutation,
} = globalSettingApiSlice;