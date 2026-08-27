import { useMemo, useState } from "react";
import { Box, LinearProgress, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from "material-react-table";
import { buildRowsPerPageOptions } from "../utils/paginationOptions";
import { EmptyOrErrorState } from "./EmptyOrErrorState";

export interface FunctionUtilizationRow {
  teamFunction: string;
  totalEngineers: number;
  totalTasks: number;
  plannedHrs: number;
  actualHrs: number;
  avgUtilizationPct: number;
}

interface Props {
  rows: FunctionUtilizationRow[];
  isLoading?: boolean;
  isError?: boolean;
}

const utilizationColor = (pct: number): "success" | "warning" | "error" => (pct >= 80 ? "success" : pct >= 50 ? "warning" : "error");

/** Aggregated view — one row per team function, not per engineer. Deliberately
 * a separate table from EngineerUtilizationTable rather than the same columns
 * with different rows, since that's what the old "Bin/Team" view actually was. */
export function FunctionUtilizationTable({ rows, isLoading, isError }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 });

  const rowsPerPageOptions = useMemo(
    () => buildRowsPerPageOptions(rows.length, pagination.pageSize),
    [rows.length, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<FunctionUtilizationRow>[]>(
    () => [
      { accessorKey: "teamFunction", header: "Function", size: 160 },
      { accessorKey: "totalEngineers", header: "Engineers", size: 100 },
      { accessorKey: "totalTasks", header: "Total Tasks", size: 100 },
      {
        accessorKey: "plannedHrs",
        header: "Planned (h)",
        size: 100,
        Cell: ({ cell }) => `${cell.getValue<number>()}h`,
      },
      {
        accessorKey: "actualHrs",
        header: "Actual (h)",
        size: 100,
        Cell: ({ cell }) => `${cell.getValue<number>()}h`,
      },
      {
        accessorKey: "avgUtilizationPct",
        header: "Avg Utilization",
        size: 150,
        Cell: ({ cell }) => {
          const pct = cell.getValue<number>();
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, pct)}
                color={utilizationColor(pct)}
                sx={{ flex: 1, height: 6, borderRadius: 3 }}
              />
              <Typography sx={{ fontSize: 12, fontWeight: 700, minWidth: 34 }}>{pct}%</Typography>
            </Box>
          );
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: rows,
    onPaginationChange: setPagination,
    state: { isLoading, pagination },
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    enableStickyHeader: true,
    paginationDisplayMode: "pages",
    muiTableContainerProps: {
      sx: { maxHeight: { xs: 300, md: 380, lg: 440, xl: 520 }, minHeight: 200 },
    },
    muiTableHeadCellProps: {
      sx: { backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.12) : theme.palette.grey[50] },
    },
    muiBottomToolbarProps: {
      sx: {
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : theme.palette.grey[50],
        px: 1,
      },
    },
    muiPaginationProps: {
      shape: "rounded",
      size: "small",
      rowsPerPageOptions,
      sx: { "& .MuiButtonBase-root": { fontSize: 12 } },
    },
    renderEmptyRowsFallback: () => (
      <Box sx={{ py: 4 }}>
        <EmptyOrErrorState kind={isError ? "error" : "empty"} />
      </Box>
    ),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
