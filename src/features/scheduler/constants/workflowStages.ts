import { format } from "date-fns";
import type { Crq } from "../types/crqWorkflow.types";
import type { StageKey } from "../types/stageWorkflow.types";
import { getStageConfig } from "./stageConfig";

/**
 * The 7-stage identifier used by the CRQ workflow cockpit (CrqDetailedView).
 * "review" is the Plan & Inventory stage - it predates the generic
 * StageConfig map and still runs on its own endpoints (crqreviewApiSlice /
 * schedulerApiSlice), so it isn't a StageKey. The other six map 1:1 to
 * StageKey and are resolved through constants/stageConfig.ts.
 */
export type WorkflowStageId = "review" | StageKey;

export type StageRunState =
  | "completed"
  | "in_progress"
  | "failed"
  | "locked"
  | "not_started";

export interface WorkflowStageDescriptor {
  id: WorkflowStageId;
  label: string;
  shortLabel: string;
  statusField: string;
}

const GENERIC_STAGE_KEYS: StageKey[] = [
  "impactanalysis",
  "mopcreate",
  "mopvalidate",
  "scheduling",
  "activityimplement",
  "closer",
];

/** Ordered 7-stage list driving the stage rail and sidebar stage labels. */
export const WORKFLOW_STAGES: WorkflowStageDescriptor[] = [
  {
    id: "review",
    label: "Plan & Inventory",
    shortLabel: "Plan & Inventory",
    statusField: "crqReviewStatus",
  },
  ...GENERIC_STAGE_KEYS.map((key) => {
    const cfg = getStageConfig(key);
    return {
      id: key,
      label: cfg.label,
      shortLabel: cfg.label,
      statusField: cfg.statusField,
    };
  }),
];

const COMPLETED_VALUES = new Set(["Done", "DONE", "Completed", "completed"]);
const FAILED_VALUES = new Set([
  "Failed",
  "failed",
  "canceled",
  "Canceled",
  "Cancel",
]);
const IN_PROGRESS_VALUES = new Set(["In Progress", "in progress"]);

function readStatus(
  crq: Crq | null | undefined,
  stage: WorkflowStageDescriptor,
): string | undefined {
  if (!crq) return undefined;
  const value = (crq as any)[stage.statusField];
  return typeof value === "string" && value.length ? value : undefined;
}

/** Index of the first not-yet-completed stage - the CRQ's "current" stage. */
export function resolveCurrentStageIndex(crq: Crq | null | undefined): number {
  if (!crq) return 0;
  for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
    const status = readStatus(crq, WORKFLOW_STAGES[i]);
    if (!status || !COMPLETED_VALUES.has(status)) return i;
  }
  return WORKFLOW_STAGES.length - 1;
}

/** Run-state of a single stage, given the CRQ's current stage index. */
export function resolveStageState(
  crq: Crq | null | undefined,
  stageIndex: number,
  currentIndex: number,
): StageRunState {
  const stage = WORKFLOW_STAGES[stageIndex];
  const status = readStatus(crq, stage);
  if (status && COMPLETED_VALUES.has(status)) return "completed";
  if (status && FAILED_VALUES.has(status)) return "failed";
  if (stageIndex > currentIndex) return "locked";
  if (status && IN_PROGRESS_VALUES.has(status)) return "in_progress";
  return "not_started";
}

export interface StageSummaryField {
  label: string;
  value: string;
}

/** Fields rendered elsewhere (sidebar/header) or structural - never shown
 * again in the generic per-stage field grid. */
const SUMMARY_EXCLUDED_KEYS = new Set(["tasks"]);

/** Short tokens that should render as an acronym instead of Title-Case. */
const ACRONYM_WORDS = new Set([
  "id",
  "crq",
  "olm",
  "olmid",
  "ne",
  "m6",
  "isis",
  "cab",
]);

/**
 * Turns an API field name into a human label without any per-stage mapping,
 * e.g. "reviewStartDate" -> "Review Start Date", "olmidReview" -> "OLMID
 * Review", "neLabel" -> "NE Label". Works the same regardless of which of
 * the 7 stages' differently-named fields it's given.
 */
function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_]+/)
    .filter(Boolean);
  return words
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYM_WORDS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?/;

/** Formats a raw field value for display - ISO-looking dates (detected by
 * value shape or a "date" in the key name) go through the same date-fns
 * formatter the rest of the app uses; everything else renders as-is. */
function formatFieldValue(key: string, value: unknown): string {
  if (typeof value === "string" && (ISO_DATE_RE.test(value) || /date/i.test(key))) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return format(d, "dd-MMM-yyyy HH:mm");
  }
  return String(value);
}

/**
 * Real-field-only summary shown in each stage's detail body: every scalar
 * property the API actually returned on the selected CRQ for the current
 * stage, auto-labeled and auto-formatted. No invented content (checklists,
 * node tables, step lists, impact metrics, etc), and no per-stage field-name
 * mapping - each of the 7 stages' endpoints can use whatever field names
 * they want (e.g. "reviewStartDate" vs "impactStartDate") and this renders
 * whatever comes back as-is.
 */
export function getStageSummaryFields(
  _stageId: WorkflowStageId,
  crq: Crq | null | undefined,
): StageSummaryField[] {
  if (!crq) return [];
  const c = crq as Record<string, unknown>;

  return Object.keys(c)
    .filter((key) => {
      if (SUMMARY_EXCLUDED_KEYS.has(key)) return false;
      const value = c[key];
      if (value === null || value === undefined) return false;
      if (typeof value === "object") return false;
      if (typeof value === "string" && !value.trim().length) return false;
      return true;
    })
    .map((key) => ({
      label: humanizeKey(key),
      value: formatFieldValue(key, c[key]),
    }));
}
