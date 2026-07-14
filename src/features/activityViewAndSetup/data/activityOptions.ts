// ─────────────────────────────────────────────
//  Shared dropdown option constants
//  (single source, reused by CreateActivity + phase config forms)
// ─────────────────────────────────────────────

export const LAYER_OPTIONS = [
  "Access",
  "Aggregation",
  "Core",
  "Backhaul",
  "Transmission",
  "IP/MPLS",
];

export const PLAN_TYPE_OPTIONS = [
  "Upgrade",
  "Greenfield",
  "Rollout",
  "Migration",
  "Decommission",
  "Maintenance",
];

export const VENDOR_OEM_OPTIONS = [
  "Huawei",
  "Nokia",
  "Ericsson",
  "ZTE",
  "Samsung",
  "Cisco",
  "Juniper",
  "STL",
  "Corning",
];

export const SHIFT_OPTIONS = ["General", "Morning", "Evening", "Night"];

export const LEVEL_OPTIONS = ["L1", "L2", "L3"];

export const CHANGE_IMPACT_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

export const IMPACT_DOT: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
  Critical: "#7c3aed",
};
