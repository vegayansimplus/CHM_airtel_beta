import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useActivity } from "../../hooks/useActivity";
import { useGetActivityViewQuery } from "../../api/acitivityApiSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityViewRow {
  activityId: number;
  activityName: string;
  changeImpact: string;
  chmDomain: number;
  chmSubDomain: number;
  createdAt: string;
  createdBy: string;
  domain: string;
  layer: string;
  planType: string;
  status: string;
  vendorOem: string;
}

interface Props {
  subDomainID?: number;
}

// ─── Inline badges ────────────────────────────────────────────────────────────

const IMPACT_COLOR: Record<string, { fg: string; bg: string }> = {
  Low: { fg: "#065f46", bg: "#d1fae5" },
  Medium: { fg: "#92400e", bg: "#fef3c7" },
  High: { fg: "#c2410c", bg: "#ffedd5" },
  Critical: { fg: "#991b1b", bg: "#fee2e2" },
};

const STATUS_COLOR: Record<string, { fg: string; bg: string; dot: string }> = {
  Active: { fg: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  Inactive: { fg: "#374151", bg: "#f3f4f6", dot: "#9ca3af" },
  Draft: { fg: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  Pending: { fg: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
};

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

const ImpactBadge: React.FC<{ value: string }> = ({ value }) => {
  const c = IMPACT_COLOR[value] ?? { fg: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{ ...badge, color: c.fg, backgroundColor: c.bg }}>
      {value || "—"}
    </span>
  );
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

// ─── Stats strip ──────────────────────────────────────────────────────────────

const StatsStrip: React.FC<{ rows: ActivityViewRow[] }> = ({ rows }) => {
  const theme = useTheme();

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      draft: rows.filter((r) => r.status === "Draft").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      highImpact: rows.filter((r) =>
        ["High", "Critical"].includes(r.changeImpact),
      ).length,
    }),
    [rows],
  );

  const items = [
    { label: "Total", value: stats.total, color: theme.palette.primary.main },
    { label: "Active", value: stats.active, color: "#10b981" },
    { label: "Draft", value: stats.draft, color: "#6b7280" },
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "High Impact", value: stats.highImpact, color: "#ef4444" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        mb: 1.5,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {items.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRight:
              i < items.length - 1
                ? `1px solid ${theme.palette.divider}`
                : "none",
            transition: "background-color 150ms",
            "&:hover": { backgroundColor: alpha(item.color, 0.04) },
          }}
        >
          <Box
            sx={{
              width: 3,
              height: 28,
              borderRadius: 2,
              backgroundColor: item.color,
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.1,
                color: item.color,
              }}
            >
              {item.value}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: "text.secondary",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const ActivityList: React.FC<Props> = ({ subDomainID }) => {
  const { goToCreate, openConfigure, handleUpdateStatus, handleDelete } =
    useActivity();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    data: apiRows = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActivityViewQuery(
    { subDomainID },
    { skip: subDomainID === undefined },
  );

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo<MRT_ColumnDef<ActivityViewRow>[]>(
    () => [
      {
        accessorKey: "activityName",
        header: "Activity",
        size: 190,
        minSize: 140,
        Cell: ({ row }) => (
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.3,
                color: "primary.main",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => openConfigure(row.original.activityId)}
            >
              {row.original.activityName}
            </Typography>
          </Box>
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
        accessorKey: "planType",
        header: "Plan",
        size: 80,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "vendorOem",
        header: "Vendor / OEM",
        size: 110,
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
        size: 108,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const r = row.original;
          const iconBtn = (color: string) => ({
            p: "3px",
            borderRadius: 1,
            "&:hover": { backgroundColor: alpha(color, 0.1) },
          });
          return (
            <Box sx={{ display: "flex", gap: 0.25, justifyContent: "center" }}>
              <Tooltip title="View phases" placement="top">
                <IconButton
                  size="small"
                  onClick={() => openConfigure(r)} // Pass FULL OBJECT here
                  sx={{
                    ...iconBtn(theme.palette.primary.main),
                    color: "text.secondary",
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" placement="top">
                <IconButton
                  size="small"
                  onClick={() => openConfigure(r)} // Pass FULL OBJECT here
                  sx={{
                    ...iconBtn(theme.palette.primary.main),
                    color: "text.secondary",
                  }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              {r.status !== "Active" ? (
                <Tooltip title="Activate" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateStatus(String(r.activityId), "Active")}
                    sx={{ ...iconBtn("#10b981"), color: "#10b981" }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Deactivate" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateStatus(String(r.activityId), "Inactive")}
                    sx={{ ...iconBtn("#f59e0b"), color: "#f59e0b" }}
                  >
                    <BlockIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete" placement="top">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(String(r.activityId))}
                  sx={{
                    ...iconBtn(theme.palette.error.main),
                    color: "error.main",
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [theme, openConfigure, handleUpdateStatus, handleDelete],
  );

  // ──( MRT table instance )────────────────────────────────────────────────────

  const table = useMaterialReactTable({
    columns,
    data: apiRows,
    state: {
      isLoading,
      showProgressBars: isFetching && !isLoading,
    },

    // compact density locked in
    initialState: {
      density: "compact",
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
      // columnVisibility: {
      //   chmDomain: false,
      //   chmSubDomain: false,
      //   createdAt: false,
      //   createdBy: false,
      // },
    },

    enableDensityToggle: true, // keep it compact always
    // enableColumnResizing: true,
    // columnResizeMode: "onChange",
    enableStickyHeader: true,
    enableFacetedValues: true,
    enableRowVirtualization: apiRows.length > 80,
    positionGlobalFilter: "left",
    paginationDisplayMode: "pages",

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

    // ── MUI slot overrides ────────────────────────────────────────────────
    muiTablePaperProps: {
      elevation: 0,
      variant: "outlined",
      sx: {
        borderRadius: 2,
        borderColor: theme.palette.divider,
        overflow: "auto",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 360px)",
        minHeight: 240,
      },
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
    muiTableBodyCellProps: {
      sx: {
        py: "1px",
        fontSize: 12,
        // borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      },
    },
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
        // minHeight: 42,
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
    muiLinearProgressProps: {
      color: "primary",
      sx: { height: 2 },
    },
    muiSkeletonProps: {
      height: 22,
      sx: { borderRadius: 1 },
    },
    muiFilterTextFieldProps: {
      size: "small",
      sx: {
        "& .MuiOutlinedInput-root": { fontSize: 12 },
        mt: 0.5,
      },
    },

    // ── Empty state ────────────────────────────────────────────────────────
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
          No activities found
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {subDomainID
            ? "Try adjusting your search or filters."
            : "Select a Sub Domain to load data."}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={goToCreate}
          sx={{
            mt: 0.5,
            fontSize: 12,
            textTransform: "none",
            borderRadius: 1.5,
          }}
        >
          Create activity
        </Button>
      </Box>
    ),
  });

  // ── Guard: no subdomain ───────────────────────────────────────────────────

  if (subDomainID === undefined) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Activities
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={goToCreate}
            disableElevation
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          >
            New Activity
          </Button>
        </Box>
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
            Use the filters above to pick a Sub Domain and load its activities.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // ── Guard: API error ──────────────────────────────────────────────────────

  if (isError) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Activities
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={goToCreate}
            disableElevation
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          >
            New Activity
          </Button>
        </Box>
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
            "Failed to load activities. Please try again."}
        </Alert>
      </Box>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Box>
      {!isLoading && apiRows.length > 0 && <StatsStrip rows={apiRows} />}
      <MaterialReactTable table={table} />
    </Box>
  );
};
