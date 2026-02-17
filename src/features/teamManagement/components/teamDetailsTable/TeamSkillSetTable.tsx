import React, { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from "material-react-table";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { TeamTopInfoCard } from "./TeamTopInfoCard";

/* ================= LEVEL COLOR MAP ================= */

const levelColorMap: Record<string, { bg: string; color: string }> = {
  L1: { bg: "#E3F2FD", color: "#1565C0" },
  L2: { bg: "#E8F5E9", color: "#2E7D32" },
  L3: { bg: "#FFF3E0", color: "#EF6C00" },
  L4: { bg: "#FDECEA", color: "#C62828" },
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
  // isLoading: boolean;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  roleCode: "User" | "Team Lead" | "Super Admin";
  overview?: OverviewType;
}

/* ================= DEFAULT COLUMN VISIBILITY ================= */

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

/* ============================================================= */

const TeamSkillSetTable: React.FC<Props> = ({
  data,
  totalRowCount,
  // isLoading,
  pagination,
  setPagination,
  roleCode,
  overview,
}) => {
  /* ================= ACTION HANDLERS ================= */

  const handleEdit = (userId: number) => {
    console.log("Edit:", userId);
  };

  const handleDelete = (userId: number) => {
    console.log("Delete:", userId);
  };

  /* ================= STABLE COLUMN KEYS ================= */
  // Prevent columns regenerating on every render
  const columnKeys = useMemo(() => {
    if (!data?.length) return [];
    return Object.keys(data[0]).filter((key) => key !== "userId");
  }, [data]);

  /* ================= COLUMNS ================= */

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => {
    const baseColumns: MRT_ColumnDef<any>[] = columnKeys.map((key) => ({
      accessorKey: key,
      header: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      size: 160,
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
                onClick={() => handleEdit(row.original.userId)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row.original.userId)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      });
    }

    return baseColumns;
  }, [columnKeys, roleCode]);

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

  /* ================= TABLE CONFIG ================= */

  const table = useMaterialReactTable({
    columns,
    data,

    // SERVER SIDE PAGINATION
    manualPagination: true,
    rowCount: totalRowCount,

    onPaginationChange: setPagination,

    state: {
      pagination,
      // isLoading,
      columnVisibility,
    },

    onColumnVisibilityChange: setColumnVisibility,

    // muiPaginationProps: {
    //   rowsPerPageOptions: [5, 10, 15, 20, 25, 50],
    // },
    muiPaginationProps: {
  rowsPerPageOptions: useMemo(() => {
    const baseOptions = [5, 10, 15, 20, 25, 50];

    // Add totalRowCount if not already included
    const options = totalRowCount > 0
      ? Array.from(new Set([...baseOptions, totalRowCount])).sort((a, b) => a - b)
      : baseOptions;

    return options;
  }, [totalRowCount]),
},


    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enableColumnPinning: true,

    initialState: {
      density: "compact",
      columnPinning: {
        right: roleCode !== "User" ? ["actions"] : [],
      },
    },

    muiTableHeadCellProps: {
      sx: {
        backgroundColor: "#f4f6f8",
        fontWeight: 700,
        fontSize: "13px",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        padding: "1px",
        pl: 1,
      },
    },

    renderTopToolbarCustomActions: () => (
      <Box display="flex" alignItems="center" gap={1}>
        {/* <TeamTopInfoCard levelCount={[]} /> */}
        <TeamTopInfoCard overview={overview} />
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default TeamSkillSetTable;
