import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { generateColumns } from "../../utils/generateColumns";


interface Props {
  data: Record<string, any>[]; 
  userRole: "User" | "Team Lead" | "Super Admin";
}
const TeamSkillSetTable: React.FC<Props> = ({ data, userRole }) => {
  const columns = useMemo<MRT_ColumnDef<Record<string, any>>[]>(() => {
    const dynamicColumns = generateColumns(data);

    if (userRole === "User") return dynamicColumns;

    return [
      ...dynamicColumns,
      {
        id: "actions",
        header: "Actions",
        size: 100,
        Cell: ({ row }) => {
          const userId = row.original.userId; 

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
                opacity: 0.7,
                "&:hover": { opacity: 1 },
              }}
            >
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEdit(userId)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(userId)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [data, userRole]);

  const table = useMaterialReactTable({
    columns,
    data,

    enableColumnFilters: true,
    enableSorting: true,
    enableGrouping: true,
    enableStickyHeader: true,
    enablePagination: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableColumnOrdering: true,
    enableRowVirtualization: true,
    enableColumnResizing: true,
    initialState: {
      density: "compact",
    },

    /* ===================== TOOLBAR ===================== */

    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Team Members Overview
        </Typography>
        <Tooltip title="Manage team members">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
    ),

    /* ===================== STYLES ===================== */

    muiTableHeadCellProps: {
      sx: {
        background:
          "linear-gradient(180deg, #e3f2fd 0%, #f8fbff 100%)",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "12px",
        borderBottom: "1px solid #dbe3ec",
      },
    },

    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        padding: "6px 8px",
        borderBottom: "1px solid #f0f0f0",
      },
    },

    muiTableBodyRowProps: {
      sx: {
        transition: "0.15s",
        "&:hover": {
          backgroundColor: "#f5faff",
          transform: "scale(1.002)",
        },
        "&:nth-of-type(odd)": {
          backgroundColor: "#fcfcfc",
        },
      },
    },

    /* ===================== EMPTY ===================== */

    renderEmptyRowsFallback: () => (
      <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
        <Typography variant="subtitle1" fontWeight={600}>
          No team members found
        </Typography>
        <Typography variant="body2">
          Try adjusting filters or search keywords
        </Typography>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default TeamSkillSetTable;
const handleEdit = (userId: number) => {
  console.log("Edit user:", userId);
};
const handleDelete = (userId: number) => {
  console.log("Delete user:", userId);
};
