import { useCallback } from "react";
import {
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
  openPlanDialog,   // ← import new
  closePlanDialog,  // ← import new
} from "../slices/activity.slice";
import {
  selectFilteredActivities,
  selectPaginatedActivities,
  selectTotalPages,
  selectTotalCount,
  selectSelectedActivity,
  selectFilters,
  selectCurrentPage,
  selectViewMode,
  selectActivePhaseTab,
  selectSnackbar,
  selectActivityStats,
  selectSelectedPlan,      // ← import new
  selectPlanDialogOpen,    // ← import new
} from "../selectors/activity.selectors";
import type { ActivityFilters, ActivityPhases, ActivityStatus } from "../types/activity.types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { PlanViewRow } from "../../scheduler/sub-feature/planViewAndSetup/api/planApiSlice";
// import type { PlanViewRow } from "../../api/planApiSlice";
// import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";

export const useActivity = () => {
  const dispatch = useAppDispatch();

  const paginatedActivities = useAppSelector(selectPaginatedActivities);
  const filteredActivities = useAppSelector(selectFilteredActivities);
  const filters = useAppSelector(selectFilters);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const totalCount = useAppSelector(selectTotalCount);
  const selectedActivity = useAppSelector(selectSelectedActivity);
  const viewMode = useAppSelector(selectViewMode);
  const activePhaseTab = useAppSelector(selectActivePhaseTab);
  const snackbar = useAppSelector(selectSnackbar);
  const stats = useAppSelector(selectActivityStats);
  const selectedPlan = useAppSelector(selectSelectedPlan);       // ← new
  const planDialogOpen = useAppSelector(selectPlanDialogOpen);   // ← new

  const goToList = useCallback(() => dispatch(setViewMode("list")), [dispatch]);
  const goToCreate = useCallback(() => dispatch(setViewMode("create")), [dispatch]);

  const openConfigure = useCallback(
    (payload: any) => dispatch(selectActivity(payload)),
    [dispatch]
  );

  const changePhaseTab = useCallback(
    (tab: string) => dispatch(setActivePhaseTab(tab)),
    [dispatch]
  );
  const updateFilters = useCallback(
    (partial: Partial<ActivityFilters>) => dispatch(setFilters(partial)),
    [dispatch]
  );
  const clearFilters = useCallback(() => dispatch(resetFilters()), [dispatch]);
  const changePage = useCallback(
    (page: number) => dispatch(setCurrentPage(page)),
    [dispatch]
  );
  const handleUpdateStatus = useCallback(
    (id: string, status: ActivityStatus) =>
      dispatch(updateActivityStatus({ id, status })),
    [dispatch]
  );
  const handleDelete = useCallback(
    (id: string) => dispatch(deleteActivity(id)),
    [dispatch]
  );
  const handleSavePhase = useCallback(
    (
      activityId: string,
      phaseKey: keyof ActivityPhases,
      data: Partial<ActivityPhases[keyof ActivityPhases]>
    ) => dispatch(savePhase({ activityId, phaseKey, data })),
    [dispatch]
  );
  const handleCloseSnackbar = useCallback(
    () => dispatch(closeSnackbar()),
    [dispatch]
  );

  // ── Plan dialog ──────────────────────────────────────────────────────────
  const handleOpenPlanDialog = useCallback(
    (plan: PlanViewRow) => dispatch(openPlanDialog(plan)),
    [dispatch]
  );
  const handleClosePlanDialog = useCallback(
    () => dispatch(closePlanDialog()),
    [dispatch]
  );
  // ────────────────────────────────────────────────────────────────────────

  return {
    paginatedActivities,
    filteredActivities,
    filters,
    currentPage,
    totalPages,
    totalCount,
    selectedActivity,
    viewMode,
    activePhaseTab,
    snackbar,
    stats,
    selectedPlan,         // ← new
    planDialogOpen,       // ← new
    goToList,
    goToCreate,
    openConfigure,
    changePhaseTab,
    updateFilters,
    clearFilters,
    changePage,
    handleUpdateStatus,
    handleDelete,
    handleSavePhase,
    handleCloseSnackbar,
    handleOpenPlanDialog,   // ← new
    handleClosePlanDialog,  // ← new
  };
};