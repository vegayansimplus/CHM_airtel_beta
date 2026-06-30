import { api } from "../../../service/api";
import { STAGE_CONFIG_MAP } from "../constants/stageConfig";
import type { CrqReviewResponse } from "../types/crqWorkflow.types";
import type { StageActionParams, StageDonePayload, StageKey } from "../types/stageWorkflow.types";

export const stageWorkflowApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getStageData: builder.query<
      CrqReviewResponse,
      { stageKey: StageKey; domainId: number; subDomainId: number }
    >({
      query: ({ stageKey, domainId, subDomainId }) => ({
        url: STAGE_CONFIG_MAP[stageKey].reviewQueryUrl,
        method: "GET",
        params: { domainId, subDomainId },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "StageWorkflow", id: arg.stageKey },
      ],
    }),

    // POST /crqworkflow/{endpointBase}/start|pause?crqNo=&crqId=
    updateStageStatus: builder.mutation<
      { message?: string },
      StageActionParams & { stageKey: StageKey; action: "start" | "pause" }
    >({
      query: ({ stageKey, crqNo, crqId, action }) => ({
        url: `/crqworkflow/${STAGE_CONFIG_MAP[stageKey].endpointBase}/${action}`,
        method: "POST",
        params: { crqNo, crqId },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "StageWorkflow", id: arg.stageKey },
      ],
    }),

    // POST /crqworkflow/{endpointBase}/done?<stage specific params>
    submitStageDone: builder.mutation<
      { message?: string },
      StageDonePayload & { stageKey: StageKey }
    >({
      query: ({ stageKey, ...params }) => ({
        url: `/crqworkflow/${STAGE_CONFIG_MAP[stageKey].endpointBase}/done`,
        method: "POST",
        params,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "StageWorkflow", id: arg.stageKey },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStageDataQuery,
  useUpdateStageStatusMutation,
  useSubmitStageDoneMutation,
} = stageWorkflowApiSlice;
