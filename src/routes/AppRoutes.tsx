import React, { type JSX, useEffect, Suspense } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";
import { PrivateRoute } from "./PrivateRoute";
// import DashboardView from "../features/dashboard/pages/DashboardPage";
import CommonContainer from "../components/common/CommonContainer";
// import { SkillSetTeamViewMain } from "../features/teamManagement/pages/TeamManagementMain";
import TeamManagementPage from "../features/teamManagement/pages/TeamManagementPage";
import { TeamManagementMain } from "../features/teamManagement/pages/TeamManagementMain";
import DashboardViewPage from "../features/dashboard/pages/DashboardPage";
import { HomeDashboard } from "../features/dashboard/pages/HomeDashboard";
import MonthlyRosterPageTab from "../features/roster/page/MonthlyRosterPageTab";
// import { MonthlyRosterMain } from "../features/roster/monthly/MonthlyRosterMain";
import { RosterViewMain } from "../features/roster/page/RosterViewMain";
// import { WeeklyRosterMain } from "../features/roster/weekly/WeeklyRosterMain";
import UserMeMainPageTab from "../features/userMe/pages/UserMeMainPageTab";
import { UserRosterMain } from "../features/userMe/userRoster/UserRosterMain";
import { UserLeaveSectionMain } from "../features/userMe/userLeaveSection/UserLeaveSectionMain";
import InboxPageTab from "../features/inbox/InboxPageTab";
import TaskInbox from "../features/inbox/components/TaskInbox";
// import SchedularTabView from "../features/scheduler/pages/SchedularTabView";
import RosterGeneratorTabView from "../features/rosterGenerator/pages/RosterGeneratorTab";
import SchedulerMainTab from "../features/scheduler/page/SchedulerMainTab";
import NotificationManagerMain from "../features/userMe/notification-manager/pages/NotificationMangermain";

interface AppRoutesProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
  setNotificationCount?: (count: number) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("navigate ", navigate);
    console.log("location ", location);
    if (location.pathname === "/") {
      const storedRoute = localStorage.getItem("currentRoute") || "/login";
      navigate(storedRoute, { replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("currentRoute", location.pathname);
    }
  }, [location.pathname]);
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
          <Route path="/home" element={<HomeDashboard />} />
          <Route
            path="/homedashboard"
            element={<CommonContainer>Hello</CommonContainer>}
          />
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
          <Route path="notifiactionmanger" element={<NotificationManagerMain />} />
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
          <Route path="view" element={<RosterViewMain />} />
          <Route path="monthly" element={<>Monthly Roster</>} />
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
          element={
            <PrivateRoute
              element={
                <SchedulerMainTab
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="crqWorkflow" replace />} />
          <Route path="shiftscheduler" element={<>Shift Scheduler</>} />
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
          path="generateroster"
          element={
            <PrivateRoute
              element={
                <RosterGeneratorTabView
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route index element={<Navigate to="rostergeneration" replace />} />
          <Route path="rostergeneration" element={<>Roster Generation</>} />
          <Route
            path="test"
            element={
              <>
                <>Notifications</>
              </>
            }
          />
        </Route>

        <Route index element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
