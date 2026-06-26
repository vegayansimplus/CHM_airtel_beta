import { Box } from "@mui/material";
import { CrqJourneyPage } from "./pages/CrqJourneyPage";
// import { authStorage } from "../../app/store/auth.storage";
// import { useOrgHierarchyState } from "../orgHierarchy/hooks/useOrgHierarchyState";
// import { useOrgHierarchyFilters } from "../orgHierarchy/hooks/useOrgHierarchyFilters";
// import OrgHierarchyFilters from "../orgHierarchy/components/OrgHierarchyFiltersV2";


export const CrqJourneyMain = () => {
  // const loggedUser = authStorage.getUser();
  // const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  // const { values, handleChange } = useOrgHierarchyState();
  // const { options } = useOrgHierarchyFilters(values);

  return (
    <>
      {/* ── Org Hierarchy Filters ── */}
      {/* <Box>
        
        <OrgHierarchyFilters
          role={roleName}
          values={values}
          options={options}
          onChange={handleChange}
        />
        
      </Box> */}

      {/* ── CRQ Selector + Journey Flow ── */}
      <Box>
        <CrqJourneyPage />
      </Box>
    </>
  );
};
