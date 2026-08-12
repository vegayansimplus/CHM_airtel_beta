/**
 * The Impact Analysis stage runs an SSH script per "attempt" (aka batch),
 * which drops CSV files on SFTP and rows in IMPACT_ANALYSIS_FAILURE_TBL /
 * UIG_CHM_SUMMARY_TBL (CrqWorkflowController -> /crqworkflow/impactanalysis*).
 * The UI only ever offers 4 fixed attempt slots - see BATCH_SLOTS.
 */
export const BATCH_SLOTS = [
  { key: "BATCH_1", batchNo: 1, label: "Batch 1", sublabel: "Insert started" },
  { key: "BATCH_2", batchNo: 2, label: "Batch 2", sublabel: "24 hours before execution" },
  { key: "BATCH_3", batchNo: 3, label: "Batch 3", sublabel: "4 hours before execution" },
  { key: "BATCH_4", batchNo: 4, label: "Batch 4", sublabel: "POST execution" },
] as const;

/**
 * One row of GET /crqworkflow/impactanalysis/batch - with flag="Main" (default)
 * these are the top-level entity categories (B2B, IWAN, ...); passing one of
 * those categories back as `flag` drills into its sub-entity breakdown.
 */
export interface ImpactAnalysisEntity {
  entity: string;
  cnt: number;
}

/** POST /crqworkflow/impactanalysis-script response. */
export interface ImpactScriptResult {
  status: "SUCCESS" | "ERROR";
  message: string;
}

/**
 * Batch CSVs land on SFTP as {PREFIX}_{crqNo}_{batchNo}.csv, crqNo already
 * carrying its "CRQ..." prefix - see ImpactBatchFileController's filename
 * parsing. /excel/impact-batchwise silently skips any name that isn't
 * actually present, so it's safe to offer the full candidate set.
 */
export const IMPACT_FILE_PREFIXES = ["IP", "BTP", "MSAN", "PACKET", "OTN"] as const;

export function buildImpactBatchFileNames(crqNo: string, batchNo: number): string[] {
  return IMPACT_FILE_PREFIXES.map((prefix) => `${prefix}_${crqNo}_${batchNo}.csv`);
}

/**
 * getImpactAnalysisSummaryQuery/runImpactAnalysisScriptMutation (impactBatchApiSlice.ts)
 * both define transformErrorResponse, which extracts the backend's
 * {status, message} error body into a plain string and, via RTK Query's
 * rejectWithValue, *becomes* the error itself - not `error.data`. So the
 * `error` these hooks/`.unwrap()` surface is already the final message.
 */
export function errorMessage(error: unknown, fallback: string): string {
  return typeof error === "string" && error ? error : fallback;
}
