import type { ActionStatus } from "../types/rescheduleNotification.types";
import type { TimeShiftDirection } from "../types/rescheduleNotification.types";

export const ACCENT = "#6366f1";
export const ACCENT_SOFT = "#8b5cf6";

export const CARD_BORDER = "1.5px solid #e8edf6";
export const CARD_SHADOW = "0 2px 12px rgba(60,60,140,.06)";
export const CARD_SHADOW_HOVER = "0 8px 28px rgba(60,60,140,.11)";

interface StatusVisual {
  label: string;
  bg: string;
  color: string;
  ring: string;
}

export const ACTION_STATUS_STYLES: Record<ActionStatus, StatusVisual> = {
  PENDING: { label: "Pending", bg: "#fff7ed", color: "#ea580c", ring: "#fed7aa" },
  APPROVED: { label: "Approved", bg: "#ecfdf5", color: "#059669", ring: "#a7f3d0" },
  REJECTED: { label: "Rejected", bg: "#fef2f2", color: "#dc2626", ring: "#fecaca" },
};

export const DIRECTION_STYLES: Record<TimeShiftDirection, { color: string; bg: string }> = {
  LATER: { color: "#ea580c", bg: "#fff7ed" },
  EARLIER: { color: "#059669", bg: "#ecfdf5" },
  SAME: { color: "#64748b", bg: "#f8fafc" },
};

export const SUMMARY_TILE_ACCENTS: Record<string, { color: string; light: string }> = {
  total: { color: ACCENT, light: "#eef2ff" },
  unread: { color: "#0ea5e9", light: "#f0f9ff" },
  pending: { color: "#ea580c", light: "#fff7ed" },
  approved: { color: "#059669", light: "#ecfdf5" },
  rejected: { color: "#dc2626", light: "#fef2f2" },
};
