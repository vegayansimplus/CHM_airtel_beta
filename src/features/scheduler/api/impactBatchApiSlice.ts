import { api } from "../../../service/api";
import type { ImpactBatchListResponse, ImpactHeaderRow } from "../types/impactBatch.types";

/**
 * Impact Analysis batch CSV files (ImpactBatchFileController -> /excel/*).
 * The CSVs themselves live on SFTP, keyed by CRQ + one of 4 fixed batch
 * slots - see BATCH_SLOTS in impactBatch.types.ts.
 */
export const impactBatchApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /excel/impact-batches?crqNo= - which of the 4 batch slots have files, and when they last changed.
    getImpactBatches: builder.query<ImpactBatchListResponse, { crqNo: string }>({
      query: ({ crqNo }) => ({
        url: "/excel/impact-batches",
        method: "GET",
        params: { crqNo },
      }),
      providesTags: (_r, _e, arg) => [{ type: "ImpactBatch", id: arg.crqNo }],
    }),

    // GET /excel/impact-header?crqNo=&batchNo= - row count per file type present in that batch.
    getImpactBatchHeader: builder.query<ImpactHeaderRow[], { crqNo: string; batchNo: number }>({
      query: ({ crqNo, batchNo }) => ({
        url: "/excel/impact-header",
        method: "GET",
        params: { crqNo, batchNo },
      }),
      providesTags: (_r, _e, arg) => [
        { type: "ImpactBatch", id: `${arg.crqNo}-${arg.batchNo}-header` },
      ],
    }),

    // POST /excel/impact-batchwise - merges the given CSV file names into one multi-sheet .xlsx.
    downloadImpactBatchExcel: builder.query<Blob, { fileNames: string[] }>({
      query: ({ fileNames }) => ({
        url: "/excel/impact-batchwise",
        method: "POST",
        body: fileNames,
        responseHandler: (response: Response) => response.blob(),
        cache: "no-cache",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetImpactBatchesQuery,
  useGetImpactBatchHeaderQuery,
  useLazyDownloadImpactBatchExcelQuery,
} = impactBatchApiSlice;
