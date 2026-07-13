import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DeleteOutline,
  ErrorOutlineOutlined,
  NotificationsNoneOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  type MRT_ColumnDef,
} from "material-react-table";
import { getNotifTokens } from "../style/notificationTokens";
import {
  NOTIFY_ROLES,
  isAnyNotifyEnabled,
  type NotifyToggleField,
} from "../constants/notifyRoles";
import NotifSwitch from "./NotifSwitch";
import StatusBadge from "./StatusBadge";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import {
  useGetNotificationConfigsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  type ApiNotificationSetting,
} from "../api/notificationApiSlice";

const NotificationManagementTable = () => {
  const theme = useTheme();
  // Memoized so the `columns` memo below only rebuilds on a real theme change.
  const tk = useMemo(() => getNotifTokens(theme), [theme]);

  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationConfigsQuery();
  const [updateNotification] = useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  // The rule stays set while the confirm dialog animates closed, so its
  // content doesn't flash empty — only `confirmOpen` drives visibility.
  const [ruleToDelete, setRuleToDelete] =
    useState<ApiNotificationSetting | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Toggles patch the RTK Query cache optimistically (see notificationApiSlice),
  // so switches flip instantly and no global "busy" lock is needed.
  const handleToggle = useCallback(
    (rule: ApiNotificationSetting, field: NotifyToggleField) => {
      updateNotification({ ...rule, [field]: !rule[field] });
    },
    [updateNotification],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!ruleToDelete) return;
    try {
      await deleteNotification({ configId: ruleToDelete.configId }).unwrap();
    } catch {
      // The optimistic removal is rolled back by the api slice on failure.
    } finally {
      setConfirmOpen(false);
    }
  }, [deleteNotification, ruleToDelete]);

  const columns = useMemo<MRT_ColumnDef<ApiNotificationSetting>[]>(() => {
    const centered = {
      muiTableHeadCellProps: { align: "center" as const },
      muiTableBodyCellProps: { align: "center" as const },
    };

    return [
      {
        accessorKey: "moduleCode",
        header: "Module",
        size: 140,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              bgcolor: tk.infoDim,
              border: `1px solid ${tk.infoBorder}`,
              color: tk.info,
              borderRadius: tk.radius,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "currentColor",
                flexShrink: 0,
              }}
            />
            {cell.getValue<string>()}
          </Box>
        ),
      },
      {
        accessorKey: "subModuleCode",
        header: "Sub-Module",
        size: 160,
        Cell: ({ cell }) => (
          <Typography
            component="span"
            sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "actionCode",
        header: "Action",
        size: 130,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.25,
              py: 0.35,
              bgcolor: tk.accentDim,
              border: `1px solid ${tk.accentBorder}`,
              color: tk.accentLight,
              borderRadius: tk.radius,
              fontSize: 11.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {cell.getValue<string>()}
          </Box>
        ),
      },
      {
        id: "status",
        header: "Status",
        size: 104,
        enableSorting: false,
        enableGlobalFilter: false,
        ...centered,
        Cell: ({ row }) => (
          <StatusBadge active={isAnyNotifyEnabled(row.original)} />
        ),
      },
      ...NOTIFY_ROLES.map<MRT_ColumnDef<ApiNotificationSetting>>(
        ({ field, label }) => ({
          accessorKey: field,
          header: label,
          size: 104,
          enableSorting: false,
          enableGlobalFilter: false,
          ...centered,
          Cell: ({ cell, row }) => (
            <NotifSwitch
              checked={cell.getValue<boolean>()}
              onChange={() => handleToggle(row.original, field)}
              inputProps={{
                "aria-label": `${label} notifications for ${row.original.actionCode}`,
              }}
            />
          ),
        }),
      ),
      {
        id: "delete",
        header: "Delete",
        size: 80,
        enableSorting: false,
        enableGlobalFilter: false,
        ...centered,
        Cell: ({ row }) => (
          <Tooltip title="Delete rule">
            <IconButton
              size="small"
              onClick={() => {
                setRuleToDelete(row.original);
                setConfirmOpen(true);
              }}
              sx={{
                width: 32,
                height: 32,
                borderRadius: tk.radius,
                color: tk.danger,
                bgcolor: tk.dangerDim,
                border: `1px solid ${tk.dangerBorder}`,
                transition: "background 0.15s, transform 0.15s",
                "&:hover": {
                  bgcolor: alpha(tk.danger, tk.isDark ? 0.25 : 0.16),
                  transform: "scale(1.06)",
                },
              }}
            >
              <DeleteOutline sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        ),
      },
    ];
  }, [tk, handleToggle]);

  const table = useMaterialReactTable({
    columns,
    data: rows,
    getRowId: (row) => String(row.configId),
    state: { isLoading },
    initialState: { showGlobalFilter: true },
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,

    muiTablePaperProps: {
      sx: {
        background: tk.surface,
        border: `1px solid ${tk.border}`,
        borderRadius: tk.radiusXL,
        boxShadow: tk.isDark
          ? "0 8px 32px rgba(0,0,0,0.45)"
          : "0 4px 24px rgba(13,27,42,0.08)",
        overflow: "hidden",
      },
    },
    muiTableContainerProps: { sx: { maxHeight: "76vh" } },

    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <NotificationsNoneOutlined
            sx={{ fontSize: 18, color: "text.secondary" }}
          />
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}
          >
            Notification Rules
          </Typography>
          <Chip
            label={rows.length}
            size="small"
            sx={{
              height: 19,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: tk.accentDim,
              color: tk.accentLight,
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <MRT_GlobalFilterTextField table={table} />
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshOutlined sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    ),
    muiSearchTextFieldProps: {
      placeholder: "Search rules…",
      size: "small",
    },

    muiTableHeadCellProps: {
      sx: {
        // Solid paper base + translucent tint keeps the sticky header opaque.
        backgroundColor: tk.surface,
        backgroundImage: tk.isDark
          ? "linear-gradient(rgba(255,255,255,0.03), rgba(255,255,255,0.03))"
          : "linear-gradient(rgba(13,27,42,0.03), rgba(13,27,42,0.03))",
        color: tk.textSecondary,
        borderBottom: `2px solid ${tk.border}`,
        px: 1.5,
        py: 1.5,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        px: 1.5,
        py: 1.4,
        fontSize: 13,
        color: "text.primary",
        verticalAlign: "middle",
        borderBottom: `1px solid ${tk.border}`,
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        background:
          row.index % 2 === 1
            ? tk.isDark
              ? "rgba(255,255,255,0.015)"
              : "rgba(13,27,42,0.015)"
            : "transparent",
        transition: "background 0.15s",
        "&:hover": {
          background: alpha(tk.accent, tk.isDark ? 0.08 : 0.045),
        },
        animation: "ntfRowIn 0.28s ease both",
        animationDelay: `${Math.min(row.index, 12) * 0.04}s`,
        "@keyframes ntfRowIn": {
          from: { opacity: 0, transform: "translateY(5px)" },
          to: { opacity: 1, transform: "none" },
        },
      },
    }),

    renderEmptyRowsFallback: () => (
      <Stack
        alignItems="center"
        justifyContent="center"
        gap={1}
        sx={{ py: 8, px: 3, textAlign: "center" }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isError ? tk.dangerDim : tk.accentDim,
            border: `1px solid ${isError ? tk.dangerBorder : tk.accentBorder}`,
            color: isError ? tk.danger : tk.accent,
          }}
        >
          {isError ? (
            <ErrorOutlineOutlined sx={{ fontSize: 22 }} />
          ) : (
            <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
          )}
        </Box>
        <Typography
          sx={{ fontSize: 14.5, fontWeight: 700, color: "text.primary" }}
        >
          {isError
            ? "Couldn't load notification rules"
            : "No notification rules yet"}
        </Typography>
        <Typography
          sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 340 }}
        >
          {isError
            ? "Something went wrong while fetching the configuration. Check your connection and try again."
            : "Rules you create will show up here with per-role delivery toggles."}
        </Typography>
        {isError && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={() => refetch()}
            sx={{ mt: 0.5 }}
          >
            Try again
          </Button>
        )}
      </Stack>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <ConfirmDeleteDialog
        open={confirmOpen}
        rule={ruleToDelete}
        deleting={isDeleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default NotificationManagementTable;
