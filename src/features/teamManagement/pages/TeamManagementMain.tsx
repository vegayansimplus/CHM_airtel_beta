import { useEffect, useMemo, useState } from "react";
import TeamSkillSetTable from "../components/teamDetailsTable/TeamSkillSetTable";
import {
  useGetEmpCountBySubDomainIdQuery,
  useGetEmployeesBySubDomainQuery,
} from "../../orgHierarchy/api/orgHierarchy.api";
import type { OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
import { TeamManagementFilter } from "../components/filters/TeamManagementFilter";
import type { MRT_PaginationState } from "material-react-table";
import { useAppSelector } from "../../../app/hooks";
import { Box } from "@mui/material";
// import CommonContainer from "../../../components/common/CommonContainer";
export const TeamManagementMain = () => {
  const [filters, setFilters] = useState<OrgFilterValues>({});
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return "No user found";

  const roleCode = user.roleCode;
  const isFilterSelected = Boolean(filters.subDomain);

  //  START PAGE SIZE = 15
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const subDomainId = filters.subDomain;

  //  API CALL (Spring Boot is 0-based → correct)
  const { data, isFetching } = useGetEmployeesBySubDomainQuery(
    {
      subDomainId: subDomainId as number,
      employeeStatus: status,
      page: pagination.pageIndex,
      size: pagination.pageSize,
    },
    {
      skip: !subDomainId,
    },
  );

  const tableData = useMemo(() => data?.content ?? [], [data]);
  const totalRowCount = useMemo(() => data?.totalElements ?? 0, [data]);

  useEffect(() => {
    if (!totalRowCount) return;

    setPagination((prev) => ({
      ...prev,
      pageSize: totalRowCount < 14 ? totalRowCount : 14,
    }));
  }, [totalRowCount]);

  const { data: overviewData } = useGetEmpCountBySubDomainIdQuery(
    { subDomainId: subDomainId as number },
    { skip: !subDomainId },
  );
  const overview = overviewData?.[0];
  return (
    <>
      <TeamManagementFilter
        filters={filters}
        setFilters={setFilters}
        status={status}
        setStatus={setStatus}
      />
      <Box sx={{ p: 0.5 }} />
      <TeamSkillSetTable
        data={tableData}
        totalRowCount={totalRowCount}
        // isLoading={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        roleCode={roleCode as "User" | "Team Lead" | "Super Admin"}
        overview={overview}
        isFilterSelected={Boolean(subDomainId)}
      />
    </>
  );
};
