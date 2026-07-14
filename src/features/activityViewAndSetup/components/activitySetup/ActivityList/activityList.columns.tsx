import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";

import type { ActivityViewRow } from "../../../types/activity.types";
import { ImpactBadge, StatusBadge } from "../shared/badges";

export const useActivityColumns = (
  onViewPhases: (row: ActivityViewRow) => void,
): MRT_ColumnDef<ActivityViewRow>[] => {
  const theme = useTheme();

  return useMemo<MRT_ColumnDef<ActivityViewRow>[]>(
    () => [
      {
        accessorKey: "activityName",
        header: "Activity",
        size: 190,
        minSize: 140,
        Cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "primary.main",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => onViewPhases(row.original)}
          >
            {row.original.activityName}
          </Typography>
        ),
      },
      {
        accessorKey: "domain",
        header: "Domain",
        size: 100,
        Cell: ({ cell }) => <Typography sx={{ fontSize: 12 }}>{cell.getValue<string>()}</Typography>,
      },
      {
        accessorKey: "layer",
        header: "Layer",
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{cell.getValue<string>()}</Typography>
        ),
      },
      {
        accessorKey: "planType",
        header: "Plan",
        size: 80,
        Cell: ({ cell }) => <Typography sx={{ fontSize: 12 }}>{cell.getValue<string>()}</Typography>,
      },
      {
        accessorKey: "vendorOem",
        header: "Vendor / OEM",
        size: 110,
        Cell: ({ cell }) => <Typography sx={{ fontSize: 12 }}>{cell.getValue<string>()}</Typography>,
      },
      {
        accessorKey: "changeImpact",
        header: "Impact",
        size: 90,
        filterVariant: "select",
        filterSelectOptions: ["Low", "Medium", "High", "Critical"],
        Cell: ({ cell }) => <ImpactBadge value={cell.getValue<string>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 90,
        filterVariant: "select",
        filterSelectOptions: ["Active", "Inactive", "Draft", "Pending"],
        Cell: ({ cell }) => <StatusBadge value={cell.getValue<string>()} />,
      },
      {
        id: "actions",
        header: "Actions",
        size: 70,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Tooltip title="View phases" placement="top">
              <IconButton
                size="small"
                onClick={() => onViewPhases(row.original)}
                sx={{
                  p: "3px",
                  borderRadius: 1,
                  color: "text.secondary",
                  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <VisibilityIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [theme, onViewPhases],
  );
};
