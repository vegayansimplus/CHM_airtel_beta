import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/slices/auth.slice";
import { api } from "../service/api";
import loadingReducer from "./loadingSlice";
import rosterReducer from "../features/roster/slices/roster.slice"; 
import { activityReducer } from "../features/activityViewAndSetup";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    loading: loadingReducer,
    roster:rosterReducer,
    activity: activityReducer,
  },
  middleware: (gDM) =>
    gDM({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
