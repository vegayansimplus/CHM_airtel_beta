import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
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
} from "../selectors/activity.selectors";
import type {
  ActivityFilters,
  CreateActivityForm,
  ActivityPhases,
  ActivityStatus,
} from "../types/activity.types";

// ─────────────────────────────────────────────
//  Primary hook — combines all activity state
// ─────────────────────────────────────────────

export const useActivity = () => {
  const dispatch = useAppDispatch();

  // ── Selectors ────────────────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  const goToList = useCallback(() => dispatch(setViewMode("list")), [dispatch]);
  const goToCreate = useCallback(() => dispatch(setViewMode("create")), [dispatch]);

  const openConfigure = useCallback(
    (id: string) => dispatch(selectActivity(id)),
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

  const handleCreate = useCallback(
    (form: CreateActivityForm) => dispatch(createActivity(form)),
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

  return {
    // State
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

    // Actions
    goToList,
    goToCreate,
    openConfigure,
    changePhaseTab,
    updateFilters,
    clearFilters,
    changePage,
    handleCreate,
    handleUpdateStatus,
    handleDelete,
    handleSavePhase,
    handleCloseSnackbar,
  };
};
