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
    "key" | "label" | "endpointBase" | "reviewQueryUrl" | "buildDonePayload"
  > &
    Partial<Pick<StageConfig, "statusField" | "statusOptions" | "fields">>,
): StageConfig {
  return {
    statusField: "status",
    statusOptions: DEFAULT_STATUS_OPTIONS,
    fields: [...CANCELLATION_FIELDS, REMARK_FIELD],
    ...partial,
  };
}

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
    reviewQueryUrl: "/crqworkflow/crqreview",
    statusField: "impactAnalysisStatus",
    buildDonePayload: (values, crq) => ({
      olmId: crq?.olmId ?? "",
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      taskNumber: crq?.taskNumber ?? "",
      ...values,
    }),
  }),

  mopcreate: buildStageConfig({
    key: "mopcreate",
    label: "MOP Create",
    endpointBase: "updatemopcreate",
    reviewQueryUrl: "/crqworkflow/mopcreate",
    statusField: "mopCreateStatus",
    buildDonePayload: (values, crq) => ({
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      ...values,
    }),
  }),

  mopvalidate: buildStageConfig({
    key: "mopvalidate",
    label: "MOP Validate",
    endpointBase: "updatemopvalidate",
    reviewQueryUrl: "/crqworkflow/mopvalidate",
    statusField: "mopValidateStatus",
    buildDonePayload: (values, crq) => ({
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      ...values,
    }),
  }),

  scheduling: buildStageConfig({
    key: "scheduling",
    label: "Scheduling",
    endpointBase: "updatescheduling",
    reviewQueryUrl: "/crqworkflow/scheduling",
    statusField: "schedulingStatus",
    buildDonePayload: (values, crq) => ({
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      ...values,
    }),
  }),

  activityimplement: buildStageConfig({
    key: "activityimplement",
    label: "Activity Implement",
    endpointBase: "updateactivityimplement",
    reviewQueryUrl: "/crqworkflow/activityimplement",
    statusField: "activityImplementStatus",
    buildDonePayload: (values, crq) => ({
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      taskNumber: crq?.taskNumber ?? "",
      ...values,
    }),
  }),

  closer: buildStageConfig({
    key: "closer",
    label: "Closer",
    endpointBase: "updatecloser",
    reviewQueryUrl: "/crqworkflow/closer",
    statusField: "closerStatus",
    buildDonePayload: (values, crq) => ({
      localStatus: values.status === "Done" ? "DONE" : values.status,
      remark: values.remark ?? "",
      planNumber: crq?.planNumber ?? "",
      ...values,
    }),
  }),
};

export const getStageConfig = (stageKey: StageKey): StageConfig =>
  STAGE_CONFIG_MAP[stageKey];
