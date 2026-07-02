import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Fab,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import DashboardHeader from "./DashboardHeader";
import StatsSection from "./StatsSection";
import SearchToolbar, { DEFAULT_FILTERS, type UserFilters } from "./SearchToolbar";
import UserTable from "./UserTable";
import UserCard from "./UserCard";
import ProfileDrawer from "./ProfileDrawer";
import AddUserWizard, { type NewUserInput } from "./AddUserWizard";
import DeleteDialog from "./DeleteDialog";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import { MOCK_USERS } from "../api/mockUsers";
import { getUserStatus, type User } from "../types/user";

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24, 50];

function parseJoinedDate(joinedDate: string): number {
  const d = new Date(`1 ${joinedDate}`);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

const ROLE_RANK: Record<User["role"], number> = {
  "Super Admin": 0,
  "Team Lead": 1,
  "Team Member": 2,
};

export default function UserManagement() {
  // ── Core state (search/filter/pagination/CRUD — same shape as before, additive fields only) ──
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<User[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  // Below `sm` (phones), the table has no room even with column-hiding, so fall
  // back to the card grid. From `sm` up, UserTable folds columns by priority.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const handleFilterChange = useCallback((patch: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(users.map((u) => u.function))).sort(),
    [users],
  );
  const managers = useMemo(
    () =>
      Array.from(
        new Set(users.filter((u) => u.role !== "Team Member").map((u) => u.name)),
      ).sort(),
    [users],
  );

  const filtered = useMemo(() => {
    const list = users.filter((u) => {
      const q = filters.search.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole = filters.roleFilter === "All" || u.role === filters.roleFilter;
      const matchDept = filters.deptFilter === "All" || u.function === filters.deptFilter;
      const matchStatus =
        filters.statusFilter === "All" || getUserStatus(u) === filters.statusFilter;

      let matchDate = true;
      if (filters.dateFrom || filters.dateTo) {
        const joined = parseJoinedDate(u.joinedDate);
        if (filters.dateFrom) matchDate = matchDate && joined >= filters.dateFrom.startOf("day").valueOf();
        if (filters.dateTo) matchDate = matchDate && joined <= filters.dateTo.endOf("day").valueOf();
      }

      return matchSearch && matchRole && matchDept && matchStatus && matchDate;
    });

    const sorted = [...list].sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "joined-new":
          return parseJoinedDate(b.joinedDate) - parseJoinedDate(a.joinedDate);
        case "joined-old":
          return parseJoinedDate(a.joinedDate) - parseJoinedDate(b.joinedDate);
        case "role":
          return ROLE_RANK[a.role] - ROLE_RANK[b.role];
        default:
          return 0;
      }
    });

    return sorted;
  }, [users, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((clampedPage - 1) * rowsPerPage, clampedPage * rowsPerPage),
    [filtered, clampedPage, rowsPerPage],
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.roleFilter !== "All" ||
    filters.deptFilter !== "All" ||
    filters.statusFilter !== "All" ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (deleteTarget) setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleBulkDeleteConfirm = () => {
    if (bulkDeleteTargets) {
      const ids = new Set(bulkDeleteTargets.map((u) => u.id));
      setUsers((prev) => prev.filter((u) => !ids.has(u.id)));
      toast.success(`Removed ${bulkDeleteTargets.length} users`);
    }
    setBulkDeleteTargets(null);
  };

  const handleAddUser = (input: NewUserInput) => {
    const nextId = String(Math.max(0, ...users.map((u) => parseInt(u.id, 10) || 0)) + 1);
    const newUser: User = {
      id: nextId,
      name: input.name,
      employeeId: input.employeeId,
      email: input.email,
      phone: input.phone || undefined,
      function: input.function || "Unassigned",
      manager: input.manager || undefined,
      role: input.role,
      joinedDate: dayjs().format("MMM YYYY"),
      active: true,
      permissions: input.permissions,
    };
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`${newUser.name} added successfully`);
  };

  const handleResetPassword = (u: User) => {
    toast.info(`Password reset link sent to ${u.email}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const handleExport = () => {
    const header = "Name,Employee ID,Email,Department,Role,Status,Joined Date\n";
    const rows = filtered
      .map((u) =>
        [u.name, u.employeeId, u.email, u.function, u.role, getUserStatus(u), u.joinedDate]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `users-export-${dayjs().format("YYYY-MM-DD")}.csv`);
    toast.success("Export ready — download started");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
        const imported: User[] = [];
        let nextId = Math.max(0, ...users.map((u) => parseInt(u.id, 10) || 0));
        for (const line of lines) {
          const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          if (cols.length < 3 || !cols[0]) continue;
          nextId += 1;
          imported.push({
            id: String(nextId),
            name: cols[0],
            employeeId: cols[1] || `IMP${nextId}`,
            email: cols[2] || "",
            function: cols[3] || "Unassigned",
            role: (["Super Admin", "Team Lead", "Team Member"].includes(cols[4])
              ? cols[4]
              : "Team Member") as User["role"],
            joinedDate: dayjs().format("MMM YYYY"),
            active: true,
          });
        }
        if (imported.length) {
          setUsers((prev) => [...imported, ...prev]);
          toast.success(`Imported ${imported.length} users`);
        } else {
          toast.warning("No valid rows found in file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Box sx={{ pb: { xs: 9, md: 1 } }}>
      <DashboardHeader
        onAddUser={() => setAddOpen(true)}
        onImport={handleImport}
        onExport={handleExport}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <StatsSection users={users} />

          <SearchToolbar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            departments={departments}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === "list" && !isMobile ? (
            <UserTable
              users={paginated}
              onView={setActiveUser}
              onEdit={setActiveUser}
              onPermissions={setActiveUser}
              onResetPassword={handleResetPassword}
              onDelete={setDeleteTarget}
              onBulkDelete={setBulkDeleteTargets}
              onAddUser={() => setAddOpen(true)}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          ) : paginated.length === 0 ? (
            <EmptyState
              onAddUser={() => setAddOpen(true)}
              onResetFilters={handleResetFilters}
              showResetFilters={hasActiveFilters}
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {paginated.map((u, i) => (
                <UserCard
                  key={u.id}
                  user={u}
                  index={i}
                  onView={setActiveUser}
                  onEdit={setActiveUser}
                  onPermissions={setActiveUser}
                  onResetPassword={handleResetPassword}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Box>
          )}

          {/* ── Modern Pagination Footer ── */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            mt={1.5}
            gap={1.5}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Rows per page</Typography>
              <Select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ fontSize: 12.5, borderRadius: "10px", minWidth: 72 }}
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 12.5 }}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * rowsPerPage + 1}–
                {Math.min(clampedPage * rowsPerPage, filtered.length)} of {filtered.length} users
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1.5}>
              <Pagination
                count={totalPages}
                page={clampedPage}
                onChange={(_, v) => setPage(v)}
                shape="rounded"
                sx={{ "& .MuiPaginationItem-root": { borderRadius: "8px" } }}
              />
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Go to</Typography>
                <TextField
                  size="small"
                  type="number"
                  defaultValue={clampedPage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = Number((e.target as HTMLInputElement).value);
                      if (v >= 1 && v <= totalPages) setPage(v);
                    }
                  }}
                  sx={{ width: 64, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 12.5 } }}
                />
              </Stack>
            </Stack>
          </Stack>
        </>
      )}

      {/* ── Floating Add User button (mobile) ── */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setAddOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          }}
        >
          <Add />
        </Fab>
      )}

      {/* ── Drawer & Dialogs ── */}
      <ProfileDrawer user={activeUser} onClose={() => setActiveUser(null)} />

      <AddUserWizard
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddUser}
        departments={departments.length ? departments : ["General"]}
        managers={managers}
      />

      <DeleteDialog
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
      <DeleteDialog
        user={null}
        count={bulkDeleteTargets?.length ?? 0}
        onClose={() => setBulkDeleteTargets(null)}
        onConfirm={handleBulkDeleteConfirm}
      />
    </Box>
  );
}
