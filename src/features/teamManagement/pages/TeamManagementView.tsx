import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import React, { type JSX, useEffect, useState, Suspense } from "react";
import { useLocation, useNavigate, Outlet } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import {
  tabBoxOneStyle,
  tabBoxTwoStyle,
  tabCursorStyle,
} from "../../../style/tabStyle/TabCursorStyle";
import { useAppSelector } from "../../../app/hooks";

interface TeamManagementViewTabProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

/* ===================== CONSTANTS ===================== */

const BASE_PATH = "/skillsetview";

const TAB_PATHS = {
  OVERVIEW: `${BASE_PATH}/SkillSetTeamViewMain`,
  TASK_CONFIG: `${BASE_PATH}/taskconfiguration`,
} as const;

const PATH_TO_TAB: Record<string, number> = {
  [TAB_PATHS.OVERVIEW]: 0,
  [TAB_PATHS.TASK_CONFIG]: 1,
};

const TAB_TO_PATH: Record<number, string> = {
  0: TAB_PATHS.OVERVIEW,
  1: TAB_PATHS.TASK_CONFIG,
};

/* ===================== COMPONENT ===================== */

const TeamManagementView: React.FC<TeamManagementViewTabProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppSelector((s) => s.auth.user);
  if (!user) return null;

  /* -------- Active Tab (derived from URL) -------- */
  const [activeTab, setActiveTab] = useState<number>(() => {
    return PATH_TO_TAB[location.pathname] ?? 0;
  });

  /* -------- URL → TAB SYNC (NO navigation here) -------- */
  useEffect(() => {
    const tabFromUrl = PATH_TO_TAB[location.pathname];
    if (tabFromUrl !== undefined && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname, activeTab]);

  /* -------- HEADER SYNC -------- */
  useEffect(() => {
    if (activeTab === 0) {
      setDynamicHeaderText("Team Overview");
    } else {
      setDynamicHeaderText("Task Configuration");
    }

    setDynamicHeaderIcon(<PeopleAltIcon sx={{ color: "white" }} />);
  }, [activeTab, setDynamicHeaderText, setDynamicHeaderIcon]);

  /* -------- TAB → ROUTE (ONLY place we navigate) -------- */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue !== activeTab) {
      setActiveTab(newValue);
      navigate(TAB_TO_PATH[newValue]);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <Box sx={tabBoxOneStyle}>
      {/* -------- Tabs Header -------- */}
      <Box sx={tabBoxTwoStyle}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={tabCursorStyle}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Team Overview" />
          <Tab label="Task Configuration" />
        </Tabs>
      </Box>

      {/* -------- Content Area -------- */}
      <Box sx={{ p: 3, minHeight: "60vh" }}>
        <Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};

export default TeamManagementView;
