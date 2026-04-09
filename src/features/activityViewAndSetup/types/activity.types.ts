// ─────────────────────────────────────────────
//  Activity Master — Type Definitions
// ─────────────────────────────────────────────

export type ChangeImpact = "Low" | "Medium" | "High";
export type ActivityStatus = "Active" | "Draft" | "Pending" | "Inactive";
export type ShiftType = "Day" | "Night" | "Evening" | "All";
export type LevelRequirement = "L1" | "L2" | "L3";

// ── Basic Activity ──────────────────────────────────────────────────────────
export interface Activity {
  id: string;
  activityName: string;
  chmDomain: string;
  chmSubDomain: string;
  domain: string;
  layer: string;
  planType: string;
  vendorOEM: string;
  changeImpact: ChangeImpact;
  status: ActivityStatus;
  phases: ActivityPhases;
  createdAt: string;
  updatedAt: string;
}

// ── Phase Configs ───────────────────────────────────────────────────────────
export interface ReviewPhase {
  crqReviewShift: ShiftType | "";
  crqReviewMinLevel: LevelRequirement | "";
  crqReviewTimeMinutes: number | "";
}

export interface ImpactAnalysisPhase {
  impactAnalysisShift: ShiftType | "";
  impactAnalysisMinLevel: LevelRequirement | "";
  impactAnalysisTimeMinutes: number | "";
}

export interface SchedulingPhase {
  schedulingShift: ShiftType | "";
  schedulingLevel: LevelRequirement | "";
  schedulingDurationMinutes: number | "";
}

export interface MOPCreationPhase {
  mopCreationShift: ShiftType | "";
  mopCreationMinLevel: LevelRequirement | "";
  mopCreationTimeMinutes: number | "";
}

export interface MOPValidationPhase {
  mopValidationShift: ShiftType | "";
  mopValidationMinLevel: LevelRequirement | "";
  mopValidationTimeMinutes: number | "";
}

export interface ExecutionPhase {
  activityNWExecShift: ShiftType | "";
  daysMargin: number | "";
  reservationMargin: number | "";
  activityTimeMinutes: number | "";
  executionMinLevel: LevelRequirement | "";
  rollbackTimeMinutes: number | "";
}

export interface ActivityPhases {
  review: ReviewPhase;
  impactAnalysis: ImpactAnalysisPhase;
  scheduling: SchedulingPhase;
  mopCreation: MOPCreationPhase;
  mopValidation: MOPValidationPhase;
  execution: ExecutionPhase;
}

// ── Form State ──────────────────────────────────────────────────────────────
export type CreateActivityForm = Omit<
  Activity,
  "id" | "status" | "phases" | "createdAt" | "updatedAt"
>;

// ── Filter State ────────────────────────────────────────────────────────────
export interface ActivityFilters {
  search: string;
  domain: string;
  status: string;
  changeImpact: string;
}

// ── Dropdown Options ────────────────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string;
}
