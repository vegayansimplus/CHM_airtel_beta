import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputBase,
  LinearProgress,
  Slider,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import GridIcon from "@mui/icons-material/GridOnOutlined";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  useLazyGetFutureWeekQuery,
  type FutureWeekRow,
} from "../api/rosterGenerationApiSlice";

// ─── Types ────────────────────────────────────────────────────────────────
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
  id: string; // olmid
  name: string;
  role: string; // roleCode
  level: "L1" | "L2" | "L3" | "L4";
}

interface GridScreenProps {
  subDomainId?: number;
}

interface FilterState {
  query: string;
  levels: string[];
  roles: string[];
  shiftCodes: ShiftCode[];
  sortField: SortField;
  sortDir: SortDir;
  workRange: [number, number];
  nightRange: [number, number];
  showHighLoad: boolean;
  showLowRest: boolean;
}

// ─── Constants (UI-only, no data) ────────────────────────────────────────
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const TOTAL_COLS = 7; // API returns exactly one week (W7D1–W7D7)
const DOW = ["M", "T", "W", "T", "F", "S", "S"] as const;
const DOW_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const TODAY = new Date();
const SHIFT_ORDER: ShiftCode[] = ["A", "B", "G", "LG", "N", "OFF"];
const ALL_LEVELS = ["L1", "L2", "L3", "L4"] as const;

const API_SHIFT_MAP: Record<string, ShiftCode> = {
  A: "A",
  B: "B",
  G: "G",
  LG: "LG",
  N: "N",
  OFF: "OFF",
  WO: "OFF",
  H: "G",
};
const toShiftCode = (raw: string): ShiftCode =>
  API_SHIFT_MAP[raw?.toUpperCase()] ?? "G";

// ─── Colour palettes ──────────────────────────────────────────────────────
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

// ─── Transform API rows → (emps, grid) ───────────────────────────────────
function buildFromApi(rows: FutureWeekRow[]): {
  emps: Employee[];
  grid: Record<string, ShiftCode[]>;
  allRoles: string[];
} {
  const emps: Employee[] = rows.map((row) => ({
    id: row.olmid,
    name: row.employeeName,
    role: row.roleCode,
    level: (ALL_LEVELS.includes(row.jobLevel as any)
      ? row.jobLevel
      : "L1") as Employee["level"],
  }));

  const grid: Record<string, ShiftCode[]> = {};
  rows.forEach((row) => {
    grid[row.olmid] = [
      toShiftCode(row.W7D1),
      toShiftCode(row.W7D2),
      toShiftCode(row.W7D3),
      toShiftCode(row.W7D4),
      toShiftCode(row.W7D5),
      toShiftCode(row.W7D6),
      toShiftCode(row.W7D7),
    ];
  });

  const allRoles = Array.from(new Set(rows.map((r) => r.roleCode)));
  return { emps, grid, allRoles };
}

// ─── Date helpers ─────────────────────────────────────────────────────────
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const mondayOf = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay() || 7;
  x.setDate(x.getDate() - day + 1);
  return x;
};
const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const isoWeek = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const ys = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - ys.getTime()) / 86400000 + 1) / 7);
};

// ─── Stat helpers ─────────────────────────────────────────────────────────
const emptyCounts = (): Record<ShiftCode, number> =>
  SHIFT_ORDER.reduce(
    (a, c) => ({ ...a, [c]: 0 }),
    {} as Record<ShiftCode, number>,
  );

const colCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  idx: number,
) =>
  emps.reduce((acc, e) => {
    const c = grid[e.id]?.[idx];
    if (c) acc[c]++;
    return acc;
  }, emptyCounts());

const spanCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  from: number,
  len: number,
) =>
  emps.reduce((acc, e) => {
    grid[e.id]?.slice(from, from + len).forEach((c) => {
      acc[c]++;
    });
    return acc;
  }, emptyCounts());

const workingTotal = (c: Record<ShiftCode, number>) =>
  SHIFT_ORDER.filter((x) => x !== "OFF").reduce((s, x) => s + c[x], 0);

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

// ─── Filter helpers ───────────────────────────────────────────────────────
const defaultFilter = (): FilterState => ({
  query: "",
  levels: [],
  roles: [],
  shiftCodes: [],
  sortField: "name",
  sortDir: "asc",
  workRange: [0, TOTAL_COLS],
  nightRange: [0, TOTAL_COLS],
  showHighLoad: false,
  showLowRest: false,
});

function applyFilters(
  emps: Employee[],
  grid: Record<string, ShiftCode[]>,
  f: FilterState,
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
    const row = grid[e.id] ?? [];
    const s = empSummary(row);
    if (s.work < f.workRange[0] || s.work > f.workRange[1]) return false;
    if (s.n < f.nightRange[0] || s.n > f.nightRange[1]) return false;
    if (f.showHighLoad && s.n <= 2) return false;
    if (f.showLowRest && s.off >= 3) return false;
    if (f.shiftCodes.length && !f.shiftCodes.every((c) => row.includes(c)))
      return false;
    return true;
  });

  result.sort((a, b) => {
    let vA: string | number = "";
    let vB: string | number = "";
    const rA = grid[a.id] ?? [];
    const sA = empSummary(rA);
    const rB = grid[b.id] ?? [];
    const sB = empSummary(rB);
    switch (f.sortField) {
      case "name":
        vA = a.name;
        vB = b.name;
        break;
      case "id":
        vA = a.id;
        vB = b.id;
        break;
      case "role":
        vA = a.role;
        vB = b.role;
        break;
      case "level":
        vA = a.level;
        vB = b.level;
        break;
      case "work":
        vA = sA.work;
        vB = sB.work;
        break;
      case "night":
        vA = sA.n;
        vB = sB.n;
        break;
      case "off":
        vA = sA.off;
        vB = sB.off;
        break;
      case "load":
        vA = sA.work / TOTAL_COLS;
        vB = sB.work / TOTAL_COLS;
        break;
    }
    const cmp =
      typeof vA === "number"
        ? vA - (vB as number)
        : String(vA).localeCompare(String(vB));
    return f.sortDir === "asc" ? cmp : -cmp;
  });
  return result;
}

function countActiveFilters(f: FilterState): number {
  const def = defaultFilter();
  let n = 0;
  if (f.query) n++;
  if (f.levels.length) n++;
  if (f.roles.length) n++;
  if (f.shiftCodes.length) n++;
  if (
    f.workRange[0] !== def.workRange[0] ||
    f.workRange[1] !== def.workRange[1]
  )
    n++;
  if (
    f.nightRange[0] !== def.nightRange[0] ||
    f.nightRange[1] !== def.nightRange[1]
  )
    n++;
  if (f.showHighLoad) n++;
  if (f.showLowRest) n++;
  return n;
}

// ─── Shared sx helpers ────────────────────────────────────────────────────
const stickyColSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  position: "sticky",
  left: 0,
  zIndex: 4,
  background: theme.palette.background.paper,
  textAlign: "left",
  whiteSpace: "nowrap",
  boxShadow: isDark
    ? "4px 0 12px -4px rgba(0,0,0,0.4)"
    : "4px 0 10px -4px rgba(13,27,42,0.1)",
  borderRight: `1px solid ${theme.palette.divider}`,
});

const stickyHeadColSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  ...stickyColSx(theme, isDark),
  zIndex: 6,
  background: isDark ? "#1A2436" : "#F4F7FB",
  borderBottom: `1.5px solid ${theme.palette.divider}`,
});

const sumCellSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  fontFamily: MONO,
  fontWeight: 600,
  textAlign: "center",
  fontSize: 11,
  background: isDark ? "rgba(255,255,255,0.008)" : "rgba(0,0,0,0.006)",
  color: theme.palette.text.secondary,
  padding: "6px 8px",
  whiteSpace: "nowrap",
});

const sumCellFirstSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  ...sumCellSx(theme, isDark),
  borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
});

const wsepSx = (theme: Theme): SxProps<Theme> => ({
  borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
});

const headerBgSx = (isDark: boolean): SxProps<Theme> => ({
  background: isDark ? "#1A2436" : "#F4F7FB",
  position: "sticky",
  top: 0,
  zIndex: 3,
  padding: "7px 4px",
  fontWeight: 650,
  textAlign: "center",
  fontSize: 11,
  whiteSpace: "nowrap",
  borderBottom: "none",
  minWidth: 56,
  width: 56,
});

const wkendSx = (isDark: boolean): SxProps<Theme> => ({
  background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
});

// ─── Small reusable UI pieces ─────────────────────────────────────────────
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
    .slice(0, 2)
    .toUpperCase();
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

// ─── Filter Panel ─────────────────────────────────────────────────────────
function FilterPanel({
  open,
  filter,
  onFilter,
  onClose,
  availableRoles = [],
}: {
  open: boolean;
  filter: FilterState;
  onFilter: (f: FilterState) => void;
  onClose: () => void;
  availableRoles?: string[];
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [local, setLocal] = useState<FilterState>(filter);

  useEffect(() => {
    setLocal(filter);
  }, [filter, open]);

  const update = (patch: Partial<FilterState>) =>
    setLocal((p) => ({ ...p, ...patch }));
  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  const toggleShift = (code: ShiftCode) =>
    update({
      shiftCodes: local.shiftCodes.includes(code)
        ? local.shiftCodes.filter((c) => c !== code)
        : [...local.shiftCodes, code],
    });

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
        {/* Header */}
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

        {/* Grid */}
        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4,1fr)",
            },
            gap: 2,
          }}
        >
          {/* Level */}
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

          {/* Role — built from actual API data */}
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
            <Stack gap={0.5} sx={{ maxHeight: 200, overflow: "auto" }}>
              {availableRoles.map((role) => {
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
              {availableRoles.length === 0 && (
                <Typography
                  sx={{ fontSize: 11, color: "text.disabled", py: 1 }}
                >
                  No roles loaded
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Has Shift */}
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

          {/* Ranges */}
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
              max={TOTAL_COLS}
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
              max={TOTAL_COLS}
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
              Quick Flags
            </Typography>
            <Stack gap={0.5}>
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
                    High night load (&gt;2)
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
                    Low rest (&lt;3 OFF)
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </Box>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap={1}
          sx={{
            px: 2,
            py: 1.25,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: isDark
              ? "rgba(255,255,255,0.008)"
              : "rgba(13,27,42,0.008)",
          }}
        >
          <Button
            size="small"
            onClick={onClose}
            sx={{
              fontSize: 12,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onFilter(local);
              onClose();
            }}
            sx={{ fontSize: 12, textTransform: "none" }}
          >
            Apply filters
          </Button>
        </Stack>
      </Card>
    </Collapse>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function GridScreen({ subDomainId }: GridScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── API ──────────────────────────────────────────────────────────────
  const parsedSubDomainId =
    typeof subDomainId === "string" ? parseInt(subDomainId, 10) : (subDomainId ?? 0);
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useLazyGetFutureWeekQuery({ subDomainId:parsedSubDomainId });

  // ── Derived data from API (memoised) ──────────────────────────────────
  const { emps, grid, allRoles, weekStart } = useMemo(() => {
    const rows = apiData?.data ?? [];
    const built = buildFromApi(rows);

    // Compute week start from the first row's isoWeek/isoYear if available
    let wStart = mondayOf(TODAY);
    if (rows.length > 0 && rows[0].isoYear && rows[0].isoWeek) {
      // Jan 4 is always in week 1 — use it to anchor
      const jan4 = new Date(rows[0].isoYear, 0, 4);
      const jan4Mon = mondayOf(jan4);
      wStart = addDays(jan4Mon, (rows[0].isoWeek - 1) * 7);
    }

    return { ...built, weekStart: wStart };
  }, [apiData]);

  const dates = useMemo(
    () => Array.from({ length: TOTAL_COLS }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // ── UI state ──────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  // Reset filter ranges when data changes
  useEffect(() => {
    setFilter((f) => ({
      ...f,
      workRange: [0, TOTAL_COLS],
      nightRange: [0, TOTAL_COLS],
    }));
  }, [apiData]);

  const filteredEmps = useMemo(
    () => applyFilters(emps, grid, filter),
    [emps, grid, filter],
  );
  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  // ── Sort chip ─────────────────────────────────────────────────────────
  const cycleSortField = (field: SortField) =>
    setFilter((f) => ({
      ...f,
      sortField: field,
      sortDir: f.sortField === field && f.sortDir === "asc" ? "desc" : "asc",
    }));

  const SortChip = ({ field, label }: { field: SortField; label: string }) => {
    const active = filter.sortField === field;
    return (
      <Chip
        size="small"
        label={
          <Stack direction="row" alignItems="center" gap={0.4}>
            {active && (
              <SwapVertIcon
                sx={{
                  fontSize: 12,
                  transform:
                    filter.sortDir === "desc"
                      ? "rotate(0deg)"
                      : "rotate(180deg)",
                  transition: "transform 0.2s",
                }}
              />
            )}
            <span>{label}</span>
          </Stack>
        }
        onClick={() => cycleSortField(field)}
        sx={{
          height: 28,
          fontSize: 12,
          fontWeight: active ? 700 : 500,
          cursor: "pointer",
          bgcolor: active
            ? isDark
              ? "primary.dark"
              : "#1A3A6B"
            : "transparent",
          color: active ? "#fff" : "text.secondary",
          border: "1px solid",
          borderColor: active
            ? isDark
              ? "primary.dark"
              : "#1A3A6B"
            : "divider",
          borderRadius: "7px",
          "& .MuiChip-label": { px: 1.25 },
          "&:hover": {
            bgcolor: active
              ? isDark
                ? "primary.dark"
                : "#14306A"
              : alpha(theme.palette.text.primary, 0.04),
          },
        }}
      />
    );
  };

  // ── Per-column helpers ────────────────────────────────────────────────
  const renderDayHeader = (colIdx: number) => {
    const date = dates[colIdx];
    const dow = colIdx % 7;
    const isSat = dow === 5;
    const isSun = dow === 6;
    const isWkend = isSat || isSun;
    const isToday = date.toDateString() === TODAY.toDateString();
    return (
      <TableCell
        key={colIdx}
        sx={{
          ...headerBgSx(isDark),
          ...(isWkend && wkendSx(isDark)),
          ...(isSat && wsepSx(theme)),
          position: "sticky",
          top: 0,
          zIndex: 3,
          ...(isToday && {
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 20,
              height: 2,
              borderRadius: 1,
              bgcolor: "primary.main",
            },
          }),
        }}
      >
        <Stack alignItems="center" gap={0.25}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: isWkend ? 700 : 650,
              lineHeight: 1,
              color: isWkend
                ? isDark
                  ? "#FBBF24"
                  : "#B25E00"
                : "text.secondary",
            }}
          >
            {DOW[dow]}
          </Typography>
          <Typography
            sx={{
              fontSize: 9.5,
              fontWeight: 500,
              lineHeight: 1,
              color: isToday ? "primary.main" : "text.disabled",
            }}
          >
            {fmtShort(date)}
          </Typography>
        </Stack>
      </TableCell>
    );
  };

  const renderShiftCell = (emp: Employee, colIdx: number) => {
    const dow = colIdx % 7;
    const isSat = dow === 5;
    const isWkend = dow === 5 || dow === 6;
    const isToday = dates[colIdx].toDateString() === TODAY.toDateString();
    const code = grid[emp.id]?.[colIdx] ?? "G";
    return (
      <TableCell
        key={colIdx}
        sx={{
          textAlign: "center",
          padding: "6px 4px",
          ...(isWkend && wkendSx(isDark)),
          ...(isSat && wsepSx(theme)),
          ...(isToday && {
            bgcolor: isDark
              ? "rgba(59,130,246,0.04)"
              : "rgba(59,130,246,0.025)",
          }),
          minWidth: 56,
          width: 56,
        }}
      >
        <Tooltip title={`${SHIFT_COLORS[code].label} · ${DOW_LONG[dow]}`} arrow>
          <Box>
            <ShiftBadge code={code} />
          </Box>
        </Tooltip>
      </TableCell>
    );
  };

  const renderFooterCell = (colIdx: number) => {
    const dow = colIdx % 7;
    const isSat = dow === 5;
    const isWkend = dow === 5 || dow === 6;
    const counts = colCounts(grid, filteredEmps, colIdx);
    const total = workingTotal(counts);
    return (
      <TableCell
        key={colIdx}
        sx={{
          ...sumCellFirstSx(theme, isDark),
          ...(isWkend && wkendSx(isDark)),
          ...(isSat && wsepSx(theme)),
          minWidth: 56,
          width: 56,
        }}
      >
        <Stack alignItems="center" gap={0.25}>
          <Typography
            sx={{ fontSize: 10, fontWeight: 700, color: "text.primary" }}
          >
            {total}
          </Typography>
          <Typography sx={{ fontSize: 9, color: "text.disabled" }}>
            /{filteredEmps.length}
          </Typography>
        </Stack>
      </TableCell>
    );
  };

  // ── Error state ───────────────────────────────────────────────────────
  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 40, color: "error.main" }} />
        <Typography
          sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}
        >
          Failed to load roster
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {(error as any)?.data?.message ?? "Check network or API."}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={() => refetch()}
          sx={{ textTransform: "none" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* ═══════════ TOOLBAR ═══════════════════════════════════════════ */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          boxShadow: isDark
            ? "0 2px 8px -2px rgba(0,0,0,0.4)"
            : "0 2px 8px -2px rgba(13,27,42,0.08)",
        }}
      >
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            px: 1.25,
            py: 0.5,
            minWidth: 190,
            flexShrink: 0,
          }}
        >
          <SearchIcon sx={{ fontSize: 15, color: "text.secondary" }} />
          <InputBase
            placeholder="Search name, ID, role…"
            value={filter.query}
            onChange={(e) =>
              setFilter((f) => ({ ...f, query: e.target.value }))
            }
            sx={{ fontSize: 12.5, flex: 1, "& input": { p: 0 } }}
          />
          {filter.query && (
            <IconButton
              size="small"
              sx={{ p: 0.25 }}
              onClick={() => setFilter((f) => ({ ...f, query: "" }))}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        {/* Filter chip */}
        <Chip
          icon={<TuneIcon sx={{ fontSize: 14, ml: 0.5 }} />}
          label={
            activeFilterCount > 0 ? (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <span>Filters</span>
                <Box
                  sx={{
                    display: "inline-grid",
                    placeItems: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </Box>
              </Stack>
            ) : (
              "Filters"
            )
          }
          onClick={() => setFilterOpen((v) => !v)}
          sx={{
            height: 28,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            border: "1px solid",
            borderColor: activeFilterCount > 0 ? "primary.main" : "divider",
            bgcolor:
              activeFilterCount > 0
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            color: activeFilterCount > 0 ? "primary.main" : "text.secondary",
            borderRadius: "7px",
            "& .MuiChip-label": { px: 1.25 },
          }}
        />

        {/* Sort chips */}
        <SortChip field="name" label="Name" />
        <SortChip field="work" label="Work" />
        <SortChip field="night" label="Night" />

        <Box flex={1} />

        {/* Week info */}
        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mr: 0.5 }}>
          <GridIcon sx={{ fontSize: 13, color: "text.disabled" }} />
          <Typography
            sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}
          >
            Wk {isoWeek(weekStart)} · {fmtShort(weekStart)} –{" "}
            {fmtShort(addDays(weekStart, 6))}
          </Typography>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        {/* Analytics */}
        <Button
          size="small"
          startIcon={<InsightsIcon sx={{ fontSize: 16 }} />}
          onClick={() => setAnalyticsOpen(true)}
          sx={{
            textTransform: "none",
            fontSize: 12.5,
            fontWeight: 500,
            color: "text.primary",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            px: 1.5,
            py: 0.5,
            "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) },
          }}
        >
          Analytics
        </Button>

        {/* Edit */}
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
          onClick={() => setEditOpen(true)}
          sx={{
            textTransform: "none",
            fontSize: 12.5,
            fontWeight: 700,
            color: "text.primary",
            border: `1.5px solid ${theme.palette.text.primary}`,
            borderRadius: "8px",
            px: 1.5,
            py: 0.5,
            "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) },
          }}
        >
          Edit
        </Button>

        {/* Download */}
        <Tooltip title="Download CSV" arrow>
          <IconButton
            size="small"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "7px",
              p: "5px",
            }}
            onClick={() => {
              const rows = filteredEmps.map((e) => {
                const shifts = grid[e.id] ?? [];
                return [e.id, e.name, e.role, e.level, ...shifts].join(",");
              });
              const csv = [
                "ID,Name,Role,Level,D1,D2,D3,D4,D5,D6,D7",
                ...rows,
              ].join("\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([csv], { type: "text/csv" }),
              );
              a.download = `roster-wk${isoWeek(weekStart)}.csv`;
              a.click();
              setSnack("CSV downloaded");
            }}
          >
            <DownloadIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {/* Refresh */}
        <Tooltip title="Refresh" arrow>
          <IconButton
            size="small"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "7px",
              p: "5px",
            }}
            onClick={() => {
              refetch();
              setSnack("Refreshed");
            }}
          >
            <RestartAltIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filter panel */}
      <Box sx={{ px: 2, flexShrink: 0 }}>
        <FilterPanel
          open={filterOpen}
          filter={filter}
          onFilter={setFilter}
          onClose={() => setFilterOpen(false)}
          availableRoles={allRoles || []}
        />
      </Box>

      {/* Legend + count bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ShiftLegend />
        <Box flex={1} />
        <Stack direction="row" alignItems="center" gap={0.75}>
          <LayersIcon sx={{ fontSize: 13, color: "text.disabled" }} />
          <Typography
            sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}
          >
            {filteredEmps.length} / {emps.length} employees
          </Typography>
        </Stack>
      </Box>

      {/* ═══════════ GRID TABLE ════════════════════════════════════════ */}
      <TableContainer sx={{ flex: 1, overflow: "auto", maxHeight:`calc(100vh - 310px)`,position: "relative" }}>
        <Table
          stickyHeader
          size="small"
          sx={{
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          {/* Column widths */}
          <colgroup>
            <col style={{ width: 220, minWidth: 220 }} />
            {Array.from({ length: TOTAL_COLS }).map((_, i) => (
              <col key={i} style={{ width: 56, minWidth: 56 }} />
            ))}
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 48, minWidth: 48 }} />
          </colgroup>

          <TableHead>
            <TableRow>
              {/* Sticky employee header */}
              <TableCell sx={{ ...stickyHeadColSx(theme, isDark), top: 0 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <PersonIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    Employee
                  </Typography>
                </Stack>
              </TableCell>

              {/* Day headers */}
              {Array.from({ length: TOTAL_COLS }).map((_, i) =>
                renderDayHeader(i),
              )}

              {/* Summary headers */}
              {(["W", "N", "OFF"] as const).map((lbl, i) => (
                <TableCell
                  key={lbl}
                  sx={{
                    ...headerBgSx(isDark),
                    top: 0,
                    ...(i === 0 && {
                      borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    }),
                    minWidth: 48,
                    width: 48,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  >
                    {lbl}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredEmps.map((emp, rowIdx) => {
              const row = grid[emp.id] ?? [];
              const { work, n, off } = empSummary(row);
              const loadPct = Math.round((work / TOTAL_COLS) * 100);
              const isEven = rowIdx % 2 === 0;
              return (
                <TableRow
                  key={emp.id}
                  hover
                  sx={{
                    bgcolor: isEven
                      ? "transparent"
                      : isDark
                        ? "rgba(255,255,255,0.012)"
                        : "rgba(0,0,0,0.008)",
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(13,27,42,0.025)",
                    },
                  }}
                >
                  {/* Sticky employee cell */}
                  <TableCell sx={{ ...stickyColSx(theme, isDark), py: 0.75 }}>
                    <EmployeeCell employee={emp} accent={rowIdx === 0} />
                  </TableCell>

                  {/* Shift cells */}
                  {Array.from({ length: TOTAL_COLS }).map((_, ci) =>
                    renderShiftCell(emp, ci),
                  )}

                  {/* Summary: Work */}
                  <TableCell
                    sx={{
                      ...sumCellFirstSx(theme, isDark),
                      borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    }}
                  >
                    <Tooltip title={`${loadPct}% load`} arrow>
                      <Stack alignItems="center" gap={0.3}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {work}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={loadPct}
                          sx={{
                            width: 28,
                            height: 3,
                            borderRadius: 2,
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": {
                              bgcolor:
                                loadPct > 85
                                  ? "#EF4444"
                                  : loadPct > 70
                                    ? "#F59E0B"
                                    : "#10B981",
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Stack>
                    </Tooltip>
                  </TableCell>

                  {/* Night */}
                  <TableCell sx={sumCellSx(theme, isDark)}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: n > 2 ? "#EF4444" : "text.secondary",
                      }}
                    >
                      {n}
                    </Typography>
                  </TableCell>

                  {/* Off */}
                  <TableCell sx={sumCellSx(theme, isDark)}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {off}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Empty state */}
            {filteredEmps.length === 0 && emps.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLS + 4}
                  sx={{ textAlign: "center", py: 6 }}
                >
                  <Stack alignItems="center" gap={1}>
                    <SearchIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      No employees match the current filters
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setFilter(defaultFilter())}
                      sx={{ textTransform: "none", fontSize: 12 }}
                    >
                      Clear filters
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {/* No data state */}
            {emps.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLS + 4}
                  sx={{ textAlign: "center", py: 6 }}
                >
                  <Stack alignItems="center" gap={1}>
                    <LayersIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      No roster data for this week
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Footer */}
          <TableFooter>
            <TableRow>
              <TableCell
                sx={{
                  ...stickyColSx(theme, isDark),
                  ...sumCellSx(theme, isDark),
                  zIndex: 4,
                  borderTop: `2px solid ${theme.palette.divider}`,
                  textAlign: "left",
                  py: 1,
                }}
              >
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <GridIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    Daily coverage
                  </Typography>
                </Stack>
              </TableCell>

              {Array.from({ length: TOTAL_COLS }).map((_, i) =>
                renderFooterCell(i),
              )}

              {(["work", "n", "off"] as const).map((key, i) => {
                const total = filteredEmps.reduce(
                  (sum, e) => sum + empSummary(grid[e.id] ?? [])[key],
                  0,
                );
                return (
                  <TableCell
                    key={key}
                    sx={{
                      ...sumCellSx(theme, isDark),
                      ...(i === 0 && {
                        borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                      }),
                      borderTop: `2px solid ${theme.palette.divider}`,
                      fontWeight: 700,
                      fontSize: 11,
                      color: "text.primary",
                    }}
                  >
                    {total}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* ═══════════ ANALYTICS DIALOG ══════════════════════════════════ */}
      <Dialog
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <InsightsIcon sx={{ fontSize: 18 }} />
            Analytics — Week {isoWeek(weekStart)}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {/* Shift distribution */}
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
            Shift distribution
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 1.5,
              mb: 3,
            }}
          >
            {SHIFT_ORDER.map((code) => {
              const counts = spanCounts(grid, filteredEmps, 0, TOTAL_COLS);
              const c = SHIFT_COLORS[code];
              const total = filteredEmps.length * TOTAL_COLS || 1;
              return (
                <Box
                  key={code}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    bgcolor: isDark ? c.bgDark : c.bg,
                    border: `1px solid ${alpha(c.solid, 0.2)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isDark ? c.textDark : c.text,
                      mb: 0.25,
                    }}
                  >
                    {c.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: isDark ? c.textDark : c.text,
                      lineHeight: 1,
                    }}
                  >
                    {counts[code]}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: isDark ? c.textDark : c.text,
                      opacity: 0.7,
                      mt: 0.25,
                    }}
                  >
                    {Math.round((counts[code] / total) * 100)}% of slots
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Level breakdown */}
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
            Level breakdown
          </Typography>
          <Stack gap={0.75}>
            {ALL_LEVELS.map((lv) => {
              const count = filteredEmps.filter((e) => e.level === lv).length;
              const pct = filteredEmps.length
                ? Math.round((count / filteredEmps.length) * 100)
                : 0;
              const c = LEVEL_COLORS[lv];
              return (
                <Stack key={lv} direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 28 }}>
                    <LevelBadge level={lv} />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: c.solid,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "text.secondary",
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {count} ({pct}%)
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setAnalyticsOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ EDIT DIALOG ═══════════════════════════════════════ */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>
          Edit Roster
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Connect your mutation endpoint here. Selected week: Wk{" "}
            {isoWeek(weekStart)}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setEditOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setEditOpen(false);
              setSnack("Changes saved");
            }}
            sx={{ textTransform: "none" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ SNACKBAR ══════════════════════════════════════════ */}
      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnack(null)}
          sx={{ fontSize: 13 }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
