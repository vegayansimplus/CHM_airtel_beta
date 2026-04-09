
import { Alert, Box, Snackbar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Chip, Fade, Paper, Typography, useTheme } from "@mui/material";

import { useActivity } from "../hooks/useActivity";
import { ActivityList } from "../components/activitySetup/ActivityList";
import { CreateActivity } from "../components/activitySetup/CreateActivity";
import { ConfigurePhases } from "../components/activitySetup/ConfigurePhases";

// ─────────────────────────────────────────────
//  ActivityViewAndSetup
//  Drop-in replacement for the empty placeholder
// ─────────────────────────────────────────────

export const ActivityViewAndSetup = () => {
  const { viewMode, snackbar, handleCloseSnackbar } = useActivity();
  const theme = useTheme();

  const viewLabel =
    viewMode === "list"
      ? "Activities"
      : viewMode === "create"
        ? "Create Activity"
        : "Configure Phases";

  const viewAccent =
    viewMode === "list"
      ? theme.palette.primary.main
      : viewMode === "create"
        ? theme.palette.success.main
        : theme.palette.warning.main;

  const headerBg = `linear-gradient(135deg, ${alpha(
    viewAccent,
    theme.palette.mode === "dark" ? 0.28 : 0.14,
  )}, ${alpha(viewAccent, theme.palette.mode === "dark" ? 0.06 : 0.04)})`;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.01)"
            : theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
          background: headerBg,
          borderBottom: `1px solid ${alpha(viewAccent, 0.28)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>
              Activity View & Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create activities, manage status, and configure phase requirements.
            </Typography>
          </Box>

          <Chip
            label={`View: ${viewLabel}`}
            size="small"
            sx={{
              fontWeight: 800,
              borderRadius: 999,
              bgcolor: alpha(viewAccent, theme.palette.mode === "dark" ? 0.22 : 0.12),
              color: viewAccent,
              border: `1px solid ${alpha(viewAccent, theme.palette.mode === "dark" ? 0.55 : 0.30)}`,
              height: 28,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ position: "relative", px: { xs: 1.5, md: 2.5 }, py: { xs: 1.5, md: 2 } }}>
        <Fade key={viewMode} timeout={220} in>
          {/* View switcher — no routing needed, pure Redux state */}
          <Box>
            {viewMode === "list" && <ActivityList />}
            {viewMode === "create" && <CreateActivity />}
            {viewMode === "configure" && <ConfigurePhases />}
          </Box>
        </Fade>

        {/* Global snackbar feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────
//  ActivityViewAndSetupMain
//  Used by AppRoutes as the Outlet child
// ─────────────────────────────────────────────

export const ActivityViewAndSetupMain = () => <ActivityViewAndSetup />;
