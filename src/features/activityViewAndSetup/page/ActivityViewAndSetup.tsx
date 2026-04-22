import { Alert, Box, Dialog, Snackbar } from "@mui/material";
import { useTheme } from "@mui/material";

import { useActivity } from "../hooks/useActivity";
import { ActivityList } from "../components/activitySetup/ActivityList";
import { CreateActivity } from "../components/activitySetup/CreateActivity";
import { ConfigurePhases } from "../components/activitySetup/ConfigurePhases";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";

export const ActivityViewAndSetup = () => {
  const { viewMode, goToList, snackbar, handleCloseSnackbar } = useActivity();
  const theme = useTheme();

  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const subDomainID = values.subDomain;

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
        {/* Table is ALWAYS rendered to stay in background */}
        <ActivityList subDomainID={subDomainID} />

        {/* Create Activity Dialog */}
        <Dialog
          open={viewMode === "create"}
          onClose={goToList}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
          {viewMode === "create" && <CreateActivity />}
        </Dialog>

        {/* Configure Phases Dialog */}
        <Dialog
          open={viewMode === "configure"}
          onClose={goToList}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", minHeight: "85vh" } }}
        >
          {viewMode === "configure" && <ConfigurePhases />}
        </Dialog>

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