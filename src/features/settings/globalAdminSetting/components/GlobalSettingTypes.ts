
// ─────────────────────────────────────────────────────────────
//  Local-only (unsaved) models

import type { ModuleModel, PermissionModel, RoleModel } from "../Globalsettingapislice";

// ─────────────────────────────────────────────────────────────
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

export interface LocalPermission extends PermissionModel {
  isLocal?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Drawer
// ─────────────────────────────────────────────────────────────
export type DrawerKind =
  | "role"
  | "module"
  | "edit-role"
  | "edit-module"
  | "sub-module"
  | "edit-sub-module"
  | "edit-permission"
  | "add-permission"
  | "manage-permissions";

export interface DrawerState {
  kind: DrawerKind;
  target?: { id: number; label: string };
  contextModuleId?: number;
}

// ─────────────────────────────────────────────────────────────
//  Confirm dialog
// ─────────────────────────────────────────────────────────────
export interface ConfirmDialogState {
  open: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
}

// ─────────────────────────────────────────────────────────────
//  Snackbar
// ─────────────────────────────────────────────────────────────
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}