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
import { MonthlyRosterMain } from "../features/roster/monthly/MonthlyRosterMain";
import { RosterViewMain } from "../features/roster/page/RosterViewMain";
import { WeeklyRosterMain } from "../features/roster/weekly/WeeklyRosterMain";

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
          <Route index element={<Navigate to="rosterview" replace />} />
          <Route path="rosterview" element={<RosterViewMain />} />

          <Route path="weeklyroster" element={<>Roster View</>} />

          <Route path="monthlyroster" element={<>Monthly Roster View </>} />
        </Route>

        <Route index element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
