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
// sp_get_crq_journey_page emits PENDING/COMPLETED (assignment), APPROVED/
// REJECTED/PENDING (service approvals), YES/NO (conflict check) and
// APPROVED/IN-PROGRESS/PENDING (the 7 canonical stages). This normalizer is
// deliberately keyword-based rather than an exact enum match so it degrades
// gracefully if the proc's vocabulary grows.
export const normalizeStepStatus = (raw: string | null | undefined): StepStatus => {
  const s = (raw ?? "").trim().toUpperCase();
  if (s.includes("PROGRESS")) return "in_progress";
  if (["APPROVED", "COMPLETED", "DONE", "COMPLETE", "YES"].includes(s)) return "completed";
  if (s.includes("PENDING")) return "pending";
  return "not_started";
};

export const normalizeApprovalStatus = (raw: string | null | undefined): ApprovalStatus => {
  const s = (raw ?? "").trim().toUpperCase();
  if (s === "APPROVED") return "approved";
  if (s === "REJECTED") return "rejected";
  return "pending";
};

/** "IN-PROGRESS" → "In Progress", "NO" → "No" — display the real backend word, just tidied up. */
export const formatStatusLabel = (raw: string | null | undefined): string => {
  const s = (raw ?? "").trim();
  if (!s) return "—";
  return s
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

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

// ─── Approval icon guesser (service names are free text from CRQ_CAB_SERVICE_MASTER) ──
export const pickApprovalIcon = (label: string): ApprovalIconKey => {
  const s = label.toLowerCase();
  if (s.includes("mobility") || s.includes("ran") || s.includes("core")) return "mobility";
  if (s.includes("b2b") || s.includes("enterprise")) return "b2b";
  if (s.includes("telemedia") || s.includes("tv")) return "telemedia";
  if (s.includes("optic")) return "optical";
  if (s.includes("packet")) return "packet";
  if (s.includes("secur")) return "security";
  return "others";
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
// Structure is guaranteed by the proc: [SPOC/FE ASSIGNMENT] + [0..N service
// approvals] + [CONFLICT CHECK] + [7 fixed canonical stages]. Located by name
// match rather than fixed index so it stays correct if row order ever shifts.
const CANONICAL_STAGE_NAMES = [
  "VALIDATE",
  "IMPACT ANALYSIS",
  "MOP CREATE",
  "MOP VALIDATE",
  "SCHEDULING",
  "IMPLEMENTATION",
  "CLOSURE",
] as const;

export const groupJourneyStages = (rows: CrqJourneyStageRow[]): CrqJourneyFlow => {
  const norm = (s: string) => s.trim().toUpperCase();
  const conflictIdx = rows.findIndex((r) => norm(r.stage) === "CONFLICT CHECK");

  const assignment = rows[0] ?? null;
  const approvals = conflictIdx > 1 ? rows.slice(1, conflictIdx) : [];
  const conflictCheck = conflictIdx >= 0 ? rows[conflictIdx] : null;
  const tail = rows.slice(conflictIdx >= 0 ? conflictIdx + 1 : 1);
  const byStage = (name: (typeof CANONICAL_STAGE_NAMES)[number]) =>
    tail.find((r) => norm(r.stage) === name) ?? null;

  return {
    assignment,
    approvals,
    conflictCheck,
    validate: byStage("VALIDATE"),
    impactAnalysis: byStage("IMPACT ANALYSIS"),
    mopCreate: byStage("MOP CREATE"),
    mopValidate: byStage("MOP VALIDATE"),
    scheduling: byStage("SCHEDULING"),
    implementation: byStage("IMPLEMENTATION"),
    closure: byStage("CLOSURE"),
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
