import type {
  AttributeFieldType,
  AttributeUpdateDetailsResponse,
  MandatoryLevel,
  ResolvedAttribute,
  StageAttribute,
  StageAttributeView,
  TargetSystem,
} from "../types/attributeUpdate.types";
import type { WorkflowStageId } from "../../../constants/workflowStages";
import {
  CMS_STAGE_SCHEMAS,
  PLANNING_TOOL_ATTRIBUTES,
} from "../constants/attributeUpdateFieldCatalog";

/** Buckets a raw mandatory label ("Mandatory - if cancellation" → conditional). */
export function getMandatoryLevel(mandatory: string): MandatoryLevel {
  if (/^mandatory\s*-\s*if/i.test(mandatory)) return "conditional";
  if (/^mandatory$/i.test(mandatory)) return "mandatory";
  return "optional";
}

interface StageResolutionContext {
  stageLabel: string;
  remedyStatus: string;
  crqNo: string;
}

function resolveAttribute(
  attribute: StageAttribute,
  system: TargetSystem,
  context: StageResolutionContext,
  liveRow: Record<string, string | null> | null | undefined,
  isBackend = false,
): ResolvedAttribute {
  const autoSetValue =
    attribute.autoSetFrom === "cmsStage"
      ? context.stageLabel
      : attribute.autoSetFrom === "remedyStatus"
        ? context.remedyStatus
        : attribute.autoSetFrom === "crqNo"
          ? context.crqNo
          : undefined;

  return {
    ...attribute,
    system,
    mandatoryLevel: getMandatoryLevel(attribute.mandatory),
    autoSetValue,
    isBackend,
    value: autoSetValue ?? liveRow?.[attribute.field] ?? null,
  };
}

/**
 * Builds the fully resolved view-model for one stage: Remedy/CAB attributes
 * plus the Planning Tool (Cygnet) master list filtered by the stage's
 * scopes, each overlaid with its live value from GET /attributeupdate/details
 * (auto-set fields ignore the live row and mirror the current stage /
 * Remedy status / CRQ number instead).
 */
export function resolveStageView(
  stageId: WorkflowStageId,
  remedyStatusIndex: number,
  details: AttributeUpdateDetailsResponse | null | undefined,
  crqNo: string,
): StageAttributeView | null {
  const stageIndex = CMS_STAGE_SCHEMAS.findIndex((s) => s.id === stageId);
  if (stageIndex < 0) return null;

  const stage = CMS_STAGE_SCHEMAS[stageIndex];
  const safeStatusIndex = Math.min(
    Math.max(remedyStatusIndex, 0),
    stage.remedyStatuses.length - 1,
  );
  const activeRemedyStatus = stage.remedyStatuses[safeStatusIndex] ?? "";
  const context: StageResolutionContext = {
    stageLabel: stage.label,
    remedyStatus: activeRemedyStatus,
    crqNo,
  };

  const planningToolVisible = PLANNING_TOOL_ATTRIBUTES.filter(
    (a) => a.scope === "always" || stage.planningToolScopes.includes(a.scope),
  ).map((a) => resolveAttribute(a, "planningTool", context, details?.cygnet));
  const planningToolBackend = PLANNING_TOOL_ATTRIBUTES.filter(
    (a) => a.scope === "backend",
  ).map((a) => resolveAttribute(a, "planningTool", context, details?.cygnet, true));

  return {
    stage,
    stageIndex,
    activeRemedyStatus,
    remedyAttributes: stage.remedy.map((a) =>
      resolveAttribute(a, "remedy", context, details?.remedy),
    ),
    cabAttributes: stage.cab.map((a) =>
      resolveAttribute(a, "cab", context, details?.cab),
    ),
    planningToolVisible,
    planningToolBackend,
    totalPlanningToolCount: planningToolVisible.length + planningToolBackend.length,
  };
}

/** attribute.system -> the save-payload/API section key ("planningTool" is the Cygnet system). */
const SYSTEM_TO_PAYLOAD_KEY: Record<TargetSystem, "remedy" | "cab" | "cygnet"> = {
  remedy: "remedy",
  cab: "cab",
  planningTool: "cygnet",
};

/** Editable form value for one field: plain string, or a string[] for the multi-value types. */
export type AttributeFormValue = string | string[];
export type AttributeFormSection = Record<string, AttributeFormValue>;
/** react-hook-form values shape for the dialog's single stage-wide form. */
export type AttributeFormValues = Record<TargetSystem, AttributeFormSection>;

/**
 * "2026-07-24T10:15:30" / "2026-07-24 10:15:30" (or with fractional/offset
 * suffix) -> "2026-07-24T10:15" for <input type="datetime-local">, which only
 * accepts the "T"-separated form. The read side sees both separators: the
 * details response echoes ISO, while values written back by save round-trip
 * as the space-separated form below.
 */
const toDateTimeLocal = (value: string | null): string =>
  value ? value.slice(0, 16).replace(" ", "T") : "";
/**
 * "2026-07-24T10:15" (the datetime-local input's value) -> "2026-07-24 10:15:00".
 * The backend's LocalDateTime fields are bound with a "yyyy-MM-dd HH:mm:ss"
 * pattern, so an ISO "T" separator fails to deserialize.
 */
const fromDateTimeLocal = (value: string): string | null => {
  if (!value) return null;
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return withSeconds.replace("T", " ");
};

const isEditable = (attribute: ResolvedAttribute) =>
  !attribute.readOnly && !attribute.isBackend && !attribute.autoSetFrom;

/** Field types held as string[] in the form and sent as a CSV string on save -
 * the dropdown and the checkbox-group renderings of the same multi-value field. */
const isMultiValueType = (type: AttributeFieldType) =>
  type === "Multi Select Dropdown" || type === "Multi Select Checkbox";

/**
 * Seeds the dialog's react-hook-form defaultValues from a resolved stage
 * view's live values - only for attributes the user can actually edit.
 * Read-only / backend-set / auto-set attributes are never registered as
 * form fields (AttributeRow renders them as plain disabled display).
 */
export function buildAttributeFormDefaults(
  stageView: StageAttributeView | null,
): AttributeFormValues {
  const sections: AttributeFormValues = { remedy: {}, cab: {}, planningTool: {} };
  if (!stageView) return sections;

  const all = [
    ...stageView.remedyAttributes,
    ...stageView.cabAttributes,
    ...stageView.planningToolVisible,
  ];

  for (const attribute of all) {
    if (!isEditable(attribute)) continue;
    const bucket = sections[attribute.system];
    if (isMultiValueType(attribute.type)) {
      bucket[attribute.field] = attribute.value
        ? attribute.value.split(",").map((v) => v.trim()).filter(Boolean)
        : [];
    } else if (attribute.type === "Date Time") {
      bucket[attribute.field] = toDateTimeLocal(attribute.value);
    } else {
      bucket[attribute.field] = attribute.value ?? "";
    }
  }

  return sections;
}

/**
 * Builds the POST /attributeupdate/save sections (remedy/cab/cygnet) for the
 * current stage: editable fields come from the submitted form values,
 * auto-set fields (cms_status, remedy_status, ...) are re-derived from the
 * stage view rather than trusted from the form, and read-only/backend-set
 * fields with no known value (cms_function, plan_id, ...) are omitted so the
 * save doesn't overwrite them with nulls.
 */
export function buildAttributeSaveSections(
  stageView: StageAttributeView,
  formValues: AttributeFormValues,
): Partial<Record<"remedy" | "cab" | "cygnet", Record<string, string | null>>> {
  const sections: Partial<Record<"remedy" | "cab" | "cygnet", Record<string, string | null>>> = {};

  const groups: Array<[TargetSystem, ResolvedAttribute[]]> = [
    ["remedy", stageView.remedyAttributes],
    ["cab", stageView.cabAttributes],
    ["planningTool", stageView.planningToolVisible],
  ];

  for (const [system, attributes] of groups) {
    const payloadKey = SYSTEM_TO_PAYLOAD_KEY[system];
    const section: Record<string, string | null> = {};
    let hasField = false;

    for (const attribute of attributes) {
      // changeId is carried as the top-level crqNo, not a Cygnet save field.
      if (attribute.field === "changeId") continue;

      if (attribute.autoSetFrom) {
        section[attribute.field] = attribute.autoSetValue ?? null;
        hasField = true;
        continue;
      }
      if (attribute.readOnly || attribute.isBackend) continue;

      hasField = true;
      const raw = formValues[system]?.[attribute.field];
      if (isMultiValueType(attribute.type)) {
        section[attribute.field] = Array.isArray(raw) && raw.length ? raw.join(",") : null;
      } else if (attribute.type === "Date Time") {
        section[attribute.field] = fromDateTimeLocal((raw as string) ?? "");
      } else {
        section[attribute.field] = (raw as string) || null;
      }
    }

    if (hasField) sections[payloadKey] = section;
  }

  return sections;
}

/**
 * Overall mandatory-field completion for the currently selected stage -
 * drives the header card's progress bar. `liveValues` (react-hook-form's
 * live watch) is preferred over the loaded `.value` so the bar updates as
 * the user types, before Save.
 *
 * Counts Remedy + CAB only. The Cygnet (Planning Tool) section is hidden
 * from the dialog (see WorkflowStageCardBody), so counting its mandatory
 * fields would show a target the user has no field to fill - even though
 * those values are still saved.
 */
export function computeStageCompletion(
  stageView: StageAttributeView,
  liveValues?: AttributeFormValues,
): { filled: number; total: number } {
  const groups: Array<[TargetSystem, ResolvedAttribute[]]> = [
    ["remedy", stageView.remedyAttributes],
    ["cab", stageView.cabAttributes],
  ];

  let filled = 0;
  let total = 0;

  for (const [system, attributes] of groups) {
    for (const attribute of attributes) {
      if (attribute.mandatoryLevel !== "mandatory") continue;
      if (attribute.readOnly || attribute.isBackend || attribute.autoSetFrom) continue;
      total += 1;
      const live = liveValues?.[system]?.[attribute.field];
      const isFilled = Array.isArray(live)
        ? live.length > 0
        : typeof live === "string"
          ? live.trim().length > 0
          : !!attribute.value;
      if (isFilled) filled += 1;
    }
  }

  return { filled, total };
}

// Re-exported (not defined here) so existing barrel/callers keep working:
// buildAttributeCrqContext lives in its own file, decoupled from this
// module's catalog import, so the eager "Attribute Update" button doesn't
// have to pull in the full attribute field catalog just to build the
// dialog's header context. See buildAttributeCrqContext.ts for why.
export { buildAttributeCrqContext } from "./buildAttributeCrqContext";
