import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Activity,
  ActivityPhases,
  ActivityFilters,
  CreateActivityForm,
  ActivityStatus,
} from "../types/activity.types";
import { MOCK_ACTIVITIES, PAGE_SIZE } from "../data/activity.mock";

// ─────────────────────────────────────────────
//  State Shape
// ─────────────────────────────────────────────

interface ActivityState {
  activities: Activity[];
  selectedActivityId: string | null;
  filters: ActivityFilters;
  currentPage: number;
  activePhaseTab: string;
  // UI mode: list | create | configure
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
  activities: MOCK_ACTIVITIES,
  selectedActivityId: null,
  filters: initialFilters,
  currentPage: 1,
  activePhaseTab: "review",
  viewMode: "list",
  snackbar: { open: false, message: "", severity: "success" },
};

// ─────────────────────────────────────────────
//  Slice
// ─────────────────────────────────────────────

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    // ── Navigation ──────────────────────────────────────────────────────────
    setViewMode(state, action: PayloadAction<ActivityState["viewMode"]>) {
      state.viewMode = action.payload;
      if (action.payload === "list") {
        state.selectedActivityId = null;
        state.activePhaseTab = "review";
      }
    },

    selectActivity(state, action: PayloadAction<string>) {
      state.selectedActivityId = action.payload;
      state.viewMode = "configure";
      state.activePhaseTab = "review";
    },

    setActivePhaseTab(state, action: PayloadAction<string>) {
      state.activePhaseTab = action.payload;
    },

    // ── Filters & Pagination ────────────────────────────────────────────────
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

    // ── CRUD ────────────────────────────────────────────────────────────────
    createActivity(state, action: PayloadAction<CreateActivityForm>) {
      const newActivity: Activity = {
        ...action.payload,
        id: `ACT-${String(state.activities.length + 1).padStart(3, "0")}`,
        status: "Draft",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        phases: {
          review: { crqReviewShift: "", crqReviewMinLevel: "", crqReviewTimeMinutes: "" },
          impactAnalysis: { impactAnalysisShift: "", impactAnalysisMinLevel: "", impactAnalysisTimeMinutes: "" },
          scheduling: { schedulingShift: "", schedulingLevel: "", schedulingDurationMinutes: "" },
          mopCreation: { mopCreationShift: "", mopCreationMinLevel: "", mopCreationTimeMinutes: "" },
          mopValidation: { mopValidationShift: "", mopValidationMinLevel: "", mopValidationTimeMinutes: "" },
          execution: { activityNWExecShift: "", daysMargin: "", reservationMargin: "", activityTimeMinutes: "", executionMinLevel: "", rollbackTimeMinutes: "" },
        },
      };
      state.activities.push(newActivity);
      state.selectedActivityId = newActivity.id;
      state.viewMode = "configure";
      state.activePhaseTab = "review";
      state.snackbar = { open: true, message: "Activity created successfully!", severity: "success" };
    },

    updateActivityStatus(
      state,
      action: PayloadAction<{ id: string; status: ActivityStatus }>
    ) {
      const idx = state.activities.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.activities[idx].status = action.payload.status;
        state.activities[idx].updatedAt = new Date().toISOString().split("T")[0];
      }
    },

    deleteActivity(state, action: PayloadAction<string>) {
      state.activities = state.activities.filter((a) => a.id !== action.payload);
      if (state.selectedActivityId === action.payload) {
        state.selectedActivityId = null;
        state.viewMode = "list";
      }
      state.snackbar = { open: true, message: "Activity deleted.", severity: "success" };
    },

    savePhase(
      state,
      action: PayloadAction<{
        activityId: string;
        phaseKey: keyof ActivityPhases;
        data: Partial<ActivityPhases[keyof ActivityPhases]>;
      }>
    ) {
      const idx = state.activities.findIndex(
        (a) => a.id === action.payload.activityId
      );
      if (idx !== -1) {
        (state.activities[idx].phases as any)[action.payload.phaseKey] = {
          ...(state.activities[idx].phases as any)[action.payload.phaseKey],
          ...action.payload.data,
        };
        state.activities[idx].updatedAt = new Date().toISOString().split("T")[0];
        // Promote Draft → Pending if first phase saved
        if (state.activities[idx].status === "Draft") {
          state.activities[idx].status = "Pending";
        }
        state.snackbar = { open: true, message: "Phase saved successfully!", severity: "success" };
      }
    },

    // ── Snackbar ────────────────────────────────────────────────────────────
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
  createActivity,
  updateActivityStatus,
  deleteActivity,
  savePhase,
  closeSnackbar,
} = activitySlice.actions;

export default activitySlice.reducer;
