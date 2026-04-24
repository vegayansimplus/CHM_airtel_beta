import type { RootState } from "../../../../../app/store";

export const selectViewMode = (state: RootState) => state.activity.viewMode;
export const selectActivePhaseTab = (state: RootState) => state.activity.activePhaseTab;
export const selectSnackbar = (state: RootState) => state.activity.snackbar;
export const selectSelectedPlan = (state: RootState) => state.activity.selectedPlan;
export const selectPlanDialogOpen = (state: RootState) => state.activity.planDialogOpen;