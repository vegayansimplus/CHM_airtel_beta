// ─────────────────────────────────────────────────────────────────────────────
//  CAB Portal — shared types
//  Mirrors the data shapes used by the Claude Design CAB Portal mock-up.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums / unions ──────────────────────────────────────────────────────────
export type CrqStage =
  | "VALIDATE"
  | "IMPACT_ANALYSIS"
  | "MOP_CREATION"
  | "MOP_VALIDATION"
  | "SCHEDULING_APPROVAL"
  | "EXECUTION"
  | "CLOSURE";

export type CrqStatus = "pending" | "approved" | "rejected" | "delegated";

export type ImpactCode = "SA" | "NSA";

export type Domain = "IP Core" | "Optics" | "Packet" | "Embedded" | "Mobility";

export type Circle =
  | "MH" | "KA" | "GJ" | "DL" | "TN" | "AP" | "WB" | "UP-E" | "RJ" | "MP";

export type Role =
  | "admin"
  | "requester"
  | "stakeholder"
  | "cabEngineer"
  | "cabMember"
  | "se";

export type CabSessionStatus = "live" | "scheduled" | "completed";

// ── CRQ ─────────────────────────────────────────────────────────────────────
export interface Crq {
  serviceApprovalId:number;
  crqNo: string;
  planId: string;
  domainName: Domain;
  circleCode: Circle;
  currentStage: CrqStage;
  approverName: string;
  assignStartTime: string;
  currentStatus: CrqStatus;
  slaPercentage: number;
  assignedToMe: boolean;
  raisedBy: string;
}

// ── Filters used by All CRQs ─────────────────────────────────────────────────
export interface CrqFilters {
  stage?: CrqStage | "All Stages";
  domain?: Domain | "All Domains";
  circle?: Circle | "All Circles";
  impact?: ImpactCode | "All Impact";
  status?: "All Status" | "active" | "escalated" | "delegated" | "rejected";
  search?: string;
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardKpi {
  label: string;
  value: number | string;
  foot: string;
  /** Optional accent token for the icon tile. */
  accent?: "blue" | "green" | "orange" | "red" | "purple";
}

export interface StageBar {
  stage: CrqStage;
  count: number;
  /** 0-100 share of total. */
  pct: number;
}

export interface EscalationItem {
  crqNo: string;
  slaPercentage: number;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  stageBars: StageBar[];
  escalations: EscalationItem[];
}

// ── My CRQs ─────────────────────────────────────────────────────────────────
export interface MyCrqsStats {
  awaitingMe: number;
  approvedThisWeek: number;
  rejectedThisWeek: number;
}

export interface MyCrqsResponse {
  stats: MyCrqsStats;
  rows: Crq[];
}

// ── CRQ Journey ─────────────────────────────────────────────────────────────
export interface ApprovalChainStep {
  level: string;     // "L1"…"L5"
  label: string;     // stage name
  who: string;
  state: "completed" | "in_progress" | "pending" | "rejected" | "not_started";
}

export interface ParallelTrack {
  track: string;
  approver: string;
  role: string;
  status: "approved" | "reviewing" | "pending" | "queued" | "rejected";
  color: string;
  time: string;
}

export interface JourneyRemark {
  who: string;
  role: string;
  stage: CrqStage | string;
  comment: string;
  time: string;
}

export interface CrqJourney {
  crq: Crq;
  pipeIndex: number;              // 0-6
  approvalChain: ApprovalChainStep[];
  parallelTracks: ParallelTrack[];
  remarks: JourneyRemark[];
}

// ── CAB Planning ────────────────────────────────────────────────────────────
export interface CabQueueRow {
  crqNo: string;
  impact: ImpactCode;
  circle: string;
  domain: Domain;
  executionWindow: string;
}

export interface CabQueueParams {
  domainId: number;
  subDomainId: number;
}

export interface CabPlanDate {
  date: string;        // "2026-06-14"
  dayName: string;     // "FRI"
  dayNum: string;      // "14"
  monthName: string;   // "JUN"
  sessionId: string;   // CAB-… reference
  type: "Critical" | "Normal" | "Emergency";
  crqIds: string[];
}

// ── CAB Sessions ────────────────────────────────────────────────────────────
export interface CabSession {
  id: string;
  stage: CrqStage;
  host: string;
  date: string;
  time: string;
  status: CabSessionStatus;
  type: "Critical" | "Normal" | "Emergency";
  crqIds: string[];
}

export interface CabAgendaItem {
  id: string;
  activity: string;
  stage: CrqStage;
  domain: Domain;
  impact: ImpactCode;
  hostname: string;
}

export interface CabSessionDetail {
  session: CabSession;
  agenda: CabAgendaItem[];
}

// ── Implementation (Field SE) ───────────────────────────────────────────────
export interface SeRing {
  id: string;
  ring: string;
  locA: string;
  locB: string;
  type: string;
  slotStart: string;
  slotEnd: string;
  decision: "pending" | "proceed" | "block";
}

export interface ImplementationDetail {
  crq: Crq;
  noc: { tollFree: string; email: string; called: boolean };
  rings: SeRing[];
}

export interface ProceedRingPayload  { crqId: string; ringId: string; }
export interface BlockRingPayload    { crqId: string; ringId: string; comment?: string; }

// ── Admin ───────────────────────────────────────────────────────────────────
export interface AdminAnalytics {
  total: number;
  approved: number;
  rejected: number;
  breachRisk: number;
  heat: { domain: Domain; breach: number; total: number; level: "low" | "mid" | "high" }[];
}

export interface AssignMatrixCell {
  stage: CrqStage;
  domain: Domain;
  approver: string;
}

export interface AssignRule {
  id: string;
  domain: Domain;
  circle: Circle;
  impact: ImpactCode;
  stage: CrqStage;
  approver: string;
  active: boolean;
}

export interface ServiceApprovalRule {
  id: string;
  service: string;
  circle: string;
  impact: ImpactCode;
  l1: string;
  l2: string;
  l3: string;
  active: boolean;
}

export interface RejectionReason {
  reason: string;
  active: boolean;
}

export interface EscalationRow {
  stage: CrqStage;
  l1: string;
  l2: string;
  l3: string;
  notify: string;
}

export interface AdminUser {
  name: string;
  olm: string;
  role: string;
  domain: string;
  access: "Approve" | "Write" | "Read";
  status: "active" | "inactive";
}

export interface AuditEntry {
  actor: string;
  action: string;
  crq: string;
  stage: CrqStage | string;
  time: string;
  tag: "create" | "system" | "approve" | "reject" | "delegate" | "escalate";
}

// ── Mutation payloads ───────────────────────────────────────────────────────
export interface PlanCabPayload      { crqIds: string[]; sessionDateTime: string; type: CabSession["type"]; }
export interface PlanCabResult       { status: string; message: string; }
export interface NewCrqPayload {
  activity: string;
  domain: Domain;
  circle: Circle;
  impact: ImpactCode;
  technology: string;
  scheduled: string;
  window: string;
  hostname: string;
  impactedParties: string[];
}

export interface AssignSpocPayload { crqId: string; spocOlmId: string; }
export interface AssignFePayload   { crqId: string; fieldEngineerOlmId: string; }
export interface ApproveCrqPayload { serviceApprovalId: number; comment?: string; }
export interface RejectCrqPayload  { serviceApprovalId: number; reasonId: number; comment: string; }
export interface ReschedulePayload { serviceApprovalId: number; newDate: string; newWindow: string; reason: string; }

// ── Workflow action result (approve / reject / reschedule) ─────────────────
export interface CrqActionResult { status: string; message: string; }

// ── Reject reasons (AllCRQs reject dropdown) ────────────────────────────────
export interface CabRejectReason { reasonId: number; reasonText: string; }

// ── Persona (role switcher) ─────────────────────────────────────────────────
export interface Persona {
  role: Role;
  name: string;
  title: string;
  shortTitle: string;
  olm: string;
  initials: string;
  color: string;
  home: string;
}
