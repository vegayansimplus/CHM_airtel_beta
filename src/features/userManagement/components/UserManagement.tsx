import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Fab,
  LinearProgress,
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

import { useAppSelector } from "../../../app/hooks";
import { usePermission } from "../../../rbac/usePermission";
import { AppScrollView } from "../../../components/ui/AppScrollView";
import DashboardHeader from "./DashboardHeader";
import StatsSection from "./StatsSection";
import SearchToolbar, { DEFAULT_FILTERS, type UserFilters } from "./SearchToolbar";
import UserTable from "./UserTable";
import UserCard from "./UserCard";
import ProfileDrawer from "./ProfileDrawer";
import AddUserWizard from "./AddUserWizard";
import AddUserTypeDialog from "./AddUserTypeDialog";
import AddOtherUserDialog from "./AddOtherUserDialog";
import DeleteDialog from "./DeleteDialog";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import { usePageLoading } from "../../../components/loading/LoadingProvider";
import { UploadEmployeeDialog } from "../../teamManagement/components/dialog/UploadEmployeeDialog";
import { useGetCreateUserDropdownsQuery } from "../../teamManagement/api/teamManagement.api";
import { useGetOrgHierarchyByUserQuery } from "../../orgHierarchy/api/orgHierarchy.api";
import { useGetUsersQuery, useLazyGetUsersQuery } from "../api/userManagementApi";
import { getUserStatus, mapUserListItem, type User } from "../types/user";

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24, 50];
// Large enough to cover any realistic filtered result set in one request for
// CSV export, without paging through the UI's normal page size.
const EXPORT_FETCH_SIZE = 5000;

// Roles that read the directory but may not create users - every add-user
// affordance (header button, mobile FAB, empty-state CTA) is hidden for them.
const NO_CREATE_ROLES = new Set(["TEAM_MEMBER"]);

/** Page size chosen once from the viewport height, so a tall window opens with
 *  a full table instead of six rows and a large empty tail. Read once (not via
 *  a resize listener) because page size drives a refetch - re-deriving it while
 *  the user resizes would thrash the query. */
function initialRowsPerPage() {
  const h = typeof window === "undefined" ? 0 : window.innerHeight;
  if (h >= 1000) return 24;
  if (h >= 800) return 12;
  return 6;
}

export default function UserManagement() {
  const authUser = useAppSelector((s) => s.auth.user);
  const actorUserId = Number(authUser?.userId ?? 0);
  const { roleCode } = usePermission();
  const canAddUser = !NO_CREATE_ROLES.has(roleCode ?? "");

  // ── Core state (search/filter/pagination/CRUD) ──────────────────────────
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<User[] | null>(null);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addOtherOpen, setAddOtherOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  // Below `sm` (phones), the table has no room even with column-hiding, so fall
  // back to the card grid. From `sm` up, UserTable folds columns by priority.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // Height-aware as well as width-aware: on a short window (laptop 768/900px
  // panels, or any window the user has shrunk) the stats strip and the spacing
  // around it tighten so the scrolling data region keeps a usable height.
  const isShortViewport = useMediaQuery("(max-height: 800px)");

  // ── Live data ────────────────────────────────────────────────────────────
  const queryArgs = useMemo(
    () => ({
      search: filters.search || undefined,
      roleCode: filters.roleCode === "All" ? undefined : filters.roleCode,
      functionId: filters.functionId === "All" ? undefined : filters.functionId,
      status: filters.statusFilter === "All" ? undefined : filters.statusFilter.toUpperCase(),
      page: page - 1,
      size: rowsPerPage,
    }),
    [filters, page, rowsPerPage],
  );

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery(queryArgs);
  const [triggerExportFetch] = useLazyGetUsersQuery();

  // Only the very first fetch (no cached data yet) should show the full
  // skeleton / block the page; subsequent isFetching (filter/page change)
  // keeps the current rows on screen with a thin progress indicator instead.
  const isInitialLoading = isLoading && !data;
  const isBackgroundRefreshing = isFetching && !isInitialLoading;
  usePageLoading(isInitialLoading, "user-management");

  const { data: hierarchyData } = useGetOrgHierarchyByUserQuery();
  const { data: dropdowns } = useGetCreateUserDropdownsQuery();

  const departmentOptions = useMemo(
    () => (hierarchyData?.data?.teamFunction ?? []).map((f) => ({ value: f.id, label: f.name })),
    [hierarchyData],
  );
  const roleOptions = dropdowns?.roleCode ?? [];

  const users = useMemo(() => (data?.page.content ?? []).map(mapUserListItem), [data]);

  // Client-side re-sort of the current server-fetched page only (search,
  // role/department/status, and pagination are all server-side - the SP has
  // no sort parameter, so this just reorders what's already on screen).
  const sorted = useMemo(() => {
    const list = [...users];
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "joined-new":
          return (b.joinedDate ?? "").localeCompare(a.joinedDate ?? "");
        case "joined-old":
          return (a.joinedDate ?? "").localeCompare(b.joinedDate ?? "");
        case "role":
          return (a.role ?? "").localeCompare(b.role ?? "");
        default:
          return 0;
      }
    });
    return list;
  }, [users, filters.sortBy]);

  const totalElements = data?.page.totalElements ?? 0;
  const totalPages = Math.max(1, data?.page.totalPages ?? 1);
  const clampedPage = Math.min(page, totalPages);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.roleCode !== "All" ||
    filters.functionId !== "All" ||
    filters.statusFilter !== "All";

  const handleFilterChange = useCallback((patch: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleResetPassword = (u: User) => {
    toast.info(`Password reset is managed by IT support for ${u.email}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const handleExport = async () => {
    try {
      const result = await triggerExportFetch({ ...queryArgs, page: 0, size: EXPORT_FETCH_SIZE }).unwrap();
      const rows = result.page.content.map(mapUserListItem);
      const header = "Name,OLM ID,Email,Department,Role,Status,Joined Date\n";
      const body = rows
        .map((u) =>
          [u.name, u.employeeId, u.email, u.function, u.role, getUserStatus(u), u.joinedDate ?? ""]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");
      const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `users-export-${dayjs().format("YYYY-MM-DD")}.csv`);
      toast.success("Export ready — download started");
    } catch {
      toast.error("Failed to export users");
    }
  };

  return (
    // The page is a full-height flex column: header, stats and toolbar stay
    // put, only the data region scrolls, and the pagination footer stays
    // reachable at the bottom without a page-level scroll. Heights come from
    // the flex chain (shell -> layout content -> here), never from measuring
    // this element, so there is no resize/scrollbar feedback loop.
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        pb: { xs: canAddUser ? 9 : 1, md: 0 },
      }}
    >
      <DashboardHeader
        onAddUser={() => setAddTypeOpen(true)}
        onImport={() => setImportOpen(true)}
        onExport={handleExport}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        canAddUser={canAddUser}
      />

      {isBackgroundRefreshing && (
        <LinearProgress sx={{ mb: 1, borderRadius: 999, height: 3, flexShrink: 0 }} />
      )}

      {isInitialLoading ? (
        <LoadingState />
      ) : (
        <>
          <StatsSection stats={data?.stats} dense={isShortViewport} />

          <SearchToolbar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            departments={departmentOptions}
            roles={roleOptions}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            dense={isShortViewport}
          />

          {/* Data region — takes all remaining height. The floor keeps it
              usable on very short windows; below that the shell scrolls. */}
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 260, md: 320 },
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {viewMode === "list" && !isMobile ? (
              <UserTable
                users={sorted}
                onView={(u) => setActiveUserId(u.userId)}
                onEdit={(u) => setActiveUserId(u.userId)}
                onPermissions={(u) => setActiveUserId(u.userId)}
                onResetPassword={handleResetPassword}
                onDelete={setDeleteTarget}
                onBulkDelete={setBulkDeleteTargets}
                onAddUser={() => setAddTypeOpen(true)}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                canAddUser={canAddUser}
              />
            ) : sorted.length === 0 && !isFetching ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmptyState
                  onAddUser={() => setAddTypeOpen(true)}
                  onResetFilters={handleResetFilters}
                  showResetFilters={hasActiveFilters}
                  showAddUser={canAddUser}
                />
              </Box>
            ) : (
              <AppScrollView sx={{ flex: 1, minHeight: 0, pr: 0.5 }}>
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
                    pb: 0.5,
                  }}
                >
                  {sorted.map((u, i) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      index={i}
                      onView={(usr) => setActiveUserId(usr.userId)}
                      onEdit={(usr) => setActiveUserId(usr.userId)}
                      onPermissions={(usr) => setActiveUserId(usr.userId)}
                      onResetPassword={handleResetPassword}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </Box>
              </AppScrollView>
            )}
          </Box>

          {/* ── Modern Pagination Footer ── */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            mt={isShortViewport ? 1 : 1.5}
            gap={isShortViewport ? 1 : 1.5}
            sx={{ flexShrink: 0 }}
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
                Showing {totalElements === 0 ? 0 : (clampedPage - 1) * rowsPerPage + 1}–
                {Math.min(clampedPage * rowsPerPage, totalElements)} of {totalElements} users
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
      {isMobile && canAddUser && (
        <Fab
          color="primary"
          onClick={() => setAddTypeOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
          }}
        >
          <Add />
        </Fab>
      )}

      {/* ── Drawer & Dialogs ── */}
      <ProfileDrawer
        userId={activeUserId}
        actorUserId={actorUserId}
        onClose={() => setActiveUserId(null)}
        onUserChanged={refetch}
      />

      <AddUserTypeDialog
        open={addTypeOpen}
        onClose={() => setAddTypeOpen(false)}
        onSelectTeam={() => {
          setAddTypeOpen(false);
          setAddOpen(true);
        }}
        onSelectOther={() => {
          setAddTypeOpen(false);
          setAddOtherOpen(true);
        }}
      />

      <AddUserWizard
        open={addOpen}
        onClose={() => setAddOpen(false)}
        actorUserId={actorUserId}
        onCreated={refetch}
      />

      <AddOtherUserDialog
        open={addOtherOpen}
        onClose={() => setAddOtherOpen(false)}
        onCreated={refetch}
      />

      <UploadEmployeeDialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          refetch();
        }}
      />

      <DeleteDialog
        user={deleteTarget}
        actorUserId={actorUserId}
        onClose={() => setDeleteTarget(null)}
        onDone={refetch}
      />
      <DeleteDialog
        user={null}
        bulkUsers={bulkDeleteTargets}
        actorUserId={actorUserId}
        onClose={() => setBulkDeleteTargets(null)}
        onDone={refetch}
      />
    </Box>
  );
}
