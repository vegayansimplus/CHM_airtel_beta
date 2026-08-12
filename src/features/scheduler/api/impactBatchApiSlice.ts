import { api } from "../../../service/api";
import { format } from "date-fns";
import type { ImpactAnalysisEntity, ImpactScriptResult } from "../types/impactBatch.types";

interface ErrorBody {
  message?: string;
  status?: string;
}

function toErrorMessage(response: { data?: unknown }, fallback: string): string {
  const data = response.data as ErrorBody | undefined;
  return data?.message || fallback;
}

/**
 * Impact Analysis stage (CrqWorkflowController -> /crqworkflow/impactanalysis*,
 * ImpactBatchFileController -> /excel/impact-batchwise). The batch summary
 * proc (chm_get_main_summary_data) only matches on the *date* portion of
 * modifiedDate, so callers just need "today" unless re-checking a past run.
 */
export const impactBatchApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /crqworkflow/impactanalysis/batch?crqNo=&batchNo=&flag=&modifiedDate=
    // flag="Main" (default) -> top-level entity categories (B2B, IWAN, ...);
    // flag=<category> -> that category's sub-entity breakdown.
    getImpactAnalysisSummary: builder.query<
      ImpactAnalysisEntity[],
      { crqNo: string; batchNo: number; modifiedDate: Date; flag?: string }
    >({
      query: ({ crqNo, batchNo, modifiedDate, flag }) => ({
        url: "/crqworkflow/impactanalysis/batch",
        method: "GET",
        params: {
          crqNo,
          batchNo,
          flag: flag || "Main",
          modifiedDate: format(modifiedDate, "yyyy-MM-dd HH:mm:ss"),
        },
      }),
      providesTags: (_r, _e, arg) => [
        { type: "ImpactBatch", id: `${arg.crqNo}-${arg.batchNo}-${arg.flag || "Main"}` },
      ],
      transformErrorResponse: (response) =>
        toErrorMessage(response, "Failed to load impact analysis summary."),
    }),

    // POST /crqworkflow/impactanalysis-script?crqNo=&attempt= - runs the
    // remote script for that attempt/batch; on success the summary above
    // becomes queryable for today's date.
    runImpactAnalysisScript: builder.mutation<ImpactScriptResult, { crqNo: string; attempt: number }>({
      query: ({ crqNo, attempt }) => ({
        url: "/crqworkflow/impactanalysis-script",
        method: "POST",
        params: { crqNo, attempt },
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: "ImpactBatch", id: arg.crqNo }],
      transformErrorResponse: (response) =>
        toErrorMessage(response, "Failed to execute impact analysis script."),
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
  useGetImpactAnalysisSummaryQuery,
  useRunImpactAnalysisScriptMutation,
  useLazyDownloadImpactBatchExcelQuery,
} = impactBatchApiSlice;
