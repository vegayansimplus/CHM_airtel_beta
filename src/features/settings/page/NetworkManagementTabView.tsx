import { Box, Tabs, Tab, CircularProgress, useTheme } from "@mui/material";
import React, { Suspense, useMemo } from "react";
import { useLocation, Outlet, Link } from "react-router";
import { useAppSelector } from "../../../app/hooks";
import { useTabColorTokens } from "../../../style/theme";

const NetworkManagementTabView: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const bg = useTabColorTokens(theme);

  if (!user) return null;

  /* ================= ACTIVE TAB DETECTION ================= */

  const activeTab = useMemo(() => {
    const path = location.pathname;

    if (path.includes("networkfreezsetting")) {
      return "networkfreezsetting";
    }

    if (path.includes("adminsetting")) {
      return "adminsetting";
    }

    return "adminsetting"; // default
  }, [location.pathname]);

  return (
    <Box
      sx={{
        backgroundColor: bg.isDark
          ? bg.accentDim
          : theme.palette.background.paper,
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
          {/* ✅ TAB 1 */}
          <Tab
            label="Network Freeze Setting"
            value="networkfreezsetting"
            to="networkfreezsetting"
            component={Link}
          />

          {/* ✅ TAB 2 */}
          <Tab
            label="Admin Setting"
            value="adminsetting"
            to="adminsetting"
            component={Link}
          />
        </Tabs>
      </Box>

      {/* ================= CONTENT ================= */}

      <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "transparent" }}>
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

export default NetworkManagementTabView;
