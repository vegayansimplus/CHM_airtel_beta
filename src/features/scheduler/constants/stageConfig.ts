import type { StageConfig, StageKey } from "../types/stageWorkflow.types";
import {
  DEFAULT_STATUS_OPTIONS,
  CANCELLATION_FIELDS,
  REMARK_FIELD,
} from "./sharedFields";

/**
 * Factory that fills in the boilerplate shared by every stage so each
 * concrete config below only needs to specify what's actually different:
 * key, label, endpointBase, reviewQueryUrl and buildDonePayload.
 */
function buildStageConfig(
  partial: Pick<
    StageConfig,
    | "key"
    | "label"
    | "endpointBase"
    | "reviewQueryUrl"
    | "buildDonePayload"
    | "stageEnum"
    | "olmIdField"
  > &
    Partial<Pick<StageConfig, "statusField" | "statusOptions" | "fields">>,
): StageConfig {
  return {
    statusField: "status",
    statusOptions: DEFAULT_STATUS_OPTIONS,
    // On Cancel, "Remedy Status" (field1) and "Remedy Remark" (field5) are
    // the only status/remark inputs shown - the generic CHM Remark box is
    // redundant here, so it's hidden and its backend param is filled from
    // field5 instead of asking for the same text twice.
    fields: [
      ...CANCELLATION_FIELDS,
      { ...REMARK_FIELD, visibleWhen: (v) => v.status !== "canceled" },
    ],
    ...partial,
  };
}

/**
 * Shared shape for every stage's /done payload: crqNo/crqId/olmId/localStatus/
 * remark/planNumber, plus (only on Cancel) the cancellation block params.
 * `extra` lets a stage add its own fields on top (e.g. taskNumber).
 */
function buildCommonDonePayload(
  values: Record<string, any>,
  crq: any,
  context: { currentUserOlmId?: string | null } | undefined,
  extra: Record<string, any> = {},
): Record<string, any> {
  const isCanceled = values.status === "canceled";
  // field4 (Cancellation Rejection Owner) is a "readonly" field - the
  // renderer shows it as a plain TextField, not an RHF Controller, so it
  // never lands in `values`. Re-derive it the same way the field config
  // does instead of reading a key that's always undefined.
  const field4Config = CANCELLATION_FIELDS.find((f) => f.name === "field4");
  const field4Value = field4Config?.deriveValue?.(values) ?? "";

  return {
    // olmId = the logged-in user actioning this stage, not a field stored
    // on the CRQ.
    olmId: context?.currentUserOlmId ?? "",
    crqNo: crq?.crqNo ?? "",
    crqId: crq?.crqId ?? "",
    localStatus: isCanceled
      ? (values.field1 ?? "Cancelled")
      : values.status === "Done"
        ? "DONE"
        : values.status,
    remark: isCanceled ? (values.field5 ?? "") : (values.remark ?? ""),
    planNumber: crq?.planNumber ?? "",
    ...extra,
    ...(isCanceled && {
      cygnetStatus: values.cygnetStatus,
      field1: values.field1,
      field3: values.cancellationReason,
      field4: field4Value,
      field5: values.field5,
    }),
  };
}

/** Comma-separated task IDs for every task under a CRQ. */
export const taskNumbersOf = (crq: any): string =>
  (crq?.tasks ?? [])
    .map((t: any) => t?.taskId)
    .filter(Boolean)
    .join(",") || (crq?.taskId ?? "");

/**
 * Single source of truth for all 7(+) workflow stages.
 *
 * To add a brand-new stage:
 *   1. Add its key to `StageKey` in stageWorkflow.types.ts
 *   2. Add one entry below (endpoint name + GET url + done payload shape)
 *   3. (optional) Override `fields`/`statusOptions` if its form differs
 *
 * Nothing else needs to change - the table page, dialog, card, hooks and
 * API slice are all driven off this map.
 */
export const STAGE_CONFIG_MAP: Record<StageKey, StageConfig> = {
  impactanalysis: buildStageConfig({
    key: "impactanalysis",
    label: "Impact Analysis",
    endpointBase: "updateimpactanalysis",
    reviewQueryUrl: "/crqworkflow/impactanalysis",
    stageEnum: "IMPACT_ANALYSIS",
    statusField: "impactAnalysisStatus",
    olmIdField: "olmidImpactAnalysis",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),

  mopcreate: buildStageConfig({
    key: "mopcreate",
    label: "MOP Create",
    endpointBase: "updatemopcreate",
    reviewQueryUrl: "/crqworkflow/mopcreate",
    stageEnum: "MOP_CREATION",
    statusField: "mopCreateStatus",
    olmIdField: "olmidMopCreation",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),

  mopvalidate: buildStageConfig({
    key: "mopvalidate",
    label: "MOP Validate",
    endpointBase: "updatemopvalidate",
    reviewQueryUrl: "/crqworkflow/mopvalidate",
    stageEnum: "MOP_VALIDATION",
    statusField: "mopValidateStatus",
    olmIdField: "olmidMopValidation",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),

  scheduling: buildStageConfig({
    key: "scheduling",
    label: "Scheduling",
    endpointBase: "updatescheduling",
    reviewQueryUrl: "/crqworkflow/scheduling",
    stageEnum: "SCHEDULING_APPROVAL",
    statusField: "schedulingStatus",
    olmIdField: "olmidSchedulingApproval",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),

  activityimplement: buildStageConfig({
    key: "activityimplement",
    label: "Activity Implement",
    endpointBase: "updateactivityimplement",
    reviewQueryUrl: "/crqworkflow/activityimplement",
    stageEnum: "EXECUTION",
    statusField: "activityImplementStatus",
    olmIdField: "olmidExecution",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),

  closer: buildStageConfig({
    key: "closer",
    label: "Closer",
    endpointBase: "updatecloser",
    reviewQueryUrl: "/crqworkflow/crqcloser",
    stageEnum: "CLOSURE",
    statusField: "crqCloserStatus",
    olmIdField: "olmidClosure",
    buildDonePayload: (values, crq, context) =>
      buildCommonDonePayload(values, crq, context, {
        taskNumber: taskNumbersOf(crq),
      }),
  }),
};

export const getStageConfig = (stageKey: StageKey): StageConfig =>
  STAGE_CONFIG_MAP[stageKey];
