import { useState } from "react";
import TeamSkillSetTable from "../components/teamDetailsTable/TeamSkillSetTable";

import { useGetEmployeesBySubDomainQuery } from "../../orgHierarchy/api/orgHierarchy.api";
import type { OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
import { TeamManagementFilter } from "../components/filters/TeamManagementFilter";
import { TeamTopInfoCard } from "../components/topInfoCard/TopInfoCardMain";

export const TeamManagementMain = () => {
  const [filters, setFilters] = useState<OrgFilterValues>({});

  const subDomainId = filters.subDomain;

  const { data = [], isFetching } = useGetEmployeesBySubDomainQuery(
    { subDomainId: subDomainId! },
    { skip: !subDomainId },
  );

  return (
    <>
      {/* FILTER BAR */}
      <TeamManagementFilter filters={filters} setFilters={setFilters} />
      <>
        <TeamTopInfoCard levelCount={[]} />
      </>
      {/* TABLE */}
      <TeamSkillSetTable data={data} userRole="Super Admin" />
    </>
  );
};
