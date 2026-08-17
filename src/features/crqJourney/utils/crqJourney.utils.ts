import { alpha } from "@mui/material/styles";
import type {
  StepStatus,
  ApprovalStatus,
  ApprovalIconKey,
  CrqJourneyStageRow,
  CrqJourneyFlow,
} from "../types/crqJourney.types";

// ─── Shared status hues ────────────────────────────────────────────────────────
// Single source of truth for each status color so every card/badge/canvas in
// this feature stays in sync, and so light vs. dark variants never drift.
// `dark`/`light` are the readable text/icon colors for that mode; `base` is the
// saturated hue used to derive dim fills and borders via alpha().
const HUE = {
  green:  { base: "#16A34A", light: "#5DCAA5", dark: "#15803D" },
  blue:   { base: "#1976D2", light: "#7FB4EE", dark: "#1565C0" },
  orange: { base: "#ED8B00", light: "#FAC775", dark: "#B45309" },
  red:    { base: "#DC2626", light: "#F09595", dark: "#B91C1C" },
  purple: { base: "#7C3AED", light: "#C4A6F5", dark: "#6D28D9" },
  grey:   { base: "#64748B", light: "#94A3B8", dark: "#475569" },
} as const;

const tone = (hue: (typeof HUE)[keyof typeof HUE], isDark: boolean) => ({
  color: isDark ? hue.light : hue.dark,
  borderColor: alpha(hue.base, isDark ? 0.4 : 0.28),
  fill: alpha(hue.base, isDark ? 0.18 : 0.09),
});

// ─── Step status visual config ────────────────────────────────────────────────
export const getStepStatusConfig = (
  isDark: boolean
): Record<StepStatus, { label: string; color: string; borderColor: string; bgColor: string }> => ({
  completed:   { label: "Completed",   ...remap(tone(HUE.green, isDark)) },
  in_progress: { label: "In Progress", ...remap(tone(HUE.blue, isDark)) },
  pending:     { label: "Pending",     ...remap(tone(HUE.orange, isDark)) },
  not_started: { label: "Not Started", ...remap(tone(HUE.grey, isDark)) },
  cancelled:   { label: "Cancelled",   ...remap(tone(HUE.red, isDark)) },
});

function remap(t: { color: string; borderColor: string; fill: string }) {
  return { color: t.color, borderColor: t.borderColor, bgColor: t.fill };
}

// ─── Approval status visual config ───────────────────────────────────────────
export const getApprovalStatusConfig = (
  isDark: boolean
): Record<ApprovalStatus, { label: string; color: string; borderColor: string; iconBg: string }> => ({
  approved: { label: "Approved", color: tone(HUE.green, isDark).color, borderColor: tone(HUE.green, isDark).borderColor, iconBg: tone(HUE.green, isDark).fill },
  pending:  { label: "Pending",  color: tone(HUE.orange, isDark).color, borderColor: tone(HUE.orange, isDark).borderColor, iconBg: tone(HUE.orange, isDark).fill },
  rejected: { label: "Rejected", color: tone(HUE.red, isDark).color, borderColor: tone(HUE.red, isDark).borderColor, iconBg: tone(HUE.red, isDark).fill },
});

// ─── Raw backend text → visual status ─────────────────────────────────────────
// The vocabulary sp_get_crq_journey_page can emit, confirmed against the live
// routine body and against CRQ_MASTER_TBL.current_status:
//   APPROVED   — a canonical stage the CRQ has already moved past
//   STARTED    — the current stage, picked up and being worked (most common)
//   IN-PROGRESS— the current stage (underscore form, hyphenated by the proc)
//   COMPLETE   — terminal CLOSURE state
//   PENDING    — a stage the CRQ hasn't reached, or an un-actioned approval
//   CANCELLED  — the CRQ was cancelled at this stage
//   NA         — a stage after a cancellation, so it will never run
//   REJECTED   — a service approval that was turned down
//   YES / NO   — the CAB and CONFLICT CHECK rows only
// Matching stays keyword-based rather than a closed enum so an added word
// degrades to "not started" instead of throwing the canvas off.
export const normalizeStepStatus = (raw: string | null | undefined): StepStatus => {
  const s = (raw ?? "").trim().toUpperCase();
  if (s.includes("PROGRESS") || s === "STARTED") return "in_progress";
  if (["APPROVED", "COMPLETED", "DONE", "COMPLETE", "YES"].includes(s)) return "completed";
  if (s.includes("CANCEL") || s.includes("REJECT")) return "cancelled";
  if (s.includes("PENDING")) return "pending";
  return "not_started";
};

export const normalizeApprovalStatus = (raw: string | null | undefined): ApprovalStatus => {
  const s = (raw ?? "").trim().toUpperCase();
  if (s === "APPROVED") return "approved";
  if (s === "REJECTED") return "rejected";
  return "pending";
};

/** "IN-PROGRESS" → "In Progress", "Activity_Implement" → "Activity Implement" — the real backend word, just tidied up. */
export const formatStatusLabel = (raw: string | null | undefined): string => {
  const s = (raw ?? "").trim();
  if (!s) return "—";
  if (s.toUpperCase() === "NA") return "N/A";
  return s
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Stage display names ──────────────────────────────────────────────────────
// sp_get_crq_journey_page emits operational stage keys ("MOP CREATE",
// "Activity_Implement", "SCHEDULING", and — since the routine was last edited —
// "Plan & Inventory"). These are the business-facing names for them.
//
// Matched on the EXACT normalized key rather than by substring, because the
// keys overlap: "MOP VALIDATE" contains "VALIDATE", and a substring rule would
// label the MOP stage as Plan & Inventory Validation. Both the current and the
// older spellings are listed so an out-of-date database still reads correctly,
// and anything unrecognised falls back to a tidied version of the raw value.
const STAGE_DISPLAY_NAMES: Record<string, string> = {
  "SPOC/FE ASSIGNMENT": "SPOC / FE Assignment",
  "PLAN & INVENTORY": "Plan & Inventory Validation",
  "PLAN AND INVENTORY": "Plan & Inventory Validation",
  VALIDATE: "Plan & Inventory Validation",
  "IMPACT ANALYSIS": "Impact Analysis",
  "MOP CREATE": "MOP Creation",
  "MOP VALIDATE": "MOP Validation",
  SCHEDULING: "Activity Scheduling",
  ACTIVITY_IMPLEMENT: "Activity Implementation",
  "ACTIVITY IMPLEMENT": "Activity Implementation",
  IMPLEMENTATION: "Activity Implementation",
  CLOSURE: "CRQ Closure",
  CAB: "CAB",
  "CONFLICT CHECK": "Conflict Check",
};

/** Business-facing name for a workflow stage — the raw proc value stays in the card tooltip. */
export const formatStageName = (raw: string | null | undefined): string =>
  STAGE_DISPLAY_NAMES[(raw ?? "").trim().toUpperCase()] ?? formatStatusLabel(raw);

/** Color a free-text CRQ_MASTER_TBL.current_status value (many possible words — see GetCRQBySubDomainId's CASE map). */
export const statusChipColor = (
  raw: string | null | undefined,
  isDark = false
): { color: string; bg: string; dot: string } => {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("progress")) { const t = tone(HUE.blue, isDark); return { color: t.color, bg: t.fill, dot: HUE.blue.base }; }
  if (s.includes("done") || s.includes("complete") || s.includes("approved")) { const t = tone(HUE.green, isDark); return { color: t.color, bg: t.fill, dot: HUE.green.base }; }
  if (s.includes("fail") || s.includes("cancel") || s.includes("reject")) { const t = tone(HUE.red, isDark); return { color: t.color, bg: t.fill, dot: HUE.red.base }; }
  if (s.includes("pending")) { const t = tone(HUE.orange, isDark); return { color: t.color, bg: t.fill, dot: HUE.orange.base }; }
  if (s.includes("pause") || s.includes("hold")) { const t = tone(HUE.purple, isDark); return { color: t.color, bg: t.fill, dot: HUE.purple.base }; }
  const t = tone(HUE.grey, isDark);
  return { color: t.color, bg: t.fill, dot: HUE.grey.base };
};

/**
 * Connector-layer hues for the flow canvas. Same five semantic hues as the
 * cards above, but nudged brighter in dark mode so 1.8px strokes stay legible
 * against the dark paper surface.
 */
export const getFlowHues = (isDark: boolean) => ({
  green:  isDark ? "#3FBF74" : HUE.green.base,
  blue:   isDark ? "#5FA3E8" : HUE.blue.base,
  orange: isDark ? "#F0A93A" : HUE.orange.base,
  red:    isDark ? "#F07070" : HUE.red.base,
  grey:   isDark ? "#5A6C82" : "#94A3B8",
});

// ─── Approval icon guesser ────────────────────────────────────────────────────
// Approval rows are named from CRQ_CAB_SERVICE_MASTER.Service_Name, which is
// free text an admin can extend — so this is a rule list, not a lookup. Order
// matters and is load-bearing:
//   • "Mobility (RAN/Core)" must resolve as mobility, not RAN or Core
//   • "Transmission" contains the letters "ran", so transmission is tested
//     before anything matching a radio-access token
// Everything currently in the master table is covered (Radio Access Network,
// Transmission, Mobility (RAN/Core), Enterprise / B2B, Telemedia, Core
// Services), plus role-style approvers such as "NOC Head"; anything new falls
// through to a neutral icon rather than a wrong one.
const APPROVAL_ICON_RULES: ReadonlyArray<{ key: ApprovalIconKey; match: readonly string[] }> = [
  { key: "user",         match: ["noc head", "head", "manager", "approver", "owner", "spoc", "lead"] },
  { key: "transmission", match: ["transmission", "microwave", "backhaul"] },
  { key: "telemedia",    match: ["telemedia", "broadband", "dth", "tv"] },
  { key: "b2b",          match: ["b2b", "enterprise", "business"] },
  { key: "mobility",     match: ["mobility", "mobile", "2g", "3g", "4g", "5g"] },
  { key: "ran",          match: ["radio access", "radio", "ran/", "/ran"] },
  { key: "optical",      match: ["optic", "fiber", "fibre", "ofc"] },
  { key: "packet",       match: ["packet", "mpls", "ip core"] },
  { key: "security",     match: ["secur", "firewall"] },
  { key: "core",         match: ["core"] },
];

export const pickApprovalIcon = (label: string): ApprovalIconKey => {
  const s = (label ?? "").toLowerCase();
  return APPROVAL_ICON_RULES.find((r) => r.match.some((m) => s.includes(m)))?.key ?? "others";
};

// ─── Approval display name ────────────────────────────────────────────────────
// CRQ_CAB_SERVICE_MASTER stores long operational names ("Mobility (RAN/Core)",
// "Enterprise / B2B", "Radio Access Network"). An approval card in the lane is
// ~86-100px wide, so those all ellipsize to noise. This maps each to the short
// name the business actually says out loud; the untouched value still shows in
// the card's tooltip, so nothing is hidden — only shortened.
//
// Same ordering rule as the icon list: "Mobility (RAN/Core)" must resolve to
// Mobility rather than RAN or Core.
const APPROVAL_SHORT_NAMES: ReadonlyArray<{ match: readonly string[]; label: string }> = [
  { match: ["noc head"],                          label: "NOC Head" },
  { match: ["mobility"],                          label: "Mobility" },
  { match: ["b2b", "enterprise"],                 label: "B2B" },
  { match: ["telemedia"],                         label: "Telemedia" },
  { match: ["transmission"],                      label: "Transmission" },
  { match: ["radio access", "ran/", "/ran"],      label: "RAN" },
  { match: ["core service", "core network"],      label: "Core" },
  { match: ["optical", "fiber", "fibre"],         label: "Optical" },
];

/** Short, card-sized label for a service approval — falls back to the backend name verbatim. */
export const formatApprovalName = (raw: string | null | undefined): string => {
  const value = (raw ?? "").trim();
  if (!value) return "—";
  const s = value.toLowerCase();
  return APPROVAL_SHORT_NAMES.find((r) => r.match.some((m) => s.includes(m)))?.label ?? value;
};

// ─── Datetime formatting (backend LocalDateTime serializes as ISO string) ────
export const formatDateTime = (raw: string | null | undefined): string => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── sp_get_crq_journey_page flat rows → grouped flow (Feature 1) ────────────
//
// Every row is resolved by NAME, never by position. The routine appends its
// four blocks in a fixed order today (canonical stages → services → CAB →
// conflict check), but it has already been re-ordered and renamed once in
// place — an index-based grouper silently mis-files whole stages when that
// happens, which is exactly the failure this avoids.
//
// Each slot lists every spelling seen in the field so an older database (which
// still says VALIDATE / IMPLEMENTATION) keeps working alongside the current one
// (Plan & Inventory / Activity_Implement).
type CanonicalSlot = Exclude<keyof CrqJourneyFlow, "approvals">;

const CANONICAL_SLOTS: ReadonlyArray<{ slot: CanonicalSlot; names: readonly string[] }> = [
  { slot: "assignment",     names: ["SPOC/FE ASSIGNMENT"] },
  { slot: "validate",       names: ["PLAN & INVENTORY", "PLAN AND INVENTORY", "VALIDATE"] },
  { slot: "impactAnalysis", names: ["IMPACT ANALYSIS"] },
  { slot: "mopCreate",      names: ["MOP CREATE"] },
  { slot: "mopValidate",    names: ["MOP VALIDATE"] },
  { slot: "scheduling",     names: ["SCHEDULING"] },
  { slot: "implementation", names: ["ACTIVITY_IMPLEMENT", "ACTIVITY IMPLEMENT", "IMPLEMENTATION"] },
  { slot: "closure",        names: ["CLOSURE"] },
  { slot: "cab",            names: ["CAB"] },
  { slot: "conflictCheck",  names: ["CONFLICT CHECK"] },
];

export const groupJourneyStages = (rows: CrqJourneyStageRow[]): CrqJourneyFlow => {
  const flow: CrqJourneyFlow = {
    assignment: null,
    approvals: [],
    cab: null,
    conflictCheck: null,
    validate: null,
    impactAnalysis: null,
    mopCreate: null,
    mopValidate: null,
    scheduling: null,
    implementation: null,
    closure: null,
  };

  for (const row of rows) {
    const name = row.stage.trim().toUpperCase();
    // Only the first row claiming a slot wins; anything left over — including a
    // service that repeats, which the proc does emit — is a service approval.
    const match = CANONICAL_SLOTS.find((c) => c.names.includes(name) && flow[c.slot] === null);
    if (match) {
      flow[match.slot] = row;
    } else {
      flow.approvals.push(row);
    }
  }

  return flow;
};

/**
 * "N of M stages complete" for the header progress meter — derived purely from
 * the stage rows the proc returned (service approvals excluded: they're a
 * side-track, not part of the linear stage count).
 */
export const computeFlowProgress = (
  flow: CrqJourneyFlow
): { completed: number; total: number; pct: number; activeStage: string | null } => {
  const steps = [
    flow.assignment,
    flow.validate,
    flow.impactAnalysis,
    flow.mopCreate,
    flow.mopValidate,
    flow.scheduling,
    flow.implementation,
    flow.closure,
  ].filter((s): s is CrqJourneyStageRow => s != null);

  const total = steps.length;
  const completed = steps.filter((s) => normalizeStepStatus(s.status) === "completed").length;
  const active = steps.find((s) => normalizeStepStatus(s.status) === "in_progress");

  return {
    completed,
    total,
    pct: total ? Math.round((completed / total) * 100) : 0,
    activeStage: active ? active.stage : null,
  };
};

// ─── get_crq_details stage codes → friendly labels (Feature 2) ──────────────
const STAGE_CODE_LABELS: Record<string, string> = {
  VALIDATE: "Validate",
  IMPACT_ANALYSIS: "Impact Analysis",
  MOP_CREATION: "MOP Creation",
  MOP_VALIDATION: "MOP Validation",
  SCHEDULING_APPROVAL: "Scheduling Approval",
  EXECUTION: "Execution",
  CLOSURE: "Closure",
};

export const formatStageCode = (code: string): string =>
  STAGE_CODE_LABELS[code.trim().toUpperCase()] ?? formatStatusLabel(code);
