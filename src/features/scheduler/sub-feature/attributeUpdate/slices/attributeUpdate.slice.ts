import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AttributeUpdateCrqContext,
  AttributeUpdateState,
} from "../types/attributeUpdate.types";
import type { WorkflowStageId } from "../../../constants/workflowStages";
import { CMS_STAGE_ORDER } from "../constants/attributeUpdate.constants";

/**
 * UI-only state for the Attribute Update dialog (which CRQ/stage is open,
 * navigation lock). The field catalog is static config
 * (constants/attributeUpdateFieldCatalog.ts) and live attribute values are
 * owned by RTK Query (api/attributeUpdateApiSlice.ts) - neither belongs in
 * this slice.
 */
const initialState: AttributeUpdateState = {
  dialogOpen: false,
  crq: null,
  selectedStageId: CMS_STAGE_ORDER[0],
  lockedStageId: null,
  selectedRemedyStatusIndex: 0,
};

const attributeUpdateSlice = createSlice({
  name: "attributeUpdate",
  initialState,
  reducers: {
    openAttributeUpdateDialog(
      state,
      action: PayloadAction<{
        crq: AttributeUpdateCrqContext;
        initialStageId?: WorkflowStageId;
        /** Lock the dialog to the initial stage (single-stage view). */
        lockToStage?: boolean;
      }>,
    ) {
      const { crq, initialStageId, lockToStage } = action.payload;
      state.dialogOpen = true;
      state.crq = crq;
      state.selectedStageId =
        initialStageId && CMS_STAGE_ORDER.includes(initialStageId)
          ? initialStageId
          : CMS_STAGE_ORDER[0];
      state.lockedStageId = lockToStage ? state.selectedStageId : null;
      state.selectedRemedyStatusIndex = 0;
    },

    closeAttributeUpdateDialog() {
      return initialState;
    },

    selectAttributeStage(state, action: PayloadAction<WorkflowStageId>) {
      if (state.lockedStageId) return;
      if (!CMS_STAGE_ORDER.includes(action.payload)) return;
      state.selectedStageId = action.payload;
      state.selectedRemedyStatusIndex = 0;
    },

    selectRemedyStatusIndex(state, action: PayloadAction<number>) {
      state.selectedRemedyStatusIndex = action.payload;
    },

    goToNextAttributeStage(state) {
      if (state.lockedStageId) return;
      const index = CMS_STAGE_ORDER.indexOf(state.selectedStageId);
      if (index < CMS_STAGE_ORDER.length - 1) {
        state.selectedStageId = CMS_STAGE_ORDER[index + 1];
        state.selectedRemedyStatusIndex = 0;
      }
    },

    goToPreviousAttributeStage(state) {
      if (state.lockedStageId) return;
      const index = CMS_STAGE_ORDER.indexOf(state.selectedStageId);
      if (index > 0) {
        state.selectedStageId = CMS_STAGE_ORDER[index - 1];
        state.selectedRemedyStatusIndex = 0;
      }
    },
  },
});

export const {
  openAttributeUpdateDialog,
  closeAttributeUpdateDialog,
  selectAttributeStage,
  selectRemedyStatusIndex,
  goToNextAttributeStage,
  goToPreviousAttributeStage,
} = attributeUpdateSlice.actions;

export default attributeUpdateSlice.reducer;
