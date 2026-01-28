

import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { api } from "../../service/api";

interface LoadingState {
  activeRequests: number;
}

const initialState: LoadingState = {
  activeRequests: 0,
};

// This matcher will be true if the action is a pending action from any of our RTK Query endpoints.
const isPendingAction = isAnyOf(
  ...Object.values(api.endpoints).map((endpoint: any) => endpoint.matchPending)
);

// This matcher will be true if the action is a fulfilled or rejected action from any of our RTK Query endpoints.
const isFulfilledOrRejectedAction = isAnyOf(
  ...Object.values(api.endpoints).map((endpoint: any) => endpoint.matchFulfilled),
  ...Object.values(api.endpoints).map((endpoint: any) => endpoint.matchRejected)
);


const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {}, // We don't need any standard reducers
  extraReducers: (builder) => {
    builder
      .addMatcher(isPendingAction, (state) => {
        state.activeRequests++;
      })
      .addMatcher(isFulfilledOrRejectedAction, (state) => {
        // Ensure the count doesn't go below zero
        state.activeRequests = Math.max(0, state.activeRequests - 1);
      });
  },
});

// Selector to get the loading state
export const selectIsLoading = (state: { loading: LoadingState }) => state.loading.activeRequests > 0;

export default loadingSlice.reducer;