import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlanViewRow } from "../api/planApiSlice";


interface ActivityState {
  viewMode: "list" | "create" | "configure";
  activePhaseTab: string;
  snackbar: { open: boolean; message: string; severity: "success" | "error" };
  // Plan dialog
  selectedPlan: PlanViewRow | null;
  planDialogOpen: boolean;
  // Add Plan dialog
  addPlanDialogOpen: boolean;
}

const initialState: ActivityState = {
  viewMode: "list",
  activePhaseTab: "review",
  snackbar: { open: false, message: "", severity: "success" },
  selectedPlan: null,
  planDialogOpen: false,
  addPlanDialogOpen: false,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ActivityState["viewMode"]>) {
      state.viewMode = action.payload;
      if (action.payload === "list") {
        state.activePhaseTab = "review";
      }
    },

    setActivePhaseTab(state, action: PayloadAction<string>) {
      state.activePhaseTab = action.payload;
    },

    openPlanDialog(state, action: PayloadAction<PlanViewRow>) {
      state.selectedPlan = action.payload;
      state.planDialogOpen = true;
    },

    closePlanDialog(state) {
      state.planDialogOpen = false;
      state.selectedPlan = null;
    },

    openAddPlanDialog(state) {
      state.addPlanDialogOpen = true;
    },

    closeAddPlanDialog(state) {
      state.addPlanDialogOpen = false;
    },

    showSnackbar(
      state,
      action: PayloadAction<{ message: string; severity: "success" | "error" }>
    ) {
      state.snackbar = { open: true, ...action.payload };
    },

    closeSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const {
  setViewMode,
  setActivePhaseTab,
  openPlanDialog,
  closePlanDialog,
  openAddPlanDialog,
  closeAddPlanDialog,
  showSnackbar,
  closeSnackbar,
} = activitySlice.actions;

export default activitySlice.reducer;