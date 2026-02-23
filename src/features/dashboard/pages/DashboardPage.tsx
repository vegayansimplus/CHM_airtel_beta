import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import React, { type JSX, useEffect, useState, Suspense } from "react";
import { useLocation, useNavigate, Outlet } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useAppSelector } from "../../../app/hooks";

interface TeamManagementViewTabProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

const TAB_PATHS = {
  OVERVIEW: `/home`,
  TASK_CONFIG: `/homedashboard`,
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

const DashboardViewPage: React.FC<TeamManagementViewTabProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppSelector((s) => s.auth.user);

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
      setDynamicHeaderText("Home");
    } else {
      setDynamicHeaderText("Dashboard");
    }

    setDynamicHeaderIcon(<PeopleAltIcon sx={{ color: "white" }} />);
  }, [activeTab, setDynamicHeaderText, setDynamicHeaderIcon]);
  if (!user) return null;

  /* -------- TAB → ROUTE (ONLY place we navigate) -------- */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue !== activeTab) {
      setActiveTab(newValue);
      navigate(TAB_TO_PATH[newValue]);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <Box
      sx={{
        backgroundColor: "auto",
        maxWidth: "100%",
        margin: "50px auto",
        height: "auto",
        pl: 8,
        overflow: "hidden",
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "grey",
        },
      }}
    >
      {/* -------- Tabs Header -------- */}
      <Box
        sx={{
          backgroundColor: "auto",
          display: "flex",
          height: "20px",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          sx={{
            "& .MuiTabs-indicator": {
              display: "flex",
              justifyContent: "center",
              backgroundColor: "transparent",
              "&::after": {
                content: '""',
                width: 0,
                height: 0,
                borderRight: "8px solid transparent",
                borderLeft: "8px solid transparent",
                borderBottom: "10px solid grey",
                position: "absolute",
                bottom: 0,
              },
            },
            "&.Mui-focusVisible": {
              backgroundColor: "auto",
            },
            width: "100%",
            backgroundColor: "auto",
            boxShadow: 2,
            mt: 1,
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Home" />
          <Tab label="Dashboard" />
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

export default DashboardViewPage;
