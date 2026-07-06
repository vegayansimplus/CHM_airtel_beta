import type { Crq } from "../../../types/crqWorkflow.types";
import type {
  AttributeUpdateCrqContext,
  CrqAttributeSchema,
  MandatoryLevel,
  ResolvedAttribute,
  StageAttribute,
  StageAttributeView,
} from "../types/attributeUpdate.types";
import type { WorkflowStageId } from "../../../constants/workflowStages";

/** Buckets a raw mandatory label ("Mandatory - if cancellation" → conditional). */
export function getMandatoryLevel(mandatory: string): MandatoryLevel {
  if (/^mandatory\s*-\s*if/i.test(mandatory)) return "conditional";
  if (/^mandatory$/i.test(mandatory)) return "mandatory";
  return "optional";
}

interface StageResolutionContext {
  stageLabel: string;
  remedyStatus: string;
}

function resolveAttribute(
  attribute: StageAttribute,
  context: StageResolutionContext,
  isBackend = false,
): ResolvedAttribute {
  return {
    ...attribute,
    mandatoryLevel: getMandatoryLevel(attribute.mandatory),
    autoSetValue:
      attribute.autoSetFrom === "cmsStage"
        ? context.stageLabel
        : attribute.autoSetFrom === "remedyStatus"
          ? context.remedyStatus
          : undefined,
    isBackend,
  };
}

/**
 * Builds the fully resolved view-model for one stage: Remedy/CAB attributes
 * plus the Planning Tool master list filtered by the stage's scopes, with
 * auto-set fields (cms_status / remedy_status) resolved against the stage.
 */
export function resolveStageView(
  schema: CrqAttributeSchema | null,
  stageId: WorkflowStageId,
  remedyStatusIndex: number,
): StageAttributeView | null {
  if (!schema) return null;
  const stageIndex = schema.stages.findIndex((s) => s.id === stageId);
  if (stageIndex < 0) return null;

  const stage = schema.stages[stageIndex];
  const safeStatusIndex = Math.min(
    Math.max(remedyStatusIndex, 0),
    stage.remedyStatuses.length - 1,
  );
  const activeRemedyStatus = stage.remedyStatuses[safeStatusIndex] ?? "";
  const context: StageResolutionContext = {
    stageLabel: stage.label,
    remedyStatus: activeRemedyStatus,
  };

  const planningToolVisible = schema.planningToolAttributes
    .filter(
      (a) => a.scope === "always" || stage.planningToolScopes.includes(a.scope),
    )
    .map((a) => resolveAttribute(a, context));
  const planningToolBackend = schema.planningToolAttributes
    .filter((a) => a.scope === "backend")
    .map((a) => resolveAttribute(a, context, true));

  return {
    stage,
    stageIndex,
    activeRemedyStatus,
    remedyAttributes: stage.remedy.map((a) => resolveAttribute(a, context)),
    cabAttributes: stage.cab.map((a) => resolveAttribute(a, context)),
    planningToolVisible,
    planningToolBackend,
    totalPlanningToolCount: planningToolVisible.length + planningToolBackend.length,
  };
}

const asText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length ? value : null;

/** Captures the header context for the dialog from the selected CRQ row. */
export function buildAttributeCrqContext(crq: Crq): AttributeUpdateCrqContext {
  const requester =
    [crq.firstName, crq.lastName].filter(Boolean).join(" ") ||
    asText(crq.managerChange) ||
    "—";

  return {
    crqNo: crq.crqNo,
    crqId: typeof crq.crqId === "number" ? crq.crqId : null,
    requester,
    circle:
      asText(crq["workAreaTerritory"]) ?? asText(crq.locationCodeM6) ?? "—",
    vendor: asText(crq.vendor) ?? "—",
    domain:
      asText(crq.categorizationTier_2) ?? asText(crq.categorizationTier_1) ?? "—",
  };
}
