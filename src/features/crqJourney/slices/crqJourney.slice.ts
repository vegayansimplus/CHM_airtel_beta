import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { CrqJourneyState } from "../types/crqJourney.types";
import { CRQ_JOURNEY_MOCK } from "../data/crqJourney.mock";

// ─── Async Thunk (replace with RTK Query later) ───────────────────────────────
export const fetchCrqJourney = createAsyncThunk(
  "crqJourney/fetchById",
  async (crqId: string) => {
    // Simulate network latency – swap body with RTK Query call
    await new Promise((r) => setTimeout(r, 600));
    const data = CRQ_JOURNEY_MOCK[crqId];
    if (!data) throw new Error(`No journey found for ${crqId}`);
    return data;
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: CrqJourneyState = {
  selectedCrqId: null,
  showLegend: true,
  isLoading: false,
  error: null,
  data: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const crqJourneySlice = createSlice({
  name: "crqJourney",
  initialState,
  reducers: {
    setSelectedCrqId(state, action: PayloadAction<string | null>) {
      state.selectedCrqId = action.payload;
      state.data = null;
      state.error = null;
    },
    toggleLegend(state) {
      state.showLegend = !state.showLegend;
    },
    resetJourney(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrqJourney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCrqJourney.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchCrqJourney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load CRQ journey.";
      });
  },
});

export const { setSelectedCrqId, toggleLegend, resetJourney } = crqJourneySlice.actions;
export default crqJourneySlice.reducer;
