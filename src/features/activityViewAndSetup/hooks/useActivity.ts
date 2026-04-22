import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
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
  ActivityPhases,
  ActivityStatus,
} from "../types/activity.types";

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

  const goToList = useCallback(() => dispatch(setViewMode("list")), [dispatch]);
  const goToCreate = useCallback(
    () => dispatch(setViewMode("create")),
    [dispatch],
  );

  // Pass ANY object into Redux to track it
  const openConfigure = useCallback(
    (payload: any) => dispatch(selectActivity(payload)),
    [dispatch],
  );

  const changePhaseTab = useCallback(
    (tab: string) => dispatch(setActivePhaseTab(tab)),
    [dispatch],
  );
  const updateFilters = useCallback(
    (partial: Partial<ActivityFilters>) => dispatch(setFilters(partial)),
    [dispatch],
  );
  const clearFilters = useCallback(() => dispatch(resetFilters()), [dispatch]);
  const changePage = useCallback(
    (page: number) => dispatch(setCurrentPage(page)),
    [dispatch],
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: ActivityStatus) =>
      dispatch(updateActivityStatus({ id, status })),
    [dispatch],
  );
  const handleDelete = useCallback(
    (id: string) => dispatch(deleteActivity(id)),
    [dispatch],
  );

  const handleSavePhase = useCallback(
    (
      activityId: string,
      phaseKey: keyof ActivityPhases,
      data: Partial<ActivityPhases[keyof ActivityPhases]>,
    ) => dispatch(savePhase({ activityId, phaseKey, data })),
    [dispatch],
  );

  const handleCloseSnackbar = useCallback(
    () => dispatch(closeSnackbar()),
    [dispatch],
  );

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" = "success") => {
      // If you have a showSnackbar action, add it here. Otherwise rely on savePhase's built in snackbar.
    },
    [],
  );

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
    showSnackbar,
  };
};
