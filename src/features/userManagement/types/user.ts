import {
  Shield,
  SupervisorAccount,
  Person,
  type SvgIconComponent,
} from "@mui/icons-material";

// ─── Core Types (unchanged shape — additive optional fields only) ───────────
export type Role = "Super Admin" | "Team Lead" | "Team Member";

export type UserStatus = "Active" | "Inactive";

export interface Device {
  name: string;
  type: "Desktop" | "Mobile" | "Tablet";
  lastActive: string;
}

export interface Session {
  id: string;
  location: string;
  ip: string;
  device: string;
  time: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  time: string;
}

export interface User {
  id: string;
  name: string;
  employeeId: string;
  function: string;
  role: Role;
  email: string;
  joinedDate: string;
  active: boolean;
  // ── Additive fields for the enterprise dashboard (all optional / derived) ──
  phone?: string;
  manager?: string;
  designation?: string;
  lastLogin?: string;
  permissions?: string[];
  devices?: Device[];
  sessions?: Session[];
  activity?: ActivityEntry[];
}

export interface RoleConfigEntry {
  label: string;
  color: string;
  gradient: string;
  bg: string;
  icon: SvgIconComponent;
}

export const ROLE_CONFIG: Record<Role, RoleConfigEntry> = {
  "Super Admin": {
    label: "Super Admin",
    color: "#DC2626",
    gradient: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
    bg: "#FEF2F2",
    icon: Shield,
  },
  "Team Lead": {
    label: "Lead",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    bg: "#EFF6FF",
    icon: SupervisorAccount,
  },
  "Team Member": {
    label: "Member",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
    bg: "#ECFDF5",
    icon: Person,
  },
};

export const STATUS_CONFIG: Record<
  UserStatus,
  { color: string; bg: string; dot: string }
> = {
  Active: { color: "#10B981", bg: "#ECFDF5", dot: "#22C55E" },
  Inactive: { color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
};

export const getUserStatus = (u: User): UserStatus =>
  u.active ? "Active" : "Inactive";
