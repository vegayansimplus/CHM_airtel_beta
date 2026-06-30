/**
 * Add these routes inside the existing "scheduler" <Route> block in
 * routes/AppRoutes.tsx (the one that currently renders <PlanViewAndSetupTab />),
 * alongside crqWorkflow/taskconfig/taskplanning/crqjourney.
 *
 * Each stage page is a thin wrapper around GenericStagePage - no new
 * page-level logic needed per stage.
 */

import ImpactAnalysisPage from "../features/scheduler/pages/ImpactAnalysisPage";
import MopCreatePage from "../features/scheduler/pages/MopCreatePage";
import MopValidatePage from "../features/scheduler/pages/MopValidatePage";
import SchedulingPage from "../features/scheduler/pages/SchedulingPage";
import ActivityImplementPage from "../features/scheduler/pages/ActivityImplementPage";
import CloserPage from "../features/scheduler/pages/CloserPage";

// Inside <Route path="scheduler" element={<PrivateRoute element={<PlanViewAndSetupTab />} />}> :
//
// <Route path="impactanalysis" element={<ImpactAnalysisPage />} />
// <Route path="mopcreate" element={<MopCreatePage />} />
// <Route path="mopvalidate" element={<MopValidatePage />} />
// <Route path="scheduling" element={<SchedulingPage />} />
// <Route path="activityimplement" element={<ActivityImplementPage />} />
// <Route path="closer" element={<CloserPage />} />
//
// NOTE: domainId / subDomainId props - in the original PlanAndInventoryPage
// these appear to come from a filter UI managed by a parent. Wire them the
// same way you currently do for crqWorkflow (e.g. via context, query params,
// or lifting state into PlanViewAndSetupTab and passing down as props).
