import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Box, Chip, Stack, Tooltip, Typography, Button } from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ShowHideColumnsButton,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
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
                    width: 40,
                    height: 40,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(u.name)}
                </Avatar>
              </Badge>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }} noWrap>
                  {u.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }} noWrap>
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
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
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
    layoutMode: "grid",
    positionToolbarAlertBanner: "top",
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "18px",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.9)",
      },
    },
    muiTableContainerProps: { sx: { maxHeight: "62vh" } },
    muiTableHeadCellProps: {
      sx: {
        background: "#F8FAFC",
        color: "#64748B",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
      },
    },
    muiTableBodyCellProps: {
      sx: { borderBottom: "1px solid rgba(15,23,42,0.05)", py: 1 },
    },
    muiTableBodyRowProps: () => ({
      className: "row-hover",
      sx: {
        transition: "background 0.15s",
        "&:hover": { background: "rgba(37,99,235,0.03)" },
      },
    }),
    muiSelectCheckboxProps: { size: "small" },
    muiSelectAllCheckboxProps: { size: "small" },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Box sx={{ minHeight: 32, display: "flex", alignItems: "center" }}>
          {selectedUsers.length > 0 && (
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Chip
                label={`${selectedUsers.length} selected`}
                size="small"
                sx={{ bgcolor: "primary.main", color: "#fff", fontWeight: 700 }}
              />
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                onClick={() => {
                  onBulkDelete(selectedUsers);
                  setRowSelection({});
                }}
                sx={{ fontWeight: 600 }}
              >
                Delete selected
              </Button>
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
