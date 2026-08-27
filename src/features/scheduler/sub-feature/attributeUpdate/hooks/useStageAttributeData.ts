import { useMemo, useState } from "react";
import { useAppSelector } from "../../../../../app/hooks";
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

  // Stamped into the "...Done By" / "...Executed By" fields: whoever is signed
  // in is who performed the step, so those are auto-set rather than typed.
  const currentUserOlmId = useAppSelector((s) => s.auth.user?.olmId ?? "");

  const {
    data: details,
    isFetching,
    error: queryError,
  } = useGetAttributeUpdateDetailsQuery({ crqNo, cmsStage });

  const stageView = useMemo(
    () => resolveStageView(stageId, remedyStatusIndex, details, crqNo, currentUserOlmId),
    [stageId, remedyStatusIndex, details, crqNo, currentUserOlmId],
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
