import type { SvgIconComponent } from "@mui/icons-material";

/**
 * Every workflow stage maps 1:1 to the backend endpoint group, e.g.
 *   "mopcreate"        -> /crqworkflow/updatemopcreate/{start|pause}
 *                          /crqworkflow/mopcreate (GET)
 *   "impactanalysis"   -> /crqworkflow/updateimpactanalysis/{start|pause|done}
 *                          /crqworkflow/impactanalysis (GET)
 *
 * Adding a new stage = adding a new key here + one config entry in
 * `constants/stageConfig.ts`. No new components/hooks/services required.
 */
export type StageKey =
  | "impactanalysis"
  | "mopcreate"
  | "mopvalidate"
  | "scheduling"
  | "activityimplement"
  | "closer";

export type StageStatusValue = "Done" | "Failed" | "canceled";

export interface StageActionParams {
  crqNo: string;
  crqId: string | number;
}

/**
 * Generic "done" payload. Every stage's /done endpoint accepts a different
 * subset of fields (olmId, planNumber, taskNumber, etc) - hence the index
 * signature. `doneFieldMap` on StageConfig is responsible for shaping this
 * from the form values + selected CRQ.
 */
export interface StageDonePayload extends StageActionParams {
  localStatus?: string;
  remark?: string;
  [key: string]: any;
}

export interface StageFieldOption {
  label: string;
  value: string;
}

/**
 * A single config-driven form field. The generic FormPanel renders fields
 * purely off this config - no per-stage JSX duplication.
 */
export interface StageFieldConfig {
  name: string;
  label: string;
  type: "select" | "text" | "textarea" | "readonly";
  required?: boolean;
  placeholder?: string;
  options?: StageFieldOption[];
  /** Show this field only when predicate against current form values is true */
  visibleWhen?: (values: Record<string, any>) => boolean;
  /** Mark required dynamically (e.g. only when status === "canceled") */
  requiredWhen?: (values: Record<string, any>) => boolean;
  /** Derive a read-only value from other form values (e.g. rollback owner) */
  deriveValue?: (values: Record<string, any>) => string;
}

export interface StageStatusOption {
  value: StageStatusValue;
  label: string;
  description: string;
  icon: SvgIconComponent;
  palette: "success" | "error" | "warning";
}

/**
 * The single source of truth for one workflow stage. Every reusable
 * component (table page, detail panel, card, dialog, form) takes a
 * StageConfig and renders itself accordingly.
 */
export interface StageConfig {
  key: StageKey;
  /** Human readable label, used in headers/toasts */
  label: string;
  /** e.g. "updatemopcreate" -> used to build /start /pause /done URLs */
  endpointBase: string;
  /** e.g. "/crqworkflow/mopcreate" -> GET listing endpoint */
  reviewQueryUrl: string;
  /** Field on the CRQ object that represents this stage's running status */
  statusField: string;
  /** Outcome options shown in the review/validate dialog */
  statusOptions: StageStatusOption[];
  /** Config-driven extra fields (cancellation block, remarks, etc) */
  fields: StageFieldConfig[];
  /** Shapes the final payload sent to the /done endpoint */
  buildDonePayload: (
    formValues: Record<string, any>,
    crq: any,
  ) => Record<string, any>;
}

export interface CrqReviewResponse {
  plans: any[];
}
