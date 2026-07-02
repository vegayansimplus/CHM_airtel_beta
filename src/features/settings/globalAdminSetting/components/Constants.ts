

// ─────────────────────────────────────────────────────────────
//  Role display labels

import type { PermissionModel } from "../Globalsettingapislice";

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
//  Default permission types (seeded into local state on mount)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS: PermissionModel[] = [
  { permissionId: 1, permissionName: "View" },
  { permissionId: 2, permissionName: "Create" },
  { permissionId: 3, permissionName: "Update" },
  { permissionId: 4, permissionName: "Delete" },
  { permissionId: 5, permissionName: "Approve" },
  { permissionId: 6, permissionName: "Reject" },
];