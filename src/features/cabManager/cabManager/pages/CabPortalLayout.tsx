import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { NavLink, Outlet, useLocation } from "react-router";
import { ROLES, ROLE_SCREENS } from "../data/cabManager.mock";
import { useCabRole } from "../hooks/useCabRole";
import type { Role } from "../types/types";

const NAV: Array<{ id: string; path: string; label: string; group: string; icon: React.ReactNode }> = [
  { id: "dashboard",      path: "/cabmanager/dashboard",     label: "Dashboard",      group: "Overview",               icon: <DashboardOutlinedIcon fontSize="small" /> },
  { id: "cabPlanning",    path: "/cabmanager/planning",      label: "CAB Planning",   group: "Change Advisory Board",  icon: <EventNoteOutlinedIcon fontSize="small" /> },
  { id: "cabSessions",    path: "/cabmanager/sessions",      label: "CAB Sessions",   group: "Change Advisory Board",  icon: <GroupsOutlinedIcon fontSize="small" /> },
  { id: "allcrqs",        path: "/cabmanager/allcrqs",       label: "All CRQs",       group: "CRQ Management",         icon: <ListAltOutlinedIcon fontSize="small" /> },
  { id: "mycrqs",         path: "/cabmanager/mycrqs",        label: "My CRQs",        group: "CRQ Management",         icon: <CheckCircleOutlineIcon fontSize="small" /> },
  { id: "journey",        path: "/cabmanager/journey",       label: "CRQ Journey",    group: "CRQ Management",         icon: <TimelineOutlinedIcon fontSize="small" /> },
  { id: "implementation", path: "/cabmanager/implementation",label: "Implementation", group: "Implementation",         icon: <PlayArrowOutlinedIcon fontSize="small" /> },
  { id: "admin",          path: "/cabmanager/admin",         label: "Admin Config",   group: "Administration",         icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export function CabPortalLayout() {
  const { role, setRole, persona } = useCabRole();
  const location = useLocation();
  const allowed = ROLE_SCREENS[role];
  const visibleNav = NAV.filter((n) => allowed.includes(n.id));

  // Group nav items
  const grouped = visibleNav.reduce<Record<string, typeof visibleNav>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const crumb = NAV.find((n) => location.pathname.startsWith(n.path));

  return (
    <Box sx={{ display: "flex", height: "100vh", minHeight: 800, bgcolor: "#F4F5F7", overflow: "hidden" }}>
      {/* Sidebar */}
      <Box component="aside" sx={{
        width: 256, flexShrink: 0, bgcolor: "#fff",
        borderRight: "1px solid", borderColor: "divider",
        display: "flex", flexDirection: "column",
      }}>
        {/* Brand */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1,
            background: "linear-gradient(135deg, #1976D2, #1565C0)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 500, fontSize: 13, letterSpacing: 0.5,
          }}>CAB</Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>CAB Portal</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Change Advisory Board</Typography>
          </Box>
        </Stack>

        {/* Role switcher */}
        <Box sx={{ p: 1.75 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.6, textTransform: "uppercase", display: "block", mb: 1.25 }}>
            Viewing as
          </Typography>
          <Stack direction="row" justifyContent="space-between" spacing={0.5} sx={{ mb: 1.25 }}>
            {(Object.keys(ROLES) as Role[]).map((r) => {
              const p = ROLES[r];
              const active = r === role;
              return (
                <Tooltip key={r} title={`${p.shortTitle} — ${p.name}`}>
                  <Box
                    onClick={() => setRole(r)}
                    sx={{
                      width: 33, height: 33, borderRadius: "50%",
                      bgcolor: p.color, color: "#fff", fontSize: 11, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                      boxShadow: active ? `0 0 0 2px #fff, 0 0 0 3.5px ${p.color}` : "none",
                      transition: "transform 0.14s ease",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    {p.initials}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
          <Box sx={{ p: 1.25, bgcolor: "#F4F8FD", borderRadius: 1, border: "1px solid rgba(21,101,192,0.12)" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1565C0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {persona.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
              {persona.title}
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <Box component="nav" sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1.5 }}>
          {Object.entries(grouped).map(([group, items]) => (
            <Box key={group}>
              <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.6, textTransform: "uppercase", px: 1.5, pt: 1.75, pb: 0.75, display: "block" }}>
                {group}
              </Typography>
              {items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        px: 1.5, py: 1.25, borderRadius: 1, mb: 0.25,
                        bgcolor: isActive ? "#E3F2FD" : "transparent",
                        color: isActive ? "#1565C0" : "text.primary",
                        fontWeight: isActive ? 500 : 400, fontSize: 14,
                        cursor: "pointer",
                        "&:hover": { bgcolor: isActive ? "#E3F2FD" : "rgba(0,0,0,0.04)" },
                      }}
                    >
                      {item.icon}
                      <Box sx={{ flex: 1 }}>{item.label}</Box>
                    </Stack>
                  )}
                </NavLink>
              ))}
            </Box>
          ))}
        </Box>

        {/* Persona footer */}
        <Divider />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.75 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: persona.color, fontSize: 13 }}>{persona.initials}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{persona.name}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{persona.title}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <Box component="header" sx={{
          height: 64, flexShrink: 0, bgcolor: "#fff",
          borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", gap: 3, px: 4,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: "text.secondary" }}>CAB Portal</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>›</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{crumb?.label ?? "Dashboard"}</Typography>
          </Stack>
          <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
            <IconButton size="small">
              <Badge variant="dot" color="error"><NotificationsNoneOutlinedIcon /></Badge>
            </IconButton>
            <IconButton size="small"><HelpOutlineOutlinedIcon /></IconButton>
          </Box>
        </Box>

        {/* Page body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
