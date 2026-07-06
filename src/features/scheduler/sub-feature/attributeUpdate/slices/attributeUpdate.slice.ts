import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AttributeUpdateCrqContext,
  AttributeUpdateState,
} from "../types/attributeUpdate.types";
import type { WorkflowStageId } from "../../../constants/workflowStages";
import { CMS_STAGE_ORDER } from "../constants/attributeUpdate.constants";
import { buildCrqAttributeSchemaMock } from "../data/attributeUpdate.mock";

/**
 * Loads the per-CRQ attribute schema. Currently resolves static mock data
 * with simulated latency; swap the body for an RTK Query endpoint (or keep
 * the thunk and call the endpoint here) once the real API exists — the
 * returned `CrqAttributeSchema` shape is the API contract.
 */
export const fetchCrqAttributeSchema = createAsyncThunk(
  "attributeUpdate/fetchSchemaByCrqNo",
  async (crqNo: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return buildCrqAttributeSchemaMock(crqNo);
  },
);

const initialState: AttributeUpdateState = {
  dialogOpen: false,
  crq: null,
  schema: null,
  selectedStageId: CMS_STAGE_ORDER[0],
  lockedStageId: null,
  selectedRemedyStatusIndex: 0,
  isLoading: false,
  error: null,
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
      state.schema = null;
      state.error = null;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrqAttributeSchema.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCrqAttributeSchema.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schema = action.payload;
      })
      .addCase(fetchCrqAttributeSchema.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? "Failed to load attribute details.";
      });
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
