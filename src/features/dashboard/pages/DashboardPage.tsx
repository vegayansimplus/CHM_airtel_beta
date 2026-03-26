import { Box, Tabs, Tab, CircularProgress, useTheme } from "@mui/material";
import React, { type JSX, useEffect, useState, Suspense } from "react";
import { useLocation, useNavigate, Outlet } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useAppSelector } from "../../../app/hooks";
import { useTabColorTokens } from "../../../style/theme";

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

const DashboardViewPage: React.FC<TeamManagementViewTabProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  /* ===================== HOOKS (ALWAYS FIRST) ===================== */
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const bg = useTabColorTokens(theme);
  const user = useAppSelector((s) => s.auth.user);

  const [activeTab, setActiveTab] = useState<number>(0);

  /* ===================== EFFECTS ===================== */

  // Sync tab from URL
  useEffect(() => {
    const tabFromUrl = PATH_TO_TAB[location.pathname];
    if (tabFromUrl !== undefined) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  // Header sync
  useEffect(() => {
    if (activeTab === 0) {
      setDynamicHeaderText("Home");
    } else {
      setDynamicHeaderText("Dashboard");
    }

    setDynamicHeaderIcon(<PeopleAltIcon sx={{ color: "white" }} />);
  }, [activeTab, setDynamicHeaderText, setDynamicHeaderIcon]);

  /* ===================== GUARD (AFTER HOOKS) ===================== */

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* ===================== HANDLERS ===================== */

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
        // backgroundColor: theme.palette.background.paper,
        backgroundColor: bg.accentDim,

        maxWidth: "100%",
        height: "auto",
        pl: 8,
        overflow: "auto",

        "&::-webkit-scrollbar": {
          height: 8,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          // backgroundColor: theme.palette.primary.main,
          borderRadius: 4,
        },
      }}
    >
      {/* -------- Tabs Header -------- */}
      <Box
        sx={{
          mt: "45px",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
              : "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",

          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",

          border: `1px ${
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.6)"
          }`,

          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.45)"
              : "0 8px 32px rgba(0,0,0,0.08)",

          transition: "all 0.3s ease",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: 14,
            },
            "& .Mui-selected": {
              fontWeight: 600,
              color: theme.palette.primary.main,
            },
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
                borderBottom: `10px solid ${theme.palette.primary.main}`,
                position: "absolute",
                bottom: 0,
              },
            },
          }}
        >
          <Tab label="Home" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>

      {/* -------- Content Area -------- */}
      <Box sx={{ pl: 2, pr: 2, pt: 1, minHeight: "60vh" }}>
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
