import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import type { Crq } from "../../../types/crqWorkflow.types";
import {
  WORKFLOW_STAGES,
  resolveCurrentStageIndex,
  type WorkflowStageId,
} from "../../../constants/workflowStages";
import {
  closeAttributeUpdateDialog,
  fetchCrqAttributeSchema,
  goToNextAttributeStage,
  goToPreviousAttributeStage,
  openAttributeUpdateDialog,
  selectAttributeStage,
  selectRemedyStatusIndex,
} from "../slices/attributeUpdate.slice";
import {
  selectAttributeCrq,
  selectAttributeDialogOpen,
  selectAttributeError,
  selectAttributeLoading,
  selectAttributeLockedStageId,
  selectAttributeStageList,
  selectSelectedAttributeStageIndex,
  selectSelectedStageView,
} from "../selectors/attributeUpdate.selectors";
import { buildAttributeCrqContext } from "../utils/attributeUpdate.utils";

/**
 * Launcher hook for pages hosting the "Attribute Update" action button.
 * Subscribes to no state, so the hosting page never re-renders on dialog
 * interactions — it only dispatches open + schema fetch for the CRQ.
 *
 * Pass `stageId` (the hosting tab's stage) to lock the dialog to that single
 * stage; omit it to open in free-browsing mode starting at the CRQ's current
 * workflow stage.
 */
export function useOpenAttributeUpdate() {
  const dispatch = useAppDispatch();

  return useCallback(
    (crq: Crq, stageId?: WorkflowStageId) => {
      const context = buildAttributeCrqContext(crq);
      const initialStageId =
        stageId ?? WORKFLOW_STAGES[resolveCurrentStageIndex(crq)]?.id;
      dispatch(
        openAttributeUpdateDialog({
          crq: context,
          initialStageId,
          lockToStage: !!stageId,
        }),
      );
      void dispatch(fetchCrqAttributeSchema(context.crqNo));
    },
    [dispatch],
  );
}

/** State + handlers consumed by the Attribute Update dialog components. */
export function useAttributeUpdate() {
  const dispatch = useAppDispatch();

  const dialogOpen = useAppSelector(selectAttributeDialogOpen);
  const crq = useAppSelector(selectAttributeCrq);
  const isLoading = useAppSelector(selectAttributeLoading);
  const error = useAppSelector(selectAttributeError);
  const stageList = useAppSelector(selectAttributeStageList);
  const selectedStageIndex = useAppSelector(selectSelectedAttributeStageIndex);
  const lockedStageId = useAppSelector(selectAttributeLockedStageId);
  const stageView = useAppSelector(selectSelectedStageView);

  const close = useCallback(
    () => dispatch(closeAttributeUpdateDialog()),
    [dispatch],
  );
  const selectStage = useCallback(
    (stageId: WorkflowStageId) => dispatch(selectAttributeStage(stageId)),
    [dispatch],
  );
  const selectRemedyStatus = useCallback(
    (index: number) => dispatch(selectRemedyStatusIndex(index)),
    [dispatch],
  );
  const goToNextStage = useCallback(
    () => dispatch(goToNextAttributeStage()),
    [dispatch],
  );
  const goToPreviousStage = useCallback(
    () => dispatch(goToPreviousAttributeStage()),
    [dispatch],
  );

  return {
    dialogOpen,
    crq,
    isLoading,
    error,
    stageList,
    selectedStageIndex,
    isStageLocked: lockedStageId !== null,
    stageView,
    close,
    selectStage,
    selectRemedyStatus,
    goToNextStage,
    goToPreviousStage,
  };
}
