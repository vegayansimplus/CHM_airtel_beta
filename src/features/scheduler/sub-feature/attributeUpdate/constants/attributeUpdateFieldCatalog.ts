import type {
  AttributeStageSchema,
  PlanningToolAttribute,
  StageAttribute,
} from "../types/attributeUpdate.types";

/**
 * Field catalog for the CMS 7-stage change flow: which Remedy / CAB / Cygnet
 * ("Planning Tool") attributes exist per stage, their input type, mandatory
 * level and (for dropdown/radio fields) allowed values.
 *
 * This is deliberately still frontend config, not fetched from the DB: the
 * backing tables (REMEDY_UPDATE_ATTR_TBL / CAB_UPDATE_ATTR_TBL /
 * CYGNET_UPDATE_ATTR_TBL) are plain flat tables with no type/label/mandatory
 * metadata columns, so there is nothing for a stored procedure to return
 * that would let the UI generate this catalog itself. Every entry's `field`
 * is the join key into the live attribute values returned by
 * GET /attributeupdate/details (and sent back on save) - that live data,
 * not this catalog, is what used to be hardcoded/mocked.
 */

// ─── Shared value lists ───────────────────────────────────────────────────────

const COMPANY_VALUES = ["Bharti Airtel Ltd-ANG", "Bharti Airtel Ltd-TNG"];

const ORGANIZATION_VALUES = [
  "Bharti Security",
  "CCB",
  "CCB_VALIDATOR",
  "DCO",
  "Data",
  "External Organisation",
  "Field Operations",
  "Front Office",
  "ILD-CLS",
  "MSC Operations Team",
  "Managed NOC",
  "Management",
  "N/W Implementation",
  "NOC",
  "NSG-Deployment",
  "NSG-ITMC",
  "OSS",
  "Operation Support",
  "Operations Team",
  "Operations_ANG",
  "TNG-Change Approvers",
  "TX",
  "Technology Solution",
  "Voice",
];

const GROUP_VALUES = ["Dependant on Support Organization"];

const MOP_METHOD_VALUES = [
  "ACE",
  "AIM + CLI",
  "AIM + GUI",
  "AIM + NIME",
  "AIM + OEM",
  "Auto - AIM",
  "Auto - INFRASOL",
  "Auto - RPA",
  "Auto - Script",
  "Auto - OEM Tools",
  "GRASP",
  "Infrasol + CLI",
  "Infrasol + GUI",
  "Infrasol + NIME",
  "Infrasol + OEM",
  "Manual - CLI",
  "Manual - GUI",
  "Manual - NIME",
  "Manual - OEM",
  "Manual - CLI/GUI",
  "OEM Tools + CLI",
  "OEM Tools + GUI",
  "OEM Tools + NIME",
  "OEM Tools + OEM",
  "RPA + CLI",
  "RPA + GUI",
  "RPA + NIME",
  "RPA + OEM",
  "Script + CLI",
  "Script + GUI",
  "Script + NIME",
  "Script + OEM",
];

const YES_NO_VALUES = ["Yes", "No"];

const EXECUTED_BY_VALUES = ["OEM", "Bharti", "Bharti + OEM"];

/** Circle codes offered by the numbered CAB circle slots (circle1..circle19).
 * Deliberately separate from the "Impacted Circle(s)**" list below, which also
 * carries an "All" entry and spells one circle "GI" - that field's options are
 * left exactly as they were. */
const CIRCLE_VALUES = [
  "AP",
  "BH&J",
  "GJ",
  "HPHP",
  "ITMC",
  "J&K",
  "KK",
  "KL",
  "ROMH",
  "MPCG",
  "MUM",
  "NCR",
  "NESA",
  "OR",
  "RJ",
  "TN",
  "UPE",
  "UPW",
  "WB",
];

/** Options for the 19 numbered per-circle impactedPartiesCab* fields. Same list
 * the existing "Impacted Parties*" multi-select uses, kept as its own const so
 * that field's inline options stay exactly as they were. */
const IMPACTED_PARTIES_VALUES = [
  "Core/MPBN",
  "TWAMP-Accedian",
  "B2B",
  "NOC_DCN_&_Tool",
  "Telemedia",
  "Switch",
  "NOC_IM",
  "NOC_NS",
  "TWAMP-Exfo",
  "Mobility-RAN",
  "DC",
  "NA",
  "IWAN",
];

// ─── Shared attribute blocks ─────────────────────────────────────────────────

/** How many numbered circle slots the CAB form stores (circle1..circle19 and
 * their matching impactedPartiesCab1..impactedPartiesCab19). */
const CAB_CIRCLE_SLOT_COUNT = 19;

/**
 * The CAB form's 19 numbered circle / impacted-parties pairs, as flat fields.
 *
 * Which circle sits in which slot is backend-driven, not fixed: the API sends
 * whatever circle1..circle19 hold for this CRQ, so both halves of each pair are
 * editable rather than hardcoded labels. That also matters for saving - a
 * read-only attribute is skipped entirely by buildAttributeSaveSections, so
 * marking the circle fields read-only would drop them from the payload instead
 * of echoing them back untouched.
 */
const CAB_CIRCLE_SLOT_ATTRIBUTES: StageAttribute[] = Array.from(
  { length: CAB_CIRCLE_SLOT_COUNT },
  (_, i) => i + 1,
).flatMap((slot) => [
  {
    name: `Circle ${slot}`,
    field: `circle${slot}`,
    type: "Dropdown" as const,
    mandatory: "Optional",
    values: CIRCLE_VALUES,
  },
  {
    name: `Impacted Parties ${slot}`,
    field: `impactedPartiesCab${slot}`,
    type: "Dropdown" as const,
    mandatory: "Optional",
    values: IMPACTED_PARTIES_VALUES,
  },
]);

/**
 * One "Support Company → Support Organization → Support Group Name+" cascade.
 *
 * The Change Coordinator and Change Implementer trios are the same three-level
 * lookup over the same lists - GET_IMPL_COMPANY_DROPDOWN /
 * GET_IMPL_ORG_DROPDOWN / GET_IMPL_GROUP_DROPDOWN, fronted by
 * /attributeupdate/dropdown/impl-*, which narrow organizations by company and
 * groups by company + organization. They differ only in field names, labels and
 * mandatory-ness, so both are built from this one definition rather than
 * duplicated.
 *
 * `values` stays behind as the offline fallback if a lookup fails; `dependsOn`
 * tells useAttributeOptions which sibling fields parameterize the lookup, and
 * `resets` clears the levels below whenever a level changes.
 */
const buildSupportCascade = (
  /** Display names, company → organization → group. */
  [companyName, organizationName, groupName]: [string, string, string],
  /** DTO field names, in the same order. */
  [companyField, organizationField, groupField]: [string, string, string],
  mandatory: string,
): StageAttribute[] => {
  const company = { field: companyField, label: companyName };
  const organization = { field: organizationField, label: organizationName };

  return [
    {
      name: companyName,
      field: companyField,
      type: "Dropdown",
      mandatory,
      optionSource: "implCompany",
      resets: [organizationField, groupField],
      values: COMPANY_VALUES,
    },
    {
      name: organizationName,
      field: organizationField,
      type: "Dropdown",
      mandatory,
      optionSource: "implOrganization",
      dependsOn: [company],
      resets: [groupField],
      values: ORGANIZATION_VALUES,
    },
    {
      name: groupName,
      field: groupField,
      type: "Dropdown",
      mandatory,
      optionSource: "implGroup",
      dependsOn: [company, organization],
      values: GROUP_VALUES,
    },
  ];
};

/** Coordinator / implementer support-group attributes (Remedy). */
const COORDINATOR_IMPLEMENTER_ATTRIBUTES: StageAttribute[] = [
  // Remedy's ASCPY / ASORG / ASGRP.
  ...buildSupportCascade(
    [
      "Support Company - Change Coordinator",
      "Support Organization - Change Coordinator",
      "Support Group Name+ - Change Coordinator",
    ],
    [
      "supportCompanyChangeCoordinator",
      "supportOrganizationChangeCoordinator",
      "supportGroupNameChangeCoordinator",
    ],
    "Mandatory",
  ),
  // Remedy's ChgImpCpy / ChgImpOrg / ChgImpGrp. The missing space in
  // "Organization -Change" matches the source system's own label.
  ...buildSupportCascade(
    [
      "Support Company - Change Implementer",
      "Support Organization -Change Implementer",
      "Support Group Name+ - Change Implementer",
    ],
    [
      "supportCompanyChangeImplementer",
      "supportOrganizationChangeImplementer",
      "supportGroupNameChangeImplementer",
    ],
    "Optional",
  ),
];

/**
 * Remedy row's own status column - not editable, mirrors the stage's active
 * Remedy status (same source as Cygnet's "Remedy Status" field below) so
 * INSERT_REMEDY_UPDATE_ATTR's status param is never sent null. Every stage
 * includes this first in its `remedy` array - see buildAttributeSaveSections,
 * which auto-includes any autoSetFrom field in the save payload.
 */
const REMEDY_STATUS_ATTRIBUTE: StageAttribute = {
  name: "Status",
  field: "status",
  type: "Text",
  mandatory: "Mandatory",
  readOnly: true,
  autoSetFrom: "remedyStatus",
};

/**
 * Business justification for the change - previously only collected at the
 * Scheduling stage, now available (editable) at every stage so it's never
 * dropped from the save payload no matter which stage the user is on.
 */
const BUSINESS_JUSTIFICATION_ATTRIBUTE: StageAttribute = {
  name: "Business Justification",
  field: "businessJustification",
  type: "Dropdown",
  mandatory: "Mandatory",
  values: [
    "Corporate Strategic",
    "Business Unit Strategic",
    "Maintenance",
    "Defect",
    "Upgrade",
    "Enhancement",
    "Customer Commitment",
    "Sarbanes-Oxley",
    "Real Time Spare consumption",
    "RMA",
  ],
};

// ─── 7 CMS stages (ids reuse the app-wide WorkflowStageId) ───────────────────

/** The per-stage schemas before the stage-agnostic CAB fields are appended. */
const CMS_STAGE_SCHEMAS_BASE: AttributeStageSchema[] = [
  {
    id: "review",
    label: "Plan & Inventory Validation",
    shortLabel: "Plan & Inv Val",
    planningToolPhase: "Planning",
    remedyStatuses: ["Planning In Progress"],
    planningToolScopes: [],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
      ...COORDINATOR_IMPLEMENTER_ATTRIBUTES,
    ],
    cab: [
      { name: "CRQ Validated By", field: "crqValidatedBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "CRQ Validated Time",
        field: "crqValidatedTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      { name: "Host Name**", field: "hostName", type: "Text", mandatory: "Mandatory" },
      {
        name: "Layer",
        field: "layer",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: ["ACC", "AGG", "CORE", "ISP", "MPLS/PE"],
      },
      { name: "Node IP Address*", field: "nodeIpAddress", type: "Text", mandatory: "Mandatory" },
    ],
  },
  {
    id: "impactanalysis",
    label: "Impact Analysis",
    shortLabel: "Impact Analysis",
    planningToolPhase: "Impact Analysis",
    remedyStatuses: ["Planning In Progress"],
    planningToolScopes: [],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
      {
        name: "Impacted Segment",
        field: "impactedSegment",
        // Multi-select: an activity can hit more than one segment. Held as
        // string[] in the form, saved as a CSV string like the other
        // multi-value fields.
        type: "Multi Select Checkbox",
        mandatory: "Optional",
        values: [
          "DC",
          "Mobility",
          "TWAMP",
          "NOC NS",
          "NOC IM",
          "Switch",
          "Telemedia",
          "NOC DCN and tool",
          "B2B",
        ],
      },
      { name: "Actual Impact", field: "actualImpact", type: "Text", mandatory: "Mandatory" },
      {
        name: "Activity Impact Analysis Done",
        field: "activityImpactAnalysisDone",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      { name: "OLT Details", field: "oltDetails", type: "Text", mandatory: "Optional" },
    ],
    cab: [
      {
        name: "Technology**",
        field: "technology",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: ["BRAS", "CEN", "EPT", "ISP", "MPLS", "NPT", "OTN"],
      },
      {
        name: "Impact Analysis Done By",
        field: "impactAnalysisDoneBy",
        type: "Text",
        mandatory: "Mandatory",
      },
      {
        name: "Impact Analysis Done By Time",
        field: "impactAnalysisDoneByTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "B2B Impacted*",
        field: "b2bImpacted",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "Impacted Circle(s)**",
        field: "impactedCircles",
        type: "Multi Select Dropdown",
        mandatory: "Mandatory",
        values: [
          "WB",
          "UPW",
          "UPE",
          "TN",
          "RJ",
          "OR",
          "NESA",
          "NCR",
          "MUM",
          "MPCG",
          "ROMH",
          "KL",
          "KK",
          "J&K",
          "ITMC",
          "HPHP",
          "GI",
          "BH&J",
          "AP",
          "All",
        ],
      },
      {
        name: "Impacted Parties*",
        field: "impactedParties",
        type: "Multi Select Dropdown",
        mandatory: "Mandatory",
        values: [
          "Core/MPBN",
          "TWAMP-Accedian",
          "B2B",
          "NOC_DCN_&_Tool",
          "Telemedia",
          "Switch",
          "NOC_IM",
          "NOC_NS",
          "TWAMP-Exfo",
          "Mobility-RAN",
          "DC",
          "NA",
          "IWAN",
        ],
      },
      { name: "MSAN Count", field: "msanCount", type: "Text", mandatory: "Optional" },
    ],
  },
  {
    id: "mopcreate",
    label: "MOP Creation",
    shortLabel: "MOP Creation",
    planningToolPhase: "MOP Creation",
    remedyStatuses: ["Planning In Progress"],
    planningToolScopes: [],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
      {
        name: "MOP Creation Method",
        field: "mopCreationMethod",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: MOP_METHOD_VALUES,
      },
      {
        name: "SOP Document",
        field: "sopDocument",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "MOP Document",
        field: "mopDocument",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: ["Yes"],
      },
    ],
    cab: [
      { name: "MOP Created By", field: "mopCreatedBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "MOP Created By Time",
        field: "mopCreatedByTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
    ],
  },
  {
    id: "mopvalidate",
    label: "MOP Validation",
    shortLabel: "MOP Validation",
    planningToolPhase: "MOP Validation",
    remedyStatuses: ["Planning In Progress"],
    planningToolScopes: [],
    remedy: [REMEDY_STATUS_ATTRIBUTE, BUSINESS_JUSTIFICATION_ATTRIBUTE],
    cab: [
      { name: "MOP Validated By", field: "mopValidatedBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "MOP Validated By Time",
        field: "mopValidatedByTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "MOP Validation Remark",
        field: "mopValidationRemark",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: ["Not OK", "OK"],
      },
    ],
  },
  {
    id: "scheduling",
    label: "Scheduling & Approvals",
    shortLabel: "Scheduling & Approvals",
    planningToolPhase: "Scheduling",
    remedyStatuses: ["Planning In Progress"],
    planningToolScopes: ["scheduling"],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      ...COORDINATOR_IMPLEMENTER_ATTRIBUTES,
      {
        name: "Scheduled Start Date+",
        field: "scheduledStartDate",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "Scheduled End Date+",
        field: "scheduledEndDate",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
    ],
    cab: [
      {
        name: "FE Required**",
        field: "feRequired",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "Remarks for FE Details",
        field: "remarksForFeDetails",
        type: "Text",
        mandatory: "Optional",
      },
      { name: "CRQ Scheduled By", field: "crqScheduledBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "CRQ Scheduled By Time",
        field: "crqScheduledByTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "Activity Executed By*",
        field: "activityExecutedBy",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: EXECUTED_BY_VALUES,
      },
      { name: "L3 Approver OLM ID", field: "l3ApproverOlmId", type: "Text", mandatory: "Mandatory" },
    ],
  },
  {
    id: "activityimplement",
    label: "Network Execution",
    shortLabel: "Network Execution",
    planningToolPhase: "Execution",
    remedyStatuses: [
      "Scheduled For Review",
      "Scheduled For Approval",
      "Scheduled",
      "Implementation in Progress",
    ],
    planningToolScopes: ["execution"],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
      {
        name: "Actual Start Date*+",
        field: "actualStartDate",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "Actual End Date*+",
        field: "actualEndDate",
        type: "Date Time",
        mandatory: "Mandatory",
      },
    ],
    cab: [
      {
        name: "Activity Executed By*",
        field: "activityExecutedBy",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: EXECUTED_BY_VALUES,
      },
      {
        name: "Actual Implementer Name",
        field: "actualImplementerName",
        type: "Text",
        mandatory: "Mandatory",
      },
      {
        name: "Actual Implementer Phone No",
        field: "actualImplementerPhoneNo",
        type: "Numbers",
        mandatory: "Mandatory",
      },
      {
        name: "Exit Criteria Fulfilled**",
        field: "exitCriteriaFulfilled",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "MOP Referred During Activity",
        field: "mopReferredDuringActivity",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "Pre Check Done**",
        field: "preCheckDone",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      { name: "Pre - Checks Done By", field: "preChecksDoneBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "Pre-Check Done Time",
        field: "preCheckDoneTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "Post Check Done**",
        field: "postCheckDone",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      { name: "Post - Checks Done By", field: "postChecksDoneBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "Post-Check Done Time",
        field: "postCheckDoneTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      {
        name: "Requested Date Deviation Reason",
        field: "requestedDateDeviationReason",
        type: "Dropdown",
        mandatory: "Optional",
        values: [
          "Activity Preponed",
          "Activity approval denied by B2B",
          "Activity approval denied by Circle (Deployment)",
          "Activity approval denied by Circle (Ops)",
          "Activity approval denied by OEM",
          "Activity on hold by management",
          "Activity reverting",
          "Based on request received from requester",
          "FE Tools not available",
          "FE not available",
          "Fiber cuts",
          "Fiber readiness issue",
          "LAN issue",
          "NE unmanaged",
          "NIAM Access Issue",
          "NMS Issue",
          "NOC Readiness",
          "NOC engg Not available",
          "Natural Calamities",
          "Portal/Tool Issues",
          "Remedy not working",
          "SPOC Details not available",
          "Site Access Issue",
          "Spare not available",
          "Time constraint",
          "VVIP Visit",
        ],
      },
      {
        name: "Executer Location",
        field: "executerLocation",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: [
          "AIRTEL CIRCLE OFFICE",
          "AIRTEL NOC",
          "MS-ERICSSON OFFICE",
          "MS-NOKIA OFFICE",
          "WORK FROM HOME",
        ],
      },
      {
        name: "MOP Execution Method",
        field: "mopExecutionMethod",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: MOP_METHOD_VALUES,
      },
      {
        name: "CRQ approval status",
        field: "crqApprovalStatus",
        type: "Dropdown",
        mandatory: "Mandatory",
        values: ["PENDING FOR APPROVAL", "REJECTED", "APPROVED"],
      },
    ],
  },
  {
    id: "closer",
    label: "Task Closure",
    shortLabel: "Task Closure",
    planningToolPhase: "Task Closure",
    remedyStatuses: ["Completed"],
    planningToolScopes: ["closure"],
    remedy: [
      REMEDY_STATUS_ATTRIBUTE,
      BUSINESS_JUSTIFICATION_ATTRIBUTE,
      { name: "Completed Date", field: "completedDate", type: "Date Time", mandatory: "Mandatory" },
    ],
    cab: [
      {
        name: "Change Activity Done",
        field: "changeActivityDone",
        type: "Radio Button",
        mandatory: "Mandatory",
        values: YES_NO_VALUES,
      },
      {
        name: "Change Activity Done Time",
        field: "changeActivityDoneTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
      { name: "CRQ Closed By", field: "crqClosedBy", type: "Text", mandatory: "Mandatory" },
      {
        name: "CRQ Closed By Time",
        field: "crqClosedByTime",
        type: "Date Time",
        mandatory: "Mandatory",
      },
    ],
  },
];

/**
 * The stage schemas, with the 19 numbered circle / impacted-parties pairs
 * appended to every stage's CAB section.
 *
 * They are not stage-specific: GET /attributeupdate/details returns the whole
 * CAB row whatever the stage, and INSERT_CAB_UPDATE_ATTR writes it back whole,
 * so a stage that omitted these columns would blank whatever the previous stage
 * had saved in them. Appended here rather than spread into each stage's `cab`
 * array so no stage can be forgotten.
 */
export const CMS_STAGE_SCHEMAS: AttributeStageSchema[] = CMS_STAGE_SCHEMAS_BASE.map(
  (stage) => ({ ...stage, cab: [...stage.cab, ...CAB_CIRCLE_SLOT_ATTRIBUTES] }),
);

// ─── Planning Tool (Cygnet) master field list, filtered per stage via scopes ─

export const PLANNING_TOOL_ATTRIBUTES: PlanningToolAttribute[] = [
  {
    name: "Change ID",
    field: "changeId",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
    readOnly: true,
    autoSetFrom: "crqNo",
  },
  {
    name: "CMS Function",
    field: "cmsFunction",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
    readOnly: true,
  },
  {
    name: "CMS Sub Function",
    field: "cmsSubFunction",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
    readOnly: true,
  },
  { name: "Plan ID", field: "planId", type: "Text", mandatory: "Mandatory", scope: "backend" },
  { name: "Task ID", field: "taskId", type: "Text", mandatory: "Mandatory", scope: "backend" },
  {
    name: "Requestor Type",
    field: "requestorType",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: ["Ops", "IT", "NOC", "Vendor", "Customer"],
  },
  {
    name: "Requestor Name",
    field: "requestorName",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
  },
  {
    name: "Circle",
    field: "circle",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: [
      "North",
      "South",
      "East",
      "West",
      "NCR",
      "WB",
      "MH",
      "KA",
      "TN",
      "KL",
      "AP",
      "GJ",
      "PB",
      "RJ",
      "UP-E",
      "UP-W",
      "MP",
      "KOL",
      "MUM",
      "DEL",
    ],
  },
  {
    name: "Vendor",
    field: "vendor",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: [
      "Nokia",
      "Ericsson",
      "Huawei",
      "Cisco",
      "ZTE",
      "Juniper",
      "ECI",
      "ADVA",
      "Ciena",
      "Samsung",
    ],
  },
  {
    name: "Domain",
    field: "domain",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: [
      "MPLS-TX",
      "IP Core",
      "Access",
      "Transport",
      "DWDM",
      "OTN",
      "RAN",
      "GPON",
      "FTTX",
      "CEN",
      "BRAS",
      "EPT",
      "NPT",
    ],
  },
  {
    name: "Opcat Level 1",
    field: "opcatLevel1",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: ["Network", "Hardware", "Software", "Service", "Application"],
  },
  {
    name: "Opcat Level 2",
    field: "opcatLevel2",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: ["MPLS", "DWDM", "IP", "Optical", "Router", "Switch", "Firewall"],
  },
  {
    name: "Opcat Level 3",
    field: "opcatLevel3",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: [
      "Node Addition",
      "Node Removal",
      "Configuration Change",
      "Upgrade",
      "Migration",
      "Patch",
    ],
  },
  {
    name: "Change Type",
    field: "changeType",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: ["Planned", "Emergency", "Standard", "Normal", "Project"],
  },
  {
    name: "Change Impact",
    field: "changeImpact",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    values: ["Minor", "Major", "Critical", "Extensive/Widespread"],
  },
  {
    name: "Activity Window",
    field: "activityWindow",
    type: "Text",
    mandatory: "Mandatory",
    scope: "scheduling",
  },
  {
    name: "Requested Start Time",
    field: "requestedStartTime",
    type: "Date Time",
    mandatory: "Mandatory",
    scope: "scheduling",
  },
  {
    name: "Requested End Time",
    field: "requestedEndTime",
    type: "Date Time",
    mandatory: "Mandatory",
    scope: "scheduling",
  },
  {
    name: "Scheduled Start Time",
    field: "scheduledStartTime",
    type: "Date Time",
    mandatory: "Mandatory",
    scope: "scheduling",
  },
  {
    name: "Scheduled End Time",
    field: "scheduledEndTime",
    type: "Date Time",
    mandatory: "Mandatory",
    scope: "scheduling",
  },
  {
    name: "Coordinator Company",
    field: "coordinatorCompany",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
  },
  {
    name: "Coordinator Organization",
    field: "coordinatorOrganization",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
  },
  {
    name: "Coordinator Group",
    field: "coordinatorGroup",
    type: "Text",
    mandatory: "Mandatory",
    scope: "always",
  },
  {
    name: "Implementer Company",
    field: "implementerCompany",
    type: "Text",
    mandatory: "Mandatory",
    scope: "execution",
  },
  {
    name: "Implementer Organization",
    field: "implementerOrganization",
    type: "Text",
    mandatory: "Mandatory",
    scope: "execution",
  },
  {
    name: "Implementer Group",
    field: "implementerGroup",
    type: "Text",
    mandatory: "Mandatory",
    scope: "execution",
  },
  {
    name: "Execution Engineer Name",
    field: "executionEngineerName",
    type: "Text",
    mandatory: "Mandatory",
    scope: "execution",
  },
  {
    name: "Execution Engineer Contact",
    field: "executionEngineerContact",
    type: "Numbers",
    mandatory: "Mandatory",
    scope: "execution",
  },
  {
    name: "Execution Engineer Details",
    field: "executionEngineerDetails",
    type: "Text",
    mandatory: "Optional",
    scope: "execution",
  },
  {
    name: "CMS Status",
    field: "cmsStatus",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    readOnly: true,
    autoSetFrom: "cmsStage",
    values: [
      "Plan & Inv Val",
      "Impact Analysis",
      "Scheduling",
      "MOP Creation",
      "MOP Validation",
      "Network Execution",
      "Task Closure",
      "Closed",
    ],
  },
  {
    name: "Approval Status",
    field: "approvalStatus",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "scheduling",
    values: ["Pending", "Approved", "Rejected", "Deferred"],
  },
  {
    name: "Remedy Status",
    field: "remedyStatus",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "always",
    readOnly: true,
    autoSetFrom: "remedyStatus",
    values: [
      "Draft",
      "Planning In Progress",
      "Scheduled For Review",
      "Scheduled For Approval",
      "Scheduled",
      "Implementation in Progress",
      "Completed",
      "Rejected",
      "Cancelled",
      "Closed",
    ],
  },
  {
    name: "Task Closure Status",
    field: "taskClosureStatus",
    type: "Dropdown",
    mandatory: "Mandatory",
    scope: "closure",
    values: ["Open", "In Progress", "Success", "Failed", "Closed"],
  },
  {
    name: "Completion Time",
    field: "completionTime",
    type: "Date Time",
    mandatory: "Mandatory",
    scope: "closure",
  },
  {
    name: "Cancellation Time",
    field: "cancellationTime",
    type: "Date Time",
    mandatory: "Optional",
    scope: "backend",
  },
  {
    name: "Rejection Time",
    field: "rejectionTime",
    type: "Date Time",
    mandatory: "Optional",
    scope: "backend",
  },
  {
    name: "Closure Reason",
    field: "closureReason",
    type: "Dropdown",
    mandatory: "Optional",
    scope: "closure",
    values: ["Successful", "Partial Success", "Failed", "Rolled Back", "Cancelled"],
  },
  {
    name: "Failure Remarks",
    field: "failureRemarks",
    type: "Text",
    mandatory: "Optional",
    scope: "backend",
  },
];
