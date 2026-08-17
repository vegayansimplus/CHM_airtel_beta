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

/** One row from sp_get_crq_journey_page — dynamic-length CRQ journey. */
export interface CrqJourneyStageRow {
  stage: string;
  status: string;
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
