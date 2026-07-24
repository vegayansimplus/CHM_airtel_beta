import { useMemo, useState } from "react";
import { STAGE_ID_TO_ENUM, type WorkflowStageId } from "../../../constants/workflowStages";
import { resolveStageView } from "../utils/attributeUpdate.utils";
import { useGetAttributeUpdateDetailsQuery } from "../api/attributeUpdateApiSlice";

/**
 * Live attribute data for one stage card - only ever called from
 * WorkflowStageCardBody, which itself only mounts once a card is actually
 * open (the current/editable stage immediately, any other stage once the
 * user expands it). Mounting *is* the lazy-load gate here: no skipToken
 * bookkeeping needed since this hook simply isn't instantiated for
 * collapsed/pending cards, so there is no query, no resolveStageView
 * mapping, and no react-hook-form instance paid for up front.
 */
export function useStageAttributeData(stageId: WorkflowStageId, crqNo: string) {
  const cmsStage = STAGE_ID_TO_ENUM[stageId];
  const [remedyStatusIndex, setRemedyStatusIndex] = useState(0);

  const {
    data: details,
    isFetching,
    error: queryError,
  } = useGetAttributeUpdateDetailsQuery({ crqNo, cmsStage });

  const stageView = useMemo(
    () => resolveStageView(stageId, remedyStatusIndex, details, crqNo),
    [stageId, remedyStatusIndex, details, crqNo],
  );

  return {
    cmsStage,
    isLoading: isFetching,
    error: queryError ? "Failed to load attribute details." : null,
    stageView,
    remedyStatusIndex,
    setRemedyStatusIndex,
  };
}
