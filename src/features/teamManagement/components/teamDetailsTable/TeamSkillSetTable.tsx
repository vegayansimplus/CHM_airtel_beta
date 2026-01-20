import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
} from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import type { TeamSkillSet } from "../../types/teamSkillset.types";
import { teamSkillsetColumns } from "../../utils/tableColumns";

interface Props {
  data: TeamSkillSet[];
  userRole: "User" | "Team Lead" | "Super Admin";
}

const TeamSkillSetTable: React.FC<Props> = ({ data, userRole }) => {
  const columns = useMemo<MRT_ColumnDef<TeamSkillSet>[]>(() => {
    const enhancedColumns = teamSkillsetColumns.map((col) => {
      if (col.accessorKey === "status") {
        return {
          ...col,
          Cell: ({ cell }: { cell: MRT_Cell<TeamSkillSet> }) => {
            const value = cell.getValue<string>();
            return (
              <Chip
                label={value}
                size="small"
                color={value === "Active" ? "success" : "default"}
                sx={{ fontWeight: 600 }}
              />
            );
          },
        };
      }
      return col;
    });

    if (userRole === "User") return enhancedColumns;

    return [
      ...enhancedColumns,
      {
        accessorKey: "action",
        header: "Actions",
        size: 80,
        Cell: () => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
              opacity: 0.6,
              transition: "0.2s",
              "&:hover": { opacity: 1 },
            }}
          >
            <Tooltip title="Edit">
              <IconButton size="small" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  }, [userRole]);

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
    initialState: {
      density: "compact",
    },

    //  TOP TOOLBAR
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Team Skillset Overview
        </Typography>
        <Tooltip title="Manage team members, roles & skills">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
    ),

    //  HEADER STYLE
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

    //  BODY CELLS
    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        padding: "6px 8px",
        borderBottom: "1px solid #f0f0f0",
      },
    },

    //  ROW UX
     
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

    //  EMPTY STATE
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          color: "text.secondary",
        }}
      >
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

