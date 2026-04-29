import { Alert, Box, Dialog, Snackbar } from "@mui/material";
import { useActivity } from "./hooks/useActivity";
import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { PlanViewTable } from "./components/PlanViewTable";
import { CreateActivity } from "./components/CreateActivity";
import { ConfigurePhases } from "./components/ConfigurePhases";
import { PlanDetailDialog } from "./components/PlanDetailDialog";

export const PlanViewAndSetup = () => {
  const {
    viewMode,
    goToList,
    snackbar,
    handleCloseSnackbar,
    selectedPlan,
    planDialogOpen,
    handleClosePlanDialog,
  } = useActivity();

  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

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
        {/* Pass ALL filter values — not just subDomain */}
        <PlanViewTable
          verticalId={values.vertical}
          functionId={values.teamFunction}
          domainId={values.domain}
          subDomainId={values.subDomain}
        />

        <PlanDetailDialog
          open={planDialogOpen}
          plan={selectedPlan}
          onClose={handleClosePlanDialog}
        />

        <Dialog
          open={viewMode === "create"}
          onClose={goToList}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
          {viewMode === "create" && <CreateActivity />}
        </Dialog>

        <Dialog
          open={viewMode === "configure"}
          onClose={goToList}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: "hidden", minHeight: "85vh" },
          }}
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

export const ActivityViewAndSetupMain = () => <PlanViewAndSetup />;
