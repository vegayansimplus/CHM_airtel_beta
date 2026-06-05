/**
 * roster-shared.jsx
 * ─────────────────────────────────────────────────────────
 * Shared types, constants, utilities, and sub-components
 * used by GoldenGridScreen and Week7PreviewScreen.
 * ─────────────────────────────────────────────────────────
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, InputBase, Snackbar, Stack,
  Tooltip, Typography, alpha, useTheme, IconButton, Slider,
  Divider, FormControlLabel, Checkbox, Collapse, LinearProgress,
  Badge,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import PersonIcon from "@mui/icons-material/Person";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import SearchIcon from "@mui/icons-material/Search";

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
export const DOW = ["M", "T", "W", "T", "F", "S", "S"];
export const DOW_LONG = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export const SHIFT_ORDER = ["A", "B", "G", "LG", "N", "OFF"];
export const TODAY = new Date();
export const ALL_ROLES = ["NOC Engineer","Shift Lead","Incident Owner","Field Coordinator"];
export const ALL_LEVELS = ["L1", "L2", "L3", "L4"];

export const SHIFT_COLORS = {
  A:   { bg: "#FFF9E6", bgDark: "rgba(245,158,11,0.15)", text: "#92400E", textDark: "#FBBF24", solid: "#F59E0B", label: "Alpha" },
  B:   { bg: "#EFF6FF", bgDark: "rgba(37,99,235,0.15)",  text: "#1E40AF", textDark: "#93C5FD", solid: "#3B82F6", label: "Bravo" },
  G:   { bg: "#F8FAFC", bgDark: "rgba(100,116,139,0.15)",text: "#475569", textDark: "#E2E8F0", solid: "#64748B", label: "Golf" },
  LG:  { bg: "#ECFDF5", bgDark: "rgba(16,185,129,0.15)", text: "#065F46", textDark: "#34D399", solid: "#10B981", label: "Lima Golf" },
  N:   { bg: "#EEF2FF", bgDark: "rgba(79,70,229,0.15)",  text: "#3730A3", textDark: "#A5B4FC", solid: "#6366F1", label: "Night" },
  OFF: { bg: "#FFF5F5", bgDark: "rgba(239,68,68,0.15)",  text: "#9B1C1C", textDark: "#FCA5A5", solid: "#EF4444", label: "Off Day" },
};

export const LEVEL_COLORS = {
  L1: { bg: "#F0FDF4", text: "#166534", solid: "#22C55E" },
  L2: { bg: "#EFF6FF", text: "#1E40AF", solid: "#3B82F6" },
  L3: { bg: "#FFF7ED", text: "#9A3412", solid: "#F97316" },
  L4: { bg: "#FDF4FF", text: "#6B21A8", solid: "#A855F7" },
};

export const EMPLOYEES = Array.from({ length: 28 }, (_, i) => ({
  id: `EMP${String(i + 1).padStart(3, "0")}`,
  name: [
    "Aarav Sharma","Isha Nair","Kabir Mehta","Tara Singh","Rohan Das",
    "Meera Iyer","Nikhil Rao","Anaya Khan","Dev Patel","Sara Thomas",
    "Arjun Bose","Diya Menon","Vihaan Jain","Kiara Roy","Yash Verma",
    "Naina Pillai","Reyansh Gupta","Aditi Sinha","Vivaan Reddy","Myra Kapoor",
    "Atharv Joshi","Saanvi Shah","Ishaan Batra","Avni Kulkarni","Dhruv Malhotra",
    "Riya Chatterjee","Neil George","Maya Krishnan"
  ][i],
  role: ALL_ROLES[i % 4],
  level: ["L1","L2","L3","L4"][i % 4],
  teamId: (i % 6) + 1,
  subTeamId: (i % 10) + 1,
}));

export const BASE_PATTERN = [
  ["G","G","LG","B","N","OFF","OFF"],
  ["A","A","G","G","LG","OFF","N"],
  ["N","OFF","OFF","A","B","G","G"],
  ["LG","B","B","N","OFF","G","A"],
  ["OFF","G","A","A","B","LG","N"],
  ["B","LG","N","OFF","G","A","OFF"],
];

// ═══════════════════════════════════════════════════════════
// Date helpers
// ═══════════════════════════════════════════════════════════
export const addDays = (date, days) => { const n = new Date(date); n.setDate(n.getDate() + days); return n; };
export const mondayOf = (date) => { const n = new Date(date); const d = n.getDay() || 7; n.setDate(n.getDate() - d + 1); return n; };
export const fmtShort = (date) => date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const isoWeek = (date) => {
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const d = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - d);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7);
};

// ═══════════════════════════════════════════════════════════
// Grid builders
// ═══════════════════════════════════════════════════════════
export const buildGrid = (emps) =>
  Object.fromEntries(emps.map((e, ei) => [
    e.id,
    Array.from({ length: 42 }, (_, di) => BASE_PATTERN[(ei + Math.floor(di / 7)) % BASE_PATTERN.length][di % 7]),
  ]));

export const buildWeekGrid = (emps) => {
  const full = buildGrid(emps);
  return Object.fromEntries(emps.map((e) => [e.id, Array.from({ length: 7 }, (_, i) => full[e.id][(i + 7) % 42])]));
};

// ═══════════════════════════════════════════════════════════
// Stats helpers
// ═══════════════════════════════════════════════════════════
export const emptyCounts = () => SHIFT_ORDER.reduce((a, c) => ({ ...a, [c]: 0 }), {});
export const colCounts = (grid, emps, index) =>
  emps.reduce((a, e) => { const c = grid[e.id]?.[index]; if (c) a[c]++; return a; }, emptyCounts());
export const spanCounts = (grid, emps, from, len) =>
  emps.reduce((a, e) => { grid[e.id]?.slice(from, from + len).forEach((c) => { a[c]++; }); return a; }, emptyCounts());
export const workingTotal = (counts) => SHIFT_ORDER.filter((c) => c !== "OFF").reduce((s, c) => s + counts[c], 0);
export const empSummary = (row = []) => ({
  work: row.filter((c) => c !== "OFF").length,
  n: row.filter((c) => c === "N").length,
  off: row.filter((c) => c === "OFF").length,
});
export const shiftStyle = (code, mode) => {
  const c = SHIFT_COLORS[code];
  return { bgcolor: mode === "dark" ? c.bgDark : c.bg, color: mode === "dark" ? c.textDark : c.text, borderColor: alpha(c.solid, 0.3) };
};
export const scopeEmployees = (teamId, subTeamId) =>
  EMPLOYEES.filter((e) => (!teamId || e.teamId === teamId) && (!subTeamId || e.subTeamId === subTeamId));

// ═══════════════════════════════════════════════════════════
// Filter engine
// ═══════════════════════════════════════════════════════════
export const defaultFilter = () => ({
  query: "", levels: [], roles: [], teams: [], shiftCodes: [],
  sortField: "name", sortDir: "asc",
  workRange: [0, 42], nightRange: [0, 42],
  showHighLoad: false, showLowRest: false,
});

export function applyFilters(emps, grid, f, totalCols) {
  let result = emps.filter((e) => {
    if (f.query && !`${e.name} ${e.id} ${e.role}`.toLowerCase().includes(f.query.toLowerCase())) return false;
    if (f.levels.length && !f.levels.includes(e.level)) return false;
    if (f.roles.length && !f.roles.includes(e.role)) return false;
    if (f.teams.length && !f.teams.includes(String(e.teamId))) return false;
    const row = grid[e.id]?.slice(0, totalCols) ?? [];
    const s = empSummary(row);
    if (s.work < f.workRange[0] || s.work > f.workRange[1]) return false;
    if (s.n < f.nightRange[0] || s.n > f.nightRange[1]) return false;
    if (f.showHighLoad && s.n <= 8) return false;
    if (f.showLowRest && s.off >= 6) return false;
    if (f.shiftCodes.length && !f.shiftCodes.every((c) => row.includes(c))) return false;
    return true;
  });
  result.sort((a, b) => {
    let vA, vB;
    const rA = grid[a.id]?.slice(0, totalCols) ?? [];
    const rB = grid[b.id]?.slice(0, totalCols) ?? [];
    const sA = empSummary(rA), sB = empSummary(rB);
    switch (f.sortField) {
      case "name": vA = a.name; vB = b.name; break;
      case "id": vA = a.id; vB = b.id; break;
      case "role": vA = a.role; vB = b.role; break;
      case "level": vA = a.level; vB = b.level; break;
      case "work": vA = sA.work; vB = sB.work; break;
      case "night": vA = sA.n; vB = sB.n; break;
      case "off": vA = sA.off; vB = sB.off; break;
      case "load": vA = sA.work / totalCols; vB = sB.work / totalCols; break;
      default: vA = a.name; vB = b.name;
    }
    const cmp = typeof vA === "number" ? vA - vB : String(vA).localeCompare(String(vB));
    return f.sortDir === "asc" ? cmp : -cmp;
  });
  return result;
}

export function countActiveFilters(f) {
  const def = defaultFilter();
  let c = 0;
  if (f.query) c++;
  if (f.levels.length) c++;
  if (f.roles.length) c++;
  if (f.teams.length) c++;
  if (f.shiftCodes.length) c++;
  if (f.workRange[0] !== def.workRange[0] || f.workRange[1] !== def.workRange[1]) c++;
  if (f.nightRange[0] !== def.nightRange[0] || f.nightRange[1] !== def.nightRange[1]) c++;
  if (f.showHighLoad) c++;
  if (f.showLowRest) c++;
  return c;
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

export function LevelBadge({ level }) {
  const c = LEVEL_COLORS[level] ?? { bg: "#F1F5F9", text: "#475569", solid: "#64748B" };
  return (
    <Box component="span" sx={{
      display: "inline-grid", placeItems: "center", px: 0.75, height: 18,
      borderRadius: "4px", fontSize: 9.5, fontWeight: 700,
      bgcolor: c.bg, color: c.text, border: `1px solid ${alpha(c.solid, 0.2)}`,
      letterSpacing: "0.03em",
    }}>{level}</Box>
  );
}

export function EmployeeCell({ employee, accent }) {
  const theme = useTheme();
  const initials = employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box sx={{
        width: 34, height: 34, borderRadius: "10px", display: "grid", placeItems: "center",
        fontWeight: 700, fontSize: 11, letterSpacing: "0.02em", flexShrink: 0,
        bgcolor: accent ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.primary, 0.05),
        color: accent ? theme.palette.primary.main : theme.palette.text.secondary,
        border: "1.5px solid", borderColor: accent ? alpha(theme.palette.primary.main, 0.25) : "transparent",
        transition: "all 0.2s ease",
      }}>{initials}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 650, lineHeight: 1.2, color: "text.primary" }} noWrap>
            {employee.name}
          </Typography>
          <LevelBadge level={employee.level} />
        </Stack>
        <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 500, mt: 0.2 }} noWrap>
          {employee.id} · {employee.role}
        </Typography>
      </Box>
    </Stack>
  );
}

export function ShiftBadge({ code, size = "md" }) {
  const theme = useTheme();
  return (
    <Box component="span" sx={{
      display: "inline-grid", placeItems: "center",
      minWidth: size === "sm" ? 28 : 34, height: size === "sm" ? 20 : 26,
      px: 0.75, borderRadius: "6px", fontFamily: MONO,
      fontSize: size === "sm" ? 10 : 11, fontWeight: 700,
      border: "1px solid", ...shiftStyle(code, theme.palette.mode),
      transition: "all 0.15s ease",
    }}>{code}</Box>
  );
}

export function ShiftLegend() {
  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
      {SHIFT_ORDER.map((code) => (
        <Tooltip key={code} title={SHIFT_COLORS[code].label} arrow>
          <Box><ShiftBadge code={code} /></Box>
        </Tooltip>
      ))}
    </Stack>
  );
}

// ═══════════════════════════════════════════════════════════
// Filter Panel
// ═══════════════════════════════════════════════════════════
export function FilterPanel({ open, filter, onFilter, onClose, totalCols, teamCount }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [local, setLocal] = useState(filter);
  useEffect(() => { setLocal(filter); }, [filter, open]);
  const update = (patch) => setLocal((p) => ({ ...p, ...patch }));
  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <Collapse in={open}>
      <Card variant="outlined" sx={{
        borderRadius: "14px",
        // ── FIX: proper overflow containment ──
        overflow: "visible",
        position: "relative",
        zIndex: 20,
        borderColor: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08),
        mb: 1,
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(13,27,42,0.12)",
        backdropFilter: "blur(12px)",
        bgcolor: isDark ? alpha("#1A2436", 0.97) : alpha("#fff", 0.97),
      }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" sx={{
          px: 2.5, py: 1.5, borderBottom: 1, borderColor: "divider",
          background: isDark
            ? "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(59,130,246,0.04))"
            : "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(59,130,246,0.02))",
        }}>
          <TuneIcon sx={{ fontSize: 16, color: "primary.main", mr: 1 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 750, color: "text.primary", letterSpacing: "-0.01em" }}>
            Advanced Filters
          </Typography>
          <Box flex={1} />
          <Button size="small" startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
            onClick={() => { setLocal(defaultFilter()); onFilter(defaultFilter()); }}
            sx={{ fontSize: 11, textTransform: "none", color: "text.secondary", mr: 0.5 }}>
            Reset
          </Button>
          <IconButton size="small" onClick={onClose} sx={{
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: "8px",
          }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Stack>

        <Box sx={{ p: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
          {/* Level */}
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Level
            </Typography>
            <Stack gap={0.75}>
              {ALL_LEVELS.map((lv) => {
                const c = LEVEL_COLORS[lv];
                const active = local.levels.includes(lv);
                return (
                  <Box key={lv} onClick={() => update({ levels: toggleArr(local.levels, lv) })}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1,
                      borderRadius: "8px", cursor: "pointer", border: "1.5px solid",
                      borderColor: active ? alpha(c.solid, 0.5) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.08) : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: alpha(c.solid, 0.4), bgcolor: alpha(c.solid, 0.05), transform: "translateY(-1px)" },
                      "&:active": { transform: "translateY(0)" },
                    }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.solid, flexShrink: 0,
                      boxShadow: active ? `0 0 8px ${alpha(c.solid, 0.4)}` : "none" }} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: active ? c.text : "text.primary", flex: 1 }}>{lv}</Typography>
                    {active && <CheckIcon sx={{ fontSize: 14, color: c.solid }} />}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Role */}
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Role
            </Typography>
            <Stack gap={0.75}>
              {ALL_ROLES.map((role) => {
                const active = local.roles.includes(role);
                return (
                  <Box key={role} onClick={() => update({ roles: toggleArr(local.roles, role) })}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1,
                      borderRadius: "8px", cursor: "pointer", border: "1.5px solid",
                      borderColor: active ? alpha(theme.palette.primary.main, 0.5) : "divider",
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05), transform: "translateY(-1px)" },
                      "&:active": { transform: "translateY(0)" },
                    }}>
                    <PersonIcon sx={{ fontSize: 14, color: active ? "primary.main" : "text.disabled", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 550, color: active ? "primary.main" : "text.primary", flex: 1 }} noWrap>{role}</Typography>
                    {active && <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Shift Codes */}
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Has Shift
            </Typography>
            <Stack gap={0.75}>
              {SHIFT_ORDER.map((code) => {
                const c = SHIFT_COLORS[code];
                const active = local.shiftCodes.includes(code);
                return (
                  <Box key={code}
                    onClick={() => update({ shiftCodes: active ? local.shiftCodes.filter((x) => x !== code) : [...local.shiftCodes, code] })}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.85,
                      borderRadius: "8px", cursor: "pointer", border: "1.5px solid",
                      borderColor: active ? alpha(c.solid, 0.5) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.08) : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: alpha(c.solid, 0.4), transform: "translateY(-1px)" },
                      "&:active": { transform: "translateY(0)" },
                    }}>
                    <ShiftBadge code={code} size="sm" />
                    <Typography sx={{ fontSize: 12, fontWeight: 550, color: "text.primary", flex: 1 }}>{c.label}</Typography>
                    {active && <CheckIcon sx={{ fontSize: 14, color: c.solid }} />}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Ranges + Flags */}
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Work Days Range
            </Typography>
            <Slider value={local.workRange} onChange={(_, v) => update({ workRange: v })}
              min={0} max={totalCols} valueLabelDisplay="auto" size="small" sx={{ mb: 1 }} />
            <Typography sx={{ fontSize: 11, color: "text.secondary", fontFamily: MONO, fontWeight: 600 }}>
              {local.workRange[0]}–{local.workRange[1]} days
            </Typography>

            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.75, mt: 2.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Night Shifts Range
            </Typography>
            <Slider value={local.nightRange} onChange={(_, v) => update({ nightRange: v })}
              min={0} max={totalCols} valueLabelDisplay="auto" size="small" sx={{ mb: 1 }} />
            <Typography sx={{ fontSize: 11, color: "text.secondary", fontFamily: MONO, fontWeight: 600 }}>
              {local.nightRange[0]}–{local.nightRange[1]} nights
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Compliance Flags
            </Typography>
            <Stack gap={0.5}>
              <FormControlLabel control={
                <Checkbox size="small" checked={local.showHighLoad} onChange={(e) => update({ showHighLoad: e.target.checked })} />
              } label={<Typography sx={{ fontSize: 12, fontWeight: 500 }}>High night load only</Typography>} />
              <FormControlLabel control={
                <Checkbox size="small" checked={local.showLowRest} onChange={(e) => update({ showLowRest: e.target.checked })} />
              } label={<Typography sx={{ fontSize: 12, fontWeight: 500 }}>Low rest violations only</Typography>} />
            </Stack>
          </Box>
        </Box>

        {/* Sort + Apply */}
        <Stack direction="row" alignItems="center" gap={1.5} sx={{
          px: 2.5, py: 1.75, borderTop: 1, borderColor: "divider", flexWrap: "wrap",
          background: isDark ? "rgba(255,255,255,0.015)" : "rgba(13,27,42,0.015)",
        }}>
          <Stack direction="row" alignItems="center" gap={0.75}>
            <SwapVertIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: "text.secondary" }}>Sort:</Typography>
          </Stack>
          {["name","id","role","level","work","night","off","load"].map((field) => (
            <Chip key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)} size="small"
              variant={local.sortField === field ? "filled" : "outlined"}
              color={local.sortField === field ? "primary" : "default"}
              onClick={() => update({ sortField: field, sortDir: local.sortField === field && local.sortDir === "asc" ? "desc" : "asc" })}
              icon={local.sortField === field ? (local.sortDir === "asc" ? <ExpandLessIcon /> : <ExpandMoreIcon />) : undefined}
              sx={{ fontSize: 11, height: 26, fontWeight: 600, borderRadius: "6px" }} />
          ))}
          <Box flex={1} />
          <Button size="small" variant="contained" disableElevation
            onClick={() => { onFilter(local); onClose(); }}
            sx={{
              fontSize: 12, textTransform: "none", px: 3, height: 34, borderRadius: "8px",
              fontWeight: 650, letterSpacing: "-0.01em",
              background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            }}>
            Apply Filters
          </Button>
        </Stack>
      </Card>
    </Collapse>
  );
}

// ═══════════════════════════════════════════════════════════
// Brush Bar
// ═══════════════════════════════════════════════════════════
export function BrushBar({ brush, onSelect }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" gap={1.5} sx={{
      px: 2, py: 1.25, borderBottom: 1, borderColor: "divider",
      background: theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(59,130,246,0.03))"
        : "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(59,130,246,0.02))",
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.5,
        borderRadius: "6px", bgcolor: alpha(theme.palette.primary.main, 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", animation: "pulse 2s infinite" }} />
        <Typography sx={{ fontSize: 11, color: "primary.main", fontWeight: 700, letterSpacing: "0.02em" }}>PAINT MODE</Typography>
      </Box>
      <Stack direction="row" gap={0.75}>
        {SHIFT_ORDER.map((code) => (
          <Button key={code} size="small" variant="outlined"
            onClick={() => onSelect(code)}
            sx={{
              minWidth: 46, height: 30, fontFamily: MONO, fontWeight: 700, fontSize: 11.5,
              borderRadius: "8px",
              borderColor: brush === code ? SHIFT_COLORS[code].solid : "divider",
              borderWidth: brush === code ? 2 : 1,
              bgcolor: brush === code ? alpha(SHIFT_COLORS[code].solid, 0.12) : "transparent",
              color: brush === code ? SHIFT_COLORS[code].text : "text.secondary",
              boxShadow: brush === code ? `0 0 0 3px ${alpha(SHIFT_COLORS[code].solid, 0.15)}` : "none",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: SHIFT_COLORS[code].solid, bgcolor: alpha(SHIFT_COLORS[code].solid, 0.08) },
            }}>
            {code}
          </Button>
        ))}
      </Stack>
      <Typography sx={{ ml: "auto", fontSize: 10.5, color: "text.secondary", fontWeight: 500, fontStyle: "italic" }}>
        Click or drag to paint cells
      </Typography>
    </Stack>
  );
}

// ═══════════════════════════════════════════════════════════
// Analytics Modal
// ═══════════════════════════════════════════════════════════
export function AnalyticsModal({ open, title, subtitle, grid, emps, from, len, dayLabels, onClose }) {
  const totals = spanCounts(grid, emps, from, len);
  const busiest = Array.from({ length: len }, (_, i) => ({
    label: dayLabels[i], count: workingTotal(colCounts(grid, emps, from + i)),
  })).sort((a, b) => b.count - a.count)[0];
  const totalShifts = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <DialogTitle sx={{ fontWeight: 750, fontSize: 18, pb: 0.5, letterSpacing: "-0.02em" }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, mb: 2.5 }}>
          {SHIFT_ORDER.map((code) => {
            const c = SHIFT_COLORS[code];
            const pct = totalShifts ? Math.round((totals[code] / totalShifts) * 100) : 0;
            return (
              <Card key={code} variant="outlined" sx={{
                p: 2, borderRadius: "12px", borderColor: alpha(c.solid, 0.2), bgcolor: alpha(c.solid, 0.03),
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: `0 4px 16px ${alpha(c.solid, 0.15)}` },
              }}>
                <ShiftBadge code={code} />
                <Typography sx={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, mt: 1.25, lineHeight: 1, color: c.text }}>
                  {totals[code]}
                </Typography>
                <LinearProgress variant="determinate" value={pct}
                  sx={{ mt: 1.25, height: 4, borderRadius: 2, bgcolor: alpha(c.solid, 0.1), "& .MuiLinearProgress-bar": { bgcolor: c.solid, borderRadius: 2 } }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mt: 0.75, display: "block", fontFamily: MONO }}>
                  {pct}%
                </Typography>
              </Card>
            );
          })}
        </Box>
        <Alert severity="info" sx={{ borderRadius: "10px" }}>
          <strong>Busiest day:</strong> {busiest?.label ?? "N/A"} with {busiest?.count ?? 0} active personnel
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" disableElevation
          sx={{ textTransform: "none", px: 3, borderRadius: "8px", fontWeight: 650 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Excel Upload Modal
// ═══════════════════════════════════════════════════════════
export function ExcelUploadModal({ open, title, subtitle, onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  useEffect(() => { if (!open) setFileName(""); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 750, fontSize: 18, pb: 1, letterSpacing: "-0.02em" }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
        <Button variant="outlined" component="label" fullWidth startIcon={<DownloadIcon />}
          sx={{
            py: 3, borderStyle: "dashed", borderWidth: 2, textTransform: "none", borderRadius: "12px",
            transition: "all 0.2s ease",
            "&:hover": { borderStyle: "solid", bgcolor: "action.hover" },
          }}>
          <Typography noWrap variant="body2" sx={{ fontWeight: 600 }}>{fileName || "Choose Excel / CSV File"}</Typography>
          <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>Cancel</Button>
        <Button variant="contained" disabled={!fileName} disableElevation
          onClick={() => onImport({ name: fileName, rows: EMPLOYEES.length })}
          sx={{ textTransform: "none", px: 3, borderRadius: "8px", fontWeight: 650 }}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Validation Panel
// ═══════════════════════════════════════════════════════════
export function ValidationPanel({ grid, emps }) {
  const nightHeavy = emps.filter((e) => empSummary(grid[e.id]).n > 8);
  const lowRest = emps.filter((e) => empSummary(grid[e.id]).off < 6);
  const balanced = Math.max(emps.length - nightHeavy.length - lowRest.length, 0);
  return (
    <Card variant="outlined" sx={{ borderRadius: "12px", p: 2, borderColor: "divider" }}>
      <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
        <Chip color="success" icon={<CheckIcon sx={{ fontSize: "14px !important" }} />}
          label={`${balanced} Balanced`} sx={{ fontWeight: 650, height: 28, borderRadius: "8px" }} />
        <Chip color={nightHeavy.length ? "warning" : "default"}
          label={`${nightHeavy.length} High Night Load`} sx={{ fontWeight: 650, height: 28, borderRadius: "8px" }} />
        <Chip color={lowRest.length ? "error" : "default"}
          label={`${lowRest.length} Low Rest`} sx={{ fontWeight: 650, height: 28, borderRadius: "8px" }} />
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", fontSize: 11.5 }}>
          42-day cycle · Night &gt;8 = High · OFF &lt;6 = Low Rest
        </Typography>
      </Stack>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════
export function RosterToast({ toast, onClose }) {
  return (
    <Snackbar open={!!toast} autoHideDuration={2600} onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert severity="success" variant="filled" icon={<CheckIcon />}
        sx={{ alignItems: "center", borderRadius: "10px" }}>{toast}</Alert>
    </Snackbar>
  );
}

// ═══════════════════════════════════════════════════════════
// Search + Toolbar builder (shared pattern)
// ═══════════════════════════════════════════════════════════
export function SearchBox({ value, onChange, onClear, placeholder = "Search..." }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{
      bgcolor: "background.paper", border: 1.5, borderColor: "divider",
      borderRadius: "10px", px: 1.25, py: 0.5, width: 170,
      transition: "all 0.2s ease",
      "&:focus-within": { borderColor: "primary.main", boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}` },
    }}>
      <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
      <InputBase placeholder={placeholder} value={value} onChange={onChange}
        sx={{ fontSize: 12.5, width: "100%", fontWeight: 500 }} />
      {value && (
        <IconButton size="small" onClick={onClear} sx={{ p: 0.25 }}>
          <CloseIcon sx={{ fontSize: 13 }} />
        </IconButton>
      )}
    </Stack>
  );
}

// ═══════════════════════════════════════════════════════════
// RosterTable (shared grid renderer)
// ═══════════════════════════════════════════════════════════
export function RosterTable({
  mode, grid, emps, allEmps, editing, brush, painting,
  dayTotals, days, filter, onBrushChange, onCellChange, headerActions,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isGolden = mode === "golden";
  const totalCols = isGolden ? 42 : 7;
  const totalsScope = allEmps ?? emps;

  return (
    <Card variant="outlined" sx={{
      borderRadius: "14px",
      // ── KEY FIX: overflow hidden so nothing bleeds through ──
      overflow: "hidden",
      position: "relative",
      zIndex: 1,
      borderColor: isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06),
      boxShadow: isDark
        ? "0 4px 32px rgba(0,0,0,0.4)"
        : "0 2px 20px rgba(13,27,42,0.08)",
    }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} sx={{
        p: "12px 18px", borderBottom: 1, borderColor: "divider", minHeight: 52,
        background: isDark
          ? "linear-gradient(135deg, rgba(24,95,165,0.06), rgba(99,102,241,0.04))"
          : "linear-gradient(135deg, rgba(24,95,165,0.03), rgba(99,102,241,0.02))",
      }}>
        {isGolden ? (
          <ShiftLegend />
        ) : (
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Chip size="small" color="success" variant="outlined"
              icon={<CheckIcon sx={{ fontSize: "12px !important" }} />}
              label="Auto Cyclical Rotation"
              sx={{ fontWeight: 650, height: 24, fontSize: 10.5, borderRadius: "6px" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Showing <b style={{ color: theme.palette.text.primary }}>{emps.length}</b> of {totalsScope.length}
            </Typography>
          </Stack>
        )}
        <Box sx={{ flex: 1 }} />
        {headerActions}
        {isGolden && (
          <Chip icon={<LayersIcon sx={{ fontSize: "13px !important" }} />}
            label="W1–W6 · 42 cols" size="small" variant="outlined"
            sx={{ display: { xs: "none", md: "flex" }, fontWeight: 650, height: 24, fontSize: 10.5, borderRadius: "6px" }} />
        )}
        {!isGolden && (
          <Box sx={{ display: { xs: "none", sm: "block" } }}><ShiftLegend /></Box>
        )}
      </Stack>

      {editing && <BrushBar brush={brush} onSelect={onBrushChange} />}

      {/*
        ── OVERFLOW FIX ──
        The root problem: you can't have overflowX:auto + overflowY:visible
        on the same element. Browsers normalize both to auto.
        
        Solution: We use overflow:hidden on the Card (above), then this
        inner scroll container handles both axes. We no longer need elements
        to visually escape — hover feedback uses box-shadow + filter instead
        of transform:scale(), so no overflow escape is needed.
      */}
      <Box sx={{
        overflowX: "auto",
        maxHeight: { xs: "65vh", md: "63vh" },
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 6, height: 6 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
          borderRadius: 6,
          "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
        },
      }}>
        <Box component="table" sx={gridTableSx(theme)}>
          <thead>
            {isGolden ? (
              <>
                <tr>
                  <th className="stick" rowSpan={2} style={{ width: 220, minWidth: 200 }}>Employee</th>
                  {Array.from({ length: 6 }, (_, w) => (
                    <th key={w} className={`wkhead${w > 0 ? " wsep" : ""}${w % 2 === 1 ? " wkAlt" : ""}`} colSpan={7}>
                      Week {w + 1}
                    </th>
                  ))}
                  <th className="sumhead first" rowSpan={2}>Work</th>
                  <th className="sumhead" rowSpan={2}>N</th>
                  <th className="sumhead" rowSpan={2}>OFF</th>
                  <th className="sumhead" rowSpan={2}>Load</th>
                </tr>
                <tr>
                  {Array.from({ length: 42 }, (_, i) => {
                    const d = i % 7, w = Math.floor(i / 7);
                    return <th key={i} className={`${d === 0 && w > 0 ? "wsep " : ""}${d >= 5 ? "wkend" : ""}`}>{DOW[d]}</th>;
                  })}
                </tr>
              </>
            ) : (
              <tr>
                <th className="stick" style={{ minWidth: 200, width: 220 }}>Staff member</th>
                {Array.from({ length: 7 }, (_, i) => {
                  const c = dayTotals[i];
                  const total = SHIFT_ORDER.reduce((s, k) => s + c[k], 0) || 1;
                  return (
                    <th key={i} className={i >= 5 ? "wkend" : ""} style={{ minWidth: 80, padding: "8px 6px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{DOW[i]}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 600, fontFamily: MONO.split(",")[0].replace(/'/g, ""), color: "inherit", opacity: 0.7, marginTop: 1 }}>
                        {days ? fmtShort(days[i]) : ""}
                      </div>
                      <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 5, background: "rgba(0,0,0,0.06)" }}>
                        {SHIFT_ORDER.filter((k) => k !== "OFF" && c[k] > 0).map((k) => (
                          <span key={k} style={{ width: `${(c[k] / total) * 100}%`, background: SHIFT_COLORS[k].solid }} />
                        ))}
                      </div>
                    </th>
                  );
                })}
                <th className="sumhead first">Work</th>
                <th className="sumhead">N</th>
                <th className="sumhead">OFF</th>
              </tr>
            )}
          </thead>
          <tbody>
            {emps.length === 0 ? (
              <tr>
                <td colSpan={totalCols + 5} style={{ textAlign: "center", padding: "40px 16px", color: theme.palette.text.secondary, fontSize: 13 }}>
                  No employees match the current filters
                </td>
              </tr>
            ) : emps.map((e) => {
              const row = grid[e.id]?.slice(0, totalCols) ?? [];
              const summary = empSummary(row);
              const loadPct = Math.round((summary.work / totalCols) * 100);
              const isHighLoad = summary.n > 8, isLowRest = summary.off < 6;
              return (
                <tr key={e.id}>
                  <td className="stick">
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <EmployeeCell employee={e} accent={editing} />
                      {(isHighLoad || isLowRest) && (
                        <Stack direction="row" gap={0.5}>
                          {isHighLoad && <Tooltip title="High night load"><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "warning.main", boxShadow: "0 0 6px rgba(245,158,11,0.4)" }} /></Tooltip>}
                          {isLowRest && <Tooltip title="Low rest violation"><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "error.main", boxShadow: "0 0 6px rgba(239,68,68,0.4)" }} /></Tooltip>}
                        </Stack>
                      )}
                    </Stack>
                  </td>
                  {row.map((code, i) => {
                    const d = i % 7, w = Math.floor(i / 7);
                    return (
                      <td key={i} className={`gcell${isGolden && d === 0 && w > 0 ? " wsep" : ""}${d >= 5 ? " wkend" : ""}`}>
                        <Tooltip title={`${e.name} · ${isGolden ? `W${w + 1} ` : ""}${DOW_LONG[d]}`} arrow disableInteractive>
                          <Box component="button" className={editing ? "gbtn editing" : "gbtn"}
                            sx={{ ...shiftStyle(code, theme.palette.mode) }}
                            onMouseDown={() => { if (editing) { painting.current = true; onCellChange(e.id, i, brush); } }}
                            onMouseEnter={() => { if (editing && painting.current) onCellChange(e.id, i, brush); }}>
                            {code}
                          </Box>
                        </Tooltip>
                      </td>
                    );
                  })}
                  <td className="sumcell first">{summary.work}</td>
                  <td className="sumcell" style={{
                    color: isHighLoad ? SHIFT_COLORS.N.text : undefined,
                    fontWeight: isHighLoad ? 700 : 600,
                  }}>{summary.n}</td>
                  <td className="sumcell" style={{
                    color: isLowRest ? SHIFT_COLORS.OFF.text : undefined,
                    fontWeight: isLowRest ? 700 : 600,
                  }}>{summary.off}</td>
                  {isGolden && (
                    <td className="sumcell">
                      <Stack direction="row" alignItems="center" gap={0.75}>
                        <Box sx={{ display: "inline-flex", height: 5, borderRadius: "4px", overflow: "hidden", width: 48, bgcolor: "action.hover" }}>
                          <Box sx={{
                            width: `${loadPct}%`, height: "100%", borderRadius: "4px",
                            bgcolor: loadPct > 78 ? "warning.main" : loadPct > 60 ? "primary.main" : "success.main",
                            transition: "width 0.3s ease",
                          }} />
                        </Box>
                        <Typography sx={{ fontSize: 9.5, fontFamily: MONO, fontWeight: 700, color: "text.secondary", minWidth: 26 }}>
                          {loadPct}%
                        </Typography>
                      </Stack>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="stick">Staffed / Day</td>
              {dayTotals.map((c, i) => {
                const d = i % 7, w = Math.floor(i / 7);
                const wt = workingTotal(c);
                return (
                  <td key={i} className={isGolden && d === 0 && w > 0 ? "wsep" : d >= 5 ? "wkend" : ""}>
                    <Typography sx={{
                      fontSize: 11.5, fontFamily: MONO, fontWeight: 700,
                      color: wt < 5 ? "error.main" : wt > 15 ? "warning.main" : "text.primary",
                    }}>{wt}</Typography>
                  </td>
                );
              })}
              <td colSpan={isGolden ? 4 : 3}></td>
            </tr>
          </tfoot>
        </Box>
      </Box>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Grid Table Styles — FIXED overflow issues
// ═══════════════════════════════════════════════════════════
export function gridTableSx(theme) {
  const isDark = theme.palette.mode === "dark";
  const headerBg = isDark ? "#1A2436" : "#F4F7FB";
  return {
    borderCollapse: "separate", borderSpacing: 0, fontSize: 12, width: "100%",
    "& th, & td": { borderBottom: `1px solid ${theme.palette.divider}`, borderRight: `1px solid ${theme.palette.divider}`, whiteSpace: "nowrap" },
    "& thead th": {
      background: headerBg, position: "sticky", top: 0, zIndex: 3,
      padding: "8px 5px", fontWeight: 650, color: theme.palette.text.secondary,
      textAlign: "center", borderBottom: `2px solid ${theme.palette.divider}`,
    },
    "& .wkhead": { fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" },
    "& .wkAlt": {
      background: isDark ? "rgba(24,95,165,0.1)" : "rgba(24,95,165,0.04)",
      color: theme.palette.primary.main,
    },
    "& .stick": {
      position: "sticky", left: 0, zIndex: 4,
      background: theme.palette.background.paper,
      textAlign: "left", padding: "6px 14px",
      // ── IMPROVED: solid shadow instead of blurry one ──
      boxShadow: isDark
        ? "3px 0 8px -2px rgba(0,0,0,0.5)"
        : "3px 0 8px -2px rgba(13,27,42,0.1)",
      borderRight: `1.5px solid ${theme.palette.divider}`,
    },
    "& thead .stick": { zIndex: 6, background: headerBg, borderBottom: `2px solid ${theme.palette.divider}` },
    "& tbody td.stick": { zIndex: 1, background: theme.palette.background.paper },
    "& tbody tr": { transition: "background 0.1s ease" },
    "& tbody tr:hover td": { background: isDark ? "rgba(255,255,255,0.025)" : "rgba(13,27,42,0.025)" },
    "& tbody tr:hover td.stick": { background: isDark ? "#1E293B" : "#F8FAFC" },
    "& td.gcell": { padding: "3px", textAlign: "center" },
    "& .wsep": { borderLeft: `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}` },
    "& .wkend": { background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" },
    "& .gbtn": {
      width: 34, height: 28, border: "1.5px solid", borderRadius: "6px",
      fontFamily: MONO, fontWeight: 700, fontSize: 10.5,
      cursor: "default", padding: 0, userSelect: "none",
      // ── FIX: NO transform:scale — use box-shadow for hover feedback ──
      transition: "box-shadow 0.12s ease, border-color 0.12s ease, filter 0.12s ease",
    },
    "& .gbtn.editing": { cursor: "pointer" },
    // ── FIX: ring + glow replaces scale — no overflow escape needed ──
    "& .gbtn.editing:hover": {
      position: "relative", zIndex: 5,
      boxShadow: `0 0 0 2.5px ${theme.palette.primary.main}, 0 2px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
      borderColor: `${theme.palette.primary.main} !important`,
      filter: "brightness(1.12) saturate(1.25)",
    },
    "& .sumcell": {
      fontFamily: MONO, fontWeight: 600, textAlign: "center", fontSize: 11,
      background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.008)",
      color: theme.palette.text.secondary, padding: "6px 8px",
    },
    "& .sumcell.first": { borderLeft: `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}` },
    "& thead th.sumhead": { background: headerBg, fontSize: 10, fontWeight: 700 },
    "& tfoot td": {
      position: "sticky", bottom: 0, background: headerBg,
      borderTop: `2px solid ${theme.palette.divider}`,
      fontFamily: MONO, fontWeight: 700, fontSize: 11, textAlign: "center",
      zIndex: 2, color: theme.palette.text.primary, padding: "8px 4px",
    },
    "& tfoot td.stick": { zIndex: 5, textAlign: "left", fontWeight: 600, color: theme.palette.text.secondary },
    // pulse animation for paint mode indicator
    "@keyframes pulse": {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.4 },
    },
  };
}