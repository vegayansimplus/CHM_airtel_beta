import { Box } from "@mui/material";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { TaskConfig } from "./components/TaskConfig";

export const TaskConfigMain = () => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  return (
    <>
     
        <OrgHierarchyFilters
          role={roleName}
          values={values}
          options={options}
          onChange={handleChange}
        />
      
      <TaskConfig />
    </>
  );
};
