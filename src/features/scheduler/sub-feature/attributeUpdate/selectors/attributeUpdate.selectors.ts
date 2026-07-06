import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../../../app/store";
import { resolveStageView } from "../utils/attributeUpdate.utils";

const selectAttributeUpdateRoot = (state: RootState) => state.attributeUpdate;

export const selectAttributeDialogOpen = (state: RootState) =>
  state.attributeUpdate.dialogOpen;
export const selectAttributeCrq = (state: RootState) =>
  state.attributeUpdate.crq;
export const selectAttributeSchema = (state: RootState) =>
  state.attributeUpdate.schema;
export const selectAttributeLoading = (state: RootState) =>
  state.attributeUpdate.isLoading;
export const selectAttributeError = (state: RootState) =>
  state.attributeUpdate.error;
export const selectSelectedAttributeStageId = (state: RootState) =>
  state.attributeUpdate.selectedStageId;
export const selectAttributeLockedStageId = (state: RootState) =>
  state.attributeUpdate.lockedStageId;
export const selectSelectedRemedyStatusIndex = (state: RootState) =>
  state.attributeUpdate.selectedRemedyStatusIndex;

/** Stepper descriptors: id + short label for each stage of the loaded schema. */
export const selectAttributeStageList = createSelector(
  [selectAttributeSchema],
  (schema) =>
    schema?.stages.map(({ id, label, shortLabel }) => ({
      id,
      label,
      shortLabel,
    })) ?? [],
);

/** Index of the selected stage within the schema's stage order. */
export const selectSelectedAttributeStageIndex = createSelector(
  [selectAttributeSchema, selectSelectedAttributeStageId],
  (schema, stageId) =>
    schema ? schema.stages.findIndex((s) => s.id === stageId) : -1,
);

/**
 * Fully resolved view-model of the selected stage (attributes per system,
 * planning-tool scope filtering, auto-set values). Memoized so components
 * re-render only when the underlying slice state changes.
 */
export const selectSelectedStageView = createSelector(
  [selectAttributeUpdateRoot],
  ({ schema, selectedStageId, selectedRemedyStatusIndex }) =>
    resolveStageView(schema, selectedStageId, selectedRemedyStatusIndex),
);
