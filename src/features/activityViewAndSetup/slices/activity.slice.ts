import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ViewMode = "list" | "create" | "configure";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface ActivityState {
  viewMode: ViewMode;
  activePhaseTab: string;
  selectedPlanId: number | null;
  selectedActivityId: string | null;
  snackbar: SnackbarState;
}

const initialState: ActivityState = {
  viewMode: "list",
  activePhaseTab: "review",
  selectedPlanId: null,
  selectedActivityId: null,
  snackbar: { open: false, message: "", severity: "success" },
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
      if (action.payload === "list") {
        state.selectedPlanId = null;
        state.selectedActivityId = null;
        state.activePhaseTab = "review";
      }
    },

    openConfigure(
      state,
      action: PayloadAction<{ planId: number; activityId: string }>,
    ) {
      state.selectedPlanId = action.payload.planId;
      state.selectedActivityId = action.payload.activityId;
      state.viewMode = "configure";
      state.activePhaseTab = "review";
    },

    setActivePhaseTab(state, action: PayloadAction<string>) {
      state.activePhaseTab = action.payload;
    },

    showSnackbar(
      state,
      action: PayloadAction<{ message: string; severity: "success" | "error" }>,
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
  openConfigure,
  setActivePhaseTab,
  showSnackbar,
  closeSnackbar,
} = activitySlice.actions;

export default activitySlice.reducer;
