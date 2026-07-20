import {
  Shield,
  SupervisorAccount,
  Groups,
  Person,
  type SvgIconComponent,
} from "@mui/icons-material";
import type { UserListItem } from "../api/userManagementApi";

// ─── Core Types ──────────────────────────────────────────────────────────
// Normalized shape the grid/cards/filters work with, adapted from the live
// UserListItem (sp_get_users_paginated) via mapUserListItem below. There is
// no manager, device, or generic-activity data anywhere in the schema, so
// those mock-only fields have no equivalent here and were dropped.
export interface User {
  id: string;
  userId: number;
  name: string;
  employeeId: string;
  function: string;
  functionId: number | null;
  verticalName: string | null;
  role: string;
  email: string;
  joinedDate: string | null;
  active: boolean;
  phone?: string | null;
  designation?: string | null;
  lastLogin?: string | null;
}

export function mapUserListItem(item: UserListItem): User {
  return {
    id: String(item.userId),
    userId: item.userId,
    name: item.employeeName,
    employeeId: item.olmid,
    function: item.functionName ?? "Unassigned",
    functionId: item.functionId,
    verticalName: item.verticalName,
    role: item.roleCode ?? "",
    email: item.emailId,
    joinedDate: item.dateOfJoining,
    active: item.employeeStatus === "ACTIVE",
    phone: item.mobileNo,
    designation: item.designation,
    lastLogin: item.lastLogin,
  };
}

export type UserStatus = "Active" | "Inactive";

export interface RoleConfigEntry {
  label: string;
  color: string;
  gradient: string;
  bg: string;
  icon: SvgIconComponent;
}

// Roles are real ROLE_MASTER.role_code values (SUPER_ADMIN, VERTICAL_HEAD,
// FUNCTION_HEAD, DOMAIN_HEAD, SUB_DOMAIN_HEAD, TEAM_MEMBER, CAB_*, ...) -
// an open set, not a fixed 3-value enum, so styling is resolved by a
// lookup with a fallback rather than a Record keyed by every possible role.
const KNOWN_ROLE_STYLE: Record<string, Omit<RoleConfigEntry, "label">> = {
  SUPER_ADMIN: {
    color: "#DC2626",
    gradient: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
    bg: "#FEF2F2",
    icon: Shield,
  },
  VERTICAL_HEAD: {
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    bg: "#EFF6FF",
    icon: SupervisorAccount,
  },
  FUNCTION_HEAD: {
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    bg: "#EFF6FF",
    icon: SupervisorAccount,
  },
  DOMAIN_HEAD: {
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    bg: "#EFF6FF",
    icon: SupervisorAccount,
  },
  SUB_DOMAIN_HEAD: {
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    bg: "#EFF6FF",
    icon: SupervisorAccount,
  },
  TEAM_MEMBER: {
    color: "#10B981",
    gradient: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
    bg: "#ECFDF5",
    icon: Person,
  },
};

const FALLBACK_ROLE_STYLE: Omit<RoleConfigEntry, "label"> = {
  color: "#7C3AED",
  gradient: "linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)",
  bg: "#F5F3FF",
  icon: Groups,
};

function roleCodeToLabel(roleCode: string): string {
  return roleCode
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getRoleConfig(roleCode: string | null | undefined): RoleConfigEntry {
  if (!roleCode) {
    return { label: "Unassigned", ...FALLBACK_ROLE_STYLE };
  }
  const style = KNOWN_ROLE_STYLE[roleCode] ?? FALLBACK_ROLE_STYLE;
  return { label: roleCodeToLabel(roleCode), ...style };
}

export const STATUS_CONFIG: Record<
  UserStatus,
  { color: string; bg: string; dot: string }
> = {
  Active: { color: "#10B981", bg: "#ECFDF5", dot: "#22C55E" },
  Inactive: { color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
};

export const getUserStatus = (u: User): UserStatus => (u.active ? "Active" : "Inactive");
