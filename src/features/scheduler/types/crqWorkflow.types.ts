export interface Task {
  taskId: string;
  neLabel: string;
  planActivityDetails: string;
  activitySequence: string;
  taskProfileType: string;
  locationCodeM6: string;
  workAreaTerritory: string;
  activityPlanStartDate: string;
  activityPlanEndDate: string;
  taskActivity: string;
}

export interface Crq {
  crqNo: string;
  crqRaisedDate: string;
  description: string;
  crqStatus: string;
  crqId: number;
  remark?: string | null;
  managerChange?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  ascpy?: string | null;
  asorg?: string | null;
  asgrp?: string | null;
  supportOrganization?: string | null;
  supportGroupName?: string | null;
  categorizationTier_1?: string | null;
  categorizationTier_2?: string | null;
  categorizationTier_3?: string | null;
  requestedStartDate?: string | null;
  requestedEndDate?: string | null;
  detailedDescription?: string | null;
  aschg?: string | null;
  remedyChangeImpact?: string | null;
  neLabel?: string | null;
  planType?: string | null;
  planNumber?: string | null;
  taskId?: string | null;
  planActivityDetails?: string | null;
  activitySequence?: string | null;
  locationCodeM6?: string | null;
  taskProfileType?: string | null;
  state?: string | null;
  assignedGroup?: string | null;
  assignedDepartment?: string | null;
  nodeType?: string | null;
  vendor?: string | null;
  activityPlanStartDate?: string | null;
  activityPlanEndDate?: string | null;
  impactStartDate?: string | null;
  impactEndDate?: string | null;
  impactAnalysisStatus?: string | null;
  olmidImpactAnalysis?: string | null;
  
  // Backwards compatibility / fallbacks for previous UI logic
  crqReviewStatus?: string | null; 
  olmidReview?: string | null;
  
  tasks: Task[];
}

export interface Plan {
  planNumber: string;
  planType: string;
  description: string;
  crqs: Crq[];
}

export interface CrqReviewResponse {
  plans: Plan[];
}