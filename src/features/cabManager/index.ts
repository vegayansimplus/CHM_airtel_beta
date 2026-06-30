// ─────────────────────────────────────────────
//  CAB Portal — feature barrel exports
// ─────────────────────────────────────────────

// Pages
export { DashboardPage }      from "./pages/DashboardPage";
export { AllCrqsPage }        from "./pages/AllCrqsPage";
export { MyCrqsPage }         from "./pages/MyCrqsPage";
export { CrqJourneyPage }     from "./pages/CrqJourneyPage";
export { CabPlanningPage }    from "./pages/CabPlanningPage";
export { CabSessionsPage }    from "./pages/CabSessionsPage";
export { ImplementationPage } from "./pages/ImplementationPage";
export { AdminPage }          from "./pages/AdminPage";

// Admin sub-tabs (in case anyone needs to embed them)
export { AdminAnalyticsTab }        from "./pages/admin/AnalyticsTab";
export { AdminAssignMatrixTab }     from "./pages/admin/AssignMatrixTab";
export { AdminReasonsTab }          from "./pages/admin/ReasonsTab";
export { AdminEscalationMatrixTab } from "./pages/admin/EscalationMatrixTab";
export { AdminUsersTab }            from "./pages/admin/UsersTab";
export { AdminAuditTab }            from "./pages/admin/AuditTab";

// Shared
export { CrqDetailDrawer }         from "./components/shared/CrqDetailDrawer";
export { ImpactChip, SlaBar, StageChip, StatusChip } from "./components/shared/Chips";

// Modals
export { ApproveCrqModal }   from "./components/modals/ApproveCrqModal";
export { RejectCrqModal }    from "./components/modals/RejectCrqModal";
export { DelegateCrqModal }  from "./components/modals/DelegateCrqModal";
export { RescheduleCrqModal } from "./components/modals/RescheduleCrqModal";
export { AssignSpocModal }   from "./components/modals/AssignSpocModal";
export { AssignFeModal }     from "./components/modals/AssignFeModal";
export { PlanCabModal }      from "./components/modals/PlanCabModal";
export { NewCrqModal }       from "./components/modals/NewCrqModal";

// Hooks
export { useCabRole } from "./hooks/useCabRole";

// API hooks + slice
export * from "./api/cabManagerApiSlice";

// Mock data
export * from "./data/cabManager.mock";

// Types
export type * from "./types/types";
