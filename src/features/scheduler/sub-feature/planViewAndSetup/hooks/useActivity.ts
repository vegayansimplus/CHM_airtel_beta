import { useCallback } from "react";
import {
  setViewMode,
  setActivePhaseTab,
  openPlanDialog,
  closePlanDialog,
  showSnackbar as showSnackbarAction,
  closeSnackbar,
} from "../slices/activity.slice";
import {
  selectViewMode,
  selectActivePhaseTab,
  selectSnackbar,
  selectSelectedPlan,
  selectPlanDialogOpen,
} from "../selectors/activity.selectors";
// import type { PlanViewRow } from "../../api/planApiSlice";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import type { PlanViewRow } from "../api/planApiSlice";

export const useActivity = () => {
  const dispatch = useAppDispatch();

  const viewMode = useAppSelector(selectViewMode);
  const activePhaseTab = useAppSelector(selectActivePhaseTab);
  const snackbar = useAppSelector(selectSnackbar);
  const selectedPlan = useAppSelector(selectSelectedPlan);
  const planDialogOpen = useAppSelector(selectPlanDialogOpen);

  const goToList = useCallback(
    () => dispatch(setViewMode("list")),
    [dispatch]
  );

  const goToCreate = useCallback(
    () => dispatch(setViewMode("create")),
    [dispatch]
  );

  const goToConfigure = useCallback(
    () => dispatch(setViewMode("configure")),
    [dispatch]
  );

  const changePhaseTab = useCallback(
    (tab: string) => dispatch(setActivePhaseTab(tab)),
    [dispatch]
  );

  const handleOpenPlanDialog = useCallback(
    (plan: PlanViewRow) => dispatch(openPlanDialog(plan)),
    [dispatch]
  );

  const handleClosePlanDialog = useCallback(
    () => dispatch(closePlanDialog()),
    [dispatch]
  );

  const handleCloseSnackbar = useCallback(
    () => dispatch(closeSnackbar()),
    [dispatch]
  );

  const handleShowSnackbar = useCallback(
    (message: string, severity: "success" | "error" = "success") =>
      dispatch(showSnackbarAction({ message, severity })),
    [dispatch]
  );

  return {
    // State
    viewMode,
    activePhaseTab,
    snackbar,
    selectedPlan,
    planDialogOpen,
    // Navigation
    goToList,
    goToCreate,
    goToConfigure,
    changePhaseTab,
    // Plan dialog
    handleOpenPlanDialog,
    handleClosePlanDialog,
    // Snackbar
    handleCloseSnackbar,
    handleShowSnackbar,
  };
};