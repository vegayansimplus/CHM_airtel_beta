import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Grid,
  Tooltip,
  Collapse,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  title: string;
  dept: string;
  time: string;
  status: "Done" | "Urgent" | "Pending" | "Rostering";
}

interface Notif {
  id: number;
  title: string;
  desc: string;
  time: string;
  action: string;
  type: "info" | "danger" | "success";
  color: string;
  eBg: string;
  eBorder: string;
  read: boolean;
}

interface Holiday {
  month: string;
  day: string;
  name: string;
  type: string;
  countdown: string;
  color: string;
  bg: string;
}

interface LeaveTeamMember {
  name: string;
  role: string;
  type: string;
  tColor: string;
  tBg: string;
  initials: string;
  bg: string;
  fg: string;
  returnDate: string;
}

interface WeekDay {
  day: string;
  date: number;
  shift: { name: string; start: string; end: string; dur: string } | null;
  isOff?: boolean;
  isToday?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PROFILE = {
  name: "Karthika P",
  role: "IP Access · CCB Division",
  id: "B0324261",
};

const WEEK: WeekDay[] = [
  { day: "SU", date: 15, shift: null, isOff: true },
  { day: "MO", date: 16, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "TU", date: 17, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "WE", date: 18, shift: { name: "Gen", start: "09:30", end: "18:00", dur: "510m" } },
  { day: "TH", date: 19, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "FR", date: 20, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" }, isToday: true },
  { day: "SA", date: 21, shift: null, isOff: true },
];

const TASKS: Task[] = [
  { id: 1, title: "Review Q1 Performance Report",    dept: "Management", time: "10:00 AM", status: "Done"      },
  { id: 2, title: "Update IP Access Protocols",      dept: "Security",   time: "2:30 PM",  status: "Urgent"    },
  { id: 3, title: "Submit weekly attendance report", dept: "HR",         time: "5:00 PM",  status: "Pending"   },
  { id: 4, title: "Review team shift requests",      dept: "Rostering",  time: "EOD",      status: "Rostering" },
];

const NOTIFS: Notif[] = [
  { id: 1, title: "Shift swap requested",  desc: "John Doe wants to swap Friday shift", time: "10m ago", action: "Review",  type: "info",    color: "#6366f1", eBg: "#eef2ff", eBorder: "#c7d2fe", read: false },
  { id: 2, title: "Swap request rejected", desc: "Manager declined your swap request",  time: "1h ago",  action: "Dismiss", type: "danger",  color: "#ef4444", eBg: "#fef2f2", eBorder: "#fecaca", read: false },
  { id: 3, title: "Leave approved",        desc: "Your leave for Apr 2 is confirmed",   time: "2h ago",  action: "View",    type: "success", color: "#10b981", eBg: "#ecfdf5", eBorder: "#a7f3d0", read: true  },
];

const HOLIDAYS: Holiday[] = [
  { month: "MAR", day: "29", name: "Good Friday", type: "Public holiday", countdown: "8 days",  color: "#6366f1", bg: "#eef2ff" },
  { month: "APR", day: "10", name: "Eid al-Fitr", type: "Public holiday", countdown: "20 days", color: "#ef4444", bg: "#fef2f2" },
];

const LEAVE_TEAM: LeaveTeamMember[] = [
  { name: "Rahul Sharma", role: "UI/UX Designer", type: "Sick leave",   tColor: "#ef4444", tBg: "#fef2f2", initials: "RS", bg: "#dbeafe", fg: "#1d4ed8", returnDate: "Mar 22" },
  { name: "Priya Patel",  role: "Frontend Dev",   type: "Annual leave", tColor: "#10b981", tBg: "#ecfdf5", initials: "PP", bg: "#ede9fe", fg: "#6d28d9", returnDate: "Mar 25" },
];

const WFH_WEEK = [
  { d: "M", t: "WFH" }, { d: "T", t: "WFH" }, { d: "W", t: "WFH" }, { d: "T", t: "WFO" }, { d: "F", t: "WFO", active: true },
];

const STATUS_MAP: Record<string, { bg: string; color: string; ring: string }> = {
  Done:      { bg: "#ecfdf5", color: "#059669", ring: "#a7f3d0" },
  Urgent:    { bg: "#fff7ed", color: "#ea580c", ring: "#fed7aa" },
  Pending:   { bg: "#f8fafc", color: "#64748b", ring: "#e2e8f0" },
  Rostering: { bg: "#eef2ff", color: "#4f46e5", ring: "#c7d2fe" },
};

const ACCENT = "#6366f1";

// ─── Radial Progress ─────────────────────────────────────────────────────────

function RadialProgress({ value, max, size = 52, stroke = 5, color = "#818cf8" }: {
  value: number; max: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDash((value / max) * circ), 200);
    return () => clearTimeout(t);
  }, [value, max, circ]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 10, color: "#94a3b8", mt: 0.3, fontWeight: 500 }}>{subtitle}</Typography>}
      </Box>
      {right}
    </Box>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [taskFilter, setTaskFilter] = useState<"All" | "Pending" | "Done">("All");
  const [wfMode, setWfMode]         = useState<"WFH" | "WFO">("WFH");
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({ 1: true });
  const [dismissed, setDismissed]   = useState<Record<number, boolean>>({});
  const [readNotifs, setReadNotifs] = useState<Record<number, boolean>>({ 3: true });
  const [mounted, setMounted]       = useState(false);
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [expandedNotif, setExpandedNotif] = useState<number | null>(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [scheduleHover, setScheduleHover]   = useState<number | null>(null);
  const [wfhBounce, setWfhBounce]           = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggleTask = (id: number) => setCheckedTasks(p => ({ ...p, [id]: !p[id] }));
  const markRead   = (id: number) => setReadNotifs(p => ({ ...p, [id]: true }));

  const doneCount   = Object.values(checkedTasks).filter(Boolean).length;
  const progressPct = (doneCount / TASKS.length) * 100;

  const visibleTasks  = TASKS.filter(t =>
    taskFilter === "Done" ? !!checkedTasks[t.id] : taskFilter === "Pending" ? !checkedTasks[t.id] : true
  );
  const activeNotifs  = NOTIFS.filter(n => !dismissed[n.id]);
  const unreadCount   = activeNotifs.filter(n => !readNotifs[n.id]).length;

  const fi = (delay: number): React.CSSProperties => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? "none" : "translateY(12px)",
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  });

  return (
    <Box sx={{
      p: "18px 20px",
      minHeight: "100vh",
      background: "linear-gradient(150deg,#f0f4ff 0%,#fafbff 50%,#f0fdf6 100%)",
      fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
    }}>

      <Grid container spacing="14px" alignItems="flex-start">

        {/* ══ COL 1 — Profile + Work Location + Holidays ══ */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* ── Profile Card ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", overflow: "hidden", ...fi(0.05) }}>
              <Box sx={{
                background: "linear-gradient(130deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)",
                p: "20px 18px 0", position: "relative", overflow: "hidden",
              }}>
                <Box sx={{ position: "absolute", top: -40, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
                <Box sx={{ position: "absolute", top: 10, right: 50, width: 55, height: 55, borderRadius: "50%", background: "rgba(165,180,252,.09)" }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
                  <Box sx={{ position: "relative" }}>
                    <Box sx={{
                      width: 46, height: 46, borderRadius: "50%",
                      background: "linear-gradient(135deg,#818cf8,#c084fc)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 900, color: "#fff",
                      boxShadow: "0 0 0 3px rgba(255,255,255,.18)",
                    }}>KP</Box>
                    <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #1e1b4b" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>{PROFILE.name}</Typography>
                    <Typography sx={{ fontSize: 9, color: "rgba(199,210,254,.6)", mt: 0.3 }}>{PROFILE.role}</Typography>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", mt: "5px", background: "rgba(255,255,255,.1)", borderRadius: "20px", px: "7px", py: "2px" }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                      <Typography sx={{ fontSize: 8, fontWeight: 700, color: "rgba(199,210,254,.8)", letterSpacing: ".4px" }}>ACTIVE · {PROFILE.id}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <RadialProgress value={doneCount} max={TASKS.length} />
                    <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{Math.round(progressPct)}%</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* 4-stat grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", mt: "14px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  {[
                    { v: doneCount,               l: "Done"      },
                    { v: TASKS.length - doneCount, l: "Remaining" },
                    { v: "5/5",                   l: "Days"      },
                    { v: wfMode,                  l: "Mode"      },
                  ].map((s, i) => (
                    <Box key={i} sx={{
                      textAlign: "center", py: "9px",
                      borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,.08)" : "none",
                      borderBottom: i < 2 ? "1px solid rgba(255,255,255,.08)" : "none",
                    }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.v}</Typography>
                      <Typography sx={{ fontSize: 7, fontWeight: 700, color: "rgba(199,210,254,.45)", mt: "3px", letterSpacing: ".6px", textTransform: "uppercase" }}>{s.l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Progress bar */}
              <Box sx={{ p: "10px 14px 12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: "5px" }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: ".5px", textTransform: "uppercase" }}>Task Progress</Typography>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: ACCENT }}>{doneCount} of {TASKS.length}</Typography>
                </Box>
                <Box sx={{ height: 5, background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                  <Box sx={{ height: "100%", borderRadius: "99px", background: `linear-gradient(90deg,${ACCENT},#8b5cf6)`, width: `${progressPct}%`, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
                </Box>
                <Typography sx={{ fontSize: 9, color: "#94a3b8", mt: "4px" }}>{Math.round(progressPct)}% complete</Typography>
              </Box>
            </Card>

            {/* ── Work Location ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.10) }}>
              <SectionHeader
                title="Work location"
                right={<Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Fri, Mar 21</Typography>}
              />
              <Box sx={{ display: "flex", gap: "8px", mb: "12px" }}>
                {(["WFH", "WFO"] as const).map(m => (
                  <Box key={m} onClick={() => { setWfMode(m); setWfhBounce(true); setTimeout(() => setWfhBounce(false), 300); }} sx={{
                    flex: 1, py: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer",
                    transition: "all .2s",
                    background: wfMode === m ? "#eef2ff" : "#f8fafc",
                    border: wfMode === m ? "2px solid #c7d2fe" : "2px solid #f1f5f9",
                    transform: wfMode === m && wfhBounce ? "scale(0.95)" : "scale(1)",
                    "&:hover": { borderColor: "#c7d2fe", background: "#f3f4ff" },
                  }}>
                    {m === "WFH"
                      ? <HomeIcon sx={{ fontSize: 17, color: wfMode === m ? ACCENT : "#94a3b8" }} />
                      : <BusinessIcon sx={{ fontSize: 17, color: wfMode === m ? ACCENT : "#94a3b8" }} />}
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: wfMode === m ? ACCENT : "#94a3b8", display: "block", mt: "2px" }}>{m}</Typography>
                    <Typography sx={{ fontSize: 8, color: wfMode === m ? "#8b5cf6" : "#cbd5e1", mt: "1px" }}>
                      {m === "WFH" ? "From Home" : "In Office"}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography sx={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", letterSpacing: ".8px", textTransform: "uppercase", mb: "7px" }}>This week</Typography>
              <Box sx={{ display: "flex", gap: "5px" }}>
                {WFH_WEEK.map((d, i) => (
                  <Tooltip key={i} title={d.t} arrow placement="top">
                    <Box sx={{
                      flex: 1, py: "5px", borderRadius: "7px", textAlign: "center", cursor: "pointer",
                      background: d.active ? "#eef2ff" : "#f8fafc",
                      border: d.active ? "1.5px solid #c7d2fe" : "1.5px solid #f1f5f9",
                      transition: "all .15s",
                      "&:hover": { borderColor: "#c7d2fe", transform: "translateY(-1px)" },
                    }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 800, color: d.active ? ACCENT : "#94a3b8" }}>{d.d}</Typography>
                      <Typography sx={{ fontSize: 7, fontWeight: 700, color: d.active ? "#8b5cf6" : "#cbd5e1", mt: "1px" }}>{d.t}</Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Card>

            {/* ── Upcoming Holidays ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.15) }}>
              <SectionHeader
                title="Upcoming holidays"
                right={<Typography sx={{ fontSize: 10, color: ACCENT, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>All</Typography>}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {HOLIDAYS.map((h, i) => (
                  <Tooltip key={i} title={`${h.name} — ${h.countdown} away`} arrow>
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: "10px", p: "9px 10px",
                      borderRadius: "10px", background: h.bg, border: `1.5px solid ${h.color}20`,
                      cursor: "default", transition: "all .2s",
                      "&:hover": { transform: "translateX(3px)", boxShadow: `0 4px 16px ${h.color}20` },
                    }}>
                      <Box sx={{
                        background: h.color, borderRadius: "8px", p: "5px 7px", textAlign: "center",
                        minWidth: 36, flexShrink: 0, boxShadow: `0 3px 10px ${h.color}40`,
                      }}>
                        <Typography sx={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,.75)", letterSpacing: ".7px" }}>{h.month}</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{h.day}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b" }}>{h.name}</Typography>
                        <Typography sx={{ fontSize: 9, color: "#94a3b8", mt: "1px" }}>{h.type}</Typography>
                      </Box>
                      <Chip label={h.countdown} size="small" sx={{
                        fontSize: 9, fontWeight: 800, color: h.color, background: "#fff",
                        border: `1.5px solid ${h.color}35`, borderRadius: "6px",
                        height: "auto", "& .MuiChip-label": { px: "8px", py: "3px" },
                      }} />
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Card>

          </Box>
        </Grid>

        {/* ══ COL 2 — Tasks + Notifications ══ */}
        <Grid size={{ xs: 12, md: 4, lg: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* ── Today's Tasks ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.08) }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Today's tasks</Typography>
                  <Typography sx={{ fontSize: 10, color: "#94a3b8", mt: 0.3 }}>
                    {TASKS.length - doneCount} remaining · {doneCount} done
                  </Typography>
                </Box>
                <Chip label={`${visibleTasks.length} tasks`} size="small" sx={{
                  fontSize: 9, fontWeight: 800, color: "#4338ca", background: "#eef2ff",
                  borderRadius: "20px", height: "auto", "& .MuiChip-label": { px: "8px", py: "2px" },
                }} />
              </Box>

              {/* Filter tabs */}
              <Box sx={{ display: "flex", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", mb: "8px" }}>
                {(["All", "Pending", "Done"] as const).map(f => (
                  <Box key={f} onClick={() => setTaskFilter(f)} sx={{
                    fontSize: 11, fontWeight: taskFilter === f ? 700 : 500, px: "10px", py: "6px",
                    cursor: "pointer", color: taskFilter === f ? ACCENT : "#94a3b8",
                    borderBottom: taskFilter === f ? `2px solid ${ACCENT}` : "2px solid transparent",
                    mb: "-1.5px", transition: "all .15s", "&:hover": { color: ACCENT },
                  }}>{f}</Box>
                ))}
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Filter">
                  <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { color: ACCENT } }}>
                    <FilterListIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {visibleTasks.map(task => {
                  const done = !!checkedTasks[task.id];
                  const sc   = STATUS_MAP[task.status];
                  return (
                    <Box
                      key={task.id}
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                      sx={{
                        display: "flex", alignItems: "center", gap: "10px", p: "8px 8px",
                        borderRadius: "9px", cursor: "pointer", transition: "all .18s",
                        background: hoveredTask === task.id ? "#f5f7ff" : "transparent",
                        boxShadow: hoveredTask === task.id ? "0 2px 8px rgba(99,102,241,.07)" : "none",
                        "&:hover .task-more": { opacity: 1 },
                      }}
                    >
                      <Box onClick={() => toggleTask(task.id)} sx={{
                        width: 18, height: 18, borderRadius: "5px", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s",
                        border: done ? "none" : "2px solid #e2e8f0",
                        background: done ? ACCENT : "transparent",
                        boxShadow: done ? "0 2px 8px rgba(99,102,241,.3)" : "none",
                        "&:hover": { borderColor: ACCENT, transform: "scale(1.1)" },
                      }}>
                        {done && <CheckIcon sx={{ fontSize: 10, color: "#fff" }} />}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: 12, fontWeight: 600,
                          color: done ? "#94a3b8" : "#1e1b4b",
                          textDecoration: done ? "line-through" : "none",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "all .2s",
                        }}>{task.title}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#94a3b8", mt: "1px" }}>{task.dept} · {task.time}</Typography>
                      </Box>

                      <Chip label={task.status} size="small" sx={{
                        background: sc.bg, color: sc.color, fontSize: 9, fontWeight: 700,
                        borderRadius: "6px", border: `1.5px solid ${sc.ring}`, flexShrink: 0,
                        height: "auto", "& .MuiChip-label": { px: "8px", py: "3px" },
                      }} />

                      <Tooltip title="More options">
                        <IconButton
                          className="task-more"
                          size="small"
                          onClick={e => { setTaskMenuAnchor(e.currentTarget); setSelectedTaskId(task.id); }}
                          sx={{ opacity: 0, color: "#94a3b8", transition: "opacity .15s", p: "2px", "&:hover": { color: ACCENT } }}
                        >
                          <MoreHorizIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                })}
                {visibleTasks.length === 0 && (
                  <Box sx={{ textAlign: "center", py: "22px" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 30, color: "#c7d2fe", mb: 1 }} />
                    <Typography sx={{ color: "#c7d2fe", fontSize: 11, fontWeight: 600 }}>All clear here! ✓</Typography>
                  </Box>
                )}
              </Box>

              <Menu anchorEl={taskMenuAnchor} open={Boolean(taskMenuAnchor)} onClose={() => setTaskMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: "10px", border: "1.5px solid #e8edf6", boxShadow: "0 8px 24px rgba(60,60,140,.12)", minWidth: 130 } }}>
                {["Mark done", "Set priority", "Reassign", "Delete"].map(opt => (
                  <MenuItem key={opt} onClick={() => { if (opt === "Mark done" && selectedTaskId) toggleTask(selectedTaskId); setTaskMenuAnchor(null); }}
                    sx={{ fontSize: 11, fontWeight: 500, color: opt === "Delete" ? "#ef4444" : "#1e1b4b", py: "6px", "&:hover": { background: "#f5f7ff" } }}>
                    {opt}
                  </MenuItem>
                ))}
              </Menu>
            </Card>

            {/* ── Notifications ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.13) }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 15, height: 15, top: 0 } }}>
                      <NotificationsNoneIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                    </Badge>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Chip label={activeNotifs.length} size="small" sx={{
                    fontSize: 9, fontWeight: 800, color: "#4338ca", background: "#eef2ff",
                    borderRadius: "20px", height: "auto", "& .MuiChip-label": { px: "8px", py: "2px" },
                  }} />
                  <Typography sx={{ fontSize: 10, color: ACCENT, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>All</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {activeNotifs.map(n => {
                  const isRead     = !!readNotifs[n.id];
                  const isExpanded = expandedNotif === n.id;
                  return (
                    <Box key={n.id}>
                      <Box
                        onClick={() => { setExpandedNotif(isExpanded ? null : n.id); markRead(n.id); }}
                        sx={{
                          display: "flex", alignItems: "flex-start", gap: "10px", p: "9px 8px",
                          borderRadius: "9px", cursor: "pointer", transition: "background .18s",
                          background: isExpanded ? "#f5f7ff" : "transparent",
                          "&:hover": { background: "#f5f7ff" },
                        }}
                      >
                        <Box sx={{
                          width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
                          background: n.eBg, border: `1.5px solid ${n.eBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                        }}>
                          {!isRead && (
                            <Box sx={{ position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", background: ACCENT, border: "1.5px solid #fff" }} />
                          )}
                          {n.type === "danger" ? <CloseIcon sx={{ fontSize: 13, color: n.color }} /> :
                           n.type === "success" ? <CheckIcon sx={{ fontSize: 13, color: n.color }} /> :
                           <SwapHorizIcon sx={{ fontSize: 13, color: n.color }} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: isRead ? 600 : 700, color: "#1e1b4b", lineHeight: 1.3 }}>{n.title}</Typography>
                          <Typography sx={{ fontSize: 10, color: "#94a3b8", mt: "2px", lineHeight: 1.4, whiteSpace: isExpanded ? "normal" : "nowrap", overflow: "hidden", textOverflow: isExpanded ? "unset" : "ellipsis" }}>
                            {n.desc}
                          </Typography>
                          <Typography sx={{ fontSize: 9, color: "#c7d2fe", mt: "2px", fontWeight: 600 }}>{n.time}</Typography>
                        </Box>
                        <Chip label={n.action} size="small"
                          onClick={e => { e.stopPropagation(); setDismissed(p => ({ ...p, [n.id]: true })); }}
                          sx={{
                            fontSize: 9, fontWeight: 700, cursor: "pointer",
                            background: n.eBg, color: n.color, border: `1px solid ${n.eBorder}`,
                            borderRadius: "20px", flexShrink: 0, height: "auto",
                            "& .MuiChip-label": { px: "8px", py: "3px" },
                            "&:hover": { opacity: 0.75, transform: "scale(0.96)" }, transition: "all .15s",
                          }} />
                      </Box>

                      <Collapse in={isExpanded}>
                        <Box sx={{ mx: "8px", mb: "6px", p: "8px 10px", borderRadius: "8px", background: n.eBg, border: `1px solid ${n.eBorder}` }}>
                          <Typography sx={{ fontSize: 10, color: "#475569", lineHeight: 1.5 }}>{n.desc}</Typography>
                          <Box sx={{ display: "flex", gap: "6px", mt: "7px" }}>
                            <Button size="small" variant="contained"
                              onClick={() => setDismissed(p => ({ ...p, [n.id]: true }))}
                              sx={{ fontSize: 9, fontWeight: 700, background: n.color, borderRadius: "6px", py: "3px", px: "10px", textTransform: "none", minWidth: 0, boxShadow: "none", "&:hover": { background: n.color, opacity: 0.85 } }}>
                              {n.action}
                            </Button>
                            <Button size="small" onClick={() => setExpandedNotif(null)}
                              sx={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", borderRadius: "6px", py: "3px", px: "10px", textTransform: "none", minWidth: 0 }}>
                              Close
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
                {activeNotifs.length === 0 && (
                  <Box sx={{ textAlign: "center", py: "18px" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 28, color: "#c7d2fe", mb: 1 }} />
                    <Typography sx={{ color: "#c7d2fe", fontSize: 11, fontWeight: 600 }}>All caught up! 🎉</Typography>
                  </Box>
                )}
              </Box>
            </Card>

          </Box>
        </Grid>

        {/* ══ COL 3 — Stats + Schedule + Leave ══ */}
        <Grid size={{ xs: 12, md: 4, lg: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* ── Stat Cards 2×2 ── */}
            <Grid container spacing="10px" sx={{ ...fi(0.05) }}>
              {[
                { key: "tasks",   label: "Total tasks",   display: 12,    sub: "8 done today",  accent: "#6366f1", light: "#eef2ff", icon: <TrendingUpIcon    sx={{ fontSize: 15 }} /> },
                { key: "pending", label: "Pending",        display: 4,     sub: "1 urgent",      accent: "#f59e0b", light: "#fffbeb", icon: <AccessTimeIcon    sx={{ fontSize: 15 }} /> },
                { key: "shift",   label: "Shift duration", display: "9h",  sub: "General",       accent: "#10b981", light: "#ecfdf5", icon: <CalendarTodayIcon sx={{ fontSize: 15 }} /> },
                { key: "holiday", label: "Next holiday",   display: "8d",  sub: "Good Friday",   accent: "#8b5cf6", light: "#f5f3ff", icon: <EventAvailableIcon sx={{ fontSize: 15 }} /> },
              ].map(s => (
                <Grid key={s.key} size={{ xs: 6 }}>
                  <Card sx={{
                    borderRadius: "12px", border: "1.5px solid #e8edf6",
                    boxShadow: "0 2px 12px rgba(60,60,140,.055)", overflow: "hidden",
                    position: "relative", cursor: "default",
                    transition: "box-shadow .22s, border-color .22s, transform .22s",
                    "&:hover": {
                      boxShadow: "0 8px 28px rgba(60,60,140,.11)", borderColor: "#c7d2fe", transform: "translateY(-2px)",
                      "& .sc-bar": { opacity: 1 }, "& .sc-glow": { opacity: 1 },
                    },
                  }}>
                    <Box className="sc-glow" sx={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", transition: "opacity .3s", background: `radial-gradient(circle at 85% 15%,${s.light},transparent 68%)` }} />
                    <Box className="sc-bar" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", borderRadius: "0 0 12px 12px", opacity: 0, transition: "opacity .25s", background: s.accent }} />
                    <Box sx={{ p: "13px 14px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "8px" }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: s.light, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>
                          {s.icon}
                        </Box>
                        <Chip label="LIVE" size="small" sx={{ fontSize: 7, fontWeight: 800, color: s.accent, background: s.light, borderRadius: "20px", height: "auto", "& .MuiChip-label": { px: "6px", py: "1px" } }} />
                      </Box>
                      <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", lineHeight: 1, letterSpacing: "-1px" }}>
                        {typeof s.display === "number" ? <AnimatedNumber value={s.display} /> : s.display}
                      </Typography>
                      <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", mt: "4px", letterSpacing: ".3px", textTransform: "uppercase" }}>{s.label}</Typography>
                      <Typography sx={{ fontSize: 10, color: s.accent, fontWeight: 600, mt: "4px" }}>{s.sub}</Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* ── Weekly Schedule ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.10) }}>
              <SectionHeader
                title="Weekly schedule"
                subtitle="Mar 15 – 21, 2025"
                right={
                  <Typography sx={{ fontSize: 10, color: ACCENT, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", "&:hover": { textDecoration: "underline" } }}>
                    Full view <OpenInFullIcon sx={{ fontSize: 10 }} />
                  </Typography>
                }
              />
              <Grid container spacing="5px">
                {WEEK.map(d => (
                  <Grid key={d.date} size={{ xs: 12/7 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", letterSpacing: ".6px", textTransform: "uppercase", mb: "4px" }}>{d.day}</Typography>
                      <Box sx={{
                        width: 24, height: 24, borderRadius: "50%", mx: "auto", mb: "5px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: d.isToday ? `linear-gradient(135deg,${ACCENT},#8b5cf6)` : "transparent",
                        boxShadow: d.isToday ? "0 3px 10px rgba(99,102,241,.4)" : "none",
                        transition: "transform .2s", "&:hover": { transform: "scale(1.12)" },
                      }}>
                        <Typography sx={{ fontSize: 10, fontWeight: d.isToday ? 900 : 600, color: d.isToday ? "#fff" : d.isOff ? "#cbd5e1" : "#374151" }}>
                          {d.date}
                        </Typography>
                      </Box>

                      {d.shift ? (
                        <Tooltip title={`${d.shift.name} · ${d.shift.start}–${d.shift.end} · ${d.shift.dur}`} arrow placement="top">
                          <Box
                            onMouseEnter={() => setScheduleHover(d.date)}
                            onMouseLeave={() => setScheduleHover(null)}
                            sx={{
                              borderRadius: "8px", py: "5px", px: "2px", minHeight: 58,
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px",
                              background: d.isToday ? "#eef2ff" : scheduleHover === d.date ? "#f5f7ff" : "#f8fafc",
                              border: d.isToday ? `1.5px solid #c7d2fe` : `1.5px solid ${scheduleHover === d.date ? "#c7d2fe" : "#f1f5f9"}`,
                              cursor: "pointer", transition: "all .18s",
                              transform: scheduleHover === d.date && !d.isToday ? "translateY(-2px)" : "none",
                              boxShadow: scheduleHover === d.date ? "0 4px 12px rgba(99,102,241,.1)" : "none",
                            }}
                          >
                            <Typography sx={{ fontSize: 8, fontWeight: 800, color: d.isToday ? ACCENT : "#475569" }}>{d.shift.name}</Typography>
                            <Typography sx={{ fontSize: 7, color: "#94a3b8", lineHeight: 1.5 }}>{d.shift.start}</Typography>
                            <Typography sx={{ fontSize: 7, color: "#94a3b8" }}>{d.shift.end}</Typography>
                            {d.isToday && (
                              <Chip label="Today" size="small" sx={{
                                fontSize: 7, fontWeight: 800, color: "#fff", background: ACCENT,
                                borderRadius: "20px", mt: "2px", height: "auto",
                                "& .MuiChip-label": { px: "5px", py: "1px" },
                              }} />
                            )}
                          </Box>
                        </Tooltip>
                      ) : (
                        <Box sx={{
                          borderRadius: "8px", minHeight: 58, display: "flex", alignItems: "center",
                          justifyContent: "center", border: "1.5px dashed #e8edf6", background: "transparent",
                        }}>
                          <Typography sx={{ fontSize: 8, color: "#d1d5db", fontWeight: 600 }}>Off</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* ── On Leave Today ── */}
            <Card sx={{ borderRadius: "16px", border: "1.5px solid #e8edf6", boxShadow: "0 2px 12px rgba(60,60,140,.06)", p: "14px", ...fi(0.15) }}>
              <SectionHeader
                title="On leave today"
                right={
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Chip label="2 members" size="small" sx={{ fontSize: 9, fontWeight: 800, color: "#92400e", background: "#fffbeb", borderRadius: "20px", height: "auto", "& .MuiChip-label": { px: "8px", py: "2px" } }} />
                    <Typography sx={{ fontSize: 10, color: ACCENT, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>All</Typography>
                  </Box>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {LEAVE_TEAM.map((p, i) => (
                  <Tooltip key={i} title={`Returns ${p.returnDate}`} arrow placement="right">
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: "10px", p: "9px 10px",
                      borderRadius: "10px", background: "#f8fafc", border: "1.5px solid #f1f5f9",
                      transition: "all .18s", cursor: "default",
                      "&:hover": { borderColor: "#c7d2fe", background: "#f0f3ff", transform: "translateX(3px)" },
                    }}>
                      <Box sx={{
                        width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                        background: p.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: p.fg,
                      }}>{p.initials}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{p.name}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#94a3b8", mt: "1px" }}>{p.role}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip label={p.type} size="small" sx={{
                          fontSize: 9, fontWeight: 700, color: p.tColor, background: p.tBg,
                          borderRadius: "6px", border: `1px solid ${p.tColor}25`, height: "auto",
                          "& .MuiChip-label": { px: "8px", py: "3px" },
                        }} />
                        <Typography sx={{ fontSize: 8, color: "#94a3b8", mt: "3px" }}>Back {p.returnDate}</Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Card>

          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}