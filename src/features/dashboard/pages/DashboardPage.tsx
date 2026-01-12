import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import React, { type JSX, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Home } from "@mui/icons-material";
import {
  tabBoxOneStyle,
  tabBoxTwoStyle,
  tabCursorStyle,
} from "../../../style/tabStyle/TabCursorStyle";
import { useAppSelector } from "../../../app/hooks";

interface DashboardViewProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ GET USER FROM REDUX
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const roles = user.roles;

  // ✅ BACKEND-ALIGNED ROLES
  const showDashboardTab =
    roles.includes("SUPER_ADMIN") || roles.includes("TEAM_LEAD");

  // 0 = Home, 1 = Dashboard
  const [activeTab, setActiveTab] = useState<number>(() => {
    if (location.pathname.startsWith("/dashboard") && showDashboardTab) {
      return 1;
    }
    return 0;
  });

  // ✅ SYNC TAB ← URL
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard") && showDashboardTab) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [location.pathname, showDashboardTab]);

  // ✅ SYNC HEADER
  useEffect(() => {
    if (activeTab === 0) {
      setDynamicHeaderText("Home");
      setDynamicHeaderIcon(<Home sx={{ color: "white" }} />);
    } else if (activeTab === 1 && showDashboardTab) {
      setDynamicHeaderText("Dashboard");
      setDynamicHeaderIcon(<PeopleAltIcon sx={{ color: "white" }} />);
    }
  }, [activeTab, setDynamicHeaderIcon, setDynamicHeaderText, showDashboardTab]);

  // ✅ TAB → ROUTE
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      navigate("/home");
    } else if (newValue === 1 && showDashboardTab) {
      navigate("/dashboard");
    }
  };

  return (
    <Box sx={tabBoxOneStyle}>
      <Box sx={tabBoxTwoStyle}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={tabCursorStyle}
        >
          <Tab label="Home" />
          {showDashboardTab && <Tab label="Dashboard" />}
        </Tabs>
      </Box>

      {/* CONTENT IS RENDERED BY ROUTES, NOT OUTLET */}
      <Box sx={{ p: 2 }}>
        <React.Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          {/* routed components render outside */}
        </React.Suspense>
      </Box>
    </Box>
  );
};

export default DashboardView;
