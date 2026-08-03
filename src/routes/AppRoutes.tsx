import React, { type JSX, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { PrivateRoute } from "./PrivateRoute";
import DefaultRedirect from "./DefaultRedirect";
import CommonContainer from "../components/common/CommonContainer";
import TeamManagementPage from "../features/teamManagement/pages/TeamManagementPage";
import { TeamManagementMain } from "../features/teamManagement/pages/TeamManagementMain";
import DashboardViewPage from "../features/dashboard/pages/DashboardPage";
import MonthlyRosterPageTab from "../features/roster/page/MonthlyRosterPageTab";
import { RosterViewMain } from "../features/roster/page/RosterViewMain";
import UserMeMainPageTab from "../features/userMe/pages/UserMeMainPageTab";
import { UserRosterMain } from "../features/userMe/pages/UserRosterMain";
import InboxPageTab from "../features/inbox/InboxPageTab";
import TaskInbox from "../features/inbox/components/TaskInbox";
import SchedulerMainTab from "../features/scheduler/page/SchedulerMainTab";
import NotificationManagerMain from "../features/userMe/pages/NotificationManagerMain";
import { UserLeaveSectionMain } from "../features/userMe/pages/UserLeaveSectionMain";
// import { PlanAndInventoryMain } from "../features/scheduler/page/SchedulerWorkflowMain";
import { CrqDetailedView } from "../features/scheduler/components/plan-and-inventory/CrqDetailedView";
// import Dashboard from "../features/dashboard/home_dashboard/Dashboard";
import { RosterGenerationMain } from "../features/rosterGenerator/pages/RosterGenerationMain";
// import Holidayandnetworkschedulemanagermain from "../features/settings/holiday/pages/Holidayandnetworkschedulemanagermain";
// import { CommonContainerWithoutTab } from "../components/common/ContainerWithoutTab";
import UserManagementLayout from "../features/userManagement/layout/UserManagementLayout";
import { UserLogs } from "../features/userManagement/pages/UserLogs";
// import { AdminSettingDashboard } from "../features/settings/globalAdminSetting";
// import HolidayAndNetworkScheduleManagerMain from "../features/settings/holiday/pages/Holidayandnetworkschedulemanagermain";
import NetworkManagementTabView from "../features/settings/page/NetworkManagementTabView";
import Holidayandnetworkschedulemanagermain from "../features/settings/holiday/pages/Holidayandnetworkschedulemanagermain";
import { PlanViewAndSetup } from "../features/scheduler/sub-feature/planViewAndSetup/PlanViewAndSetup";
import PlanViewAndSetupTab from "../features/scheduler/page/PlanViewAndSetupTab";
import { TaskConfigMain } from "../features/scheduler/sub-feature/taskConfig/TaskConfigMain";
import ModernHomeDashboard from "../features/dashboard/pages/ModernHomeDashboard";
import { AdminSettingDashboard } from "../features/settings/globalAdminSetting";
import { OrganizationConfigPage } from "../features/settings/orgConfig";
import TaskPlanningMain from "../features/scheduler/sub-feature/taskPlanning/TaskPlanningMain";
import { CrqJourneyMain } from "../features/crqJourney/CrqJourneyMain";
import { PlanAndInventoryMain } from "../features/scheduler/page/SchedulerWorkflowMain";

// Cab Manager pages
// import { DashboardPage as CabDashboardPage } from "../features/cabManager/pages/DashboardPage";
// import { AllCrqsPage } from "../features/cabManager/pages/AllCrqsPage";

import {
  CabDashboardPage,
  AllCrqsPage,
  MyCrqsPage,
  CabPlanningPage,
  CabSessionsPage,
  ImplementationPage,
  AdminPage,
} from "../features/cabManager";
import CabManagerMainPageTab from "../features/cabManager/pages/CabManagerMainPageTab";
import { CrqJourneyPage } from "../features/crqJourney";
import UserManagement from "../features/userManagement/components/UserManagement";
import PageLoader from "../components/loading/PageLoader";
import {
  AnalyticsMainPageTab,
  AnalyticsDashboardPage,
  CrqAnalyticsPage,
  AnalyticsReportsPage,
} from "../features/crqAnalytics";
import DataAgentPage from "../features/dataAgent/pages/DataAgentPage";
import {
  SftpManagementMainPageTab,
  WindowsSftpPage,
  LinuxSftpPage,
} from "../features/sftpManagement";

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
          <Route path="taskplanning" element={<TaskPlanningMain />} />
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
