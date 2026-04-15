import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Box, Tabs, Tab, Typography, useTheme } from "@mui/material";
import { useTabColorTokens } from "../../../style/theme";

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
  const bg = useTabColorTokens(theme);

  // Derive active tab from current URL
  const activeTab = TAB_ROUTES.findIndex((route) => pathname.endsWith(route));
  const currentTab = activeTab === -1 ? 0 : activeTab;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(TAB_ROUTES[newValue]);
  };

  return (
    <Box
      sx={{
        // backgroundColor: theme.palette.background.paper,
        backgroundColor: bg.accentDim,
        maxWidth: "100%",
        height: "auto",
        pl: 8,
        overflow: "auto",

        /* THEME-AWARE SCROLLBAR */
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
      {/* Header */}
      <Box sx={{
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
        }}>
       

        {/* Tab Navigation */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="user management tabs"
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
          {TAB_ROUTES.map((route) => (
            <Tab
              key={route}
              label={TAB_LABELS[route]}
              //   icon={TAB_ICONS[route]}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Divider */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }} />

      {/* Routed child renders here */}
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserManagementLayout;
