// import { Box } from "@mui/material";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { TaskConfig } from "./components/TaskConfig";
import { useGetTaskConfigViewQuery } from "./api/taskConfigApi";

export const TaskConfigMain = () => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const { data, isLoading } = useGetTaskConfigViewQuery(
    { subDomainId: values.subDomain! },
    { skip: !values.subDomain }
  );

  return (
    <>
      <OrgHierarchyFilters
        role={roleName}
        values={values}
        options={options}
        onChange={handleChange}
      />

      <TaskConfig data={data} isLoading={isLoading} />
    </>
  );
};
