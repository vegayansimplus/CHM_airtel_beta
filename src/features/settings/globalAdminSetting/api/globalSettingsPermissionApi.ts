import { api } from "../../../../service/api";

// ─────────────────────────────────────────────────────────────
//  Response models (mirror GlobalSettingsPermissionController)
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

/**
 * Returned by GET /dropdown/permissions — only id + name; permissionCode is
 * derived client-side from the name (see utils/permissionUtils.ts#slug).
 */
export interface PermissionModel {
  permissionId: number;
  permissionName: string;
}

/** Shape returned inside permissions[] from the role-permissions endpoint */
export interface GrantedPermissionItem {
  permission_id: number;
  permission_code: string;
}

/** Shape returned by GET /role-permissions */
export interface RolePermissionViewModel {
  rolePermissionId: number | null;
  moduleId: number;
  moduleName: string;
  subModuleId: number;
  subModuleName: string;
  permissions: GrantedPermissionItem[];
}

export interface ApiResponse {
  status: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
//  Request models
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

export interface CreateRoleRequest {
  roleCode: string;
  copiedRoleId?: number;
}

export interface CreateModuleRequest {
  moduleCode: string;
}

export interface CreateSubModuleRequest {
  moduleId: number;
  subModuleCode: string;
}

// ─────────────────────────────────────────────────────────────
//  API slice
// ─────────────────────────────────────────────────────────────

const PERMISSIONS_LIST_TAG = { type: "GlobalSettingsPermission" as const, id: "LIST" as const };
const ROLES_LIST_TAG = { type: "GlobalSettingsRoles" as const, id: "LIST" as const };
const MODULES_LIST_TAG = { type: "GlobalSettingsModules" as const, id: "LIST" as const };
const SUB_MODULES_LIST_TAG = { type: "GlobalSettingsSubModules" as const, id: "LIST" as const };

export const globalSettingsPermissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Dropdowns ────────────────────────────────────────────
    getRoles: builder.query<RoleModel[], void>({
      query: () => ({ url: "/global-settings/permissions/dropdown/roles", method: "GET" }),
      providesTags: [ROLES_LIST_TAG],
    }),

    getModules: builder.query<ModuleModel[], void>({
      query: () => ({ url: "/global-settings/permissions/dropdown/modules", method: "GET" }),
      providesTags: [MODULES_LIST_TAG],
    }),

    getSubModules: builder.query<SubModuleModel[], number>({
      query: (moduleId) => ({
        url: "/global-settings/permissions/dropdown/sub-modules",
        method: "GET",
        params: { moduleId },
      }),
      providesTags: [SUB_MODULES_LIST_TAG],
    }),

    getPermissionTypes: builder.query<PermissionModel[], void>({
      query: () => ({ url: "/global-settings/permissions/dropdown/permissions", method: "GET" }),
      providesTags: [PERMISSIONS_LIST_TAG],
    }),

    // ── Permission mutations ─────────────────────────────────
    updatePermission: builder.mutation<ApiResponse, UpdatePermissionRequest>({
      query: (body) => ({ url: "/global-settings/permissions/update", method: "PATCH", body }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    bulkUpdatePermissions: builder.mutation<ApiResponse, BulkUpdatePermissionRequest>({
      query: (body) => ({ url: "/global-settings/permissions/bulk-update", method: "PATCH", body }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    resetPermissions: builder.mutation<ApiResponse, { roleId: number; subModuleId: number }>({
      query: ({ roleId, subModuleId }) => ({
        url: `/global-settings/permissions/reset/role/${roleId}/sub-module/${subModuleId}`,
        method: "DELETE",
      }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    enablePermission: builder.mutation<ApiResponse, PermissionActionRequest>({
      query: (body) => ({ url: "/global-settings/permissions/enable", method: "POST", body }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    disablePermission: builder.mutation<ApiResponse, PermissionActionRequest>({
      query: (body) => ({ url: "/global-settings/permissions/disable", method: "POST", body }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    // ── Attach a permission type to a sub-module (persists the mapping) ─
    addNewRolePermission: builder.mutation<ApiResponse, PermissionActionRequest>({
      query: (body) => ({
        url: "/global-settings/permissions/add-role-permission",
        method: "POST",
        body,
      }),
      invalidatesTags: [PERMISSIONS_LIST_TAG],
    }),

    // ── Disable Role ──────────────────────────────────────────
    disableRole: builder.mutation<ApiResponse, { roleId: number }>({
      query: ({ roleId }) => ({
        url: "/global-settings/permissions/disable-role",
        method: "POST",
        params: { roleId },
      }),
      invalidatesTags: [ROLES_LIST_TAG, PERMISSIONS_LIST_TAG],
    }),

    // ── Create Role (optionally cloning an existing role's permissions) ─
    createNewRole: builder.mutation<ApiResponse, CreateRoleRequest>({
      query: ({ roleCode, copiedRoleId }) => ({
        url: "/global-settings/permissions/create-new-role",
        method: "POST",
        params: copiedRoleId != null ? { roleCode, copiedRoleId } : { roleCode },
      }),
      invalidatesTags: [ROLES_LIST_TAG, PERMISSIONS_LIST_TAG],
    }),

    // ── Create Module ────────────────────────────────────────
    createNewModule: builder.mutation<ApiResponse, CreateModuleRequest>({
      query: ({ moduleCode }) => ({
        url: "/global-settings/permissions/create-new-module",
        method: "POST",
        params: { moduleCode },
      }),
      invalidatesTags: [MODULES_LIST_TAG],
    }),

    // ── Disable Module ────────────────────────────────────────
    disableModule: builder.mutation<ApiResponse, { moduleId: number }>({
      query: ({ moduleId }) => ({
        url: "/global-settings/permissions/disable-module",
        method: "POST",
        params: { moduleId },
      }),
      invalidatesTags: [MODULES_LIST_TAG, PERMISSIONS_LIST_TAG],
    }),

    // ── Create Sub-module ────────────────────────────────────
    createNewSubModule: builder.mutation<ApiResponse, CreateSubModuleRequest>({
      query: ({ moduleId, subModuleCode }) => ({
        url: "/global-settings/permissions/create-new-sub-module",
        method: "POST",
        params: { moduleId, subModuleCode },
      }),
      invalidatesTags: [SUB_MODULES_LIST_TAG, PERMISSIONS_LIST_TAG],
    }),

    // ── Role-permission matrix (grouped view — powers the dashboard) ────
    getAllRolePermissions: builder.query<
      RolePermissionViewModel[],
      { roleId: number; moduleId: number }
    >({
      query: ({ roleId, moduleId }) => ({
        url: "/global-settings/permissions/role-permissions",
        method: "GET",
        params: { roleId, moduleId },
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `getAllRolePermissions-${queryArgs.roleId}-${queryArgs.moduleId}`,
      providesTags: (_result, _error, { roleId, moduleId }) => [
        PERMISSIONS_LIST_TAG,
        { type: "GlobalSettingsPermission", id: `${roleId}-${moduleId}` },
      ],
    }),

    // ── Flat role-permission map ─────────────────────────────
    // Added for controller parity (GET /role-permission-map). The response
    // model (RolePermissionModel) isn't defined anywhere in this frontend
    // repo, so it's intentionally typed loosely and left unconsumed by the
    // dashboard — no UI should be built on a shape that hasn't been confirmed.
    getAllRolePermission: builder.query<unknown[], { moduleId: number; roleId: number }>({
      query: ({ moduleId, roleId }) => ({
        url: "/global-settings/permissions/role-permission-map",
        method: "GET",
        params: { moduleId, roleId },
      }),
      providesTags: [PERMISSIONS_LIST_TAG],
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
  useEnablePermissionMutation,
  useDisablePermissionMutation,
  useAddNewRolePermissionMutation,
  useDisableRoleMutation,
  useCreateNewRoleMutation,
  useDisableModuleMutation,
  useCreateNewModuleMutation,
  useCreateNewSubModuleMutation,
  useGetAllRolePermissionsQuery,
  useGetAllRolePermissionQuery,
} = globalSettingsPermissionApi;
