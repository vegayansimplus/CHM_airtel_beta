import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Close,
  DeleteOutline,
  EditOutlined,
  ErrorOutlineOutlined,
  NotificationsNoneOutlined,
  RefreshOutlined,
  ToggleOffOutlined,
  ToggleOnOutlined,
} from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from "material-react-table";
import { getNotifTokens } from "../style/notificationTokens";
<<<<<<< Updated upstream
import { NOTIFY_ROLES } from "../constants/notifyRoles";
=======
import { NOTIFY_ROLES, STATUS_COLUMN } from "../constants/notifyRoles";
>>>>>>> Stashed changes
import NotifSwitch from "./NotifSwitch";
import StatusBadge from "./StatusBadge";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import {
  useGetNotificationConfigsQuery,
  useUpdateNotificationFieldMutation,
  useDeleteNotificationMutation,
  type ApiNotificationSetting,
  type NotificationBooleanField,
} from "../api/notificationApiSlice";

type StatusFilter = "All" | "Active" | "Inactive";

interface NotificationManagementTableProps {
  onEdit: (rule: ApiNotificationSetting) => void;
}

const NotificationManagementTable = ({ onEdit }: NotificationManagementTableProps) => {
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
<<<<<<< Updated upstream
  const [updateNotificationField] = useUpdateNotificationFieldMutation();
=======
  const [updateField] = useUpdateNotificationFieldMutation();
>>>>>>> Stashed changes
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [moduleFilter, setModuleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // The rule stays set while the confirm dialog animates closed, so its
  // content doesn't flash empty — only `confirmOpen` drives visibility.
  const [ruleToDelete, setRuleToDelete] =
    useState<ApiNotificationSetting | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dynamic filter options — derived from the fetched rows, never hardcoded.
  const moduleOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.moduleCode))).sort(),
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        if (moduleFilter !== "All" && r.moduleCode !== moduleFilter) return false;
        if (statusFilter === "Active" && !r.isActive) return false;
        if (statusFilter === "Inactive" && r.isActive) return false;
        return true;
      }),
    [rows, moduleFilter, statusFilter],
  );

  // Toggles patch the RTK Query cache optimistically (see notificationApiSlice),
  // so switches flip instantly and no global "busy" lock is needed.
  const handleToggle = useCallback(
<<<<<<< Updated upstream
    (rule: ApiNotificationSetting, field: NotificationBooleanField) => {
      updateNotificationField({
        configId: rule.configId,
        field,
        value: !rule[field],
      });
    },
    [updateNotificationField],
=======
    (rule: ApiNotificationSetting, role: (typeof NOTIFY_ROLES)[number]) => {
      updateField({ configId: rule.configId, column: role.column, value: !rule[role.field] });
    },
    [updateField],
  );

  const handleStatusToggle = useCallback(
    (rule: ApiNotificationSetting) => {
      updateField({ configId: rule.configId, column: STATUS_COLUMN, value: !rule.isActive });
    },
    [updateField],
>>>>>>> Stashed changes
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

  const selectedRules = useMemo(
    () => filteredRows.filter((r) => rowSelection[String(r.configId)]),
    [filteredRows, rowSelection],
  );

  const handleBulkSetActive = useCallback(
    async (active: boolean) => {
      await Promise.all(
        selectedRules.map((r) =>
          updateField({ configId: r.configId, column: STATUS_COLUMN, value: active }),
        ),
      );
      setRowSelection({});
    },
    [selectedRules, updateField],
  );

  const handleBulkDelete = useCallback(async () => {
    await Promise.all(
      selectedRules.map((r) => deleteNotification({ configId: r.configId })),
    );
    setRowSelection({});
  }, [selectedRules, deleteNotification]);

  const columns = useMemo<MRT_ColumnDef<ApiNotificationSetting>[]>(() => {
    const centered = {
      muiTableHeadCellProps: { align: "center" as const },
      muiTableBodyCellProps: { align: "center" as const },
    };

    return [
      {
        accessorKey: "moduleCode",
        header: "Module",
        size: 116,
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
        size: 140,
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
        size: 116,
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
        accessorKey: "isActive",
        header: "Status",
<<<<<<< Updated upstream
        size: 112,
        enableSorting: false,
        enableGlobalFilter: false,
        ...centered,
        Cell: ({ row }) => (
          <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
            <NotifSwitch
              checked={row.original.isActive}
              onChange={() => handleToggle(row.original, "isActive")}
              inputProps={{
                "aria-label": `Enable or disable rule for ${row.original.actionCode}`,
              }}
            />
            <StatusBadge active={row.original.isActive} />
          </Stack>
        ),
      },
      ...NOTIFY_ROLES.map<MRT_ColumnDef<ApiNotificationSetting>>(
        ({ field, label, shortLabel }) => ({
          accessorKey: field,
          header: shortLabel,
          size: 76,
          enableSorting: false,
          enableGlobalFilter: false,
          ...centered,
          Cell: ({ cell, row }) => (
            <Tooltip title={label} enterDelay={400}>
              <span>
                <NotifSwitch
                  checked={cell.getValue<boolean>()}
                  disabled={!row.original.isActive}
                  onChange={() => handleToggle(row.original, field)}
                  inputProps={{
                    "aria-label": `${label} notifications for ${row.original.actionCode}`,
                  }}
                />
              </span>
            </Tooltip>
          ),
        }),
      ),
      {
        id: "delete",
        header: "",
        size: 52,
=======
        size: 116,
        enableGlobalFilter: false,
        accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
        ...centered,
        Cell: ({ row }) => (
          <Tooltip title={row.original.isActive ? "Click to deactivate" : "Click to reactivate"}>
            <Box
              component="button"
              onClick={() => handleStatusToggle(row.original)}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "inline-flex",
                borderRadius: "999px",
              }}
            >
              <StatusBadge active={row.original.isActive} />
            </Box>
          </Tooltip>
        ),
      },
      ...NOTIFY_ROLES.map<MRT_ColumnDef<ApiNotificationSetting>>((role) => ({
        accessorKey: role.field,
        header: role.label,
        size: 104,
        enableSorting: false,
        enableGlobalFilter: false,
        ...centered,
        Cell: ({ cell, row }) => (
          <NotifSwitch
            checked={cell.getValue<boolean>()}
            onChange={() => handleToggle(row.original, role)}
            inputProps={{
              "aria-label": `${role.label} notifications for ${row.original.actionCode}`,
            }}
          />
        ),
      })),
      {
        id: "actions",
        header: "Actions",
        size: 100,
>>>>>>> Stashed changes
        enableSorting: false,
        enableGlobalFilter: false,
        ...centered,
        Cell: ({ row }) => (
          <Stack direction="row" gap={0.75} justifyContent="center">
            <Tooltip title="Edit rule">
              <IconButton
                size="small"
                onClick={() => onEdit(row.original)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: tk.radius,
                  color: tk.accent,
                  bgcolor: tk.accentDim,
                  border: `1px solid ${tk.accentBorder}`,
                  transition: "background 0.15s, transform 0.15s",
                  "&:hover": {
                    bgcolor: alpha(tk.accent, tk.isDark ? 0.25 : 0.16),
                    transform: "scale(1.06)",
                  },
                }}
              >
                <EditOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
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
          </Stack>
        ),
      },
    ];
  }, [tk, handleToggle, handleStatusToggle, onEdit]);

  const table = useMaterialReactTable({
    columns,
    data: filteredRows,
    getRowId: (row) => String(row.configId),
    state: { isLoading, rowSelection },
    onRowSelectionChange: setRowSelection,
    initialState: { showGlobalFilter: true },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableRowSelection: true,
    enablePagination: true,
    enableBottomToolbar: true,
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
        width: "100%",
        maxWidth: "100%",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "76vh",
        maxWidth: "100%",
        overflowX: "auto",
        // Slim, unobtrusive scrollbar so the compact layout doesn't feel bulky
        // on the narrow viewports it's actually needed on.
        "&::-webkit-scrollbar": { height: 7 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(tk.accent, 0.35),
          borderRadius: 4,
        },
      },
    },
<<<<<<< Updated upstream

    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 1.5,
          py: 1,
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
=======
    muiTableContainerProps: { sx: { maxHeight: "68vh" } },

    renderTopToolbar: ({ table }) => {
      const selectedCount = table.getSelectedRowModel().rows.length;

      if (selectedCount > 0) {
        return (
          <Box
>>>>>>> Stashed changes
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 2,
              py: 1.1,
              borderBottom: `1px solid ${tk.border}`,
              bgcolor: alpha(tk.accent, tk.isDark ? 0.1 : 0.06),
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Chip
                label={`${selectedCount} selected`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: tk.accentDim, color: tk.accentLight }}
              />
              <Button
                size="small"
                startIcon={<ToggleOnOutlined sx={{ fontSize: 17 }} />}
                onClick={() => handleBulkSetActive(true)}
              >
                Enable
              </Button>
              <Button
                size="small"
                color="inherit"
                startIcon={<ToggleOffOutlined sx={{ fontSize: 17 }} />}
                onClick={() => handleBulkSetActive(false)}
              >
                Disable
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </Stack>
            <Tooltip title="Clear selection">
              <IconButton size="small" onClick={() => setRowSelection({})}>
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }

      return (
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
              label={filteredRows.length}
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
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                displayEmpty
                sx={{ fontSize: 12.5, "& .MuiSelect-select": { py: 0.6 } }}
              >
                <MenuItem value="All" sx={{ fontSize: 12.5 }}>
                  All Modules
                </MenuItem>
                {moduleOptions.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: 12.5 }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                sx={{ fontSize: 12.5, "& .MuiSelect-select": { py: 0.6 } }}
              >
                <MenuItem value="All" sx={{ fontSize: 12.5 }}>All Statuses</MenuItem>
                <MenuItem value="Active" sx={{ fontSize: 12.5 }}>Active</MenuItem>
                <MenuItem value="Inactive" sx={{ fontSize: 12.5 }}>Inactive</MenuItem>
              </Select>
            </FormControl>
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
      );
    },
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
        px: 1.1,
        py: 1.1,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        px: 1.1,
        py: 0.9,
        fontSize: 12.5,
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
            : rows.length > 0
              ? "No rules match these filters"
              : "No notification rules yet"}
        </Typography>
        <Typography
          sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 340 }}
        >
          {isError
            ? "Something went wrong while fetching the configuration. Check your connection and try again."
            : rows.length > 0
              ? "Try clearing the module or status filter."
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
