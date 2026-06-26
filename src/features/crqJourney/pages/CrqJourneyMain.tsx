import { Box } from "@mui/material";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import { useActivity } from "../hooks/useActivity";
export const CrqJourneyMain = () => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  //   const subDomainID = values.subDomain;

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
      <Box>
        {/* Select CRQ Option here  */}

      </Box>

      <Box>
        {/* CRQ Journey logic should be come in this place  */}
    
      </Box>


    </>
  );
};
