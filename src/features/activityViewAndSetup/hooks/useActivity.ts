import { useCallback } from "react";
import {
  setViewMode,
  openConfigure,
  setActivePhaseTab,
  showSnackbar,
  closeSnackbar,
} from "../slices/activity.slice";
import {
  selectViewMode,
  selectActivePhaseTab,
  selectSnackbar,
  selectSelectedPlanId,
  selectSelectedActivityId,
} from "../selectors/activity.selectors";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

export const useActivity = () => {
  const dispatch = useAppDispatch();

  const viewMode = useAppSelector(selectViewMode);
  const activePhaseTab = useAppSelector(selectActivePhaseTab);
  const snackbar = useAppSelector(selectSnackbar);
  const selectedPlanId = useAppSelector(selectSelectedPlanId);
  const selectedActivityId = useAppSelector(selectSelectedActivityId);

  const goToList = useCallback(() => dispatch(setViewMode("list")), [dispatch]);
  const goToCreate = useCallback(() => dispatch(setViewMode("create")), [dispatch]);

  const openConfigureFor = useCallback(
    (planId: number, activityId: string) =>
      dispatch(openConfigure({ planId, activityId })),
    [dispatch],
  );

  const changePhaseTab = useCallback(
    (tab: string) => dispatch(setActivePhaseTab(tab)),
    [dispatch],
  );

  const notify = useCallback(
    (message: string, severity: "success" | "error" = "success") =>
      dispatch(showSnackbar({ message, severity })),
    [dispatch],
  );

  const handleCloseSnackbar = useCallback(() => dispatch(closeSnackbar()), [dispatch]);

  return {
    viewMode,
    activePhaseTab,
    snackbar,
    selectedPlanId,
    selectedActivityId,
    goToList,
    goToCreate,
    openConfigureFor,
    changePhaseTab,
    notify,
    handleCloseSnackbar,
  };
};
