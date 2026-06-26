// ─── Enums ────────────────────────────────────────────────────────────────────

export type StepStatus = "completed" | "in_progress" | "pending" | "not_started";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export type ApprovalIconKey =
  | "mobility"
  | "b2b"
  | "telemedia"
  | "user"
  | "optical"
  | "packet"
  | "security"
  | "others";

export type Priority = "high" | "medium" | "low";

export type CrqStatus = "in_progress" | "pending" | "completed" | "cancelled";

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface CrqInfo {
  id: string;
  title: string;
  requester: string;
  priority: Priority;
  createdOn: string;
  status: CrqStatus;
  slaRemaining: string;
}

export interface ParallelActivityStep {
  id: string;
  label: string;
  iconType: "team" | "tools" | "clipboard" | "chart";
  status: StepStatus;
}

export interface ApprovalTrigger {
  id: string;
  name: string;
  icon: ApprovalIconKey;
  status: ApprovalStatus;
}

export interface SchedulingStep {
  id: string;
  label: string;
  iconType: "calendar" | "team" | "shield" | "check";
  status: StepStatus;
}

export interface ExecutionStep {
  id: string;
  label: string;
  iconType: "tools" | "check";
  status: StepStatus;
}

export interface MopStep {
  id: string;
  label: string;
  status: StepStatus;
}

export interface CrqFlowData {
  parallelActivities: {
    row1: ParallelActivityStep[];
    row2: ParallelActivityStep[];
  };
  mopSteps: MopStep[];
  approvalTriggers: ApprovalTrigger[];
  schedulingSteps: SchedulingStep[];
  executionSteps: ExecutionStep[];
}

export interface CrqJourneyData {
  crqInfo: CrqInfo;
  flowData: CrqFlowData;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface CrqJourneyState {
  selectedCrqId: string | null;
  showLegend: boolean;
  isLoading: boolean;
  error: string | null;
  data: CrqJourneyData | null;
}
