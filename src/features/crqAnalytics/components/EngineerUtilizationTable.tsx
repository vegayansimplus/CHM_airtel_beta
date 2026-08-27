import { useMemo, useState } from "react";
import { Box, LinearProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_VisibilityState,
} from "material-react-table";
import type { EngineerUtilizationDto } from "../types/crqAnalytics.types";
import { buildRowsPerPageOptions } from "../utils/paginationOptions";
import { EmptyOrErrorState } from "./EmptyOrErrorState";

interface Props {
  rows: EngineerUtilizationDto[];
  isLoading?: boolean;
  isError?: boolean;
}

const utilizationColor = (pct: number): "success" | "warning" | "error" => (pct >= 80 ? "success" : pct >= 50 ? "warning" : "error");

export function EngineerUtilizationTable({ rows, isLoading, isError }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 });

  const rowsPerPageOptions = useMemo(
    () => buildRowsPerPageOptions(rows.length, pagination.pageSize),
    [rows.length, pagination.pageSize],
  );

  const columnVisibility = useMemo<MRT_VisibilityState>(
    () => ({
      skillTags: !isDownMd,
      planAndInventoryValidation: !isDownLg,
      impactAnalysis: !isDownLg,
      mopCreate: !isDownLg,
      mopValidate: !isDownLg,
      schedulingAndApprovals: !isDownLg,
      networkExecution: !isDownLg,
      taskClosure: !isDownLg,
    }),
    [isDownMd, isDownLg],
  );

  const columns = useMemo<MRT_ColumnDef<EngineerUtilizationDto>[]>(
    () => [
      { accessorKey: "engineerName", header: "Engineer", size: 170 },
      { accessorKey: "teamFunction", header: "Function", size: 120 },
      { accessorKey: "skillTags", header: "Skills", size: 160 },
      { accessorKey: "planAndInventoryValidation", header: "Plan & Inv.", size: 90 },
      { accessorKey: "impactAnalysis", header: "Impact", size: 80 },
      { accessorKey: "mopCreate", header: "MOP Create", size: 90 },
      { accessorKey: "mopValidate", header: "MOP Validate", size: 100 },
      { accessorKey: "schedulingAndApprovals", header: "Scheduling", size: 90 },
      { accessorKey: "networkExecution", header: "Execution", size: 90 },
      { accessorKey: "taskClosure", header: "Closure", size: 80 },
      { accessorKey: "totalTasks", header: "Total Tasks", size: 90 },
      {
        accessorKey: "utilizationPct",
        header: "Utilization",
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
    state: { columnVisibility, isLoading, pagination },
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    enableStickyHeader: true,
    paginationDisplayMode: "pages",
    // The card grows with its content, so the table body has to be what
    // scrolls — otherwise picking "show every row" stretches the dashboard.
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
