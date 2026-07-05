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

const fallback = (v?: string | null) =>
  v && String(v).trim().length ? String(v) : "—";

const fallbackDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? fallback(v) : format(d, "dd-MMM-yyyy HH:mm");
};

/**
 * Real-field-only summary shown in each stage's detail body. No invented
 * content (checklists, node tables, step lists, impact metrics, etc) -
 * only whatever the CRQ object actually carries for that stage today.
 */
export function getStageSummaryFields(
  stageId: WorkflowStageId,
  crq: Crq | null | undefined,
): StageSummaryField[] {
  if (!crq) return [];
  const c = crq as any;

  if (stageId === "review") {
    return [
      { label: "CRQ Status", value: fallback(c.crqStatus) },
      { label: "Review Status", value: fallback(c.crqReviewStatus) },
      { label: "Review Start", value: fallbackDate(c.reviewStartDate) },
      { label: "Review End", value: fallbackDate(c.reviewEndDate) },
      { label: "OLM ID", value: fallback(c.olmidReview) },
      { label: "Plan Type", value: fallback(c.planType) },
    ];
  }

  if (stageId === "impactanalysis") {
    return [
      { label: "CRQ Status", value: fallback(c.crqStatus) },
      { label: "Impact Analysis Status", value: fallback(c.impactAnalysisStatus) },
      { label: "OLM ID (Impact)", value: fallback(c.olmidImpactAnalysis) },
      { label: "Plan Start", value: fallbackDate(c.activityPlanStartDate) },
      { label: "Plan End", value: fallbackDate(c.activityPlanEndDate) },
    ];
  }

  const stage = WORKFLOW_STAGES.find((s) => s.id === stageId);
  return [
    { label: "CRQ Status", value: fallback(c.crqStatus) },
    { label: stage?.label ?? "Stage Status", value: fallback(stage ? c[stage.statusField] : undefined) },
    { label: "Plan Start", value: fallbackDate(c.activityPlanStartDate) },
    { label: "Plan End", value: fallbackDate(c.activityPlanEndDate) },
  ];
}
