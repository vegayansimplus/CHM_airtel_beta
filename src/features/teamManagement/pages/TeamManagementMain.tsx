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

export const TeamManagementMain = () => {
  //  ALL hooks before any conditional return
  const user = useAppSelector((s) => s.auth.user);

  const [filters, setFilters] = useState<OrgFilterValues>({});
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [filteredRows, setFilteredRows] = useState<Record<string, any>[]>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 14,
  });

  const subDomainId = filters.subDomain;

  const { data } = useGetEmployeesBySubDomainQuery(
    {
      subDomainId: subDomainId as number,
      employeeStatus: status,
      page: pagination.pageIndex,
      size: pagination.pageSize,
    },
    { skip: !subDomainId },
  );

  const { data: overviewData } = useGetEmpCountBySubDomainIdQuery(
    { subDomainId: subDomainId as number },
    { skip: !subDomainId },
  );

  const tableData = useMemo(() => data?.content ?? [], [data]);
  const totalRowCount = useMemo(() => data?.totalElements ?? 0, [data]);

  // Sync filteredRows with fresh server data (column filters clear on new fetch)
  useEffect(() => {
    setFilteredRows(tableData);
  }, [tableData]);

  // Adjust page size when total record count is known
  useEffect(() => {
    if (!totalRowCount) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: totalRowCount < 14 ? totalRowCount : 14,
    }));
  }, [totalRowCount]);

  //  Early return AFTER all hooks
  if (!user) return <Box>No user found</Box>;

  const roleCode = user.roleCode;
  const overview = overviewData?.[0];

  return (
    <>
      <TeamManagementFilter
        filters={filters}
        setFilters={setFilters}
        status={status}
        setStatus={setStatus}
        filteredRows={filteredRows}
        totalRowCount={totalRowCount}
        currentPageSize={pagination.pageSize}
      />
      <Box sx={{ p: 0.5 }} />
      <TeamSkillSetTable
        data={tableData}
        totalRowCount={totalRowCount}
        pagination={pagination}
        setPagination={setPagination}
        roleCode={roleCode as "User" | "Team Lead" | "Super Admin"}
        overview={overview}
        isFilterSelected={Boolean(subDomainId)}
        onFilteredRowsChange={setFilteredRows}
      />
    </>
  );
};
