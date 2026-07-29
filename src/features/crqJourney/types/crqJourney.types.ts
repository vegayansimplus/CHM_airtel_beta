// ─── Step / approval status enums (drive card colors, not raw backend text) ──

export type StepStatus = "completed" | "in_progress" | "pending" | "not_started";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export type ApprovalIconKey =
  | "mobility"
  | "b2b"
  | "telemedia"
  | "optical"
  | "packet"
  | "security"
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
// sp_get_crq_journey_page always returns, in order:
//   1. SPOC/FE ASSIGNMENT           (exactly 1 row)
//   2. 0..N linked CAB service rows (Mobility / Enterprise-B2B / Telemedia / …)
//   3. CONFLICT CHECK                (exactly 1 row)
//   4. the 7 canonical workflow stages (always present, fixed order)
// groupJourneyStages() below turns that flat list into this shape.

export interface CrqJourneyFlow {
  assignment: CrqJourneyStageRow | null;
  approvals: CrqJourneyStageRow[];
  conflictCheck: CrqJourneyStageRow | null;
  validate: CrqJourneyStageRow | null;
  impactAnalysis: CrqJourneyStageRow | null;
  mopCreate: CrqJourneyStageRow | null;
  mopValidate: CrqJourneyStageRow | null;
  scheduling: CrqJourneyStageRow | null;
  implementation: CrqJourneyStageRow | null;
  closure: CrqJourneyStageRow | null;
}
