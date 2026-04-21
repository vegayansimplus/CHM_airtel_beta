import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  InputAdornment,
  TextField,
  Chip,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Alert,
} from "@mui/material";
import { Search, ExpandMore, CheckCircle } from "@mui/icons-material";

import { CommonContainerWithoutTab } from "../../../components/common/ContainerWithoutTab";
import { useTabColorTokens } from "../../../style/theme";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "SUPER_ADMIN" | "TEAM_LEAD" | "TEAM_MEMBER" | "SPECIFIC_USER";
type Permission = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";
type FilterRole = Role | "ALL";

const ROLES: Role[] = ["SUPER_ADMIN", "TEAM_LEAD", "TEAM_MEMBER", "SPECIFIC_USER"];
const PERMISSIONS: Permission[] = ["VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"];

interface Feature {
  id: string;
  name: string;
}

interface DashboardModule {
  id: string;
  name: string;
  features: Feature[];
}

interface UserPerms {
  [featureId: string]: {
    [perm in Permission]?: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  team: string;
  role: Role;
  isGlobal: boolean;
  isCustom: boolean;
  perms: UserPerms;
  av: string;
  avColor: "blue" | "teal" | "coral" | "purple" | "amber";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DASHBOARDS: DashboardModule[] = [
  {
    id: "d1",
    name: "User Management",
    features: [
      { id: "f1", name: "View users" },
      { id: "f2", name: "Create user" },
      { id: "f3", name: "Edit user" },
      { id: "f4", name: "Delete user" },
      { id: "f5", name: "Approve user" },
    ],
  },
  {
    id: "d2",
    name: "Roster Management",
    features: [
      { id: "f6",  name: "View roster" },
      { id: "f7",  name: "Create shift" },
      { id: "f8",  name: "Edit shift" },
      { id: "f9",  name: "Delete shift" },
      { id: "f10", name: "Approve shift" },
      { id: "f11", name: "Reject shift" },
    ],
  },
  {
    id: "d3",
    name: "Organisation Hierarchy",
    features: [
      { id: "f12", name: "View hierarchy" },
      { id: "f13", name: "Add team" },
      { id: "f14", name: "Edit team" },
      { id: "f15", name: "Remove member" },
    ],
  },
  {
    id: "d4",
    name: "Notification System",
    features: [
      { id: "f16", name: "View notifications" },
      { id: "f17", name: "Create template" },
      { id: "f18", name: "Send notification" },
      { id: "f19", name: "Delete template" },
    ],
  },
  {
    id: "d5",
    name: "RBAC Settings",
    features: [
      { id: "f20", name: "View roles" },
      { id: "f21", name: "Create role" },
      { id: "f22", name: "Assign permissions" },
      { id: "f23", name: "Delete role" },
    ],
  },
];

// ─── Permission Generators ────────────────────────────────────────────────────
const fullPerms = (): UserPerms => {
  const out: UserPerms = {};
  DASHBOARDS.forEach((d) =>
    d.features.forEach((f) => {
      out[f.id] = { VIEW: true, CREATE: true, UPDATE: true, DELETE: true, APPROVE: true, REJECT: true };
    }),
  );
  return out;
};

const leadPerms = (): UserPerms => {
  const out: UserPerms = {};
  DASHBOARDS.slice(0, 3).forEach((d) =>
    d.features.forEach((f) => {
      out[f.id] = { VIEW: true, CREATE: true, UPDATE: true, DELETE: false, APPROVE: true, REJECT: true };
    }),
  );
  DASHBOARDS.slice(3).forEach((d) =>
    d.features.forEach((f) => {
      out[f.id] = { VIEW: true, CREATE: false, UPDATE: false, DELETE: false, APPROVE: false, REJECT: false };
    }),
  );
  return out;
};

const memberPerms = (): UserPerms => {
  const out: UserPerms = {};
  DASHBOARDS.forEach((d) =>
    d.features.forEach((f) => {
      out[f.id] = { VIEW: true, CREATE: false, UPDATE: false, DELETE: false, APPROVE: false, REJECT: false };
    }),
  );
  return out;
};

// ─── Initial Users ────────────────────────────────────────────────────────────
const INITIAL_USERS: User[] = [
  { id: "u1", name: "Pankaj Sharma",   email: "pankaj@acme.com", team: "Operations",  role: "SUPER_ADMIN",   isGlobal: true,  isCustom: false, perms: fullPerms(),   av: "PS", avColor: "blue"   },
  { id: "u2", name: "Riya Mehta",      email: "riya@acme.com",   team: "Operations",  role: "TEAM_LEAD",     isGlobal: false, isCustom: false, perms: leadPerms(),   av: "RM", avColor: "teal"   },
  { id: "u3", name: "Arjun Nair",      email: "arjun@acme.com",  team: "Operations",  role: "TEAM_MEMBER",   isGlobal: false, isCustom: false, perms: memberPerms(), av: "AN", avColor: "purple" },
  { id: "u4", name: "Sneha Kulkarni",  email: "sneha@acme.com",  team: "Engineering", role: "TEAM_LEAD",     isGlobal: false, isCustom: false, perms: leadPerms(),   av: "SK", avColor: "coral"  },
  { id: "u5", name: "Dev Patil",       email: "dev@acme.com",    team: "Engineering", role: "TEAM_MEMBER",   isGlobal: false, isCustom: false, perms: memberPerms(), av: "DP", avColor: "purple" },
  { id: "u6", name: "Kavya Reddy",     email: "kavya@acme.com",  team: "Finance",     role: "SPECIFIC_USER", isGlobal: false, isCustom: true,  perms: memberPerms(), av: "KR", avColor: "amber"  },
  { id: "u7", name: "Rohan Iyer",      email: "rohan@acme.com",  team: "Finance",     role: "TEAM_MEMBER",   isGlobal: false, isCustom: false, perms: memberPerms(), av: "RI", avColor: "teal"   },
];

// ─── Design Tokens ────────────────────────────────────────────────────────────
const roleLabel: Record<Role, string> = {
  SUPER_ADMIN:   "Super Admin",
  TEAM_LEAD:     "Team Lead",
  TEAM_MEMBER:   "Team Member",
  SPECIFIC_USER: "Specific User",
};

// Role chip colors — pastel bg + dark text from same family
const roleChipColors: Record<Role, { bg: string; color: string }> = {
  SUPER_ADMIN:   { bg: "#B5D4F4", color: "#0C447C" },
  TEAM_LEAD:     { bg: "#9FE1CB", color: "#085041" },
  TEAM_MEMBER:   { bg: "#CECBF6", color: "#3C3489" },
  SPECIFIC_USER: { bg: "#FAC775", color: "#633806" },
};

// Scope badge (inside accordions)
const scopeBadgeColors = {
  global: { bg: "#E6F1FB", color: "#0C447C" },
  team:   { bg: "#EEEDFE", color: "#3C3489" },
  custom: { bg: "#FAEEDA", color: "#633806" },
};

const avatarColors: Record<User["avColor"], { bg: string; color: string }> = {
  blue:   { bg: "#B5D4F4", color: "#0C447C" },
  teal:   { bg: "#9FE1CB", color: "#085041" },
  coral:  { bg: "#F5C4B3", color: "#712B13" },
  purple: { bg: "#CECBF6", color: "#3C3489" },
  amber:  { bg: "#FAC775", color: "#633806" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminSettingDashboard: React.FC = () => {
  const theme  = useTheme();
  const bg     = useTabColorTokens(theme);
  const isDark = theme.palette.mode === "dark";

  const [users,       setUsers]       = useState<User[]>(JSON.parse(JSON.stringify(INITIAL_USERS)));
  const [selectedId,  setSelectedId]  = useState<string>("u1");
  const [search,      setSearch]      = useState("");
  const [filterRole,  setFilterRole]  = useState<FilterRole>("ALL");
  const [changed,     setChanged]     = useState<Record<string, boolean>>({});
  const [isSavedMsg,  setIsSavedMsg]  = useState(false);

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedId), [users, selectedId]);
  const hasChanges   = !!changed[selectedId];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q     = search.toLowerCase();
      const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.team.toLowerCase().includes(q);
      const matchR = filterRole === "ALL" || u.role === filterRole;
      return matchQ && matchR;
    });
  }, [users, search, filterRole]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRoleChange = (newRole: Role) => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== selectedId) return u;
        const updated = { ...u, role: newRole, isGlobal: newRole === "SUPER_ADMIN", isCustom: newRole === "SPECIFIC_USER" };
        if (newRole === "SUPER_ADMIN")    updated.perms = fullPerms();
        else if (newRole === "TEAM_LEAD") updated.perms = leadPerms();
        else                              updated.perms = memberPerms();
        return updated;
      }),
    );
    setChanged((prev) => ({ ...prev, [selectedId]: true }));
  };

  const handlePermChange = (featureId: string, perm: Permission, checked: boolean) => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== selectedId) return u;
        const newPerms = { ...u.perms };
        if (!newPerms[featureId]) newPerms[featureId] = {};
        newPerms[featureId][perm] = checked;
        return { ...u, perms: newPerms };
      }),
    );
    setChanged((prev) => ({ ...prev, [selectedId]: true }));
  };

  const handleSave = () => {
    setChanged((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 1400);
  };

  // ── Scope helpers ──────────────────────────────────────────────────────────
  const getScopeKey = (u: User): "global" | "team" | "custom" =>
    u.role === "SUPER_ADMIN" ? "global" : u.isCustom ? "custom" : "team";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <CommonContainerWithoutTab>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: bg.radiusL,
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
          mt: 1,
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                mb: 1.5,
              }}
            >
              Users
            </Typography>

            <TextField
              fullWidth
              placeholder="Search users..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: { fontSize: 12, height: 34 },
              }}
            />

            {/* Role filter chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 1.5 }}>
              {(["ALL", ...ROLES] as FilterRole[]).map((r) => {
                const isActive = filterRole === r;
                return (
                  <Chip
                    key={r}
                    label={r === "ALL" ? "All" : roleLabel[r as Role].split(" ")[0]}
                    onClick={() => setFilterRole(r)}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 22,
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      backgroundColor: isActive
                        ? alpha(bg.accent, isDark ? 0.2 : 0.1)
                        : "transparent",
                      color: isActive ? bg.accent : "text.secondary",
                      border: `1px solid ${isActive ? alpha(bg.accent, 0.35) : theme.palette.divider}`,
                      "&:hover": {
                        backgroundColor: isActive
                          ? alpha(bg.accent, isDark ? 0.25 : 0.14)
                          : alpha(theme.palette.text.primary, 0.04),
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* User list */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 0.75 }}>
            {filteredUsers.map((u) => {
              const isSelected  = u.id === selectedId;
              const hasUnsaved  = changed[u.id];
              const avColors    = avatarColors[u.avColor];
              const chipColors  = roleChipColors[u.role];

              return (
                <Box
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: "9px 12px",
                    cursor: "pointer",
                    borderRadius: bg.radius,
                    mb: 0.25,
                    backgroundColor: isSelected
                      ? alpha(bg.accent, isDark ? 0.12 : 0.07)
                      : "transparent",
                    borderRight: `2.5px solid ${isSelected ? bg.accent : "transparent"}`,
                    transition: "background 0.12s",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? alpha(bg.accent, isDark ? 0.15 : 0.09)
                        : alpha(theme.palette.text.primary, 0.035),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: avColors.bg,
                      color: avColors.color,
                      flexShrink: 0,
                    }}
                  >
                    {u.av}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {u.name}
                      {hasUnsaved && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            backgroundColor: theme.palette.error.main,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 11, color: "text.secondary" }}>
                      {u.team}
                    </Typography>
                  </Box>

                  <Chip
                    label={roleLabel[u.role].split(" ")[0]}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      fontWeight: 600,
                      backgroundColor: chipColors.bg,
                      color: chipColors.color,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.palette.background.default,
            overflow: "hidden",
          }}
        >
          {selectedUser ? (
            <>
              {/* Header */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: avatarColors[selectedUser.avColor].bg,
                    color:           avatarColors[selectedUser.avColor].color,
                    flexShrink: 0,
                  }}
                >
                  {selectedUser.av}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "text.primary" }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                    {selectedUser.email}&nbsp;&nbsp;·&nbsp;&nbsp;{selectedUser.team}
                  </Typography>
                </Box>

                {/* Role selector */}
                <TextField
                  select
                  size="small"
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  sx={{
                    width: 162,
                    "& .MuiInputBase-root": { fontSize: 12, height: 34 },
                  }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: 12 }}>
                      {roleLabel[r]}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Save button */}
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={!hasChanges && !isSavedMsg}
                  startIcon={isSavedMsg ? <CheckCircle sx={{ fontSize: "16px !important" }} /> : undefined}
                  sx={{
                    height: 34,
                    px: 2.25,
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 120,
                    backgroundColor: isSavedMsg
                      ? theme.palette.secondary.main
                      : theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: isSavedMsg
                        ? theme.palette.secondary.dark
                        : theme.palette.primary.dark,
                    },
                    "&.Mui-disabled": {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(13,27,42,0.06)",
                      color: "text.disabled",
                    },
                    transition: "background 0.2s",
                  }}
                >
                  {isSavedMsg ? "Saved!" : "Save changes"}
                </Button>
              </Box>

              {/* Permissions area */}
              <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 2.5 } }}>

                {/* Banners */}
                {selectedUser.isGlobal && (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2.5,
                      "& .MuiAlert-message": {
                        fontSize: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      },
                    }}
                  >
                    Global access — Super Admin can access all features without restriction.
                  </Alert>
                )}

                {selectedUser.isCustom && (
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 2.5,
                      "& .MuiAlert-message": { fontSize: 12 },
                    }}
                  >
                    Custom view enabled — permissions are user-specific, not team-based.
                  </Alert>
                )}

                {/* Module accordions */}
                {DASHBOARDS.map((db) => {
                  const scopeKey    = getScopeKey(selectedUser);
                  const scopeColors = scopeBadgeColors[scopeKey];

                  return (
                    <Accordion
                      key={db.id}
                      defaultExpanded
                      disableGutters
                      elevation={0}
                      sx={{ mb: 1.5 }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                          {db.name}
                        </Typography>
                        <Chip
                          label={scopeKey}
                          size="small"
                          sx={{
                            height: 19,
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            backgroundColor: scopeColors.bg,
                            color: scopeColors.color,
                            mr: 1,
                          }}
                        />
                      </AccordionSummary>

                      <AccordionDetails>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: "35%", py: 1.25 }}>Feature</TableCell>
                              {PERMISSIONS.map((p) => (
                                <TableCell key={p} align="center" sx={{ py: 1.25 }}>
                                  {p.charAt(0) + p.slice(1).toLowerCase()}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {db.features.map((feat) => {
                              const fp = selectedUser.perms[feat.id] || {};
                              return (
                                <TableRow key={feat.id}>
                                  <TableCell sx={{ fontWeight: 500, fontSize: 12 }}>
                                    {feat.name}
                                  </TableCell>
                                  {PERMISSIONS.map((p) => (
                                    <TableCell key={p} align="center">
                                      <Checkbox
                                        size="small"
                                        checked={Boolean(fp[p])}
                                        disabled={selectedUser.isGlobal}
                                        onChange={(e) =>
                                          handlePermChange(feat.id, p, e.target.checked)
                                        }
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "text.secondary",
              }}
            >
              <Typography sx={{ fontSize: 14 }}>Select a user to manage permissions</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </CommonContainerWithoutTab>
  );
};