import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import { PAGE_SIZE } from "../data/activity.mock";

// ─────────────────────────────────────────────
//  Base Selectors
// ─────────────────────────────────────────────

const selectActivityState = (state: RootState) => state.activity;

export const selectAllActivities = (state: RootState) =>
  state.activity.activities;

export const selectFilters = (state: RootState) => state.activity.filters;
export const selectCurrentPage = (state: RootState) =>
  state.activity.currentPage;
export const selectViewMode = (state: RootState) => state.activity.viewMode;
export const selectActivePhaseTab = (state: RootState) =>
  state.activity.activePhaseTab;
export const selectSnackbar = (state: RootState) => state.activity.snackbar;

export const selectSelectedActivityId = (state: RootState) =>
  state.activity.selectedActivityId;

// ─────────────────────────────────────────────
//  Derived Selectors (memoised)
// ─────────────────────────────────────────────

export const selectFilteredActivities = createSelector(
  selectAllActivities,
  selectFilters,
  (activities, filters) => {
    return activities.filter((a) => {
      const matchSearch =
        !filters.search ||
        a.activityName.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.vendorOEM.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.domain.toLowerCase().includes(filters.search.toLowerCase());

      const matchDomain = !filters.domain || a.domain === filters.domain;
      const matchStatus = !filters.status || a.status === filters.status;
      const matchImpact =
        !filters.changeImpact || a.changeImpact === filters.changeImpact;

      return matchSearch && matchDomain && matchStatus && matchImpact;
    });
  }
);

export const selectPaginatedActivities = createSelector(
  selectFilteredActivities,
  selectCurrentPage,
  (filtered, page) => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }
);

export const selectTotalPages = createSelector(
  selectFilteredActivities,
  (filtered) => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
);

export const selectTotalCount = createSelector(
  selectFilteredActivities,
  (f) => f.length
);

export const selectSelectedActivity = createSelector(
  selectAllActivities,
  selectSelectedActivityId,
  (activities, id) => activities.find((a) => a.id === id) ?? null
);

// ── Stats for summary cards ─────────────────────────────────────────────────
export const selectActivityStats = createSelector(
  selectAllActivities,
  (activities) => ({
    total: activities.length,
    active: activities.filter((a) => a.status === "Active").length,
    draft: activities.filter((a) => a.status === "Draft").length,
    pending: activities.filter((a) => a.status === "Pending").length,
    highImpact: activities.filter((a) => a.changeImpact === "High").length,
  })
);

export const selectSelectedPlan = (state: RootState) =>
  state.activity.selectedPlan;

export const selectPlanDialogOpen = (state: RootState) =>
  state.activity.planDialogOpen;
