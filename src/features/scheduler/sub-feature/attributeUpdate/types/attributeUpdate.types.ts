import type { WorkflowStageId } from "../../../constants/workflowStages";

/** Field input types used across Remedy / CAB / Planning Tool attribute schemas. */
export type AttributeFieldType =
  | "Text"
  | "Numbers"
  | "Date Time"
  | "Dropdown"
  | "Multi Select Dropdown"
  | "Radio Button";

/** Normalized mandatory-ness bucket derived from the raw mandatory label. */
export type MandatoryLevel = "mandatory" | "optional" | "conditional";

/** Downstream system a group of attributes is written to on save. */
export type TargetSystem = "remedy" | "cab" | "planningTool";

/**
 * Visibility scope of a Planning Tool attribute:
 * - "always"    – shown at every stage
 * - "backend"   – set by the backend, never shown as an editable field
 * - other       – only shown when the stage declares that scope
 */
export type PlanningToolScope =
  | "always"
  | "backend"
  | "scheduling"
  | "execution"
  | "closure";

/** Which runtime value an auto-set (read-only) attribute mirrors. */
export type AutoSetSource = "cmsStage" | "remedyStatus";

export interface StageAttribute {
  name: string;
  type: AttributeFieldType;
  /** Raw mandatory label from the source system, e.g. "Mandatory - if cancellation". */
  mandatory: string;
  values?: string[];
  readOnly?: boolean;
  autoSetFrom?: AutoSetSource;
}

export interface PlanningToolAttribute extends StageAttribute {
  scope: PlanningToolScope;
}

/** Attribute schema of one CMS stage, keyed by the app-wide workflow stage id. */
export interface AttributeStageSchema {
  id: WorkflowStageId;
  /** Full CMS stage label, e.g. "Plan & Inventory Validation". */
  label: string;
  /** Short label rendered in the stage stepper. */
  shortLabel: string;
  /** Planning Tool phase name shown in the header badge. */
  planningToolPhase: string;
  /** Remedy statuses the CRQ can be in at this stage (>1 renders the sub-status bar). */
  remedyStatuses: string[];
  /** Extra Planning Tool scopes unlocked at this stage (besides "always"). */
  planningToolScopes: PlanningToolScope[];
  remedy: StageAttribute[];
  cab: StageAttribute[];
}

/** Full per-CRQ attribute schema – the shape a future API endpoint should return. */
export interface CrqAttributeSchema {
  crqNo: string;
  stages: AttributeStageSchema[];
  /** Master Planning Tool field list, filtered per stage via scopes. */
  planningToolAttributes: PlanningToolAttribute[];
}

/** Lightweight CRQ header context captured from the selected CRQ row. */
export interface AttributeUpdateCrqContext {
  crqNo: string;
  crqId: number | null;
  requester: string;
  circle: string;
  vendor: string;
  domain: string;
}

export interface AttributeUpdateState {
  dialogOpen: boolean;
  crq: AttributeUpdateCrqContext | null;
  schema: CrqAttributeSchema | null;
  selectedStageId: WorkflowStageId;
  /**
   * When set, the dialog is locked to this single stage (opened from a
   * stage tab): other stages are not browsable. Null = free browsing.
   */
  lockedStageId: WorkflowStageId | null;
  selectedRemedyStatusIndex: number;
  isLoading: boolean;
  error: string | null;
}

/** A stage attribute enriched with everything the row component needs to render. */
export interface ResolvedAttribute extends StageAttribute {
  mandatoryLevel: MandatoryLevel;
  /** Resolved value for auto-set fields (current CMS stage / Remedy status). */
  autoSetValue?: string;
  /** True for backend-set Planning Tool fields (rendered dimmed with a flag). */
  isBackend: boolean;
}

/** Fully resolved view-model for the currently selected stage. */
export interface StageAttributeView {
  stage: AttributeStageSchema;
  stageIndex: number;
  activeRemedyStatus: string;
  remedyAttributes: ResolvedAttribute[];
  cabAttributes: ResolvedAttribute[];
  planningToolVisible: ResolvedAttribute[];
  planningToolBackend: ResolvedAttribute[];
  totalPlanningToolCount: number;
}
