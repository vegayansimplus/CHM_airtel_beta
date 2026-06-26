// ─────────────────────────────────────────────────────────────
//  Constants & shared types for AdminSettingDashboard
// ─────────────────────────────────────────────────────────────

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  VERTICAL_HEAD: "Vertical Head",
  FUNCTION_HEAD: "Function Head",
  DOMAIN_HEAD: "Domain Head",
  SUB_DOMAIN_HEAD: "Sub-Domain Head",
  TEAM_MEMBER: "Team Member",
};

// ─────────────────────────────────────────────────────────────
//  Addable permission shape (used in AddPermissionPopover)
// ─────────────────────────────────────────────────────────────
export interface AddablePermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
}

// ─────────────────────────────────────────────────────────────
//  Local-only (unsaved) model extensions
// ─────────────────────────────────────────────────────────────
import type { RoleModel, ModuleModel } from "../Globalsettingapislice";

export interface LocalRole extends RoleModel {
  isLocal?: boolean;
}

export interface LocalModule extends ModuleModel {
  isLocal?: boolean;
}

export interface LocalSubModule {
  subModuleId: number;
  subModuleName: string;
  moduleId: number;
  isLocal?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  DrawerKind & DrawerState
// ─────────────────────────────────────────────────────────────
export type DrawerKind =
  | "role"
  | "module"
  | "sub-module"
  | "edit-role"
  | "edit-module"
  | "edit-sub-module";

export interface DrawerState {
  kind: DrawerKind;
  target?: { id: number; label: string };
  contextModuleId?: number;
}