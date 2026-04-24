// ─────────────────────────────────────────────
//  Feature barrel exports
// ─────────────────────────────────────────────

// Page-level components (used in AppRoutes)
export { ActivityViewAndSetup, ActivityViewAndSetupMain } from "./page/PlanViewAndSetup";

// Redux
export { default as activityReducer } from "./slices/activity.slice";
export * from "./slices/activity.slice";

// Selectors
export * from "./selectors/activity.selectors";

// Hooks
export { useActivity } from "./hooks/useActivity";

// Types
export type * from "./types/activity.types";

// Data
export { MOCK_ACTIVITIES } from "./data/activity.mock";
