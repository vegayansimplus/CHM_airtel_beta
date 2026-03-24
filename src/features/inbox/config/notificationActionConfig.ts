// src/features/inbox/config/notificationActionConfig.ts

const MANAGER_ROLES = new Set([
  "TEAM_LEAD", "DOMAIN_HEAD", "FUNCTION_HEAD", "VERTICAL_HEAD", "SUPER_ADMIN"
]);

export type ActionConfig = {
  approveUrl: (notificationId: number, rejectReason?: string) => string;
  rejectUrl:  (notificationId: number, rejectReason?: string) => string;
};

export type AcknowledgeConfig = {
  acknowledgeUrl: (notificationId: number) => string;
};

// ─── Approve / Reject registry ────────────────────────────────────────────────
// Key pattern: `${SUB_MODULE}:${roleTier}`  where roleTier = "MANAGER" | "MEMBER"

const actionRegistry: Record<string, ActionConfig> = {

  "SHIFT_SWAP:MANAGER": {
    approveUrl: (id) =>
      `/notification/swapreqmanageraction?notificationId=${id}&status=APPROVED`,
    rejectUrl:  (id, reason = "") =>
      `/notification/swapreqmanageraction?notificationId=${id}&status=REJECTED&shiftSwapRejectReason=${encodeURIComponent(reason)}`,
  },

  "SHIFT_SWAP:MEMBER": {
    approveUrl: (id) =>
      `/notification/swapreqempaction?notificationId=${id}&status=APPROVED`,
    rejectUrl:  (id, reason = "") =>
      `/notification/swapreqempaction?notificationId=${id}&status=REJECTED&rejectReason=${encodeURIComponent(reason)}`,
  },

  // ── Add future modules here ──────────────────────────────────────────────────
  // "LEAVE_REQUEST:MANAGER": { approveUrl: ..., rejectUrl: ... },
  // "LEAVE_REQUEST:MEMBER":  { approveUrl: ..., rejectUrl: ... },
  // "ATTENDANCE_CORRECTION:MANAGER": { ... },
};

// ─── Acknowledge registry ─────────────────────────────────────────────────────

const acknowledgeRegistry: Record<string, AcknowledgeConfig> = {

  "SHIFT_SWAP": {
    acknowledgeUrl: (id) => `/notification/acknowledge?notificationId=${id}`,
  },

  // "LEAVE_REQUEST": { acknowledgeUrl: (id) => `/notification/leaveack?notificationId=${id}` },
};

// ─── Public helpers ───────────────────────────────────────────────────────────

export function getRoleTier(roleCode: string): "MANAGER" | "MEMBER" {
  return MANAGER_ROLES.has(roleCode) ? "MANAGER" : "MEMBER";
}

export function getActionConfig(
  subModule: string | null | undefined,
  roleCode: string,
): ActionConfig | null {
  if (!subModule) return null;
  const tier = getRoleTier(roleCode);
  return actionRegistry[`${subModule}:${tier}`] ?? null;
}

export function getAcknowledgeConfig(
  subModule: string | null | undefined,
): AcknowledgeConfig | null {
  if (!subModule) return null;
  return acknowledgeRegistry[subModule] ?? null;
}