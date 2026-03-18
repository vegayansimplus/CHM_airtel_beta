import { Box, Tabs, Tab, CircularProgress, useTheme } from "@mui/material";
import React, { type JSX, Suspense, useEffect, useMemo } from "react";
import { useLocation, Outlet, Link } from "react-router";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useAppSelector } from "../../../app/hooks";

interface SchedularTabViewProps {
  setDynamicHeaderText: (text: string) => void;
  setDynamicHeaderIcon: (icon: JSX.Element) => void;
}

const SchedularTabView: React.FC<SchedularTabViewProps> = ({
  setDynamicHeaderText,
  setDynamicHeaderIcon,
}) => {
  const location = useLocation();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  /* ================= ACTIVE TAB ================= */

  const activeTab = useMemo(() => {
    const path = location.pathname;

    if (path.includes("shiftscheduler")) return "shiftscheduler";
    if (path.includes("action")) return "action";

    return "shiftscheduler"; // default
  }, [location.pathname]);

  /* ================= HEADER CONTROL ================= */

  useEffect(() => {
    if (activeTab === "action") {
      setDynamicHeaderText("Calendar View");
    } else {
      setDynamicHeaderText("Shift Scheduler");
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
      }}
    >
      {/* ================= Tabs ================= */}

      <Box sx={{ mt: "45px" }}>
        <Tabs value={activeTab} variant="scrollable" scrollButtons="auto">
          <Tab
            label="Shift Scheduler"
            value="shiftscheduler"
            component={Link}
            to="shiftscheduler"
          />

          <Tab
            label="Action"
            value="action"
            component={Link}
            to="action"
          />
        </Tabs>
      </Box>

      {/* ================= Content ================= */}

      <Box sx={{ minHeight: "65vh" }}>
        <Suspense fallback={<CircularProgress />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};
export default SchedularTabView;
