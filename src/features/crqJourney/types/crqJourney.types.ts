// ─── Step / approval status enums (drive card colors, not raw backend text) ──

export type StepStatus = "completed" | "in_progress" | "pending" | "not_started" | "cancelled";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export type ApprovalIconKey =
  | "mobility"
  | "b2b"
  | "telemedia"
  | "optical"
  | "packet"
  | "security"
  | "ran"
  | "transmission"
  | "core"
  | "user"
  | "others";

// ─── Raw API row shapes (mirror backend DTOs exactly) ────────────────────────

/** One row from GetCRQBySubDomainId — backs the CRQ search/autocomplete. */
export interface CrqJourneySearchRow {
  crqNo: string;
  currentStage: string;
  currentStatus: string;
  enteredCurrentStageAt: string | null;
}

/** One row from result set 1 of sp_get_crq_journey_page — dynamic-length CRQ journey. */
export interface CrqJourneyStageRow {
  stage: string;
  status: string;
}

/**
 * One RAW row of result set 2 of sp_get_crq_journey_page — a CAB service still
 * awaiting a decision on this CRQ, plus the approver configured to make it.
 *
 * Exactly the three columns the procedure emits, untouched. The procedure is
 * read-only for this feature, so its three rough edges are handled in
 * `summarizePendingApprovals` rather than in SQL:
 *
 *   • `serviceCode` is the raw CRQ_CAB_SERVICE_MASTER code ("MOB", "TEL",
 *     "TX") while result set 1 names the very same services by their display
 *     name ("Mobility (RAN/Core)", "Telemedia") — the same service would
 *     otherwise appear under two different labels on one page.
 *   • One row is emitted per PENDING row of CRQ_CAB_SERVICE_TBL, so a service
 *     with several open rows repeats verbatim (one live CRQ yields six
 *     identical Transmission rows).
 *   • `serviceCode` doubles as a sentinel channel: the literal 'NO SERVICES' or
 *     'NO SERVICES PENDING' arrives as the only row, both approver fields null.
 *
 * A null `approverOlmId` on a real service row is a genuine gap in
 * CRQ_CAB_SERVICE_APPROVAL_CONFIG_TBL, not a failed lookup.
 */
export interface CrqPendingApproval {
  serviceCode: string | null;
  approverOlmId: string | null;
  approverName: string | null;
}

/**
 * One pending service as the UI shows it: the raw row above, de-duplicated and
 * given the proper display name that result set 2 doesn't carry.
 */
export interface PendingApprovalView {
  /** Raw code from the proc — "MOB", "TEL", "TX". Always present. */
  serviceCode: string;
  /** Display name resolved from result set 1 / the service master; falls back to the code. */
  serviceName: string;
  /** False when the code could not be resolved and `serviceName` is just the code echoed back. */
  nameResolved: boolean;
  /** How many PENDING CRQ_CAB_SERVICE_TBL rows this one line stands for. */
  pendingCount: number;
  approverOlmId: string | null;
  approverName: string | null;
  /** An active approval-config row was found, i.e. there is someone to route this to. */
  configured: boolean;
}

/** Result set 3 of sp_get_crq_journey_page — the CRQ's org scope. */
export interface CrqJourneyScope {
  domainName: string | null;
  subDomainName: string | null;
}

/** GET /crqworkflow/journey-explorer/{crqNo} — all three result sets in one payload. */
export interface CrqJourneyPageResponse {
  stages: CrqJourneyStageRow[];
  pendingApprovals: CrqPendingApproval[];
  scope: CrqJourneyScope | null;
}

/** Result set 1 of get_crq_details — the CRQ info card. */
export interface CrqDetailsInfo {
  crqNo: string;
  currentStage: string;
  currentStatus: string;
  teamFunction: string | null;
  teamSubFunction: string | null;
  createdDate: string | null;
  remark: string | null;
}

/** Result set 2 of get_crq_details — one row per canonical workflow stage. */
export interface CrqDetailsStage {
  stage: string;
  stageStatus: string;
  isCurrent: boolean;
  assignedTo: string | null;
  performedBy: string | null;
  assignStart: string | null;
  assignEnd: string | null;
  stageStartDate: string | null;
  stageEndDate: string | null;
}

export interface CrqDetailsResponse {
  info: CrqDetailsInfo | null;
  stages: CrqDetailsStage[];
}

// ─── Feature 1 (/cabmanager/journey) — grouped, dynamic-length flow ──────────
//
// sp_get_crq_journey_page emits one flat (STAGE, STATUS) list, built in four
// appends (verified against the live routine body):
//   1. the 7 canonical workflow stages, always present, fixed order:
//      Plan & Inventory · IMPACT ANALYSIS · MOP CREATE · MOP VALIDATE ·
//      SCHEDULING · Activity_Implement · CLOSURE
//      Status = APPROVED for stages before the current one, the CRQ's live
//      current_status (underscores → hyphens) for the current one, PENDING
//      after it — or NA after it once the CRQ is CANCELLED.
//   2. 0..N linked CAB service rows, named from CRQ_CAB_SERVICE_MASTER
//      (Mobility (RAN/Core), Enterprise / B2B, Transmission, …) — names are
//      NOT unique, the same service can appear several times.
//   3. CAB             (exactly 1 row) — YES/NO: is the CRQ mapped to a session
//   4. CONFLICT CHECK  (exactly 1 row) — YES/NO
//
// groupJourneyStages() resolves this by NAME rather than by position, so a
// future re-ordering or an extra appended row can't shift stages into the
// approvals bucket.

export interface CrqJourneyFlow {
  /** Legacy slot — the current routine no longer emits SPOC/FE ASSIGNMENT, kept so an older DB still renders. */
  assignment: CrqJourneyStageRow | null;
  approvals: CrqJourneyStageRow[];
  /** YES = CRQ is mapped into a CAB session. */
  cab: CrqJourneyStageRow | null;
  conflictCheck: CrqJourneyStageRow | null;
  validate: CrqJourneyStageRow | null;
  impactAnalysis: CrqJourneyStageRow | null;
  mopCreate: CrqJourneyStageRow | null;
  mopValidate: CrqJourneyStageRow | null;
  scheduling: CrqJourneyStageRow | null;
  implementation: CrqJourneyStageRow | null;
  closure: CrqJourneyStageRow | null;
}
