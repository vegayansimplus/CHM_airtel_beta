import type {
  StepStatus,
  ApprovalStatus,
  ApprovalIconKey,
  CrqJourneyStageRow,
  CrqJourneyFlow,
} from "../types/crqJourney.types";

// ─── Step status visual config ────────────────────────────────────────────────
export const STEP_STATUS_CONFIG: Record<
  StepStatus,
  { label: string; color: string; borderColor: string; bgColor: string }
> = {
  completed:   { label: "Completed",   color: "#16A34A", borderColor: "#BCE6CC", bgColor: "#F0FBF4" },
  in_progress: { label: "In Progress", color: "#1976D2", borderColor: "#8FBDF4", bgColor: "#F2F7FE" },
  pending:     { label: "Pending",     color: "#ED8B00", borderColor: "#FBE0BE", bgColor: "#FDF5E8" },
  not_started: { label: "Not Started", color: "#64748B", borderColor: "#CBD5E1", bgColor: "#F8FAFC" },
};

// ─── Approval status visual config ───────────────────────────────────────────
export const APPROVAL_STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; borderColor: string; iconBg: string }
> = {
  approved: { label: "Approved", color: "#16A34A", borderColor: "#CDEBD9", iconBg: "#E9F7EF" },
  pending:  { label: "Pending",  color: "#ED8B00", borderColor: "#FBE2C6", iconBg: "#FDF0E2" },
  rejected: { label: "Rejected", color: "#E11D48", borderColor: "#F6C7D2", iconBg: "#FDE7EC" },
};

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
  raw: string | null | undefined
): { color: string; bg: string; dot: string } => {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("progress")) return { color: "#1565C0", bg: "#E8F1FC", dot: "#1976D2" };
  if (s.includes("done") || s.includes("complete") || s.includes("approved"))
    return { color: "#15803D", bg: "#DCFCE7", dot: "#16A34A" };
  if (s.includes("fail") || s.includes("cancel") || s.includes("reject"))
    return { color: "#B91C1C", bg: "#FEE2E2", dot: "#DC2626" };
  if (s.includes("pending")) return { color: "#B45309", bg: "#FEF3C7", dot: "#ED8B00" };
  if (s.includes("pause") || s.includes("hold")) return { color: "#7C3AED", bg: "#EDE6FB", dot: "#7C3AED" };
  return { color: "#475569", bg: "#F1F5F9", dot: "#94A3B8" };
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
