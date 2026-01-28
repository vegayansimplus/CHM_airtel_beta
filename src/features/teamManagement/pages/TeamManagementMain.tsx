import { useMemo, useState } from "react";
// import TeamManagementFilter from "./TeamManagementFilter";
import TeamSkillSetTable from "../components/teamDetailsTable/TeamSkillSetTable";

import { useGetEmployeesBySubDomainQuery } from "../../orgHierarchy/api/orgHierarchy.api";
import type { OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
import type { EmployeeDto } from "../types/employee.types";
import type { TeamSkillSet } from "../types/teamSkillset.types";
import { TeamManagementFilter } from "../components/filters/TeamManagementFilter";
import { TeamTopInfoCard } from "../components/topInfoCard/TopInfoCardMain";

export const TeamManagementMain = () => {
  const [filters, setFilters] = useState<OrgFilterValues>({});

  const subDomainId = filters.subDomain;

  //  CALL API ONLY AFTER SUB-DOMAIN IS SELECTED
  const { data = [], isFetching } = useGetEmployeesBySubDomainQuery(
    { subDomainId: subDomainId! },
    { skip: !subDomainId }, // 🔒 CRITICAL
  );

  //  MAP BACKEND DTO → TABLE MODEL
  const tableData = useMemo<TeamSkillSet[]>(() => {
    return data.map((e: EmployeeDto) => ({
      olmId: e.olmId,
      employeeName: e.employeeName,
      teamFunction: "-", // not provided by API yet
      subFunction: "-", // not provided by API yet
      designation: e.designation,
      role: "TEAM_MEMBER",
      level: e.jobLevel,
      payRoll: e.employmentType,
      companyName: e.vendorCompany,
      domain: "-",
      vendor: e.deviceVendorCapability
        ? e.deviceVendorCapability.split(",")
        : [],
      gender: e.gender,
      officeLocation: e.officeLocation,
      status: e.employeeStatus === "ACTIVE" ? "Active" : "Inactive",
    }));
  }, [data]);

  return (
    <>
      {/* FILTER BAR */}
      <TeamManagementFilter filters={filters} setFilters={setFilters} />

      <>
        <TeamTopInfoCard levelCount={[]} />
      </>

      {/* TABLE */}
      <TeamSkillSetTable data={tableData} userRole="Super Admin" />
    </>
  );
};
