import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Activity,
  ActivityPhases,
  ActivityFilters,
  ActivityStatus,
} from "../types/activity.types";

interface ActivityState {
  activities: Activity[];
  selectedActivityId: string | null;
  filters: ActivityFilters;
  currentPage: number;
  activePhaseTab: string;
  viewMode: "list" | "create" | "configure";
  snackbar: { open: boolean; message: string; severity: "success" | "error" };
}

const initialFilters: ActivityFilters = {
  search: "",
  domain: "",
  status: "",
  changeImpact: "",
};

const initialState: ActivityState = {
  activities: [], // 🚀 CLEAN START, NO MOCK DATA
  selectedActivityId: null,
  filters: initialFilters,
  currentPage: 1,
  activePhaseTab: "review",
  viewMode: "list",
  snackbar: { open: false, message: "", severity: "success" },
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ActivityState["viewMode"]>) {
      state.viewMode = action.payload;
      if (action.payload === "list") {
        state.selectedActivityId = null;
        state.activePhaseTab = "review";
      }
    },

    selectActivity(state, action: PayloadAction<any>) {
      const row = action.payload;
      if (!row || typeof row !== "object") return;

      const id = String(row.activityId || row.id);
      const exists = state.activities.find((a) => String(a.id) === id);

      // If Redux doesn't have this activity's phases tracked yet, track it now:
      if (!exists) {
        state.activities.push({
          id: id,
          activityName: row.activityName,
          chmDomain: row.chmDomain ?? "—",
          chmSubDomain: row.chmSubDomain ?? "—",
          domain: row.domain ?? "—",
          layer: row.layer ?? "—",
          planType: row.planType ?? "—",
          vendorOEM: row.vendorOem || row.vendorOEM || "—",
          changeImpact: row.changeImpact ?? "—",
          status: row.status || "Draft",
          createdAt: row.createdAt || new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          // Ensure phase forms don't crash
          phases: {
            review: {
              crqReviewShift: "",
              crqReviewMinLevel: "",
              crqReviewTimeMinutes: "",
            },
            impactAnalysis: {
              impactAnalysisShift: "",
              impactAnalysisMinLevel: "",
              impactAnalysisTimeMinutes: "",
            },
            scheduling: {
              schedulingShift: "",
              schedulingLevel: "",
              schedulingDurationMinutes: "",
            },
            mopCreation: {
              mopCreationShift: "",
              mopCreationMinLevel: "",
              mopCreationTimeMinutes: "",
            },
            mopValidation: {
              mopValidationShift: "",
              mopValidationMinLevel: "",
              mopValidationTimeMinutes: "",
            },
            execution: {
              activityNWExecShift: "",
              daysMargin: "",
              reservationMargin: "",
              activityTimeMinutes: "",
              executionMinLevel: "",
              rollbackTimeMinutes: "",
            },
          },
        } as Activity);
      }

      state.selectedActivityId = id;
      state.viewMode = "configure";
      state.activePhaseTab = "review";
    },

    setActivePhaseTab(state, action: PayloadAction<string>) {
      state.activePhaseTab = action.payload;
    },

    setFilters(state, action: PayloadAction<Partial<ActivityFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },

    resetFilters(state) {
      state.filters = initialFilters;
      state.currentPage = 1;
    },

    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },

    savePhase(
      state,
      action: PayloadAction<{
        activityId: string;
        phaseKey: keyof ActivityPhases;
        data: Partial<ActivityPhases[keyof ActivityPhases]>;
      }>,
    ) {
      const idx = state.activities.findIndex(
        (a) => String(a.id) === String(action.payload.activityId),
      );
      if (idx !== -1) {
        (state.activities[idx].phases as any)[action.payload.phaseKey] = {
          ...(state.activities[idx].phases as any)[action.payload.phaseKey],
          ...action.payload.data,
        };
        state.activities[idx].updatedAt = new Date()
          .toISOString()
          .split("T")[0];

        if (state.activities[idx].status === "Draft") {
          state.activities[idx].status = "Pending";
        }
        state.snackbar = {
          open: true,
          message: "Phase saved successfully!",
          severity: "success",
        };
      }
    },

    updateActivityStatus(
      state,
      action: PayloadAction<{ id: string; status: ActivityStatus }>,
    ) {
      const idx = state.activities.findIndex(
        (a) => String(a.id) === String(action.payload.id),
      );
      if (idx !== -1) {
        state.activities[idx].status = action.payload.status;
        state.activities[idx].updatedAt = new Date()
          .toISOString()
          .split("T")[0];
      }
    },

    // Kept to avoid breaking table UI
    deleteActivity(state, action: PayloadAction<string>) {
      state.activities = state.activities.filter(
        (a) => String(a.id) !== String(action.payload),
      );
      state.snackbar = {
        open: true,
        message: "Activity deleted locally.",
        severity: "success",
      };
    },

    closeSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const {
  setViewMode,
  selectActivity,
  setActivePhaseTab,
  setFilters,
  resetFilters,
  setCurrentPage,
  updateActivityStatus,
  deleteActivity,
  savePhase,
  closeSnackbar,
} = activitySlice.actions;

export default activitySlice.reducer;
