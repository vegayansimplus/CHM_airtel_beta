import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "../../../app/hooks";
// ↑ Uncomment when wired into your Redux store. Using local shims below for portability.
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  setSelectedCrqId,
  toggleLegend,
  fetchCrqJourney,
  resetJourney,
} from "../slices/crqJourney.slice";

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCrqJourney = () => {
  const dispatch = useAppDispatch();
  const { selectedCrqId, showLegend, isLoading, error, data } = useAppSelector(
    (s) => s.crqJourney
  );

  // Auto-fetch when a CRQ is selected
  useEffect(() => {
    if (selectedCrqId) {
      dispatch(fetchCrqJourney(selectedCrqId));
    }
  }, [selectedCrqId, dispatch]);

  const handleSelectCrq = (id: string | null) => {
    dispatch(setSelectedCrqId(id));
  };

  const handleToggleLegend = () => {
    dispatch(toggleLegend());
  };

  const handleReset = () => {
    dispatch(resetJourney());
  };

  return {
    selectedCrqId,
    showLegend,
    isLoading,
    error,
    data,
    handleSelectCrq,
    handleToggleLegend,
    handleReset,
  };
};
