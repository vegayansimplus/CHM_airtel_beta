import { Alert, Box, Snackbar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Chip, Fade, Paper, Typography, useTheme } from "@mui/material";

import { useActivity } from "../hooks/useActivity";
import { ActivityList } from "../components/activitySetup/ActivityList";
import { CreateActivity } from "../components/activitySetup/CreateActivity";
import { ConfigurePhases } from "../components/activitySetup/ConfigurePhases";
// import { TeamManagementFilter } from "../../teamManagement/components/filters/TeamManagementFilter";
// import { useState } from "react";
// import type { OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";

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
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);
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
    <>
      <Box>
        <OrgHierarchyFilters
          role={roleName}
          values={values}
          options={options}
          onChange={handleChange}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
        }}
      >
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
    </>
  );
};

export const ActivityViewAndSetupMain = () => <ActivityViewAndSetup />;
