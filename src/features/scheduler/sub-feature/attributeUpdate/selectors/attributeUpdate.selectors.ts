import type { RootState } from "../../../../../app/store";

export const selectAttributeDialogOpen = (state: RootState) =>
  state.attributeUpdate.dialogOpen;
export const selectAttributeCrq = (state: RootState) =>
  state.attributeUpdate.crq;
export const selectAttributeCurrentStageId = (state: RootState) =>
  state.attributeUpdate.currentStageId;
export const selectAttributeCrqStatus = (state: RootState) =>
  state.attributeUpdate.crqStatus;
export const selectAttributeStageMeta = (state: RootState) =>
  state.attributeUpdate.stageMeta;
