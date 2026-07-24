import type { RootState } from "../../../../../app/store";

export const selectAttributeDialogOpen = (state: RootState) =>
  state.attributeUpdate.dialogOpen;
export const selectAttributeCrq = (state: RootState) =>
  state.attributeUpdate.crq;
export const selectSelectedAttributeStageId = (state: RootState) =>
  state.attributeUpdate.selectedStageId;
export const selectAttributeLockedStageId = (state: RootState) =>
  state.attributeUpdate.lockedStageId;
export const selectSelectedRemedyStatusIndex = (state: RootState) =>
  state.attributeUpdate.selectedRemedyStatusIndex;
