import React, { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useActivity } from "../hooks/useActivity";
import { useGetPlanViewQuery, type PlanViewRow } from "../api/planApiSlice";
import { PlanEditDialog } from "./PlanEditDialog"; 

interface Props {
  verticalId?: number;
  functionId?: number;
  domainId?: number;
  subDomainId?: number;
}

// ── Badges ─────────────────────────────────────────────────────────────────

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "1px 7px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
};

const STATUS_COLOR: Record<string, { fg: string; bg: string; dot: string }> = {
  Active: { fg: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  Inactive: { fg: "#374151", bg: "#f3f4f6", dot: "#9ca3af" },
  Draft: { fg: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
};

const StatusBadge: React.FC<{ value: string }> = ({ value }) => {
  const c = STATUS_COLOR[value] ?? {
    fg: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
  return (
    <span style={{ ...badge, color: c.fg, backgroundColor: c.bg, gap: 5 }}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: c.dot,
          flexShrink: 0,
        }}
      />
      {value || "—"}
    </span>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────

export const PlanViewTable: React.FC<Props> = ({
  verticalId,
  functionId,
  domainId,
  subDomainId,
}) => {
  const { goToCreate, handleOpenPlanDialog } = useActivity();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State for the Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<PlanViewRow | null>(
    null,
  );

  const {
    data: apiRows = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPlanViewQuery(
    {
      verticalId,
      functionId,
      domainId,
      subDomainId,
      page: 0,
      size: 10,
    },
    {
      skip: subDomainId === undefined,
    },
  );

  const handleOpenEdit = (rowData: PlanViewRow) => {
    setSelectedRowData(rowData);
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedRowData(null);
  };

 const handleSaveEdit = async (updatedData: PlanViewRow) => {
    console.log("Data to save:", updatedData);
    
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo<MRT_ColumnDef<PlanViewRow>[]>(
    () => [
      {
        accessorKey: "planType",
        header: "Plan Type",
        size: 180,
        Cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "primary.main",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => handleOpenPlanDialog(row.original)}
          >
            {row.original.planType}
          </Typography>
        ),
      },
      {
        accessorKey: "domain",
        header: "Domain",
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "layer",
        header: "Layer",
        size: 100,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "vendorOem",
        header: "Vendor / OEM",
        size: 160,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "changeImpact",
        header: "Impact",
        size: 90,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        filterVariant: "select",
        filterSelectOptions: ["Active", "Inactive", "Draft"],
        Cell: ({ cell }) => <StatusBadge value={cell.getValue<string>()} />,
      },
    ],
    [handleOpenPlanDialog],
  );

  // ── Table instance ─────────────────────────────────────────────────────────

  const table = useMaterialReactTable({
    columns,
    data: apiRows,
    state: {
      isLoading,
      showProgressBars: isFetching && !isLoading,
    },
    initialState: {
      density: "compact",
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    enableStickyHeader: true,
    enableFacetedValues: true,
    paginationDisplayMode: "pages",

    // ── Enable Action Column (Edit) ──────────────────────────────────────────
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <Tooltip title="Edit Row">
        <IconButton
          size="small"
          onClick={() => handleOpenEdit(row.original)}
          sx={{ color: "text.secondary" }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),

    renderToolbarInternalActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Refresh">
          <span>
            <IconButton
              size="small"
              onClick={refetch}
              disabled={isFetching}
              sx={{ p: "5px" }}
            >
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
          sx={{
            fontSize: 12,
            py: 0.5,
            px: 1.5,
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          New
        </Button>
      </Box>
    ),

    muiTablePaperProps: {
      elevation: 0,
      variant: "outlined",
      sx: { borderRadius: 2, borderColor: theme.palette.divider },
    },
    muiTableContainerProps: {
      sx: { maxHeight: "calc(100vh - 360px)", minHeight: 240 },
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "text.secondary",
        py: 0.75,
        backgroundColor: isDark
          ? alpha(theme.palette.primary.main, 0.12)
          : theme.palette.grey[50],
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
    muiTableBodyCellProps: { sx: { py: "1px", fontSize: 12 } },
    muiTableBodyRowProps: {
      sx: {
        "&:hover td": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDark ? 0.08 : 0.04,
          ),
        },
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
        backgroundColor: isDark
          ? "rgba(255,255,255,0.02)"
          : theme.palette.grey[50],
        px: 1,
      },
    },
    muiPaginationProps: {
      shape: "rounded",
      size: "small",
      sx: { "& .MuiButtonBase-root": { fontSize: 12 } },
    },
    muiSearchTextFieldProps: {
      size: "small",
      placeholder: "Search…",
      variant: "outlined",
      sx: {
        "& .MuiOutlinedInput-root": {
          fontSize: 12,
          borderRadius: 1.5,
          height: 30,
        },
      },
    },
    muiLinearProgressProps: { color: "primary", sx: { height: 2 } },
    muiSkeletonProps: { height: 22, sx: { borderRadius: 1 } },

    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          py: 5,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 34, color: "text.disabled" }} />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          No plans found
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {subDomainId
            ? "Try adjusting your search or filters."
            : "Select a Sub Domain to load data."}
        </Typography>
      </Box>
    ),
  });

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (subDomainId === undefined) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 5, borderRadius: 2, textAlign: "center" }}
      >
        <InfoOutlinedIcon
          sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
        />
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Select a Sub Domain
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Use the filters above to pick a Sub Domain and load its plans.
        </Typography>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refetch}
          >
            Retry
          </Button>
        }
      >
        {(error as any)?.data?.message ??
          "Failed to load plans. Please try again."}
      </Alert>
    );
  }

  return (
    <>
      <MaterialReactTable table={table} />

      {/* Edit Dialog Component */}
      <PlanEditDialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        data={selectedRowData}
        onSave={handleSaveEdit}
      />
    </>
  );
};
