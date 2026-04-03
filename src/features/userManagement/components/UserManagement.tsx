import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Select,
  FormControl,
  Pagination,
  Fade,
  Divider,
  Paper,
  Stack,
  alpha,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import {
  Search,
  PersonAdd,
  UploadFile,
  MoreVert,
  FilterList,
  GridView,
  ViewList,
  Edit,
  Delete,
  Shield,
  Group,
  Person,
  SupervisorAccount,
  Close,
  CheckCircle,
  TrendingUp,
  People,
} from "@mui/icons-material";

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a1a2e" },
    secondary: { main: "#e94560" },
    background: { default: "#f0f2f8", paper: "#ffffff" },
    text: { primary: "#1a1a2e", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 800, letterSpacing: "-0.5px" },
    h6: { fontWeight: 700 },
    body2: { fontSize: "0.8125rem" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: "0.72rem" } },
    },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Super Admin" | "Team Lead" | "Team Member";
interface User {
  id: string;
  name: string;
  employeeId: string;
  function: string;
  role: Role;
  email: string;
  joinedDate: string;
  active: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS: User[] = [
  { id: "1", name: "Prasann Shrivastava", employeeId: "B0093363", function: "IP Core", role: "Team Lead", email: "prasann@corp.com", joinedDate: "Jan 2021", active: true },
  { id: "2", name: "Pankaj Chaudhary", employeeId: "B0223564", function: "IP Core", role: "Team Lead", email: "pankaj@corp.com", joinedDate: "Mar 2021", active: true },
  { id: "3", name: "Dhananjay Saini", employeeId: "B0223641", function: "IP Core", role: "Team Lead", email: "dhananjay@corp.com", joinedDate: "Mar 2021", active: true },
  { id: "4", name: "Akash Sharma", employeeId: "B0308597", function: "IP Core", role: "Super Admin", email: "akash@corp.com", joinedDate: "Jun 2022", active: true },
  { id: "5", name: "Harsh Yadav", employeeId: "B0266821", function: "IP Core", role: "Team Member", email: "harsh@corp.com", joinedDate: "Aug 2021", active: true },
  { id: "6", name: "Satydeep Jaiswal", employeeId: "B0321549", function: "IP Core", role: "Team Member", email: "satydeep@corp.com", joinedDate: "Sep 2022", active: false },
  { id: "7", name: "Bibhu Raj", employeeId: "B0325609", function: "IP Core", role: "Team Member", email: "bibhu@corp.com", joinedDate: "Oct 2022", active: true },
  { id: "8", name: "Aditya Guleria", employeeId: "A1KQODMV", function: "IP Core", role: "Team Member", email: "aditya@corp.com", joinedDate: "Nov 2022", active: true },
  { id: "9", name: "Riya Mehta", employeeId: "B0410023", function: "IP Core", role: "Team Member", email: "riya@corp.com", joinedDate: "Jan 2023", active: true },
  { id: "10", name: "Vikram Nair", employeeId: "B0412088", function: "IP Core", role: "Team Lead", email: "vikram@corp.com", joinedDate: "Feb 2023", active: false },
];

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<Role, { color: string; bg: string; icon: React.ElementType }> = {
  "Super Admin": { color: "#dc2626", bg: "#fef2f2", icon: Shield },
  "Team Lead":   { color: "#7c3aed", bg: "#f5f3ff", icon: SupervisorAccount },
  "Team Member": { color: "#0284c7", bg: "#f0f9ff", icon: Person },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  "#e94560", "#7c3aed", "#0284c7", "#059669",
  "#d97706", "#db2777", "#2563eb", "#16a34a",
];
const getAvatarColor = (id: string) =>
  AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number; icon: React.ElementType; color: string; sub: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, borderRadius: 3, flex: 1, minWidth: 140,
        border: "1px solid", borderColor: "rgba(0,0,0,0.06)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
        background: "white",
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
          <Typography variant="h5" fontWeight={800} color="text.primary">{value}</Typography>
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        </Box>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(color, 0.12) }}>
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
      </Stack>
    </Paper>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ user, onEdit, onDelete }: {
  user: User; onEdit: (u: User) => void; onDelete: (u: User) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { color, bg, icon: RoleIcon } = ROLE_CONFIG[user.role];

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "2.5fr 1fr 1.2fr 1fr auto" },
          alignItems: "center", gap: 2, px: 3, py: 2,
          borderRadius: 2, mb: 1,
          border: "1px solid", borderColor: "rgba(0,0,0,0.05)",
          bgcolor: "white",
          transition: "all 0.18s ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 16px rgba(26,26,46,0.08)",
            transform: "translateX(2px)",
          },
        }}
      >
        {/* User */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box sx={{
                width: 10, height: 10, borderRadius: "50%",
                bgcolor: user.active ? "#22c55e" : "#9ca3af",
                border: "2px solid white",
              }} />
            }
          >
            <Avatar
              sx={{
                bgcolor: getAvatarColor(user.id),
                width: 42, height: 42, fontSize: "0.85rem", fontWeight: 700,
              }}
            >
              {getInitials(user.name)}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.employeeId} · {user.email}
            </Typography>
          </Box>
        </Stack>

        {/* Function — hidden on xs */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Chip
            label={user.function}
            size="small"
            sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: "0.72rem" }}
          />
        </Box>

        {/* Role — hidden on xs */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Chip
            icon={<RoleIcon style={{ fontSize: 14, color }} />}
            label={user.role}
            size="small"
            sx={{ bgcolor: bg, color, border: `1px solid ${alpha(color, 0.25)}` }}
          />
        </Box>

        {/* Joined — hidden on xs */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Typography variant="caption" color="text.secondary">{user.joinedDate}</Typography>
        </Box>

        {/* Actions */}
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: "text.secondary",
            "&:hover": { bgcolor: "rgba(26,26,46,0.06)", color: "primary.main" },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160 } }}
        >
          <MenuItem onClick={() => { onEdit(user); setAnchorEl(null); }} sx={{ gap: 1.5 }}>
            <Edit fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="body2">Edit User</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { onDelete(user); setAnchorEl(null); }} sx={{ gap: 1.5, color: "#dc2626" }}>
            <Delete fontSize="small" />
            <Typography variant="body2" color="inherit">Remove User</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Fade>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({ user, onClose, onConfirm }: {
  user: User | null; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Dialog open={!!user} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Remove User</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          Are you sure you want to remove <strong>{user?.name}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Remove</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Add User Dialog ──────────────────────────────────────────────────────────
function AddUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 }}>
        Add New User
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={1}>
          {["Full Name", "Employee ID", "Email Address"].map((label) => (
            <TextField key={label} label={label} fullWidth size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          ))}
          <FormControl fullWidth size="small">
            <Select defaultValue="Team Member" sx={{ borderRadius: 2 }}>
              <MenuItem value="Team Member">Team Member</MenuItem>
              <MenuItem value="Team Lead">Team Lead</MenuItem>
              <MenuItem value="Super Admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d4e" } }}
        >
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const PER_PAGE = 6;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "Super Admin").length,
    leads: users.filter((u) => u.role === "Team Lead").length,
    members: users.filter((u) => u.role === "Team Member").length,
  }), [users]);

  const handleDelete = () => {
    if (deleteTarget) setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f8", fontFamily: '"DM Sans", sans-serif' }}>

        {/* Top Header Bar */}
        <Box sx={{
          bgcolor: "#1a1a2e", color: "white", px: { xs: 2, md: 4 }, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              bgcolor: "#e94560", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <People sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.3px" }}>
              UserHub
            </Typography>
          </Stack>
          <Stack direction="row" gap={1.5}>
            <Button
              startIcon={<UploadFile />}
              variant="outlined"
              size="small"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.25)", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" } }}
            >
              Import Excel
            </Button>
            <Button
              startIcon={<PersonAdd />}
              variant="contained"
              size="small"
              onClick={() => setAddOpen(true)}
              sx={{ bgcolor: "#e94560", "&:hover": { bgcolor: "#c73652" } }}
            >
              Add User
            </Button>
          </Stack>
        </Box>

        {/* Page Body */}
        <Box sx={{ mx: "auto", p:2}}>

          {/* Page Title */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h4" color="text.primary">User Management</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage roles, permissions and team access
              </Typography>
            </Box>
            <Chip
              icon={<TrendingUp sx={{ fontSize: 14 }} />}
              label={`${stats.total} total users`}
              sx={{ bgcolor: "#e94560", color: "white", fontWeight: 700 }}
            />
          </Stack>

          {/* Stats Row */}
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={3} flexWrap="wrap">
            <StatCard label="Total Users" value={stats.total} icon={Group} color="#1a1a2e" sub="Across all roles" />
            <StatCard label="Super Admins" value={stats.admins} icon={Shield} color="#dc2626" sub="Full access" />
            <StatCard label="Team Leads" value={stats.leads} icon={SupervisorAccount} color="#7c3aed" sub="Lead access" />
            <StatCard label="Team Members" value={stats.members} icon={Person} color="#0284c7" sub="Standard access" />
          </Stack>

          {/* Filter Bar */}
          <Paper elevation={0} sx={{
            p: 2, borderRadius: 3, mb: 2,
            border: "1px solid rgba(0,0,0,0.06)",
            display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center",
          }}>
            <TextField
              placeholder="Search by name, ID or email…"
              size="small"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1, minWidth: 220,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                },
              }}
            />
            <Stack direction="row" gap={1} flexWrap="wrap">
              {["All", "Super Admin", "Team Lead", "Team Member"].map((r) => (
                <Chip
                  key={r}
                  label={r}
                  clickable
                  onClick={() => { setRoleFilter(r); setPage(1); }}
                  variant={roleFilter === r ? "filled" : "outlined"}
                  sx={roleFilter === r
                    ? { bgcolor: "#1a1a2e", color: "white", fontWeight: 700 }
                    : { borderColor: "rgba(0,0,0,0.12)", color: "text.secondary" }
                  }
                />
              ))}
            </Stack>
            <Stack direction="row" gap={0.5} ml="auto">
              <Tooltip title="List view">
                <IconButton size="small" onClick={() => setViewMode("list")}
                  sx={{ bgcolor: viewMode === "list" ? "rgba(26,26,46,0.08)" : "transparent" }}>
                  <ViewList fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid view">
                <IconButton size="small" onClick={() => setViewMode("grid")}
                  sx={{ bgcolor: viewMode === "grid" ? "rgba(26,26,46,0.08)" : "transparent" }}>
                  <GridView fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          {/* Column Headers (list mode) */}
          {viewMode === "list" && (
            <Box sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr auto",
              gap: 2, px: 3, py: 1, mb: 1,
            }}>
              {["User", "Function", "Role", "Joined", ""].map((col) => (
                <Typography key={col} variant="caption" fontWeight={700}
                  color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {col}
                </Typography>
              ))}
            </Box>
          )}

          {/* User List / Grid */}
          {viewMode === "list" ? (
            <Box>
              {paginated.length > 0
                ? paginated.map((u) => (
                    <UserRow key={u.id} user={u}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                    />
                  ))
                : (
                  <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px dashed rgba(0,0,0,0.12)" }}>
                    <Typography color="text.secondary">No users match your search.</Typography>
                  </Paper>
                )
              }
            </Box>
          ) : (
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}>
              {paginated.map((u) => {
                const { color, bg, icon: RoleIcon } = ROLE_CONFIG[u.role];
                return (
                  <Paper key={u.id} elevation={0} sx={{
                    p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        badgeContent={
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%",
                            bgcolor: u.active ? "#22c55e" : "#9ca3af", border: "2px solid white" }} />
                        }
                      >
                        <Avatar sx={{ bgcolor: getAvatarColor(u.id), width: 48, height: 48, fontWeight: 700 }}>
                          {getInitials(u.name)}
                        </Avatar>
                      </Badge>
                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} mt={1.5}>{u.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{u.employeeId}</Typography>
                    <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
                      <Chip icon={<RoleIcon style={{ fontSize: 13, color }} />}
                        label={u.role} size="small"
                        sx={{ bgcolor: bg, color, border: `1px solid ${alpha(color, 0.2)}`, fontSize: "0.7rem" }}
                      />
                      <Chip label={u.function} size="small"
                        sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: "0.7rem" }}
                      />
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* Footer */}
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center"
            justifyContent="space-between" mt={3} gap={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": { borderRadius: 2 },
                "& .Mui-selected": { bgcolor: "#1a1a2e !important", color: "white" },
              }}
            />
          </Stack>
        </Box>

        {/* Dialogs */}
        <DeleteDialog user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}