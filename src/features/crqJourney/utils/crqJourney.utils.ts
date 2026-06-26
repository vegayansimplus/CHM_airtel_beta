import type { StepStatus, ApprovalStatus, Priority, CrqStatus } from "../types/crqJourney.types";

// ─── Step status config ───────────────────────────────────────────────────────
export const STEP_STATUS_CONFIG: Record<
  StepStatus,
  { label: string; color: string; borderColor: string; bgColor: string }
> = {
  completed:   { label: "Completed",   color: "#16A34A", borderColor: "#BCE6CC", bgColor: "#F0FBF4" },
  in_progress: { label: "In Progress", color: "#1976D2", borderColor: "#8FBDF4", bgColor: "#F2F7FE" },
  pending:     { label: "Pending",     color: "#ED8B00", borderColor: "#FBE0BE", bgColor: "#FDF5E8" },
  not_started: { label: "Not Started", color: "#64748B", borderColor: "#CBD5E1", bgColor: "#F8FAFC" },
};

// ─── Approval status config ───────────────────────────────────────────────────
export const APPROVAL_STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; borderColor: string; iconBg: string }
> = {
  approved: { label: "Approved", color: "#16A34A", borderColor: "#CDEBD9", iconBg: "#E9F7EF" },
  pending:  { label: "Pending",  color: "#ED8B00", borderColor: "#FBE2C6", iconBg: "#FDF0E2" },
  rejected: { label: "Rejected", color: "#E11D48", borderColor: "#F6C7D2", iconBg: "#FDE7EC" },
};

// ─── Priority config ──────────────────────────────────────────────────────────
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high:   { label: "High",   color: "#E53935" },
  medium: { label: "Medium", color: "#ED8B00" },
  low:    { label: "Low",    color: "#16A34A" },
};

// ─── CRQ status config ────────────────────────────────────────────────────────
export const CRQ_STATUS_CONFIG: Record<
  CrqStatus,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  in_progress: { label: "In Progress", color: "#1565C0", bg: "#E8F1FC", dotColor: "#1976D2" },
  pending:     { label: "Pending",     color: "#B45309", bg: "#FEF3C7", dotColor: "#ED8B00" },
  completed:   { label: "Completed",   color: "#15803D", bg: "#DCFCE7", dotColor: "#16A34A" },
  cancelled:   { label: "Cancelled",   color: "#64748B", bg: "#F1F5F9", dotColor: "#94A3B8" },
};
