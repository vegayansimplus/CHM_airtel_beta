import { combineReducers, configureStore, type Action } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer, { logout } from "../features/auth/slices/auth.slice";
import { api } from "../service/api";
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

const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  roster: rosterReducer,
  crqJourney: crqJourneyReducer,
  attributeUpdate: attributeUpdateReducer,
  planViewAndSetup: planViewAndSetupReducer,
});

// Every logout path (explicit header logout, the global 401/403 handler in
// service/api.ts, and the cross-tab `storage` event in AuthHydrator) ends by
// dispatching auth/logout — resetting the whole tree here, rather than just
// the auth slice, guarantees roster/crqJourney/attributeUpdate/
// planViewAndSetup/RTK-Query-cache can never leak into the next session,
// without every logout call site having to remember to clean up each slice.
const rootReducer: typeof appReducer = (state, action: Action) => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (gDM) =>
    gDM({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
