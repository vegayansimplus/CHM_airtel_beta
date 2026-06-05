// give me this two components in two saprate components and improve ui view and I want more user interactive view and 
// give me overflow best view, in current view overflow is looks like transparent it override another component view.

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  Badge,
  FormControlLabel,
  Checkbox,
  Collapse,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Slider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CalendarIcon from "@mui/icons-material/CalendarTodayOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GridIcon from "@mui/icons-material/GridOnOutlined";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import NightIcon from "@mui/icons-material/DarkModeOutlined";
import PowerIcon from "@mui/icons-material/PowerSettingsNew";
import SearchIcon from "@mui/icons-material/Search";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import PersonIcon from "@mui/icons-material/Person";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import StarIcon from "@mui/icons-material/Star";

type ShiftCode = "A" | "B" | "G" | "LG" | "N" | "OFF";
type SortField =
  | "name"
  | "id"
  | "role"
  | "level"
  | "work"
  | "night"
  | "off"
  | "load";
type SortDir = "asc" | "desc";

interface Employee {
  id: string;
  name: string;
  role: string;
  level: "L1" | "L2" | "L3" | "L4";
  teamId: number;
  subTeamId: number;
}

interface GridScreenProps {
  teamId?: number;
  subTeamId?: number;
}

interface ParsedUpload {
  name: string;
  rows: number;
}

interface FilterState {
  query: string;
  levels: string[];
  roles: string[];
  teams: string[];
  shiftCodes: ShiftCode[];
  sortField: SortField;
  sortDir: SortDir;
  workRange: [number, number];
  nightRange: [number, number];
  showHighLoad: boolean;
  showLowRest: boolean;
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const DOW_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SHIFT_ORDER: ShiftCode[] = ["A", "B", "G", "LG", "N", "OFF"];
const TODAY = new Date();
const ALL_ROLES = [
  "NOC Engineer",
  "Shift Lead",
  "Incident Owner",
  "Field Coordinator",
];
const ALL_LEVELS = ["L1", "L2", "L3", "L4"];

const SHIFT_COLORS: Record<
  ShiftCode,
  {
    bg: string;
    bgDark: string;
    text: string;
    textDark: string;
    solid: string;
    label: string;
  }
> = {
  A: {
    bg: "#FFF9E6",
    bgDark: "rgba(245,158,11,0.12)",
    text: "#B25E00",
    textDark: "#FBBF24",
    solid: "#F59E0B",
    label: "Alpha",
  },
  B: {
    bg: "#EFF6FF",
    bgDark: "rgba(37,99,235,0.12)",
    text: "#1E40AF",
    textDark: "#93C5FD",
    solid: "#3B82F6",
    label: "Bravo",
  },
  G: {
    bg: "#F8FAFC",
    bgDark: "rgba(100,116,139,0.12)",
    text: "#475569",
    textDark: "#E2E8F0",
    solid: "#64748B",
    label: "Golf",
  },
  LG: {
    bg: "#ECFDF5",
    bgDark: "rgba(16,185,129,0.12)",
    text: "#065F46",
    textDark: "#34D399",
    solid: "#10B981",
    label: "Lima Golf",
  },
  N: {
    bg: "#EEF2FF",
    bgDark: "rgba(79,70,229,0.12)",
    text: "#3730A3",
    textDark: "#A5B4FC",
    solid: "#6366F1",
    label: "Night",
  },
  OFF: {
    bg: "#FFF5F5",
    bgDark: "rgba(239,68,68,0.12)",
    text: "#9B1C1C",
    textDark: "#FCA5A5",
    solid: "#EF4444",
    label: "Off Day",
  },
};

const LEVEL_COLORS: Record<
  string,
  { bg: string; text: string; solid: string }
> = {
  L1: { bg: "#F0FDF4", text: "#166534", solid: "#22C55E" },
  L2: { bg: "#EFF6FF", text: "#1E40AF", solid: "#3B82F6" },
  L3: { bg: "#FFF7ED", text: "#9A3412", solid: "#F97316" },
  L4: { bg: "#FDF4FF", text: "#6B21A8", solid: "#A855F7" },
};

const EMPLOYEES: Employee[] = Array.from({ length: 28 }, (_, i) => ({
  id: `EMP${String(i + 1).padStart(3, "0")}`,
  name: [
    "Aarav Sharma",
    "Isha Nair",
    "Kabir Mehta",
    "Tara Singh",
    "Rohan Das",
    "Meera Iyer",
    "Nikhil Rao",
    "Anaya Khan",
    "Dev Patel",
    "Sara Thomas",
    "Arjun Bose",
    "Diya Menon",
    "Vihaan Jain",
    "Kiara Roy",
    "Yash Verma",
    "Naina Pillai",
    "Reyansh Gupta",
    "Aditi Sinha",
    "Vivaan Reddy",
    "Myra Kapoor",
    "Atharv Joshi",
    "Saanvi Shah",
    "Ishaan Batra",
    "Avni Kulkarni",
    "Dhruv Malhotra",
    "Riya Chatterjee",
    "Neil George",
    "Maya Krishnan",
  ][i],
  role: ALL_ROLES[i % 4],
  level: (["L1", "L2", "L3", "L4"] as const)[i % 4],
  teamId: (i % 6) + 1,
  subTeamId: (i % 10) + 1,
}));

const BASE_PATTERN: ShiftCode[][] = [
  ["G", "G", "LG", "B", "N", "OFF", "OFF"],
  ["A", "A", "G", "G", "LG", "OFF", "N"],
  ["N", "OFF", "OFF", "A", "B", "G", "G"],
  ["LG", "B", "B", "N", "OFF", "G", "A"],
  ["OFF", "G", "A", "A", "B", "LG", "N"],
  ["B", "LG", "N", "OFF", "G", "A", "OFF"],
];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const mondayOf = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
};
const fmtShort = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const isoWeek = (date: Date) => {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNo = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNo);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
};

const buildGrid = (emps: Employee[]) =>
  Object.fromEntries(
    emps.map((e, empIndex) => [
      e.id,
      Array.from({ length: 42 }, (_, dayIndex) => {
        const week = Math.floor(dayIndex / 7);
        const day = dayIndex % 7;
        return BASE_PATTERN[(empIndex + week) % BASE_PATTERN.length][day];
      }),
    ]),
  ) as Record<string, ShiftCode[]>;

const buildWeekGrid = (emps: Employee[]) => {
  const full = buildGrid(emps);
  return Object.fromEntries(
    emps.map((e) => [
      e.id,
      Array.from({ length: 7 }, (_, i) => full[e.id][(i + 7) % 42]),
    ]),
  ) as Record<string, ShiftCode[]>;
};

const emptyCounts = () =>
  SHIFT_ORDER.reduce(
    (acc, code) => ({ ...acc, [code]: 0 }),
    {} as Record<ShiftCode, number>,
  );
const colCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  index: number,
) =>
  emps.reduce((acc, e) => {
    const code = grid[e.id]?.[index];
    if (code) acc[code] += 1;
    return acc;
  }, emptyCounts());
const spanCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  from: number,
  len: number,
) =>
  emps.reduce((acc, e) => {
    grid[e.id]?.slice(from, from + len).forEach((code) => {
      acc[code] += 1;
    });
    return acc;
  }, emptyCounts());
const workingTotal = (counts: Record<ShiftCode, number>) =>
  SHIFT_ORDER.filter((code) => code !== "OFF").reduce(
    (sum, code) => sum + counts[code],
    0,
  );
const empSummary = (row: ShiftCode[] = []) => ({
  work: row.filter((c) => c !== "OFF").length,
  n: row.filter((c) => c === "N").length,
  off: row.filter((c) => c === "OFF").length,
});
const shiftStyle = (code: ShiftCode, mode: "light" | "dark") => {
  const c = SHIFT_COLORS[code];
  return {
    bgcolor: mode === "dark" ? c.bgDark : c.bg,
    color: mode === "dark" ? c.textDark : c.text,
    borderColor: alpha(c.solid, 0.25),
  };
};

function scopeEmployees(teamId?: number, subTeamId?: number) {
  return EMPLOYEES.filter(
    (e) =>
      (!teamId || e.teamId === teamId) &&
      (!subTeamId || e.subTeamId === subTeamId),
  );
}

const defaultFilter = (): FilterState => ({
  query: "",
  levels: [],
  roles: [],
  teams: [],
  shiftCodes: [],
  sortField: "name",
  sortDir: "asc",
  workRange: [0, 42],
  nightRange: [0, 42],
  showHighLoad: false,
  showLowRest: false,
});

// ─── Filter + Sort Engine ───────────────────────────────────────────────
function applyFilters(
  emps: Employee[],
  grid: Record<string, ShiftCode[]>,
  f: FilterState,
  totalCols: number,
): Employee[] {
  let result = emps.filter((e) => {
    if (
      f.query &&
      !`${e.name} ${e.id} ${e.role}`
        .toLowerCase()
        .includes(f.query.toLowerCase())
    )
      return false;
    if (f.levels.length && !f.levels.includes(e.level)) return false;
    if (f.roles.length && !f.roles.includes(e.role)) return false;
    if (f.teams.length && !f.teams.includes(String(e.teamId))) return false;
    const row = grid[e.id]?.slice(0, totalCols) ?? [];
    const s = empSummary(row);
    if (s.work < f.workRange[0] || s.work > f.workRange[1]) return false;
    if (s.n < f.nightRange[0] || s.n > f.nightRange[1]) return false;
    if (f.showHighLoad && s.n <= 8) return false;
    if (f.showLowRest && s.off >= 6) return false;
    if (f.shiftCodes.length) {
      const hasAll = f.shiftCodes.every((code) => row.includes(code));
      if (!hasAll) return false;
    }
    return true;
  });

  result.sort((a, b) => {
    let valA: string | number = "";
    let valB: string | number = "";
    const rowA = grid[a.id]?.slice(0, totalCols) ?? [];
    const rowB = grid[b.id]?.slice(0, totalCols) ?? [];
    const sA = empSummary(rowA);
    const sB = empSummary(rowB);
    switch (f.sortField) {
      case "name":
        valA = a.name;
        valB = b.name;
        break;
      case "id":
        valA = a.id;
        valB = b.id;
        break;
      case "role":
        valA = a.role;
        valB = b.role;
        break;
      case "level":
        valA = a.level;
        valB = b.level;
        break;
      case "work":
        valA = sA.work;
        valB = sB.work;
        break;
      case "night":
        valA = sA.n;
        valB = sB.n;
        break;
      case "off":
        valA = sA.off;
        valB = sB.off;
        break;
      case "load":
        valA = sA.work / totalCols;
        valB = sB.work / totalCols;
        break;
    }
    const cmp =
      typeof valA === "number"
        ? valA - (valB as number)
        : String(valA).localeCompare(String(valB));
    return f.sortDir === "asc" ? cmp : -cmp;
  });

  return result;
}

function countActiveFilters(f: FilterState): number {
  const def = defaultFilter();
  let count = 0;
  if (f.query) count++;
  if (f.levels.length) count++;
  if (f.roles.length) count++;
  if (f.teams.length) count++;
  if (f.shiftCodes.length) count++;
  if (
    f.workRange[0] !== def.workRange[0] ||
    f.workRange[1] !== def.workRange[1]
  )
    count++;
  if (
    f.nightRange[0] !== def.nightRange[0] ||
    f.nightRange[1] !== def.nightRange[1]
  )
    count++;
  if (f.showHighLoad) count++;
  if (f.showLowRest) count++;
  return count;
}

// ─── Sub-components ─────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const c = LEVEL_COLORS[level] ?? {
    bg: "#F1F5F9",
    text: "#475569",
    solid: "#64748B",
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-grid",
        placeItems: "center",
        px: 0.75,
        height: 18,
        borderRadius: "4px",
        fontSize: 9.5,
        fontWeight: 700,
        bgcolor: c.bg,
        color: c.text,
        border: `1px solid ${alpha(c.solid, 0.2)}`,
        letterSpacing: "0.03em",
      }}
    >
      {level}
    </Box>
  );
}

function EmployeeCell({
  employee,
  accent,
}: {
  employee: Employee;
  accent?: boolean;
}) {
  const theme = useTheme();
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.02em",
          bgcolor: accent
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.text.primary, 0.05),
          color: accent
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          border: "1px solid",
          borderColor: accent
            ? alpha(theme.palette.primary.main, 0.2)
            : "transparent",
          flexShrink: 0,
        }}
      >
        {initials}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 650,
              lineHeight: 1.2,
              color: "text.primary",
            }}
            noWrap
          >
            {employee.name}
          </Typography>
          <LevelBadge level={employee.level} />
        </Stack>
        <Typography
          sx={{
            fontSize: 10,
            color: "text.secondary",
            fontWeight: 500,
            mt: 0.2,
          }}
          noWrap
        >
          {employee.id} • {employee.role}
        </Typography>
      </Box>
    </Stack>
  );
}

function ShiftBadge({
  code,
  size = "md",
}: {
  code: ShiftCode;
  size?: "sm" | "md";
}) {
  const theme = useTheme();
  return (
    <Box
      component="span"
      sx={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: size === "sm" ? 28 : 32,
        height: size === "sm" ? 20 : 24,
        px: 0.75,
        borderRadius: "5px",
        fontFamily: MONO,
        fontSize: size === "sm" ? 10 : 11,
        fontWeight: 700,
        border: "1px solid",
        ...shiftStyle(code, theme.palette.mode),
      }}
    >
      {code}
    </Box>
  );
}

function ShiftLegend() {
  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
      {SHIFT_ORDER.map((code) => (
        <Tooltip key={code} title={SHIFT_COLORS[code].label} arrow>
          <Box>
            <ShiftBadge code={code} />
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}

// ─── Advanced Filter Panel ──────────────────────────────────────────────
function FilterPanel({
  open,
  filter,
  onFilter,
  onClose,
  totalCols,
  teamCount,
}: {
  open: boolean;
  filter: FilterState;
  onFilter: (f: FilterState) => void;
  onClose: () => void;
  totalCols: number;
  teamCount: number;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [local, setLocal] = useState(filter);

  useEffect(() => {
    setLocal(filter);
  }, [filter, open]);

  const update = (patch: Partial<FilterState>) =>
    setLocal((prev) => ({ ...prev, ...patch }));
  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  const toggleShift = (code: ShiftCode) =>
    update({
      shiftCodes: local.shiftCodes.includes(code)
        ? local.shiftCodes.filter((c) => c !== code)
        : [...local.shiftCodes, code],
    });

  const teams = Array.from({ length: teamCount }, (_, i) => String(i + 1));

  return (
    <Collapse in={open}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          borderColor: "divider",
          mb: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: isDark
              ? "rgba(255,255,255,0.015)"
              : "rgba(13,27,42,0.015)",
          }}
        >
          <TuneIcon sx={{ fontSize: 15, color: "text.secondary", mr: 1 }} />
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}
          >
            Advanced Filters
          </Typography>
          <Box flex={1} />
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={() => {
              setLocal(defaultFilter());
              onFilter(defaultFilter());
            }}
            sx={{
              fontSize: 11,
              textTransform: "none",
              color: "text.secondary",
              mr: 1,
            }}
          >
            Reset all
          </Button>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* Level Filter */}
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Level
            </Typography>
            <Stack gap={0.5}>
              {ALL_LEVELS.map((lv) => {
                const c = LEVEL_COLORS[lv];
                const active = local.levels.includes(lv);
                return (
                  <Box
                    key={lv}
                    onClick={() =>
                      update({ levels: toggleArr(local.levels, lv) })
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active ? alpha(c.solid, 0.4) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.06) : "transparent",
                      transition: "all 0.12s",
                      "&:hover": {
                        borderColor: alpha(c.solid, 0.35),
                        bgcolor: alpha(c.solid, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: c.solid,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? c.text : "text.primary",
                        flex: 1,
                      }}
                    >
                      {lv}
                    </Typography>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: c.solid }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Role Filter */}
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Role
            </Typography>
            <Stack gap={0.5}>
              {ALL_ROLES.map((role) => {
                const active = local.roles.includes(role);
                return (
                  <Box
                    key={role}
                    onClick={() =>
                      update({ roles: toggleArr(local.roles, role) })
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active
                        ? alpha(theme.palette.primary.main, 0.4)
                        : "divider",
                      bgcolor: active
                        ? alpha(theme.palette.primary.main, 0.06)
                        : "transparent",
                      transition: "all 0.12s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <PersonIcon
                      sx={{
                        fontSize: 13,
                        color: active ? "primary.main" : "text.disabled",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: active ? "primary.main" : "text.primary",
                        flex: 1,
                      }}
                      noWrap
                    >
                      {role}
                    </Typography>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: "primary.main" }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Shift Codes + Teams */}
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Has Shift
            </Typography>
            <Stack gap={0.5}>
              {SHIFT_ORDER.map((code) => {
                const c = SHIFT_COLORS[code];
                const active = local.shiftCodes.includes(code);
                return (
                  <Box
                    key={code}
                    onClick={() => toggleShift(code)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: active ? alpha(c.solid, 0.4) : "divider",
                      bgcolor: active ? alpha(c.solid, 0.06) : "transparent",
                      transition: "all 0.12s",
                    }}
                  >
                    <ShiftBadge code={code} size="sm" />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: "text.primary",
                        flex: 1,
                      }}
                    >
                      {c.label}
                    </Typography>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: c.solid }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Range + Flags */}
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Work Days Range
            </Typography>
            <Slider
              value={local.workRange}
              onChange={(_, v) => update({ workRange: v as [number, number] })}
              min={0}
              max={totalCols}
              valueLabelDisplay="auto"
              size="small"
              sx={{ mb: 2 }}
            />
            <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>
              {local.workRange[0]} – {local.workRange[1]} work days
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1.5,
                mt: 2,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Night Shifts Range
            </Typography>
            <Slider
              value={local.nightRange}
              onChange={(_, v) => update({ nightRange: v as [number, number] })}
              min={0}
              max={totalCols}
              valueLabelDisplay="auto"
              size="small"
              sx={{ mb: 2 }}
            />
            <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1 }}>
              {local.nightRange[0]} – {local.nightRange[1]} night shifts
            </Typography>

            <Divider sx={{ my: 1.5 }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Compliance Flags
            </Typography>
            <Stack gap={0.75}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={local.showHighLoad}
                    onChange={(e) => update({ showHighLoad: e.target.checked })}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 12 }}>
                    High night load only
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={local.showLowRest}
                    onChange={(e) => update({ showLowRest: e.target.checked })}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 12 }}>
                    Low rest violations only
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </Box>

        {/* Sort Row */}
        <Stack
          direction="row"
          alignItems="center"
          gap={2}
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: isDark
              ? "rgba(255,255,255,0.015)"
              : "rgba(13,27,42,0.015)",
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <SwapVertIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography
              sx={{ fontSize: 11.5, fontWeight: 600, color: "text.secondary" }}
            >
              Sort by:
            </Typography>
          </Stack>
          {(
            [
              "name",
              "id",
              "role",
              "level",
              "work",
              "night",
              "off",
              "load",
            ] as SortField[]
          ).map((field) => (
            <Chip
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              size="small"
              variant={local.sortField === field ? "filled" : "outlined"}
              color={local.sortField === field ? "primary" : "default"}
              onClick={() =>
                update({
                  sortField: field,
                  sortDir:
                    local.sortField === field && local.sortDir === "asc"
                      ? "desc"
                      : "asc",
                })
              }
              icon={
                local.sortField === field ? (
                  local.sortDir === "asc" ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : undefined
              }
              sx={{ fontSize: 11, height: 24 }}
            />
          ))}
          <Box flex={1} />
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onFilter(local);
              onClose();
            }}
            sx={{
              fontSize: 11.5,
              textTransform: "none",
              px: 2,
              height: 30,
              borderRadius: "6px",
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Card>
    </Collapse>
  );
}

// ─── BrushBar ───────────────────────────────────────────────────────────
function BrushBar({
  brush,
  onSelect,
}: {
  brush: ShiftCode;
  onSelect: (code: ShiftCode) => void;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.02)"
            : alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Typography
        sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 700 }}
      >
        Paint:
      </Typography>
      <Stack direction="row" gap={0.75}>
        {SHIFT_ORDER.map((code) => (
          <Button
            key={code}
            size="small"
            variant="outlined"
            onClick={() => onSelect(code)}
            sx={{
              minWidth: 44,
              height: 28,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 11,
              borderRadius: "6px",
              borderColor:
                brush === code ? SHIFT_COLORS[code].solid : "divider",
              bgcolor:
                brush === code
                  ? alpha(SHIFT_COLORS[code].solid, 0.1)
                  : "transparent",
              color:
                brush === code ? SHIFT_COLORS[code].text : "text.secondary",
              boxShadow:
                brush === code
                  ? `0 0 0 2px ${alpha(SHIFT_COLORS[code].solid, 0.2)}`
                  : "none",
              "&:hover": {
                borderColor: SHIFT_COLORS[code].solid,
                bgcolor: alpha(SHIFT_COLORS[code].solid, 0.05),
              },
            }}
          >
            {code}
          </Button>
        ))}
      </Stack>
      <Typography sx={{ ml: "auto", fontSize: 10.5, color: "text.secondary" }}>
        Drag to paint multiple cells
      </Typography>
    </Stack>
  );
}

// ─── Analytics Modal ────────────────────────────────────────────────────
function AnalyticsModal({
  open,
  title,
  subtitle,
  grid,
  emps,
  from,
  len,
  dayLabels,
  onClose,
}: any) {
  const totals = spanCounts(grid, emps, from, len);
  const busiest = Array.from({ length: len }, (_, i) => ({
    label: dayLabels[i],
    count: workingTotal(colCounts(grid, emps, from + i)),
  })).sort((a, b) => b.count - a.count)[0];
  const totalShifts = Object.values(totals).reduce(
    (a: number, b: any) => a + b,
    0,
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ fontWeight: 750, fontSize: 17, pb: 0.5 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {subtitle}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.5,
            mb: 2,
          }}
        >
          {SHIFT_ORDER.map((code) => {
            const c = SHIFT_COLORS[code];
            const pct = totalShifts
              ? Math.round((totals[code] / totalShifts) * 100)
              : 0;
            return (
              <Card
                key={code}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  borderColor: alpha(c.solid, 0.2),
                  bgcolor: alpha(c.solid, 0.03),
                }}
              >
                <ShiftBadge code={code} />
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: 24,
                    fontWeight: 700,
                    mt: 1,
                    lineHeight: 1,
                    color: c.text,
                  }}
                >
                  {totals[code]}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    mt: 1,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: alpha(c.solid, 0.1),
                    "& .MuiLinearProgress-bar": { bgcolor: c.solid },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  {pct}% of total
                </Typography>
              </Card>
            );
          })}
        </Box>
        <Alert severity="info" sx={{ borderRadius: "8px" }}>
          <b>Busiest day:</b> {busiest?.label ?? "N/A"} with{" "}
          {busiest?.count ?? 0} active personnel
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none", px: 3, borderRadius: "6px" }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExcelUploadModal({ open, title, subtitle, onClose, onImport }: any) {
  const [fileName, setFileName] = useState("");
  useEffect(() => {
    if (!open) setFileName("");
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      <DialogTitle sx={{ fontWeight: 750, fontSize: 17, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<DownloadIcon />}
          sx={{
            py: 2,
            borderStyle: "dashed",
            borderWidth: 1.5,
            textTransform: "none",
            borderRadius: "10px",
          }}
        >
          <Typography noWrap variant="body2" sx={{ fontWeight: 600 }}>
            {fileName || "Choose Excel / CSV File"}
          </Typography>
          <input
            hidden
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!fileName}
          onClick={() => onImport({ name: fileName, rows: EMPLOYEES.length })}
          sx={{ textTransform: "none", px: 3, borderRadius: "6px" }}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ValidationPanel({
  grid,
  emps,
}: {
  grid: Record<string, ShiftCode[]>;
  emps: Employee[];
}) {
  const nightHeavy = emps.filter((e) => empSummary(grid[e.id]).n > 8);
  const lowRest = emps.filter((e) => empSummary(grid[e.id]).off < 6);
  const balanced = Math.max(
    emps.length - nightHeavy.length - lowRest.length,
    0,
  );
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: "10px", p: 1.75, borderColor: "divider" }}
    >
      <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
        <Chip
          color="success"
          icon={<CheckIcon sx={{ fontSize: "14px !important" }} />}
          label={`${balanced} Balanced`}
          sx={{ fontWeight: 600, height: 26 }}
        />
        <Chip
          color={nightHeavy.length ? "warning" : "default"}
          label={`${nightHeavy.length} High Night Load`}
          sx={{ fontWeight: 600, height: 26 }}
        />
        <Chip
          color={lowRest.length ? "error" : "default"}
          label={`${lowRest.length} Low Rest`}
          sx={{ fontWeight: 600, height: 26 }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: "auto", fontSize: 11.5 }}
        >
          Evaluated against 42-day cycle • Night &gt;8 = High • OFF &lt;6 = Low
          Rest
        </Typography>
      </Stack>
    </Card>
  );
}

function RosterToast({
  toast,
  onClose,
}: {
  toast: string | null;
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={2600}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity="success"
        variant="filled"
        icon={<CheckIcon />}
        sx={{ alignItems: "center", borderRadius: "8px" }}
      >
        {toast}
      </Alert>
    </Snackbar>
  );
}

// ─── RosterTable ────────────────────────────────────────────────────────
function RosterTable({
  mode,
  grid,
  emps,
  allEmps,
  editing,
  brush,
  painting,
  dayTotals,
  days,
  filter,
  onBrushChange,
  onCellChange,
  headerActions,
}: {
  mode: "golden" | "week7";
  grid: Record<string, ShiftCode[]>;
  emps: Employee[];
  allEmps?: Employee[];
  editing: boolean;
  brush: ShiftCode;
  painting: React.MutableRefObject<boolean>;
  dayTotals: Record<ShiftCode, number>[];
  days?: Date[];
  filter: FilterState;
  onBrushChange: (code: ShiftCode) => void;
  onCellChange: (id: string, day: number, code: ShiftCode) => void;
  headerActions?: React.ReactNode;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isGolden = mode === "golden";
  const totalCols = isGolden ? 42 : 7;
  const totalsScope = allEmps ?? emps;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        borderColor: "divider",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 2px 16px rgba(13,27,42,0.06)",
      }}
    >
      {/* Header bar */}
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{
          p: "10px 16px",
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 50,
          bgcolor: isDark ? alpha("#185FA5", 0.04) : alpha("#185FA5", 0.015),
        }}
      >
        {isGolden ? (
          <ShiftLegend />
        ) : (
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckIcon sx={{ fontSize: "12px !important" }} />}
              label="Auto Cyclical Rotation"
              sx={{ fontWeight: 600, height: 22, fontSize: 10.5 }}
            />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Showing{" "}
              <b style={{ color: theme.palette.text.primary }}>{emps.length}</b>{" "}
              of {totalsScope.length}
            </Typography>
          </Stack>
        )}
        <Box sx={{ flex: 1 }} />
        {headerActions}
        {isGolden && (
          <Chip
            icon={<LayersIcon sx={{ fontSize: "13px !important" }} />}
            label="W1–W6 · 42 cols"
            size="small"
            variant="outlined"
            sx={{
              display: { xs: "none", md: "flex" },
              fontWeight: 600,
              height: 22,
              fontSize: 10.5,
            }}
          />
        )}
        {!isGolden && (
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <ShiftLegend />
          </Box>
        )}
      </Stack>

      {editing && <BrushBar brush={brush} onSelect={onBrushChange} />}

      {/*
        ─── FIX: overflow clip issue ──────────────────────────────────────
        The key fix is here. Previously both overflowX and overflowY were set
        which creates a new stacking context that clips transform:scale() on
        child elements regardless of z-index.

        Solution: wrap the scroll in an outer container that only clips X,
        and set the inner table wrapper to overflow: visible so scaled cells
        can visually escape. We use a clip-path trick on X only via a wrapper.

        Actually the cleanest CSS-compatible fix:
        - Set the scroll container to overflowX: auto, overflowY: visible
        - BUT because a single element cannot have overflowX:auto + overflowY:visible
          (browser normalises it to auto/auto), we use two nested divs.
        - Outer div: overflowX: auto (handles horizontal scroll)
        - Inner div: overflowY: visible, minWidth: max-content (allows vertical overflow)
        This way hover scale(1.18) escapes the container vertically.

        Alternatively (and what we do here for simplicity): replace scale()
        with a ring + glow effect that needs no overflow escape.
      ──────────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "visible",
          // Two-div trick: this outer box scrolls horizontally.
          // We do NOT set overflowY here at all so vertical overflow is visible.
          // maxHeight is moved to an inner wrapper below.
          "&::-webkit-scrollbar": { width: 5, height: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderRadius: 4,
          },
        }}
      >
        {/* Inner wrapper: clips height but NOT the hover glow since we removed transform:scale */}
        <Box
          sx={{
            maxHeight: { xs: "65vh", md: "63vh" },
            overflowY: "auto",
            overflowX: "visible",
            minWidth: "max-content",
            "&::-webkit-scrollbar": { width: 5, height: 5 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
              borderRadius: 4,
            },
          }}
        >
          <Box component="table" sx={gridTableSx(theme)}>
            <thead>
              {isGolden ? (
                <>
                  <tr>
                    <th
                      className="stick"
                      rowSpan={2}
                      style={{ width: 220, minWidth: 200 }}
                    >
                      Employee
                    </th>
                    {Array.from({ length: 6 }, (_, w) => (
                      <th
                        key={w}
                        className={`wkhead${w > 0 ? " wsep" : ""}${w % 2 === 1 ? " wkAlt" : ""}`}
                        colSpan={7}
                      >
                        Week {w + 1}
                      </th>
                    ))}
                    <th className="sumhead first" rowSpan={2}>
                      Work
                    </th>
                    <th className="sumhead" rowSpan={2}>
                      N
                    </th>
                    <th className="sumhead" rowSpan={2}>
                      OFF
                    </th>
                    <th className="sumhead" rowSpan={2}>
                      Load
                    </th>
                  </tr>
                  <tr>
                    {Array.from({ length: 42 }, (_, i) => {
                      const d = i % 7;
                      const w = Math.floor(i / 7);
                      return (
                        <th
                          key={i}
                          className={`${d === 0 && w > 0 ? "wsep " : ""}${d >= 5 ? "wkend" : ""}`}
                        >
                          {DOW[d]}
                        </th>
                      );
                    })}
                  </tr>
                </>
              ) : (
                <tr>
                  <th className="stick" style={{ minWidth: 200, width: 220 }}>
                    Staff member
                  </th>
                  {Array.from({ length: 7 }, (_, i) => {
                    const c = dayTotals[i];
                    const total = SHIFT_ORDER.reduce((s, k) => s + c[k], 0) || 1;
                    return (
                      <th
                        key={i}
                        className={i >= 5 ? "wkend" : ""}
                        style={{ minWidth: 80, padding: "8px 6px" }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700 }}>
                          {DOW[i]}
                        </div>
                        <div
                          style={{
                            fontSize: 9.5,
                            fontWeight: 600,
                            fontFamily: MONO,
                            color: theme.palette.text.secondary,
                            marginTop: 1,
                          }}
                        >
                          {days ? fmtShort(days[i]) : ""}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            height: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            marginTop: 5,
                            background: theme.palette.action.hover,
                          }}
                        >
                          {SHIFT_ORDER.filter((k) => k !== "OFF" && c[k] > 0).map(
                            (k) => (
                              <span
                                key={k}
                                style={{
                                  width: `${(c[k] / total) * 100}%`,
                                  background: SHIFT_COLORS[k].solid,
                                }}
                              />
                            ),
                          )}
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
                  <td
                    colSpan={totalCols + 5}
                    style={{
                      textAlign: "center",
                      padding: "32px 16px",
                      color: theme.palette.text.secondary,
                      fontSize: 13,
                    }}
                  >
                    No employees match the current filters
                  </td>
                </tr>
              ) : (
                emps.map((e) => {
                  const row = grid[e.id]?.slice(0, totalCols) ?? [];
                  const summary = empSummary(row);
                  const loadPct = Math.round((summary.work / totalCols) * 100);
                  const isHighLoad = summary.n > 8;
                  const isLowRest = summary.off < 6;
                  return (
                    <tr key={e.id} style={{ opacity: 1 }}>
                      <td className="stick">
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <EmployeeCell employee={e} accent={editing} />
                          {(isHighLoad || isLowRest) && (
                            <Stack direction="row" gap={0.5}>
                              {isHighLoad && (
                                <Tooltip title="High night load">
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      bgcolor: "warning.main",
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {isLowRest && (
                                <Tooltip title="Low rest violation">
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      bgcolor: "error.main",
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </td>
                      {row.map((code, i) => {
                        const d = i % 7;
                        const w = Math.floor(i / 7);
                        return (
                          <td
                            key={i}
                            className={`gcell${isGolden && d === 0 && w > 0 ? " wsep" : ""}${d >= 5 ? " wkend" : ""}`}
                          >
                            <Tooltip
                              title={`${e.name} • ${isGolden ? `W${w + 1} ` : ""}${DOW_LONG[d]}`}
                              arrow
                              disableInteractive
                            >
                              <Box
                                component="button"
                                className={editing ? "gbtn editing" : "gbtn"}
                                sx={{ ...shiftStyle(code, theme.palette.mode) }}
                                onMouseDown={() => {
                                  if (editing) {
                                    painting.current = true;
                                    onCellChange(e.id, i, brush);
                                  }
                                }}
                                onMouseEnter={() => {
                                  if (editing && painting.current)
                                    onCellChange(e.id, i, brush);
                                }}
                              >
                                {code}
                              </Box>
                            </Tooltip>
                          </td>
                        );
                      })}
                      <td className="sumcell first">{summary.work}</td>
                      <td
                        className="sumcell"
                        style={{
                          color: isHighLoad ? SHIFT_COLORS.N.text : undefined,
                          fontWeight: isHighLoad ? 700 : 600,
                        }}
                      >
                        {summary.n}
                      </td>
                      <td
                        className="sumcell"
                        style={{
                          color: isLowRest ? SHIFT_COLORS.OFF.text : undefined,
                          fontWeight: isLowRest ? 700 : 600,
                        }}
                      >
                        {summary.off}
                      </td>
                      {isGolden && (
                        <td className="sumcell">
                          <Stack direction="row" alignItems="center" gap={0.75}>
                            <Box
                              sx={{
                                display: "inline-flex",
                                height: 4,
                                borderRadius: "4px",
                                overflow: "hidden",
                                width: 44,
                                bgcolor: "action.hover",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${loadPct}%`,
                                  height: "100%",
                                  bgcolor:
                                    loadPct > 78
                                      ? "warning.main"
                                      : loadPct > 60
                                        ? "primary.main"
                                        : "success.main",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: 9.5,
                                fontFamily: MONO,
                                fontWeight: 600,
                                color: "text.secondary",
                                minWidth: 24,
                              }}
                            >
                              {loadPct}%
                            </Typography>
                          </Stack>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="stick">Staffed / Day</td>
                {dayTotals.map((c, i) => {
                  const d = i % 7;
                  const w = Math.floor(i / 7);
                  const wt = workingTotal(c);
                  return (
                    <td
                      key={i}
                      className={
                        isGolden && d === 0 && w > 0
                          ? "wsep"
                          : d >= 5
                            ? "wkend"
                            : ""
                      }
                    >
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          fontFamily: MONO,
                          fontWeight: 700,
                          color:
                            wt < 5
                              ? "error.main"
                              : wt > 15
                                ? "warning.main"
                                : "text.primary",
                        }}
                      >
                        {wt}
                      </Typography>
                    </td>
                  );
                })}
                <td colSpan={isGolden ? 4 : 3}></td>
              </tr>
            </tfoot>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// ─── GoldenGridScreen ────────────────────────────────────────────────────
export function GoldenGridScreen({ teamId, subTeamId }: GridScreenProps) {
  const theme = useTheme();
  const allEmps = useMemo(
    () => scopeEmployees(teamId, subTeamId),
    [teamId, subTeamId],
  );
  const [grid, setGrid] = useState(() => buildGrid(EMPLOYEES));
  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState<ShiftCode>("G");
  const [showVal, setShowVal] = useState(false);
  const [upload, setUpload] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const painting = useRef(false);

  useEffect(() => {
    const up = () => {
      painting.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const emps = useMemo(
    () => applyFilters(allEmps, grid, filter, 42),
    [allEmps, grid, filter],
  );
  const activeCount = countActiveFilters(filter);
  const setCell = (id: string, day: number, code: ShiftCode) =>
    setGrid((prev) => ({
      ...prev,
      [id]: prev[id].map((c, i) => (i === day ? code : c)),
    }));
  const dayTotals = Array.from({ length: 42 }, (_, i) =>
    colCounts(grid, emps, i),
  );

  const headerActions = (
    <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          px: 1.25,
          py: 0.5,
          width: 160,
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <SearchIcon sx={{ fontSize: 15, color: "text.secondary" }} />
        <InputBase
          placeholder="Search staff..."
          value={filter.query}
          onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
          sx={{ fontSize: 12, width: "100%" }}
        />
        {filter.query && (
          <IconButton
            size="small"
            onClick={() => setFilter((f) => ({ ...f, query: "" }))}
            sx={{ p: 0.25 }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        )}
      </Stack>
      <Badge badgeContent={activeCount || undefined} color="primary">
        <Button
          size="small"
          variant={filterOpen || activeCount > 0 ? "contained" : "outlined"}
          color={activeCount > 0 ? "primary" : "inherit"}
          startIcon={<TuneIcon />}
          onClick={() => setFilterOpen((v) => !v)}
          sx={{
            textTransform: "none",
            height: 32,
            fontSize: 12,
            borderRadius: "7px",
          }}
        >
          {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
        </Button>
      </Badge>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<DownloadIcon />}
        onClick={() => setUpload(true)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        Upload
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<InsightsIcon />}
        onClick={() => setAnalytics(true)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        Analytics
      </Button>
      <Button
        size="small"
        variant={showVal ? "contained" : "outlined"}
        color={showVal ? "primary" : "inherit"}
        startIcon={<GridIcon />}
        onClick={() => setShowVal((v) => !v)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        {showVal ? "Hide" : "Validate"}
      </Button>
      <Button
        size="small"
        variant={editing ? "contained" : "outlined"}
        color={editing ? "primary" : "inherit"}
        startIcon={editing ? <CheckIcon /> : <EditIcon />}
        onClick={() => setEditing((v) => !v)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        {editing ? "Done" : "Edit"}
      </Button>
    </Stack>
  );

  return (
    <Stack gap={1.5}>
      <FilterPanel
        open={filterOpen}
        filter={filter}
        onFilter={setFilter}
        onClose={() => setFilterOpen(false)}
        totalCols={42}
        teamCount={6}
      />
      <RosterTable
        mode="golden"
        grid={grid}
        emps={emps}
        editing={editing}
        brush={brush}
        painting={painting}
        dayTotals={dayTotals}
        filter={filter}
        onBrushChange={setBrush}
        onCellChange={setCell}
        headerActions={headerActions}
      />
      {showVal && <ValidationPanel grid={grid} emps={emps} />}
      <ExcelUploadModal
        open={upload}
        title="Upload Golden Set"
        subtitle="Import employee × 42-day shift matrix"
        onClose={() => setUpload(false)}
        onImport={(f: ParsedUpload) => {
          setUpload(false);
          setToast(`Imported "${f.name}" — ${f.rows} rows updated`);
        }}
      />
      <AnalyticsModal
        open={analytics}
        title="Golden Set Analytics"
        subtitle={`6-week cycle · ${emps.length} staff in scope`}
        grid={grid}
        emps={emps}
        from={0}
        len={42}
        dayLabels={Array.from(
          { length: 42 },
          (_, i) => `W${Math.floor(i / 7) + 1}${DOW[i % 7]}`,
        )}
        onClose={() => setAnalytics(false)}
      />
      <RosterToast toast={toast} onClose={() => setToast(null)} />
    </Stack>
  );
}

// ─── Week7PreviewScreen ──────────────────────────────────────────────────
export function Week7PreviewScreen({ teamId, subTeamId }: GridScreenProps) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const wkMon = useMemo(() => addDays(mondayOf(TODAY), 7 * 7), []);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(wkMon, i)),
    [wkMon],
  );
  const allEmps = useMemo(
    () => scopeEmployees(teamId, subTeamId),
    [teamId, subTeamId],
  );
  const [grid, setGrid] = useState(() => buildWeekGrid(EMPLOYEES));
  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState<ShiftCode>("G");
  const [upload, setUpload] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const painting = useRef(false);

  useEffect(() => {
    const up = () => {
      painting.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);
  useEffect(() => setLimit(10), [teamId, subTeamId]);

  const filteredEmps = useMemo(
    () => applyFilters(allEmps, grid, filter, 7),
    [allEmps, grid, filter],
  );
  const shown = filteredEmps.slice(0, limit);
  const activeCount = countActiveFilters(filter);
  const setCell = (id: string, day: number, code: ShiftCode) =>
    setGrid((prev) => ({
      ...prev,
      [id]: prev[id].map((c, i) => (i === day ? code : c)),
    }));
  const dayTotals = Array.from({ length: 7 }, (_, i) =>
    colCounts(grid, allEmps, i),
  );
  const weekTotal = spanCounts(grid, allEmps, 0, 7);
  const weekWork = workingTotal(weekTotal);

  const band = [
    {
      ico: <GroupIcon sx={{ fontSize: 20 }} />,
      val: allEmps.length,
      lbl: "Staff in Scope",
      color: "primary.main",
      bg: alpha(theme.palette.primary.main, 0.08),
    },
    {
      ico: <CalendarIcon sx={{ fontSize: 18 }} />,
      val: weekWork,
      lbl: "Working Shifts",
      color: SHIFT_COLORS.G.text,
      bg: mode === "dark" ? SHIFT_COLORS.G.bgDark : SHIFT_COLORS.G.bg,
    },
    {
      ico: <NightIcon sx={{ fontSize: 18 }} />,
      val: weekTotal.N,
      lbl: "Night Shifts",
      color: SHIFT_COLORS.N.text,
      bg: mode === "dark" ? SHIFT_COLORS.N.bgDark : SHIFT_COLORS.N.bg,
    },
    {
      ico: <PowerIcon sx={{ fontSize: 18 }} />,
      val: weekTotal.OFF,
      lbl: "OFF / Rest Days",
      color: SHIFT_COLORS.OFF.text,
      bg: mode === "dark" ? SHIFT_COLORS.OFF.bgDark : SHIFT_COLORS.OFF.bg,
    },
  ];

  const headerActions = (
    <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          px: 1.25,
          py: 0.5,
          width: 155,
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <SearchIcon sx={{ fontSize: 15, color: "text.secondary" }} />
        <InputBase
          placeholder="Search..."
          value={filter.query}
          onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
          sx={{ fontSize: 12, width: "100%" }}
        />
        {filter.query && (
          <IconButton
            size="small"
            onClick={() => setFilter((f) => ({ ...f, query: "" }))}
            sx={{ p: 0.25 }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        )}
      </Stack>
      <Badge badgeContent={activeCount || undefined} color="primary">
        <Button
          size="small"
          variant={filterOpen || activeCount > 0 ? "contained" : "outlined"}
          color={activeCount > 0 ? "primary" : "inherit"}
          startIcon={<TuneIcon />}
          onClick={() => setFilterOpen((v) => !v)}
          sx={{
            textTransform: "none",
            height: 32,
            fontSize: 12,
            borderRadius: "7px",
          }}
        >
          {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
        </Button>
      </Badge>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<DownloadIcon />}
        onClick={() => setUpload(true)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        Upload
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<InsightsIcon />}
        onClick={() => setAnalytics(true)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        Analytics
      </Button>
      <Button
        size="small"
        variant={editing ? "contained" : "outlined"}
        color={editing ? "primary" : "inherit"}
        startIcon={editing ? <CheckIcon /> : <EditIcon />}
        onClick={() => setEditing((v) => !v)}
        sx={{
          textTransform: "none",
          height: 32,
          fontSize: 12,
          borderRadius: "7px",
        }}
      >
        {editing ? "Done" : "Edit"}
      </Button>
    </Stack>
  );

  return (
    <Stack gap={2}>
    
     
      <FilterPanel
        open={filterOpen}
        filter={filter}
        onFilter={setFilter}
        onClose={() => setFilterOpen(false)}
        totalCols={7}
        teamCount={6}
      />

      <RosterTable
        mode="week7"
        grid={grid}
        emps={shown}
        allEmps={allEmps}
        editing={editing}
        brush={brush}
        painting={painting}
        dayTotals={dayTotals}
        days={days}
        filter={filter}
        onBrushChange={setBrush}
        onCellChange={setCell}
        headerActions={headerActions}
      />

      {filteredEmps.length > 10 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1.5}
          sx={{
            p: 1.25,
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
            bgcolor: "background.paper",
          }}
        >
          {limit < filteredEmps.length ? (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ExpandMoreIcon />}
              onClick={() => setLimit(filteredEmps.length)}
              sx={{ textTransform: "none", fontSize: 12, borderRadius: "6px" }}
            >
              Show all {filteredEmps.length}
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ExpandLessIcon />}
              onClick={() => setLimit(10)}
              sx={{ textTransform: "none", fontSize: 12, borderRadius: "6px" }}
            >
              Show fewer
            </Button>
          )}
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, color: "text.secondary" }}
          >
            Showing {shown.length} of {filteredEmps.length}
          </Typography>
        </Stack>
      )}

      <ExcelUploadModal
        open={upload}
        title="Upload Week 7 Roster"
        subtitle="Import employee × 7-day shift matrix"
        onClose={() => setUpload(false)}
        onImport={(f: ParsedUpload) => {
          setUpload(false);
          setToast(`Imported "${f.name}" — Week 7 updated`);
        }}
      />
      <AnalyticsModal
        open={analytics}
        title="Week 7 Analytics"
        subtitle={`ISO Week ${isoWeek(wkMon)} · ${allEmps.length} staff`}
        grid={grid}
        emps={allEmps}
        from={0}
        len={7}
        dayLabels={DOW}
        onClose={() => setAnalytics(false)}
      />
      <RosterToast toast={toast} onClose={() => setToast(null)} />
    </Stack>
  );
}

// ─── gridTableSx ─────────────────────────────────────────────────────────
export function gridTableSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === "dark";
  const headerBg = isDark ? "#1A2436" : "#F4F7FB";
  return {
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 12,
    width: "100%",
    "& th, & td": {
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderRight: `1px solid ${theme.palette.divider}`,
      whiteSpace: "nowrap",
    },
    "& thead th": {
      background: headerBg,
      position: "sticky",
      top: 0,
      zIndex: 3,
      padding: "7px 5px",
      fontWeight: 650,
      color: theme.palette.text.secondary,
      textAlign: "center",
      borderBottom: `1.5px solid ${theme.palette.divider}`,
    },
    "& .wkhead": {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: ".06em",
      textTransform: "uppercase",
    },
    "& .wkAlt": {
      background: isDark ? "rgba(24,95,165,0.1)" : "rgba(24,95,165,0.04)",
      color: theme.palette.primary.main,
    },
    "& .stick": {
      position: "sticky",
      left: 0,
      zIndex: 4,
      background: theme.palette.background.paper,
      textAlign: "left",
      padding: "6px 12px",
      boxShadow: isDark
        ? "4px 0 12px -4px rgba(0,0,0,0.4)"
        : "4px 0 10px -4px rgba(13,27,42,0.1)",
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    "& thead .stick": {
      zIndex: 6,
      background: headerBg,
      borderBottom: `1.5px solid ${theme.palette.divider}`,
    },
    "& tbody td.stick": {
      zIndex: 1,
      background: theme.palette.background.paper,
    },
    "& tbody tr:hover td": {
      background: isDark ? "rgba(255,255,255,0.018)" : "rgba(13,27,42,0.018)",
    },
    "& tbody tr:hover td.stick": { background: isDark ? "#1A2436" : "#F9FAFB" },
    "& td.gcell": { padding: "3px", textAlign: "center" },
    "& .wsep": {
      borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
    },
    "& .wkend": {
      background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
    },
    "& .gbtn": {
      width: 32,
      height: 26,
      border: "1px solid",
      borderRadius: "5px",
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 10.5,
      cursor: "default",
      padding: 0,
      userSelect: "none",
      // ── FIX: use transition on box-shadow + filter instead of transform ──
      transition: "box-shadow .12s ease, border-color .12s ease, filter .12s ease",
    },
    "& .gbtn.editing": { cursor: "pointer" },
    // ── FIX: replaced transform:scale(1.18) with ring + glow + brightness ──
    // transform:scale causes overflow clipping in scroll containers regardless
    // of z-index, because overflow:auto creates a new stacking context.
    // The ring+glow approach gives equally strong visual feedback without
    // requiring the element to escape its container bounds.
    "& .gbtn.editing:hover": {
      position: "relative",
      zIndex: 5,
      boxShadow: `0 0 0 2.5px ${theme.palette.primary.main}, 0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
      borderColor: `${theme.palette.primary.main} !important`,
      filter: "brightness(1.1) saturate(1.2)",
    },
    "& .sumcell": {
      fontFamily: MONO,
      fontWeight: 600,
      textAlign: "center",
      fontSize: 11,
      background: isDark ? "rgba(255,255,255,0.008)" : "rgba(0,0,0,0.006)",
      color: theme.palette.text.secondary,
      padding: "6px 8px",
    },
    "& .sumcell.first": {
      borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
    },
    "& thead th.sumhead": {
      background: headerBg,
      fontSize: 10,
      fontWeight: 700,
    },
    "& tfoot td": {
      position: "sticky",
      bottom: 0,
      background: headerBg,
      borderTop: `1.5px solid ${theme.palette.divider}`,
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 11,
      textAlign: "center",
      zIndex: 2,
      color: theme.palette.text.primary,
      padding: "7px 4px",
    },
    "& tfoot td.stick": {
      zIndex: 5,
      textAlign: "left",
      fontWeight: 600,
      color: theme.palette.text.secondary,
    },
  };
}