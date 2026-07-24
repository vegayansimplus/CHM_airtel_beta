import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/slices/auth.slice";
import { api } from "../service/api";
import loadingReducer from "./loadingSlice";
import rosterReducer from "../features/roster/slices/roster.slice";
import { crqJourneyReducer } from "../features/crqJourney";
// Imported directly from the slice file, not the sub-feature's barrel: the
// barrel statically re-exports every component in the sub-feature (including
// the lazy-loaded AttributeUpdateDialog and its whole subtree/field
// catalog), and the store is part of the app's eager root - importing the
// reducer through the barrel here would pull that entire subtree into the
// main bundle and silently defeat the dialog's React.lazy() code-split.
import attributeUpdateReducer from "../features/scheduler/sub-feature/attributeUpdate/slices/attributeUpdate.slice";
import { planViewAndSetupReducer } from "../features/scheduler/sub-feature/planViewAndSetup";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    loading: loadingReducer,
    roster:rosterReducer,
     crqJourney: crqJourneyReducer,
    attributeUpdate: attributeUpdateReducer,
    planViewAndSetup: planViewAndSetupReducer,
  },
  middleware: (gDM) =>
    gDM({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
