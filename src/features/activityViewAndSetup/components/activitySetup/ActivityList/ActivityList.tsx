import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Alert, Box, Button, IconButton, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useActivity } from "../../../hooks/useActivity";
import { useGetActivityViewQuery } from "../../../api/acitivityApiSlice";
import type { ActivityViewRow } from "../../../types/activity.types";
import { useActivityColumns } from "./activityList.columns";
import { StatsStrip } from "./StatsStrip";

interface Props {
  subDomainID?: number;
}

export const ActivityList: React.FC<Props> = ({ subDomainID }) => {
  const { goToCreate, openConfigureFor } = useActivity();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    data: apiRows = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActivityViewQuery({ subDomainID }, { skip: subDomainID === undefined });

  const handleViewPhases = (row: ActivityViewRow) => openConfigureFor(row.planId, row.activityId);
  const columns = useActivityColumns(handleViewPhases);

  const table = useMaterialReactTable({
    columns,
    data: apiRows,
    state: { isLoading, showProgressBars: isFetching && !isLoading },
    initialState: {
      density: "compact",
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    enableDensityToggle: true,
    enableStickyHeader: true,
    enableFacetedValues: true,
    enableRowVirtualization: apiRows.length > 80,
    positionGlobalFilter: "left",
    paginationDisplayMode: "pages",

    renderToolbarInternalActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Refresh">
          <span>
            <IconButton size="small" onClick={refetch} disabled={isFetching} sx={{ p: "5px" }}>
              <RefreshIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={goToCreate}
          disableElevation
          sx={{ fontSize: 12, py: 0.5, px: 1.5, borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
        >
          New
        </Button>
      </Box>
    ),

    muiTablePaperProps: {
      elevation: 0,
      variant: "outlined",
      sx: { borderRadius: 2, borderColor: theme.palette.divider, overflow: "auto" },
    },
    muiTableContainerProps: { sx: { maxHeight: "calc(100vh - 360px)", minHeight: 240 } },
    muiTableHeadCellProps: {
      sx: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "text.secondary",
        py: 0.75,
        backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.12) : theme.palette.grey[50],
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    muiTableBodyCellProps: { sx: { py: "1px", fontSize: 12 } },
    muiTableBodyRowProps: {
      sx: {
        "&:hover td": { backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04) },
        transition: "background-color 100ms ease",
      },
    },
    muiTopToolbarProps: {
      sx: {
        px: 1.5,
        py: 0.75,
        minHeight: 46,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        "& .MuiTextField-root": { minWidth: 200 },
      },
    },
    muiBottomToolbarProps: {
      sx: {
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : theme.palette.grey[50],
        px: 1,
      },
    },
    muiPaginationProps: { shape: "rounded", size: "small", sx: { "& .MuiButtonBase-root": { fontSize: 12 } } },
    muiSearchTextFieldProps: {
      size: "small",
      placeholder: "Search…",
      variant: "outlined",
      sx: { "& .MuiOutlinedInput-root": { fontSize: 12, borderRadius: 1.5, height: 30 } },
    },
    muiLinearProgressProps: { color: "primary", sx: { height: 2 } },
    muiSkeletonProps: { height: 22, sx: { borderRadius: 1 } },
    muiFilterTextFieldProps: { size: "small", sx: { "& .MuiOutlinedInput-root": { fontSize: 12 }, mt: 0.5 } },

    renderEmptyRowsFallback: () => (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 5 }}>
        <InfoOutlinedIcon sx={{ fontSize: 34, color: "text.disabled" }} />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          No activities found
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {subDomainID ? "Try adjusting your search or filters." : "Select a Sub Domain to load data."}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={goToCreate}
          sx={{ mt: 0.5, fontSize: 12, textTransform: "none", borderRadius: 1.5 }}
        >
          Create activity
        </Button>
      </Box>
    ),
  });

  if (subDomainID === undefined) {
    return <NoSubDomainState onCreate={goToCreate} />;
  }

  if (isError) {
    return <ActivityListError error={error} onRetry={refetch} onCreate={goToCreate} />;
  }

  return (
    <Box>
      {!isLoading && apiRows.length > 0 && <StatsStrip rows={apiRows} />}
      <MaterialReactTable table={table} />
    </Box>
  );
};

const ListHeader: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
    <Typography variant="subtitle1" fontWeight={700}>
      Activities
    </Typography>
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={onCreate}
      disableElevation
      sx={{ fontSize: 12, textTransform: "none", borderRadius: 1.5, fontWeight: 600 }}
    >
      New Activity
    </Button>
  </Box>
);

const NoSubDomainState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <Box>
    <ListHeader onCreate={onCreate} />
    <Paper variant="outlined" sx={{ p: 5, borderRadius: 2, textAlign: "center" }}>
      <InfoOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
      <Typography variant="body2" fontWeight={600} gutterBottom>
        Select a Sub Domain
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Use the filters above to pick a Sub Domain and load its activities.
      </Typography>
    </Paper>
  </Box>
);

const ActivityListError: React.FC<{ error: unknown; onRetry: () => void; onCreate: () => void }> = ({
  error,
  onRetry,
  onCreate,
}) => (
  <Box>
    <ListHeader onCreate={onCreate} />
    <Alert
      severity="error"
      sx={{ borderRadius: 2 }}
      action={
        <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {(error as { data?: { message?: string } } | undefined)?.data?.message ??
        "Failed to load activities. Please try again."}
    </Alert>
  </Box>
);
