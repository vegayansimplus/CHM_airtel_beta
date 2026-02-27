import React, { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Column,
} from "material-react-table";
import { useTheme, alpha } from "@mui/material";
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { TeamTopInfoCard } from "./TeamTopInfoCard";
import FilterSvg from "../../../../assets/svg/NoDataFound.svg";
import { CreateEditMemberDialog } from "../dialog/CreateEditMemberDialog";
import { ExitEmployeeDialog } from "../dialog/ExitEmployeeDialog";

/* ================= LEVEL COLOR MAP ================= */

const levelColorMap: Record<string, { bg: string; color: string }> = {
  L1: { bg: "#E3F2FD", color: "#1565C0" },
  L2: { bg: "#E8F5E9", color: "#2E7D32" },
  L3: { bg: "#FFF3E0", color: "#EF6C00" },
  L4: { bg: "#FDECEA", color: "#C62828" },
};

/* ================= MULTI SELECT FILTER ================= */

const MultiSelectFilter = ({
  column,
  options,
}: {
  column: MRT_Column<any>;
  options: string[];
}) => {
  // const selected = (column.getFilterValue() as string[]) || [];
  const rawValue = column.getFilterValue();
  const selected = Array.isArray(rawValue) ? rawValue : [];

  return (
    <FormControl variant="standard" sx={{ minWidth: 140 }}>
      <Select
        multiple
        value={selected}
        onChange={(e) => column.setFilterValue(e.target.value)}
        renderValue={(selected) =>
          (selected as string[]).length > 2
            ? `${(selected as string[]).length} selected`
            : (selected as string[]).join(", ")
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selected.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

/* ================= PROPS ================= */

interface OverviewType {
  l1Count: number;
  l2Count: number;
  l3Count: number;
  l4Count: number;
  teamLead: string;
  totalCount: number;
}

interface Props {
  data: Record<string, any>[];
  totalRowCount: number;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  roleCode: "User" | "Team Lead" | "Super Admin";
  overview?: OverviewType;
  isFilterSelected: boolean;
}

const DEFAULT_VISIBLE = [
  "olmId",
  "employeeName",
  "emailId",
  "mobileNo",
  "jobLevel",
  "employmentType",
  "designation",
  "officeLocation",
];

const STORAGE_KEY = "team-table-column-visibility";

const TeamSkillSetTable: React.FC<Props> = ({
  data,
  totalRowCount,
  pagination,
  setPagination,
  roleCode,
  overview,
  isFilterSelected,
}) => {
  const [editData, setEditData] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const theme = useTheme();
  const handleEdit = (rowData: any) => {
    setEditData(rowData);
    setDialogOpen(true);
  };

  const handleDelete = (rowData: any) => {
    setSelectedRow(rowData);
    setExitDialogOpen(true);
  };

  /* ================= COLUMN KEYS ================= */

  const columnKeys = useMemo(() => {
    if (!data?.length) return [];
    return Object.keys(data[0]).filter((key) => key !== "userId");
  }, [data]);

  /* ================= FILTER OPTIONS ================= */

  const columnFilterOptions = useMemo(() => {
    const map: Record<string, string[]> = {};

    columnKeys.forEach((key) => {
      map[key] = Array.from(
        new Set(
          data
            .map((row) => row[key])
            .filter((val) => val !== null && val !== undefined)
            .map((val) => val.toString()),
        ),
      );
    });

    return map;
  }, [data, columnKeys]);

  /* ================= COLUMNS ================= */

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => {
    const baseColumns: MRT_ColumnDef<any>[] = columnKeys.map((key) => ({
      accessorKey: key,
      header: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      size: 160,
      enableColumnFilter: true,

      Filter: ({ column }) => (
        <MultiSelectFilter
          column={column}
          options={columnFilterOptions[key] || []}
        />
      ),

      filterFn: (row, id, filterValue) => {
        if (!filterValue?.length) return true;
        const rowValue = row.getValue(id)?.toString().toLowerCase() || "";
        return filterValue.some((val: string) =>
          rowValue.includes(val.toLowerCase()),
        );
      },

      Cell:
        key === "jobLevel"
          ? ({ cell }) => {
              const value = cell.getValue<string>();
              const style = levelColorMap[value] || {
                bg: "#f5f5f5",
                color: "#555",
              };

              return (
                <Chip
                  label={value}
                  size="small"
                  sx={{
                    backgroundColor: style.bg,
                    color: style.color,
                    fontWeight: 600,
                    borderRadius: "8px",
                    minWidth: 45,
                  }}
                />
              );
            }
          : key === "employmentType"
            ? ({ cell }) => (
                <Chip
                  label={cell.getValue<string>()}
                  size="small"
                  sx={{
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                    fontWeight: 500,
                    borderRadius: "8px",
                  }}
                />
              )
            : undefined,
    }));

    if (roleCode !== "User") {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box display="flex" gap={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(row.original)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row.original)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      });
    }

    return baseColumns;
  }, [columnKeys, roleCode, columnFilterOptions]);

  /* ================= COLUMN VISIBILITY ================= */

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (!columnKeys.length) return;

    if (Object.keys(columnVisibility).length === 0) {
      const visibility: Record<string, boolean> = {};
      columnKeys.forEach((key) => {
        visibility[key] = DEFAULT_VISIBLE.includes(key);
      });
      setColumnVisibility(visibility);
    }
  }, [columnKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  /* ================= TABLE ================= */

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    rowCount: totalRowCount,
    onPaginationChange: setPagination,
    state: { pagination, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableStickyHeader: true,
    enableColumnPinning: true,
    // muiTableHeadCellProps: {
    //   sx: {
    //     backgroundColor: "#f4f6f8",
    //     fontWeight: 700,
    //     fontSize: "13px",
    //   },
    // },

    /* ================= HEADER ================= */
    muiTableHeadCellProps: {
      sx: {
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.15)
            : alpha(theme.palette.primary.main, 0.08),

        color: theme.palette.text.primary,
        textAlign: "center",
        fontWeight: 600,
        border: `1px solid ${theme.palette.divider}`,
      },
    },

    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        padding: "4px 8px",
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
    },

    muiTableContainerProps: {
      sx: {
        maxHeight: {
          xs: "100px",
          sm: "100px",
          md: "180px",
          lg: "300px",
          xl: "390px",
        },

        backgroundColor: theme.palette.background.paper,

        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-track": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.primary.main,
          borderRadius: "6px",
        },
      },
    },
    muiPaginationProps: {
      rowsPerPageOptions: useMemo(() => {
        const baseOptions = [5, 10, 15, 20, 25, 50];

        // Add totalRowCount if not already included
        const options =
          totalRowCount > 0
            ? Array.from(new Set([...baseOptions, totalRowCount])).sort(
                (a, b) => a - b,
              )
            : baseOptions;

        return options;
      }, [totalRowCount]),
    },

    initialState: {
      density: "compact",
      columnPinning: {
        right: roleCode !== "User" ? ["actions"] : [],
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box display="flex" alignItems="center" gap={1}>
        <TeamTopInfoCard overview={overview} />
      </Box>
    ),
  });

  if (!isFilterSelected) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <img src={FilterSvg} alt="Select Filter" width={850} />
      </Box>
    );
  }

  return (
    <>
      <MaterialReactTable table={table} />

      {dialogOpen && (
        <CreateEditMemberDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          actorUserId={2}
          mode="edit"
          editData={editData}
        />
      )}

      {selectedRow && (
        <ExitEmployeeDialog
          open={exitDialogOpen}
          onClose={() => setExitDialogOpen(false)}
          actorUserId={1}
          userId={selectedRow.userId}
          employeeName={selectedRow.employeeName}
          employeeOlmId={selectedRow.olmId}
        />
      )}
    </>
  );
};

export default TeamSkillSetTable;
