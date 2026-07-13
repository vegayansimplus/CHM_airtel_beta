import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_APP_BASE_URL,
    // Send the httpOnly `jwt` cookie the backend already issues on login.
    // It can't be read or stolen via JS/XSS (unlike the bearer token), so
    // this gives the API a second, tamper-resistant way to authenticate
    // the request even if the Authorization header is ever missing.
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    "ORG_HIERARCHY",
    "EMPLOYEES",
    "RosterVIew",
    "Leave",
    "NotificationCount",
    "ImpactAnalysis",
    "CrqReview",
    "MopCreateView",
    "MopValidateView",
    "LoginDetails",
    "Activity",
    "Holiday",
    "Plan",
    "ActivityPhase",
    "TaskConfig",
    "GlobalSettingsPermission",
    "GlobalSettingsRoles",
    "GlobalSettingsModules",
    "GlobalSettingsSubModules",
    "ShiftDropdown",
    "NetworkFreeze",
    "GoldenSetTag",
    "FutureWeekTag",
    "StageWorkflow",
    "Scheduling",
    "NotificationConfig",
    "CabKpi",
    "CabQueue",
    "CabSession",
    "CabDashboard",
    "CabAdmin",
    "CabAudit",
    "CabCrq",
    "CabImpl"
   
    
  ],
});
   