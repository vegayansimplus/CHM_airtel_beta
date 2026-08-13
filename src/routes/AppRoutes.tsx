import React, { type JSX, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router";
import { PrivateRoute } from "./PrivateRoute";
import DefaultRedirect from "./DefaultRedirect";
import CommonContainer from "../components/common/CommonContainer";
import PageLoader from "../components/loading/PageLoader";

// Route-level code splitting — every feature page below is fetched on
// first navigation instead of bundled eagerly into the initial load. The
// <Suspense fallback={<PageLoader/>}> already wrapping <Routes> further
// down (previously dead weight, since nothing here was lazy) is what
// makes this work with no new boundaries needed. Named exports from a
// feature's barrel `index.ts` resolve to the same dynamic import
// specifier, so the bundler still only fetches one chunk per feature.
const TeamManagementPage = lazy(
  () => import("../features/teamManagement/pages/TeamManagementPage"),
);
const TeamManagementMain = lazy(() =>
  import("../features/teamManagement/pages/TeamManagementMain").then((m) => ({
    default: m.TeamManagementMain,
  })),
);
const DashboardViewPage = lazy(
  () => import("../features/dashboard/pages/DashboardPage"),
);
const MonthlyRosterPageTab = lazy(
  () => import("../features/roster/page/MonthlyRosterPageTab"),
);
const RosterViewMain = lazy(() =>
  import("../features/roster/page/RosterViewMain").then((m) => ({
    default: m.RosterViewMain,
  })),
);
const UserMeMainPageTab = lazy(
  () => import("../features/userMe/pages/UserMeMainPageTab"),
);
const UserRosterMain = lazy(() =>
  import("../features/userMe/pages/UserRosterMain").then((m) => ({
    default: m.UserRosterMain,
  })),
);
const InboxPageTab = lazy(() => import("../features/inbox/InboxPageTab"));
const TaskInbox = lazy(() => import("../features/inbox/components/TaskInbox"));
const SchedulerMainTab = lazy(
  () => import("../features/scheduler/page/SchedulerMainTab"),
);
const NotificationManagerMain = lazy(
  () => import("../features/userMe/pages/NotificationManagerMain"),
);
const UserLeaveSectionMain = lazy(() =>
  import("../features/userMe/pages/UserLeaveSectionMain").then((m) => ({
    default: m.UserLeaveSectionMain,
  })),
);
const CrqDetailedView = lazy(() =>
  import("../features/scheduler/components/plan-and-inventory/CrqDetailedView").then(
    (m) => ({
      default: m.CrqDetailedView,
    }),
  ),
);
const RosterGenerationMain = lazy(() =>
  import("../features/rosterGenerator/pages/RosterGenerationMain").then(
    (m) => ({
      default: m.RosterGenerationMain,
    }),
  ),
);
const UserManagementLayout = lazy(
  () => import("../features/userManagement/layout/UserManagementLayout"),
);
const UserLogs = lazy(() =>
  import("../features/userManagement/pages/UserLogs").then((m) => ({
    default: m.UserLogs,
  })),
);
const NetworkManagementTabView = lazy(
  () => import("../features/settings/page/NetworkManagementTabView"),
);
const Holidayandnetworkschedulemanagermain = lazy(
  () =>
    import("../features/settings/holiday/pages/Holidayandnetworkschedulemanagermain"),
);
const PlanViewAndSetup = lazy(() =>
  import("../features/scheduler/sub-feature/planViewAndSetup/PlanViewAndSetup").then(
    (m) => ({
      default: m.PlanViewAndSetup,
    }),
  ),
);
const PlanViewAndSetupTab = lazy(
  () => import("../features/scheduler/page/PlanViewAndSetupTab"),
);
const TaskConfigMain = lazy(() =>
  import("../features/scheduler/sub-feature/taskConfig/TaskConfigMain").then(
    (m) => ({ default: m.TaskConfigMain }),
  ),
);
const ModernHomeDashboard = lazy(
  () => import("../features/dashboard/pages/ModernHomeDashboard"),
);
const AdminSettingDashboard = lazy(() =>
  import("../features/settings/globalAdminSetting").then((m) => ({
    default: m.AdminSettingDashboard,
  })),
);
const OrganizationConfigPage = lazy(() =>
  import("../features/settings/orgConfig").then((m) => ({
    default: m.OrganizationConfigPage,
  })),
);
// Hidden from tab + route (task planning page disabled)
// const TaskPlanningMain = lazy(() => import("../features/scheduler/sub-feature/taskPlanning/TaskPlanningMain"));
const CrqJourneyMain = lazy(() =>
  import("../features/crqJourney/CrqJourneyMain").then((m) => ({
    default: m.CrqJourneyMain,
  })),
);
const PlanAndInventoryMain = lazy(() =>
  import("../features/scheduler/page/SchedulerWorkflowMain").then((m) => ({
    default: m.PlanAndInventoryMain,
  })),
);

// Cab Manager pages
const CabDashboardPage = lazy(() =>
  import("../features/cabManager").then((m) => ({
    default: m.CabDashboardPage,
  })),
);
const AllCrqsPage = lazy(() =>
  import("../features/cabManager").then((m) => ({ default: m.AllCrqsPage })),
);
const MyCrqsPage = lazy(() =>
  import("../features/cabManager").then((m) => ({ default: m.MyCrqsPage })),
);
const CabPlanningPage = lazy(() =>
  import("../features/cabManager").then((m) => ({
    default: m.CabPlanningPage,
  })),
);
const CabSessionsPage = lazy(() =>
  import("../features/cabManager").then((m) => ({
    default: m.CabSessionsPage,
  })),
);
const ImplementationPage = lazy(() =>
  import("../features/cabManager").then((m) => ({
    default: m.ImplementationPage,
  })),
);
const AdminPage = lazy(() =>
  import("../features/cabManager").then((m) => ({ default: m.AdminPage })),
);
const CabManagerMainPageTab = lazy(
  () => import("../features/cabManager/pages/CabManagerMainPageTab"),
);
const CrqJourneyPage = lazy(() =>
  import("../features/crqJourney").then((m) => ({ default: m.CrqJourneyPage })),
);
const UserManagement = lazy(
  () => import("../features/userManagement/components/UserManagement"),
);
const AnalyticsMainPageTab = lazy(() =>
  import("../features/crqAnalytics").then((m) => ({
    default: m.AnalyticsMainPageTab,
  })),
);
const AnalyticsDashboardPage = lazy(() =>
  import("../features/crqAnalytics").then((m) => ({
    default: m.AnalyticsDashboardPage,
  })),
);
const CrqAnalyticsPage = lazy(() =>
  import("../features/crqAnalytics").then((m) => ({
    default: m.CrqAnalyticsPage,
  })),
);
const AnalyticsReportsPage = lazy(() =>
  import("../features/crqAnalytics").then((m) => ({
    default: m.AnalyticsReportsPage,
  })),
);
const DataAgentPage = lazy(
  () => import("../features/dataAgent/pages/DataAgentPage"),
);
const SftpManagementMainPageTab = lazy(() =>
  import("../features/sftpManagement").then((m) => ({
    default: m.SftpManagementMainPageTab,
  })),
);
const WindowsSftpPage = lazy(() =>
  import("../features/sftpManagement").then((m) => ({
    default: m.WindowsSftpPage,
  })),
);
const LinuxSftpPage = lazy(() =>
  import("../features/sftpManagement").then((m) => ({
    default: m.LinuxSftpPage,
  })),
);

interface AppRoutesProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
  setNotificationCount?: (count: number) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  return (
    <Suspense fallback={<PageLoader height="70vh" />}>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute
              element={
                <DashboardViewPage
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                  setDynamicHeaderText={setDynamicHeaderText}
                />
              }
            />
          }
        >
          <Route path="/home" element={<ModernHomeDashboard />} />
        </Route>
        <Route
          path="team"
          element={
            <PrivateRoute
              element={
                <TeamManagementPage
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="teammanagement" replace />} />
          <Route path="teammanagement" element={<TeamManagementMain />} />
          <Route
            path="taskconfiguration"
            element={
              <CommonContainer>Hello Task Configuration</CommonContainer>
            }
          />
        </Route>

        <Route
          path="me"
          element={
            <PrivateRoute
              element={
                <UserMeMainPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="monthlyview" replace />} />
          <Route path="monthlyview" element={<UserRosterMain />} />
          <Route path="leave" element={<UserLeaveSectionMain />} />
          <Route
            path="notifiactionmanger"
            element={<NotificationManagerMain />}
          />
        </Route>

        {/* {cabPortalRoutes} */}
        <Route
          path="cabmanager"
          element={
            <PrivateRoute
              element={
                <CabManagerMainPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CabDashboardPage />} />
          <Route path="allcrqs" element={<AllCrqsPage />} />
          <Route path="mycrqs" element={<MyCrqsPage />} />
          <Route path="journey" element={<CrqJourneyPage />} />
          <Route path="journey/:id" element={<CrqJourneyPage />} />
          <Route path="planning" element={<CabPlanningPage />} />
          <Route path="sessions" element={<CabSessionsPage />} />
          <Route path="implementation" element={<ImplementationPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route
          path="analytics"
          element={
            <PrivateRoute
              element={
                <AnalyticsMainPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AnalyticsDashboardPage />} />
          <Route path="crq-analytics" element={<CrqAnalyticsPage />} />
          <Route path="reports" element={<AnalyticsReportsPage />} />
        </Route>

        <Route
          path="roster"
          element={
            <PrivateRoute
              element={
                <MonthlyRosterPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="view" replace />} />
          <Route path="generation" element={<RosterGenerationMain />} />
          <Route path="view" element={<RosterViewMain />} />
        </Route>

        <Route
          path="inbox"
          element={
            <PrivateRoute
              element={
                <InboxPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="notifications" replace />} />
          <Route path="notifications" element={<TaskInbox />} />
          <Route
            path="action"
            element={
              <>
                <>Notifications</>
              </>
            }
          />
        </Route>
        <Route
          path="scheduler"
          element={<PrivateRoute element={<SchedulerMainTab />} />}
        >
          <Route index element={<Navigate to="crqWorkflow" replace />} />
          {/* <Route path="crqWorkflow" element={<PlanAndInventoryMain />} /> */}
          <Route path="crqWorkflow" element={<PlanAndInventoryMain />} />
          <Route
            path="action"
            element={
              <>
                <>Notifications</>
              </>
            }
          />

          <Route path="crqWorkflow/:crqNo" element={<CrqDetailedView />} />
        </Route>
        <Route
          path="scheduler"
          element={<PrivateRoute element={<PlanViewAndSetupTab />} />}
        >
          <Route path="planviewandsetup" element={<PlanViewAndSetup />} />
          <Route path="taskconfig" element={<TaskConfigMain />} />
          {/* <Route path="taskplanning" element={<TaskPlanningMain />} /> */}
          <Route path="crqjourney" element={<CrqJourneyMain />} />
        </Route>

        <Route
          path="generateroster/*"
          element={<Navigate to="/roster/generation" replace />}
        />

        <Route
          path="user-management"
          element={
            // <PrivateRoute element={<Holidayandnetworkschedulemanagermain />} />
            // <PrivateRoute element={<Holidayandnetworkschedulemanagermain />} />
            <PrivateRoute element={<UserManagementLayout />} />
          }
        >
          <Route index element={<Navigate to="usermang" replace />} />
          <Route path="usermang" element={<UserManagement />} />
          <Route path="userlogs" element={<UserLogs />} />
        </Route>
        <Route
          path="sftp-management"
          element={
            <PrivateRoute
              element={
                <SftpManagementMainPageTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="windows" replace />} />
          <Route path="windows" element={<WindowsSftpPage />} />
          <Route path="linux" element={<LinuxSftpPage />} />
        </Route>
        <Route path="global-settings">
          <Route
            element={<PrivateRoute element={<NetworkManagementTabView />} />}
          >
            {/* default tab */}
            <Route
              index
              element={<Navigate to="networkfreezsetting" replace />}
            />

            {/* tab routes */}
            <Route
              path="networkfreezsetting"
              element={<Holidayandnetworkschedulemanagermain />}
            />
            <Route path="adminsetting" element={<AdminSettingDashboard />} />
            <Route path="orgconfig" element={<OrganizationConfigPage />} />
          </Route>
        </Route>
        <Route
          path="data-agent"
          element={<PrivateRoute element={<DataAgentPage />} />}
        />

        <Route index element={<DefaultRedirect />} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
