import { Box, Tabs, Tab, CircularProgress, useTheme } from "@mui/material";
import React, { type JSX, Suspense, useEffect, useMemo } from "react";
import { useLocation, Outlet, Link } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useAppSelector } from "../../../app/hooks";

interface SchedulerMainTabProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

const SchedulerMainTab: React.FC<SchedulerMainTabProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const location = useLocation();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const activeTab = useMemo(() => {
    const segments = location.pathname.split("/");
    const lastSegment = segments[segments.length - 1];

    //  ensure correct tab detection
    if (["rostergeneration"].includes(lastSegment)) {
      return lastSegment;
    }

    return "rostergeneration"; // default fallback
  }, [location.pathname]);

  /* ================= HEADER CONTROL ================= */

  useEffect(() => {
    switch (activeTab) {
      case "rostergeneration":
        setDynamicHeaderText("Shift Scheduler");
        break;
    }

    setDynamicHeaderIcon(<PeopleAltIcon sx={{ color: "white" }} />);
  }, [activeTab, setDynamicHeaderText, setDynamicHeaderIcon]);

  /* ================= UI ================= */

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
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
          backgroundColor: theme.palette.primary.main,
          borderRadius: 4,
        },
      }}
    >
      {/* ================= TABS ================= */}

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
          variant="scrollable"
          scrollButtons="auto"
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
          <Tab
            label="Shift Scheduler"
            value="rostergeneration" //  must match route
            to="rostergeneration"   //  must match route
            component={Link}
          />
        </Tabs>
      </Box>

      {/* ================= CONTENT ================= */}

      <Box sx={{ p: 2, minHeight: "65vh" }}>
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

export default SchedulerMainTab;