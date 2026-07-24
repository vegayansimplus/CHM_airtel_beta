import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import type { Crq } from "../../../types/crqWorkflow.types";
import {
  STAGE_ID_TO_ENUM,
  WORKFLOW_STAGES,
  resolveCurrentStageIndex,
  type WorkflowStageId,
} from "../../../constants/workflowStages";
import {
  closeAttributeUpdateDialog,
  goToNextAttributeStage,
  goToPreviousAttributeStage,
  openAttributeUpdateDialog,
  selectAttributeStage,
  selectRemedyStatusIndex,
} from "../slices/attributeUpdate.slice";
import {
  selectAttributeCrq,
  selectAttributeDialogOpen,
  selectAttributeLockedStageId,
  selectSelectedAttributeStageId,
  selectSelectedRemedyStatusIndex,
} from "../selectors/attributeUpdate.selectors";
import { buildAttributeCrqContext, resolveStageView } from "../utils/attributeUpdate.utils";
import { CMS_STAGE_SCHEMAS } from "../constants/attributeUpdateFieldCatalog";
import { useGetAttributeUpdateDetailsQuery } from "../api/attributeUpdateApiSlice";

/**
 * Launcher hook for pages hosting the "Attribute Update" action button.
 * Subscribes to no state, so the hosting page never re-renders on dialog
 * interactions — it only dispatches the dialog-open action; live data is
 * fetched reactively by useAttributeUpdate() via RTK Query once open.
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
    },
    [dispatch],
  );
}

const STAGE_LIST = CMS_STAGE_SCHEMAS.map(({ id, label, shortLabel }) => ({
  id,
  label,
  shortLabel,
}));

/** State + handlers consumed by the Attribute Update dialog components. */
export function useAttributeUpdate() {
  const dispatch = useAppDispatch();

  const dialogOpen = useAppSelector(selectAttributeDialogOpen);
  const crq = useAppSelector(selectAttributeCrq);
  const selectedStageId = useAppSelector(selectSelectedAttributeStageId);
  const lockedStageId = useAppSelector(selectAttributeLockedStageId);
  const selectedRemedyStatusIndex = useAppSelector(selectSelectedRemedyStatusIndex);

  const selectedStageIndex = CMS_STAGE_SCHEMAS.findIndex((s) => s.id === selectedStageId);
  const cmsStage = STAGE_ID_TO_ENUM[selectedStageId];

  const {
    data: details,
    isFetching,
    error: queryError,
  } = useGetAttributeUpdateDetailsQuery(
    dialogOpen && crq && cmsStage ? { crqNo: crq.crqNo, cmsStage } : skipToken,
  );

  const stageView = useMemo(
    () =>
      crq
        ? resolveStageView(selectedStageId, selectedRemedyStatusIndex, details, crq.crqNo)
        : null,
    [selectedStageId, selectedRemedyStatusIndex, details, crq],
  );

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
    isLoading: isFetching,
    error: queryError ? "Failed to load attribute details." : null,
    stageList: STAGE_LIST,
    selectedStageIndex,
    cmsStage,
    isStageLocked: lockedStageId !== null,
    stageView,
    close,
    selectStage,
    selectRemedyStatus,
    goToNextStage,
    goToPreviousStage,
  };
}
