import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Stack,
  Tooltip,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DeleteOutline, GroupOutlined, Close } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ShowHideColumnsButton,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  type MRT_VisibilityState,
} from "material-react-table";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import EmptyState from "./EmptyState";
import { getAvatarColor, getInitials, formatRelativeTime } from "../utils/userHelpers";
import { getUserStatus, type User } from "../types/user";

export interface UserTableProps {
  users: User[];
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onPermissions: (u: User) => void;
  onResetPassword: (u: User) => void;
  onDelete: (u: User) => void;
  onBulkDelete: (users: User[]) => void;
  onAddUser: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function UserTable({
  users,
  onView,
  onEdit,
  onPermissions,
  onResetPassword,
  onDelete,
  onBulkDelete,
  onAddUser,
  onResetFilters,
  hasActiveFilters,
}: UserTableProps) {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  // Clear stale selection whenever the visible (filtered/paginated) row set changes.
  useEffect(() => {
    setRowSelection({});
  }, [users]);

  // ── Responsive column priority ──────────────────────────────────────────
  // Lower-priority columns fold away as the available width shrinks (the
  // sidebar + header eat into it before the table container even starts).
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));
  const isDownXl = useMediaQuery(theme.breakpoints.down("xl"));

  const responsiveVisibility = useMemo<MRT_VisibilityState>(
    () => ({
      function: !isDownMd,
      employeeId: !isDownLg,
      joinedDate: !isDownLg,
      lastLogin: !isDownXl,
      permissions: !isDownXl,
    }),
    [isDownMd, isDownLg, isDownXl],
  );

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(responsiveVisibility);

  // Re-apply the breakpoint defaults whenever the viewport crosses a boundary,
  // while still letting the user override via the Show/Hide columns menu in between.
  useEffect(() => {
    setColumnVisibility(responsiveVisibility);
  }, [responsiveVisibility]);

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        size: 260,
        Cell: ({ row }) => {
          const u = row.original;
          const status = getUserStatus(u);
          return (
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: status === "Active" ? "#22C55E" : "#9CA3AF",
                      border: "2px solid white",
                    }}
                  />
                }
              >
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(u.id),
                    width: 38,
                    height: 38,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
                  }}
                >
                  {getInitials(u.name)}
                </Avatar>
              </Badge>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }} noWrap>
                  {u.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }} noWrap>
                  {u.email}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        size: 130,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: "function",
        header: "Department",
        size: 140,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            size="small"
            sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.7rem" }}
          />
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 140,
        Cell: ({ cell }) => <RoleBadge role={cell.getValue<User["role"]>()} size="small" />,
      },
      {
        id: "status",
        header: "Status",
        size: 110,
        accessorFn: (row) => getUserStatus(row),
        Cell: ({ row }) => <StatusBadge status={getUserStatus(row.original)} />,
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        size: 130,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {formatRelativeTime(cell.getValue<string>())}
          </Typography>
        ),
      },
      {
        accessorKey: "joinedDate",
        header: "Joined Date",
        size: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        id: "permissions",
        header: "Permissions",
        size: 130,
        enableSorting: false,
        Cell: ({ row }) => {
          const perms = row.original.permissions ?? [];
          if (perms.length === 0)
            return (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>—</Typography>
            );
          return (
            <Tooltip title={perms.join(", ")}>
              <Chip
                label={`${perms.length} granted`}
                size="small"
                sx={{ bgcolor: "#EEF2FF", color: "#4338CA", fontWeight: 600, fontSize: "0.68rem" }}
              />
            </Tooltip>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 130,
        enableSorting: false,
        enableColumnActions: false,
        enableResizing: false,
        Cell: ({ row }) => (
          <ActionMenu
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onPermissions={() => onPermissions(row.original)}
            onResetPassword={() => onResetPassword(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ),
      },
    ],
    [onView, onEdit, onPermissions, onResetPassword, onDelete],
  );

  const selectedUsers = useMemo(
    () => users.filter((u) => rowSelection[u.id]),
    [users, rowSelection],
  );

  const table = useMaterialReactTable({
    columns,
    data: users,
    getRowId: (row) => row.id,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enableSorting: true,
    enablePagination: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enableHiding: true,
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["mrt-row-select", "name"], right: ["actions"] },
    },
    layoutMode: "grid",
    positionToolbarAlertBanner: "top",
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "16px",
        border: "1px solid rgba(15,23,42,0.07)",
        boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
        overflow: "hidden",
        background: "#fff",
        width: "100%",
      },
    },
    muiTableContainerProps: {
      sx: { maxHeight: { xs: "60vh", md: "68vh", xl: "72vh" }, overflowX: "auto" },
    },
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        background: "#F8FAFC",
        color: "#475569",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderBottom: "2px solid rgba(15,23,42,0.08)",
        px: { xs: 1, lg: 1.5 },
        "& .Mui-TableHeadCell-Content-Actions button": { color: "#94A3B8" },
        ...(column.getIsPinned() && {
          background: "#F8FAFC",
          boxShadow:
            column.getIsPinned() === "left"
              ? "2px 0 4px rgba(15,23,42,0.04)"
              : "-2px 0 4px rgba(15,23,42,0.04)",
        }),
      },
    }),
    muiTableBodyCellProps: ({ column }) => ({
      sx: {
        borderBottom: "1px solid rgba(15,23,42,0.05)",
        py: 1.35,
        px: { xs: 1, lg: 1.5 },
        ...(column.getIsPinned() && {
          background: "#fff",
          boxShadow:
            column.getIsPinned() === "left"
              ? "2px 0 4px rgba(15,23,42,0.04)"
              : "-2px 0 4px rgba(15,23,42,0.04)",
        }),
      },
    }),
    muiTableBodyRowProps: ({ row }) => ({
      className: "row-hover",
      sx: {
        transition: "background 0.15s",
        background: row.index % 2 === 1 ? "rgba(248,250,252,0.6)" : "transparent",
        "&:hover": { background: "rgba(37,99,235,0.045)" },
      },
    }),
    muiSelectCheckboxProps: { size: "small" },
    muiSelectAllCheckboxProps: { size: "small" },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: { xs: 1.25, lg: 2.25 },
          py: 1.25,
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          background: "linear-gradient(180deg, #FAFBFF 0%, #FFFFFF 100%)",
        }}
      >
        <Box sx={{ minHeight: 30, display: "flex", alignItems: "center" }}>
          {selectedUsers.length > 0 ? (
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.25}>
              <Chip
                label={`${selectedUsers.length} selected`}
                size="small"
                onDelete={() => setRowSelection({})}
                deleteIcon={<Close sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: "primary.main", color: "#fff", fontWeight: 700, "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.8)" } }}
              />
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                onClick={() => {
                  onBulkDelete(selectedUsers);
                  setRowSelection({});
                }}
                sx={{ fontWeight: 600, borderRadius: "8px" }}
              >
                Delete selected
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" gap={0.75}>
              <GroupOutlined sx={{ fontSize: 17, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                All Users
              </Typography>
              <Chip
                label={users.length}
                size="small"
                sx={{ height: 19, fontSize: 11, fontWeight: 700, bgcolor: "#EFF6FF", color: "#2563EB" }}
              />
            </Stack>
          )}
        </Box>
        <MRT_ShowHideColumnsButton table={table} />
      </Box>
    ),
    renderEmptyRowsFallback: () => (
      <EmptyState
        onAddUser={onAddUser}
        onResetFilters={onResetFilters}
        showResetFilters={hasActiveFilters}
      />
    ),
  });

  return <MaterialReactTable table={table} />;
}
