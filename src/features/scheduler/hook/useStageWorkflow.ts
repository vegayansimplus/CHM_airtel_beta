import { useCallback } from "react";
import { toast } from "react-toastify";
import { getStageConfig } from "../constants/stageConfig";
import {
  useUpdateStageStatusMutation,
  useSubmitStageDoneMutation,
} from "../api/stageWorkflowApiSlice";
import type { StageKey } from "../types/stageWorkflow.types";

const TOAST_OPTS = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};


export const useStageWorkflow = (stageKey: StageKey) => {
  const stageConfig = getStageConfig(stageKey);
  const [updateStageStatus, { isLoading: isTogglingStatus }] =
    useUpdateStageStatusMutation();
  const [submitStageDone, { isLoading: isSubmittingDone }] =
    useSubmitStageDoneMutation();

  const toggleStartPause = useCallback(
    async (crq: any) => {
      try {
        const isRunning = crq?.[stageConfig.statusField] === "In Progress";
        const action = isRunning ? "pause" : "start";

        const response = await updateStageStatus({
          stageKey,
          crqNo: crq.crqNo,
          crqId: crq.crqId,
          action,
        }).unwrap();

        toast.success(
          response?.message || `${stageConfig.label} updated successfully.`,
          TOAST_OPTS,
        );

        return { success: true, nextStatus: isRunning ? "Paused" : "In Progress" };
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            `Failed to update ${stageConfig.label}. Please try again.`,
        );
        return { success: false, nextStatus: null };
      }
    },
    [stageKey, stageConfig, updateStageStatus],
  );

  const submitDone = useCallback(
    async (formValues: Record<string, any>, crq: any) => {
      try {
        const payload = stageConfig.buildDonePayload(formValues, crq);
        const response = await submitStageDone({
          stageKey,
          ...payload,
        } as any).unwrap();

        toast.success(
          response?.message || `${stageConfig.label} submitted for ${crq?.crqNo}.`,
        );
        return { success: true };
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            `Submission failed for ${stageConfig.label}. Please try again.`,
        );
        return { success: false };
      }
    },
    [stageKey, stageConfig, submitStageDone],
  );

  return {
    stageConfig,
    toggleStartPause,
    submitDone,
    isTogglingStatus,
    isSubmittingDone,
  };
};
