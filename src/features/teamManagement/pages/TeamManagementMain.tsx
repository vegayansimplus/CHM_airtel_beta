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

export const TeamManagementMain = () => {
  const [filters, setFilters] = useState<OrgFilterValues>({});
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const user = useAppSelector((s) => s.auth.user);
  if (!user) return "No user found";

  const roleCode = user.roleCode;

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

  //  MEMOIZED VALUES (avoid re-renders)
  const tableData = useMemo(() => data?.content ?? [], [data]);
  const totalRowCount = useMemo(() => data?.totalElements ?? 0, [data]);

  //  Reset page when filter/status changes
  // useEffect(() => {
  //   setPagination((prev) => ({
  //     ...prev,
  //     pageIndex: 0,
  //   }));
  // }, [status, subDomainId]);

  useEffect(() => {
    if (!totalRowCount) return;

    setPagination((prev) => ({
      ...prev,
      pageSize: totalRowCount < 15 ? totalRowCount : 15,
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

      <TeamSkillSetTable
        data={tableData}
        totalRowCount={totalRowCount}
        // isLoading={isFetching}
        pagination={pagination}
        setPagination={setPagination}
        roleCode={roleCode as "User" | "Team Lead" | "Super Admin"}
        overview={overview}
      />
    </>
  );
};

// import { useEffect, useState } from "react";
// import TeamSkillSetTable from "../components/teamDetailsTable/TeamSkillSetTable";

// import { useGetEmployeesBySubDomainQuery } from "../../orgHierarchy/api/orgHierarchy.api";
// import type { OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
// import { TeamManagementFilter } from "../components/filters/TeamManagementFilter";
// import type { MRT_PaginationState } from "material-react-table";
// import { useAppSelector } from "../../../app/hooks";

// export const TeamManagementMain = () => {
//   const [filters, setFilters] = useState<OrgFilterValues>({});
//   const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

//   const user = useAppSelector((s) => s.auth.user);
//   if (!user) return "No user found";
//   const roleCode = user.roleCode;
//   const [pagination, setPagination] = useState<MRT_PaginationState>({
//     pageIndex: 0,
//     pageSize: 5,
//   });

//   const subDomainId = filters.subDomain;

//   const { data, isFetching } = useGetEmployeesBySubDomainQuery(
//     {
//       subDomainId: subDomainId as number,
//       employeeStatus: status,
//       page: pagination.pageIndex,
//       size: pagination.pageSize,
//     },
//     {
//       skip: !subDomainId,
//     },
//   );

//   const tableData = data?.content ?? [];
//   const totalRowCount = data?.totalElements ?? 0;
//   const totalPages = data?.totalPages ?? 0;
//   useEffect(() => {
//     setPagination((prev) => ({ ...prev, pageIndex: 0 }));
//   }, [status]);

//   return (
//     <>
//       {/* FILTER BAR */}
//       <TeamManagementFilter
//         filters={filters}
//         setFilters={setFilters}
//         status={status}
//         setStatus={setStatus}
//         // exportData={tableData}
//       />

//       {/* TOP INFO CARD */}
//       {/* <TeamTopInfoCard levelCount={[]} /> */}

//       {/* TABLE */}
//       <TeamSkillSetTable
//         data={tableData}
//         totalRowCount={totalRowCount}
//         totalPages={totalPages}
//         isLoading={isFetching}
//         pagination={pagination}
//         setPagination={setPagination}
//         roleCode={roleCode as "User" | "Team Lead" | "Super Admin"}
//       />
//     </>
//   );
// };
