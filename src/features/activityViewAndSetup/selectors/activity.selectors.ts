import type { RootState } from "../../../app/store";

export const selectViewMode = (state: RootState) => state.activity.viewMode;
export const selectActivePhaseTab = (state: RootState) =>
  state.activity.activePhaseTab;
export const selectSnackbar = (state: RootState) => state.activity.snackbar;
export const selectSelectedPlanId = (state: RootState) =>
  state.activity.selectedPlanId;
export const selectSelectedActivityId = (state: RootState) =>
  state.activity.selectedActivityId;
