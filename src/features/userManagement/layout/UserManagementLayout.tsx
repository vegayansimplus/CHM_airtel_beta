import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Box, Tabs, Tab, useTheme } from "@mui/material";
import { useTabColorTokens } from "../../../style/theme";
import AnimatedOutlet from "../../../components/loading/AnimatedOutlet";
import { SHELL_MIN_HEIGHT } from "../../../components/layout/layoutConstants";

const TAB_ROUTES = ["usermang", "userlogs"] as const;
type TabRoute = (typeof TAB_ROUTES)[number];

const TAB_LABELS: Record<TabRoute, string> = {
  usermang: "User Management",
  userlogs: "User Log Details",
};

const UserManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const t = useTabColorTokens(theme);

  // Derive active tab from current URL
  const activeTab = TAB_ROUTES.findIndex((route) => pathname.endsWith(route));
  const currentTab = activeTab === -1 ? 0 : activeTab;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(TAB_ROUTES[newValue]);
  };

  return (
    <Box
      sx={{
        backgroundColor: t.accentDim,
        maxWidth: "100%",
        minHeight: SHELL_MIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
        // Sidebar rail inset + fixed header offset — the app-wide shell
        // convention (see ReusableTabLayout).
        pl: 8,
        // Stays scrollable: `minHeight: 100vh` already gives the flex column a
        // definite height for User Management to fit itself into, while the
        // sibling User Log Details tab is a naturally-growing page that needs
        // somewhere to overflow. Local ::-webkit-scrollbar rules were dropped —
        // index.css styles scrollbars app-wide now.
        overflow: "auto",
      }}
    >
      {/* Tab bar */}
      <Box
        sx={{
          mt: "45px",
          flexShrink: 0,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="user management tabs"
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: 13.5,
              minHeight: 44,
              py: 0,
            },
            "& .Mui-selected": { fontWeight: 700 },
            // A plain 2px underline instead of the pointing triangle the old
            // shell drew: the triangle sat on the panel's bottom edge and read
            // as a stray glyph once the panel itself lost its glass border.
            "& .MuiTabs-indicator": { height: 2, borderRadius: "2px 2px 0 0" },
          }}
        >
          {TAB_ROUTES.map((route) => (
            <Tab key={route} label={TAB_LABELS[route]} />
          ))}
        </Tabs>
      </Box>

      {/* Routed child renders here.
          `minHeight: 0` is what lets this region resolve to "whatever the
          viewport has left under the tab bar" instead of growing to its own
          content height — routed pages can then flex-fill and scroll their own
          data region rather than pushing the whole shell into a page scroll. */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AnimatedOutlet />
      </Box>
    </Box>
  );
};

export default UserManagementLayout;
