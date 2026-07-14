import { Box } from "@mui/material";
import { useActivity } from "./hooks/useActivity";
import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { PlanViewTable } from "./components/PlanViewTable";
import { PlanDetailDialog } from "./components/PlanDetailDialog";

export const PlanViewAndSetup = () => {
  const { selectedPlan, planDialogOpen, handleClosePlanDialog } = useActivity();

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
          chmDomainOptions={options.domain}
          chmSubDomainOptions={options.subDomain}
          selectedChmDomain={values.domain}
          selectedChmSubDomain={values.subDomain}
        />

        <PlanDetailDialog
          open={planDialogOpen}
          plan={selectedPlan}
          onClose={handleClosePlanDialog}
        />
      </Box>
    </>
  );
};

export const ActivityViewAndSetupMain = () => <PlanViewAndSetup />;
