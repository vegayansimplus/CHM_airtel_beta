// ─────────────────────────────────────────────
//  Activity — Type Definitions (matches real backend contracts)
// ─────────────────────────────────────────────

export type ChangeImpact = "Low" | "Medium" | "High" | "Critical";
export type ActivityStatus = "Active" | "Draft" | "Pending" | "Inactive";
export type ShiftType = "General" | "Morning" | "Evening" | "Night";
export type LevelRequirement = "L1" | "L2" | "L3";

// ── GET /activity/view row (sp_get_activity_details) ────────────────────────
export interface ActivityViewRow {
  activityId: string;
  planId: number;
  activityName: string;
  chmDomain: number;
  chmSubDomain: number;
  domain: string;
  layer: string;
  planType: string;
  vendorOem: string;
  changeImpact: ChangeImpact;
  status: ActivityStatus;
  createdAt: string;
  createdBy: string;
}

// ── GET /activity/phase-view response (sp_get_activity_phase_view) ──────────
export interface PhaseConfig {
  assignTeam?: string | null;
  minimumLevelRequirement?: string | null;
  shift?: string | null;
  time?: number | null;
}

export interface ExecutionConfig extends PhaseConfig {
  daysMargin?: number | null;
  reservationMargin?: number | null;
  rollbackTime?: number | null;
}

export interface ActivityPhaseEntry {
  activityId: string;
  activityName: string;
  execution: ExecutionConfig | null;
  phases: {
    review?: PhaseConfig | null;
    impactAnalysis?: PhaseConfig | null;
    scheduling?: PhaseConfig | null;
    mopCreation?: PhaseConfig | null;
    mopValidation?: PhaseConfig | null;
  };
}

export interface ActivityPhaseView {
  activities: ActivityPhaseEntry[];
  basicInfo: {
    chmDomain: string;
    chmSubDomain: string;
    domain: string;
    layer: string;
    planType: string;
    vendorOem: string;
    changeImpact: string;
  };
}

// ── POST /activity/insert payload (ActivityInsertRequestDTO / sp_insert_activity) ──
/** Base: 4 fields shared by crqReview, impactAnalysis, scheduling, mopCreate, mopValidate */
export interface InsertPhaseConfig {
  shift: string;
  minimumLevelRequirement: string;
  requiredTimeMinutes: number;
  assignedToTeam: number;
}

/** Extended: 3 extra fields, only for crqExecution */
export interface InsertExecutionPhaseConfig extends InsertPhaseConfig {
  daysMargin: number;
  reservationMargin: number;
  rollbackTime: number;
}

/** Flat payload sent to /activity/insert (field names mirror the DTO exactly) */
export interface InsertActivityPayload {
  planId: number;
  activityName: string;
  [key: string]: string | number;
}

// ── GET /plan/view row (for the Plan picker) ─────────────────────────────────
export interface PlanOption {
  planId: number;
  chmDomain: string;
  chmSubDomain: string | null;
  domain: string;
  layer: string;
  planType: string;
  vendorOem: string;
  changeImpact: string;
  status: string;
}

// ── Filter state (client-side table filtering) ───────────────────────────────
export interface ActivityFilters {
  search: string;
  domain: string;
  status: string;
  changeImpact: string;
}
