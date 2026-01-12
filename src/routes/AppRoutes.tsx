import React, { type JSX, useEffect, Suspense } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";
import { PrivateRoute } from "./PrivateRoute";
import DashboardView from "../features/dashboard/pages/DashboardPage";
import CommonContainer from "../components/common/CommonContainer";
import TeamManagementView from "../features/teamManagement/pages/TeamManagementView";
import { SkillSetTeamViewMain } from "../features/teamManagement/pages/SkillSetTeamViewMain";

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
                <DashboardView
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                  setDynamicHeaderText={setDynamicHeaderText}
                />
              }
            />
          }
        >
          <Route
            path="/dashboard"
            element={<CommonContainer>Hello</CommonContainer>}
          />
          <Route
            path="/home"
            element={<CommonContainer>Hello Home page </CommonContainer>}
          />
        </Route>
        <Route
          path="skillsetview"
          element={
            <PrivateRoute
              element={
                <TeamManagementView
                  setDynamicHeaderText={setDynamicHeaderText}
                  setDynamicHeaderIcon={setDynamicHeaderIcon}
                />
              }
            />
          }
        >
          <Route
            index
            element={<Navigate to="SkillSetTeamViewMain" replace />}
          />
          <Route
            path="SkillSetTeamViewMain"
            element={<SkillSetTeamViewMain />}
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
