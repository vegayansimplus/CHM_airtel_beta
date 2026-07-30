// Mirrors com.vegayan.airtelmanagement.crqanalytic.dto (+ one crqdashboard DTO for aging heatmap).

export interface CRQAnalyticsFilterParams {
  verticalId?: number;
  teamFunctionId?: number;
  domainId?: number;
  subDomainId?: number;
  circleId?: number;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
}

export interface CRQKpiSummaryDto {
  totalCrq: number;
  openCrq: number;
  closedCrq: number;
  rejected: number;
  slaScore: number;
  totalTrendPct: number | null;
  openTrendPct: number | null;
  closedTrendPct: number | null;
  rejectedTrendPct: number | null;
  slaTrendPct: number | null;
}

export interface CRQWorkflowStageDto {
  stage: string;
  totalCount: number;
  openCount: number;
}

export interface CRQSlaDomainDto {
  domain: string;
  score: number;
}

export interface CRQRaisedVsClosedDto {
  label: string;
  raised: number;
  closed: number;
  rejected: number;
}

export interface CRQRejectionReasonDto {
  reason: string;
  count: number;
  pct: number;
}

export interface EngineerUtilizationDto {
  engineerName: string;
  teamFunction: string;
  skillTags: string;
  planAndInventoryValidation: number;
  impactAnalysis: number;
  mopCreate: number;
  mopValidate: number;
  schedulingAndApprovals: number;
  networkExecution: number;
  taskClosure: number;
  totalTasks: number;
  plannedHrs: number;
  actualHrs: number;
  utilizationPct: number;
}

/** The master aggregate call — one round trip for the whole Dashboard tab. */
export interface CRQAnalyticsDashboardResponse {
  status: string;
  kpi: CRQKpiSummaryDto;
  workflowStages: CRQWorkflowStageDto[];
  slaDomains: CRQSlaDomainDto[];
  raisedVsClosed: CRQRaisedVsClosedDto[];
  rejectionReasons: CRQRejectionReasonDto[];
  engineerUtilization: EngineerUtilizationDto[];
}

export interface CRQOpenDomainDto {
  domain: string;
  openCount: number;
}

export interface CRQGroupBreakdownDto {
  group: string;
  raised: number;
  closed: number;
  rejected: number;
}

export interface CRQRunRateDto {
  date: string;
  raised: number;
  movedToScheduling: number;
  closed: number;
}

export type GroupBreakdownDimension = "domain" | "region" | "circle";

export interface CRQListRowDto {
  crqNo: string;
  currentStage: string;
  currentStatus: string;
  domain: string;
  subDomain: string;
  schedulingFlag: string;
  approvalFlag: string;
  createdAt: string;
}

export interface CRQListResponseDto {
  status: string;
  totalCount: number;
  rows: CRQListRowDto[];
}

export interface CRQListParams extends CRQAnalyticsFilterParams {
  status?: string;
  stage?: string;
  page?: number;
  size?: number;
}

/** From crqdashboard's /crq/agingheatmap — the only aging-data source available (crqanalytic has none). */
export interface AgingHeatmapCellDto {
  stage: string;
  bucket: string;
  count: number;
  intensity: number;
}

export interface AgingHeatmapResponseDto {
  status: string;
  buckets: string[];
  stages: string[];
  cells: AgingHeatmapCellDto[];
}

export type AgingHeatmapMode = "SCHEDULED" | "RECEIVED";

export interface AgingHeatmapParams {
  verticalId?: number;
  teamFunctionId?: number;
  domainId?: number;
  subDomainId?: number;
  startDate: string;
  endDate: string;
  heatmapMode: AgingHeatmapMode;
}

// ─── Reports tab — com.vegayan.airtelmanagement.analyticsreport ──────────────

export type AnalyticsReportType = "daily" | "weekly" | "monthly";

export interface AvailableDatesResponse {
  availableDates: string[];
}

export interface AvailableReportsResponse {
  availableReports: string[];
}

export interface DownloadReportArgs {
  reportType: AnalyticsReportType;
  date: string;
  fileName: string;
}
