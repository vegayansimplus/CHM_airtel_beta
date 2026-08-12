/**
 * The Impact Analysis stage's batch CSV files land on SFTP as
 * {PREFIX}_{crqNo}_{batchNo}.csv (PREFIX one of IP/BTP/MSAN/PACKET/OTN).
 * The UI only ever shows 4 fixed batch slots - see BATCH_SLOTS.
 */
export interface ImpactBatchInfo {
  modifiedDate: string;
  files: string[];
}

/** GET /excel/impact-batches response - keyed "BATCH_1".."BATCH_4", omitting any slot with no files yet. */
export type ImpactBatchListResponse = Record<string, ImpactBatchInfo>;

/** One row of GET /excel/impact-header - row count (excluding header) for one file type present in the batch. */
export interface ImpactHeaderRow {
  entity: string;
  cnt: number;
}

export const BATCH_SLOTS = [
  { key: "BATCH_1", batchNo: 1, label: "Batch 1", sublabel: "Insert started" },
  { key: "BATCH_2", batchNo: 2, label: "Batch 2", sublabel: "24 hours before execution" },
  { key: "BATCH_3", batchNo: 3, label: "Batch 3", sublabel: "4 hours before execution" },
  { key: "BATCH_4", batchNo: 4, label: "Batch 4", sublabel: "POST execution" },
] as const;
