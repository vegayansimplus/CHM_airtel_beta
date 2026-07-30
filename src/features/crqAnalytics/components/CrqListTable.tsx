import { useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_PaginationState } from "material-react-table";
import { useGetCrqAnalyticsListQuery } from "../api/crqAnalyticsApi";
import type { CRQAnalyticsFilterParams, CRQListRowDto } from "../types/crqAnalytics.types";
import { EmptyOrErrorState } from "./EmptyOrErrorState";

interface Props {
  filters: CRQAnalyticsFilterParams;
  onRowClick: (crqNo: string) => void;
}

const statusColor = (status: string): "success" | "warning" | "error" | "default" => {
  const s = status.toUpperCase();
  if (s.includes("CLOS")) return "success";
  if (s.includes("REJECT") || s.includes("CANCEL")) return "error";
  if (s.includes("OPEN") || s.includes("PROGRESS")) return "warning";
  return "default";
};

export function CrqListTable({ filters, onRowClick }: Props) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 25 });

  // status/stage filters intentionally omitted here — the backend's accepted
  // values for those two params aren't confirmed anywhere in this migration's
  // source material, so we default to "ALL" rather than guess at an enum.
  const { data, isFetching, isError } = useGetCrqAnalyticsListQuery({
    ...filters,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const columns = useMemo<MRT_ColumnDef<CRQListRowDto>[]>(
    () => [
      { accessorKey: "crqNo", header: "CRQ No.", size: 140 },
      { accessorKey: "currentStage", header: "Stage", size: 160 },
      {
        accessorKey: "currentStatus",
        header: "Status",
        size: 130,
        Cell: ({ cell }) => <Chip label={cell.getValue<string>()} size="small" color={statusColor(cell.getValue<string>())} />,
      },
      { accessorKey: "domain", header: "Domain", size: 140 },
      { accessorKey: "subDomain", header: "Sub Domain", size: 150 },
      { accessorKey: "schedulingFlag", header: "Scheduling", size: 110 },
      { accessorKey: "approvalFlag", header: "Approval", size: 110 },
      {
        accessorKey: "createdAt",
        header: "Created",
        size: 140,
        Cell: ({ cell }) => {
          const v = cell.getValue<string>();
          return v ? new Date(v).toLocaleDateString() : "—";
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: data?.rows ?? [],
    manualPagination: true,
    rowCount: data?.totalCount ?? 0,
    onPaginationChange: setPagination,
    state: { pagination, isLoading: isFetching },
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick(row.original.crqNo),
      sx: { cursor: "pointer" },
    }),
    renderEmptyRowsFallback: () => (
      <Box sx={{ py: 4 }}>
        <EmptyOrErrorState kind={isError ? "error" : "empty"} />
      </Box>
    ),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
