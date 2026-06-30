import { Navigate, Route } from "react-router";
import { CabPortalLayout } from "../pages/CabPortalLayout";
import { DashboardPage }   from "../pages/DashboardPage";
import { AllCrqsPage }     from "../pages/AllCrqsPage";
import { MyCrqsPage }      from "../pages/MyCrqsPage";
import { CrqJourneyPage }  from "../pages/CrqJourneyPage";
import { CabPlanningPage } from "../pages/CabPlanningPage";
import { CabSessionsPage } from "../pages/CabSessionsPage";
import { ImplementationPage } from "../pages/ImplementationPage";
import { AdminPage }       from "../pages/AdminPage";

/**
 * CAB Portal routes.
 *
 * Drop into your AppRoutes.tsx <Routes> block:
 *
 *   import { cabPortalRoutes } from "./features/cabManager/routes/cabRoutes";
 *   ...
 *   <Routes>
 *     ...
 *     {cabPortalRoutes}
 *   </Routes>
 *
 * Or, if you prefer JSX-as-children, copy the contents of this file
 * directly into your <Routes> block.
 */
export const cabPortalRoutes = (
  <Route path="/cabmanager" element={<CabPortalLayout />}>
    <Route index               element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"     element={<DashboardPage />} />
    <Route path="allcrqs"       element={<AllCrqsPage />} />
    <Route path="mycrqs"        element={<MyCrqsPage />} />
    <Route path="journey"       element={<Navigate to="../allcrqs" replace />} />
    <Route path="journey/:id"   element={<CrqJourneyPage />} />
    <Route path="planning"      element={<CabPlanningPage />} />
    <Route path="sessions"      element={<CabSessionsPage />} />
    <Route path="implementation" element={<Navigate to="implementation/CRQ-2026-0418" replace />} />
    <Route path="implementation/:id" element={<ImplementationPage />} />
    <Route path="admin"         element={<AdminPage />} />
  </Route>
);
