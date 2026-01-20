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
      const storedRoute = localStorage.getItem("currentRoute") || "/dashboard";
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
          
          <Route
            path="/home"
            element={<HomeDashboard />}
          />
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
          <Route
            index
            element={<Navigate to="teammanagement" replace />}
          />
          <Route
            path="teammanagement"
            element={<TeamManagementMain />}
          />
          <Route
            path="taskconfiguration"
            element={
              <CommonContainer>Hello Task Configuration</CommonContainer>
            }
          />
        </Route>
        {/* <Route path="*" element={<Navigate to="/home" replace />} /> */}
        <Route index element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
