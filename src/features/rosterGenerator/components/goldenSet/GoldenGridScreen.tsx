import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  alpha,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  LinearProgress,
  Popover,
  Checkbox,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  type Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import RosterFilterDrawer, {
  type FilterState,
  type SortConfig,
  type SortField,
} from "./RosterFilterDrawer";

// ── Icons ─────────────────────────────────────────────────────────────────────
import BarChartIcon from "@mui/icons-material/BarChart";
import BrushIcon from "@mui/icons-material/Brush";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import RedoIcon from "@mui/icons-material/Redo";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";

import type { GoldenSetApiRow } from "../../types/goldenSet.types";
import {
  useGetGoldenSetQuery,
  useUpdateDailyGoldenSetMutation,
  type DailyGoldenSetPayload,
} from "../../api/rosterGenerationApiSlice";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface GoldenSetEmployee {
  prefId: number;
  name: string;
  olmid: string;
  role: string;
  level: string;
  shifts: string[];
}

type EditMode = "select" | "drag" | "week";

interface HistoryEntry {
  grid: Record<number, string[]>;
}

interface ShiftColor {
  background: string;
  color: string;
  border: string;
}

interface LevelMeta {
  bg: string;
  text: string;
  solid: string;
}

interface ShiftSummary {
  work: number;
  night: number;
  off: number;
  loadPct: number;
}

interface TabColorTokens {
  isDark: boolean;
  accent: string;
  accentDim: string;
  accentBorder: string;
  success: string;
  successDim: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  border: string;
  surface: string;
  surface2: string;
  bg: string;
  radius: string;
  radiusL: string;
  radiusXL: string;
}

interface GoldenGridScreenProps {
  teamId?: number | string;
  subTeamId?: number | string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
function useTabColorTokens(theme: Theme): TabColorTokens {
  const isDark = theme.palette.mode === "dark";
  return {
    isDark,
    accent: theme.palette.primary.main,
    accentDim: alpha(theme.palette.primary.main, 0.08),
    accentBorder: alpha(theme.palette.primary.main, 0.35),
    success: theme.palette.success.main,
    successDim: alpha(theme.palette.success.main, 0.08),
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textDim: alpha(theme.palette.text.secondary, 0.6),
    border: theme.palette.divider,
    surface: theme.palette.background.paper,
    surface2: isDark ? "rgba(255,255,255,0.04)" : "rgba(13,27,42,0.028)",
    bg: theme.palette.background.default,
    radius: "8px",
    radiusL: "12px",
    radiusXL: "16px",
  };
}

const TOTAL_COLS = 42;
const CELL_W = 42;
const CELL_H = 28;
const EMP_COL_W = 240;
const AVATAR = 28;
const MONO = "'Roboto Mono', 'Fira Mono', monospace";


const WEEK_ROW_H = 38; 
const DAY_ROW_TOP = WEEK_ROW_H;

const DOW_SHORT: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DOW_LONG: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SHIFT_CODES: string[] = ["G", "N", "A", "B", "L", "W", "H", "C", "Leave"];

const SHIFT_META: Record<string, { label: string }> = {
  G: { label: "General" },
  N: { label: "Night" },
  A: { label: "Afternoon" },
  B: { label: "Early" },
  L: { label: "Late" },
  W: { label: "Week Off" },
  H: { label: "Holiday" },
  C: { label: "Comp Off" },
  Leave: { label: "Leave" },
};

const LEVEL_META: Record<string, LevelMeta> = {
  L1: { bg: "#EFF6FF", text: "#1D4ED8", solid: "#3B82F6" },
  L2: { bg: "#F0FDF4", text: "#15803D", solid: "#22C55E" },
  L3: { bg: "#FFF7ED", text: "#C2410C", solid: "#F97316" },
  L4: { bg: "#FDF4FF", text: "#7E22CE", solid: "#A855F7" },
};

const shiftColorMap = new Map<string, ShiftColor>([
  ["Leave", { background: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" }],
  [
    "New Joinee",
    { background: "#FFFBEB", color: "#92400E", border: "#FCD34D" },
  ],
  ["N", { background: "#EEF2FF", color: "#3730A3", border: "#818CF8" }],
  ["A", { background: "#F5F3FF", color: "#6B21A8", border: "#C4B5FD" }],
  ["B", { background: "#ECFEFF", color: "#155E75", border: "#67E8F9" }],
  ["G", { background: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" }],
  ["L", { background: "#ECFDF5", color: "#065F46", border: "#6EE7B7" }],
  ["W", { background: "#F8FAFC", color: "#475569", border: "#CBD5E1" }],
  ["H", { background: "#FFF7ED", color: "#C2410C", border: "#FDBA74" }],
  ["C", { background: "#F1F5F9", color: "#475569", border: "#CBD5E1" }],
]);

const DEFAULT_SHIFT_COLOR: ShiftColor = {
  background: "#EFF6FF",
  color: "#1D4ED8",
  border: "#93C5FD",
};

const EDIT_MODES: {
  id: EditMode;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
}[] = [
  {
    id: "select",
    label: "Row select",
    icon: <CheckBoxOutlineBlankIcon sx={{ fontSize: 13 }} />,
    tooltip: "Select rows and apply shifts in bulk",
  },
  {
    id: "drag",
    label: "Free paint",
    icon: <BrushIcon sx={{ fontSize: 13 }} />,
    tooltip: "Click or drag cells to paint shifts",
  },
  {
    id: "week",
    label: "Week override",
    icon: <CalendarViewWeekIcon sx={{ fontSize: 13 }} />,
    tooltip: "Right-click a week header to override all 7 days",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getShiftColor(code: string): ShiftColor {
  if (!code) return DEFAULT_SHIFT_COLOR;
  return (
    shiftColorMap.get(code) ?? shiftColorMap.get(code[0]) ?? DEFAULT_SHIFT_COLOR
  );
}

function transformApiRowToEmployee(row: GoldenSetApiRow): GoldenSetEmployee {
  const shifts: string[] = [];
  for (let week = 1; week <= 6; week++) {
    for (let day = 1; day <= 7; day++) {
      const key = `W${week}D${day}` as keyof GoldenSetApiRow;
      const shiftCode = row[key];
      shifts.push(typeof shiftCode === "string" ? shiftCode : "");
    }
  }
  return {
    prefId: row.prefId,
    name: row.employeeName,
    olmid: row.olmid,
    role: row.employeeRoll,
    level: row.employeeLevel,
    shifts,
  };
}

function transformApiDataToEmployees(
  apiRows: GoldenSetApiRow[],
): GoldenSetEmployee[] {
  return apiRows.map(transformApiRowToEmployee);
}

function buildDailyGoldenSetPayload(
  emp: GoldenSetEmployee,
): DailyGoldenSetPayload {
  const fields: Record<string, string> = {};
  for (let w = 1; w <= 6; w++) {
    for (let d = 1; d <= 7; d++) {
      const idx = (w - 1) * 7 + (d - 1);
      const code = emp.shifts[idx] ?? "W";
      fields[`W${w}D${d}`] = code;
    }
  }
  return { userId: emp.prefId, ...fields } as DailyGoldenSetPayload;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function summarise(shifts: string[]): ShiftSummary {
  const work = shifts.filter(
    (s) => !["W", "H", "C", "Leave"].includes(s),
  ).length;
  const night = shifts.filter((s) => s === "N").length;
  const off = shifts.filter((s) => ["W", "H", "C"].includes(s)).length;
  const loadPct = Math.round((work / TOTAL_COLS) * 100);
  return { work, night, off, loadPct };
}

function workingCount(counts: Record<string, number>): number {
  return Object.entries(counts)
    .filter(([k]) => !["W", "H", "C", "Leave"].includes(k))
    .reduce((a, [, v]) => a + v, 0);
}

function colTotals(
  emps: GoldenSetEmployee[],
  idx: number,
): Record<string, number> {
  const map: Record<string, number> = {};
  emps.forEach((e) => {
    const code = e.shifts[idx] ?? "";
    map[code] = (map[code] ?? 0) + 1;
  });
  return map;
}

function spanTotals(
  emps: GoldenSetEmployee[],
  from: number,
  to: number,
): Record<string, number> {
  const map: Record<string, number> = {};
  emps.forEach((e) => {
    e.shifts.slice(from, to).forEach((code) => {
      map[code] = (map[code] ?? 0) + 1;
    });
  });
  return map;
}

const defaultFilter = (): FilterState => ({
  query: "",
  levels: [],
  roles: [],
  shiftCodes: [],
  workRange: [0, TOTAL_COLS],
  nightRange: [0, TOTAL_COLS],
  showHighLoad: false,
  showLowRest: false,
});

// ── Sub-components ────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: string }) {
  const c: LevelMeta = LEVEL_META[level] ?? {
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
        border: `1px solid ${alpha(c.solid, 0.25)}`,
        letterSpacing: "0.03em",
        flexShrink: 0,
      }}
    >
      {level}
    </Box>
  );
}

function ShiftPill({
  code,
  size = "md",
  onClick,
  active,
}: {
  code: string;
  size?: "sm" | "md";
  onClick?: () => void;
  active?: boolean;
}) {
  const sc = getShiftColor(code);
  return (
    <Box
      component={onClick ? "button" : "span"}
      onClick={onClick}
      sx={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: size === "sm" ? 30 : 36,
        height: size === "sm" ? 22 : 26,
        px: 0.75,
        borderRadius: "6px",
        fontFamily: MONO,
        fontSize: size === "sm" ? 10 : 11,
        fontWeight: 700,
        border: "1.5px solid",
        borderColor: active ? sc.border : alpha(sc.border, 0.5),
        bgcolor: sc.background,
        color: sc.color,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
        boxShadow: active ? `0 0 0 2.5px ${alpha(sc.border, 0.4)}` : "none",
        "&:hover": onClick
          ? { borderColor: sc.border, filter: "brightness(0.96)" }
          : undefined,
      }}
    >
      {code}
    </Box>
  );
}

function EmployeeCell({
  emp,
  isEditing,
}: {
  emp: GoldenSetEmployee;
  isEditing?: boolean;
}) {
  const theme = useTheme();
  const tk = useTabColorTokens(theme);
  const inits = initials(emp.name);
  return (
    <Stack direction="row" alignItems="center" gap={1.1} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: tk.radius,
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          fontSize: 10.5,
          letterSpacing: "0.02em",
          flexShrink: 0,
          bgcolor: isEditing
            ? tk.accentDim
            : alpha(theme.palette.text.primary, 0.05),
          color: isEditing ? tk.accent : tk.textSecondary,
          border: "1.5px solid",
          borderColor: isEditing ? tk.accentBorder : "transparent",
          transition: "all 0.2s",
        }}
      >
        {inits}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 650,
              lineHeight: 1.15,
              color: tk.textPrimary,
            }}
            noWrap
          >
            {emp.name}
          </Typography>
          <LevelBadge level={emp.level} />
        </Stack>
        <Typography
          sx={{
            fontSize: 9.5,
            color: tk.textSecondary,
            fontWeight: 500,
            mt: 0.1,
            lineHeight: 1.2,
          }}
          noWrap
        >
          {emp.olmid} · {emp.role.replace(/_/g, " ")}
        </Typography>
      </Box>
    </Stack>
  );
}

function ShiftLegend() {
  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
      {SHIFT_CODES.map((code) => (
        <Tooltip key={code} title={SHIFT_META[code]?.label ?? code} arrow>
          <Box>
            <ShiftPill code={code} />
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}

// ── BrushBar (drag mode) ──────────────────────────────────────────────────────
function BrushBar({
  brush,
  onSelect,
}: {
  brush: string;
  onSelect: (c: string) => void;
}) {
  const theme = useTheme();
  const tk = useTabColorTokens(theme);
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      flexWrap="wrap"
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: `1px solid ${tk.border}`,
        bgcolor: tk.isDark ? "rgba(24,95,165,0.06)" : "rgba(24,95,165,0.025)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: "6px",
          bgcolor: tk.accentDim,
          border: `1px solid ${tk.accentBorder}`,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: tk.accent,
            animation: "tkPulse 2s infinite",
          }}
        />
        <Typography
          sx={{
            fontSize: 11,
            color: tk.accent,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          PAINT MODE
        </Typography>
      </Box>
      <Stack direction="row" gap={0.75} flexWrap="wrap">
        {SHIFT_CODES.map((code) => (
          <ShiftPill
            key={code}
            code={code}
            active={brush === code}
            onClick={() => onSelect(code)}
          />
        ))}
      </Stack>
      <Typography
        sx={{
          ml: "auto",
          fontSize: 10.5,
          color: tk.textDim,
          fontStyle: "italic",
          display: { xs: "none", md: "block" },
        }}
      >
        Click or drag cells · hotkeys: G N A B L W H C
      </Typography>
    </Stack>
  );
}

// ── Analytics Modal ───────────────────────────────────────────────────────────
function AnalyticsModal({
  open,
  emps,
  onClose,
}: {
  open: boolean;
  emps: GoldenSetEmployee[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const tk = useTabColorTokens(theme);

  const totals = useMemo(() => spanTotals(emps, 0, TOTAL_COLS), [emps]);
  const totalShifts = Object.values(totals).reduce((a, b) => a + b, 0);
  const busiestDay = useMemo(
    () =>
      Array.from({ length: TOTAL_COLS }, (_, i) => ({
        label: `W${Math.floor(i / 7) + 1} ${DOW_LONG[i % 7]}`,
        count: workingCount(colTotals(emps, i)),
      })).sort((a, b) => b.count - a.count)[0],
    [emps],
  );

  const nightHeavy = emps.filter((e) => summarise(e.shifts).night > 8).length;
  const lowRest = emps.filter((e) => summarise(e.shifts).off < 6).length;
  const balanced = Math.max(emps.length - nightHeavy - lowRest, 0);

  const kpis = [
    { label: "Total Shifts", value: totalShifts, color: tk.accent },
    { label: "Balanced", value: balanced, color: theme.palette.success.main },
    {
      label: "High Night Load",
      value: nightHeavy,
      color: theme.palette.warning.main,
    },
    { label: "Low Rest", value: lowRest, color: theme.palette.error.main },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: tk.radiusXL,
          bgcolor: tk.surface,
          border: `1px solid ${tk.border}`,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 750,
          fontSize: 17,
          pb: 0.5,
          letterSpacing: "-0.02em",
          color: tk.textPrimary,
          borderBottom: `1px solid ${tk.border}`,
          background: tk.isDark
            ? "linear-gradient(135deg,rgba(24,95,165,0.07),rgba(15,110,86,0.04))"
            : "linear-gradient(135deg,rgba(24,95,165,0.04),rgba(15,110,86,0.02))",
        }}
      >
        Shift Distribution Analytics
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" sx={{ color: tk.textSecondary, mb: 2.5 }}>
          Full 42-day cycle · {emps.length} employees
        </Typography>
        <Stack direction="row" gap={1.25} sx={{ mb: 3 }}>
          {kpis.map((k) => (
            <Card
              key={k.label}
              variant="outlined"
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: tk.radiusL,
                borderColor: alpha(k.color, 0.2),
                bgcolor: alpha(k.color, 0.04),
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: k.color,
                  fontFamily: MONO,
                  lineHeight: 1,
                }}
              >
                {k.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: tk.textSecondary,
                  fontWeight: 600,
                  mt: 0.5,
                  lineHeight: 1.3,
                }}
              >
                {k.label}
              </Typography>
            </Card>
          ))}
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 1.25,
            mb: 2.5,
          }}
        >
          {SHIFT_CODES.map((code) => {
            const sc = getShiftColor(code);
            const pct = totalShifts
              ? Math.round(((totals[code] ?? 0) / totalShifts) * 100)
              : 0;
            return (
              <Card
                key={code}
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: tk.radiusL,
                  borderColor: alpha(sc.border, 0.35),
                  bgcolor: alpha(sc.background, tk.isDark ? 0.15 : 1),
                  transition: "transform 0.18s,box-shadow 0.18s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 20px ${alpha(sc.border, 0.25)}`,
                  },
                }}
              >
                <ShiftPill code={code} />
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: 26,
                    fontWeight: 700,
                    mt: 1,
                    lineHeight: 1,
                    color: sc.color,
                  }}
                >
                  {totals[code] ?? 0}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(sc.border, 0.15),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: sc.border,
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: tk.textSecondary,
                    fontWeight: 600,
                    mt: 0.5,
                    display: "block",
                    fontFamily: MONO,
                  }}
                >
                  {pct}%
                </Typography>
              </Card>
            );
          })}
        </Box>
        <Alert severity="info" sx={{ borderRadius: tk.radiusL }}>
          <strong>Busiest day:</strong> {busiestDay?.label ?? "N/A"} —{" "}
          {busiestDay?.count ?? 0} active personnel
        </Alert>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${tk.border}` }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
            px: 3,
            borderRadius: tk.radius,
            fontWeight: 650,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function GoldenGridScreen({
  teamId,
  subTeamId,
}: GoldenGridScreenProps): React.ReactElement {
  const theme = useTheme();
  const tk = useTabColorTokens(theme);

  // ── API ───────────────────────────────────────────────────────────────────
  const subDomainId =
    typeof subTeamId === "string" ? parseInt(subTeamId, 10) : (subTeamId ?? 0);

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetGoldenSetQuery({ subDomainId });
  const [updateDailyGoldenSet, { isLoading: isSaving }] =
    useUpdateDailyGoldenSetMutation();

  const allEmps = useMemo<GoldenSetEmployee[]>(() => {
    if (!apiResponse?.data || !Array.isArray(apiResponse.data)) return [];
    return transformApiDataToEmployees(apiResponse.data);
  }, [apiResponse]);

  const allRoles = useMemo<string[]>(
    () => [...new Set(allEmps.map((e) => e.role))],
    [allEmps],
  );

  // ── Local paint grid ──────────────────────────────────────────────────────
  const [localGrid, setLocalGrid] = useState<Record<number, string[]>>({});

  const getShifts = useCallback(
    (emp: GoldenSetEmployee): string[] => localGrid[emp.prefId] ?? emp.shifts,
    [localGrid],
  );

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("select");
  const [brush, setBrush] = useState("G");

  // Row selection
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const lastSelectedRowRef = useRef<number | null>(null);

  // Bulk apply scope
  const [bulkWeek, setBulkWeek] = useState<number | "all">("all");
  const [bulkDay, setBulkDay] = useState<number | "all">("all");

  // Undo/redo
  const [editHistory, setEditHistory] = useState<HistoryEntry[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Drag painting
  const painting = useRef(false);
  const dragStarted = useRef(false);

  // Week-override popover
  const [weekPopover, setWeekPopover] = useState<{
    anchorEl: HTMLElement;
    weekIdx: number;
  } | null>(null);

  // UI state
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortConfig>({ field: "name", dir: "asc" });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    severity: "success" | "error";
  } | null>(null);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDeferredValue(searchRaw);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const pushHistory = useCallback(
    (grid: Record<number, string[]>) => {
      const snap: HistoryEntry = { grid: JSON.parse(JSON.stringify(grid)) };
      setEditHistory((prev) => {
        const next = prev.slice(0, historyIdx + 1);
        next.push(snap);
        return next;
      });
      setHistoryIdx((i) => i + 1);
    },
    [historyIdx],
  );

  const handleUndo = useCallback(() => {
    if (historyIdx < 0) return;
    const prevEntry = historyIdx > 0 ? editHistory[historyIdx - 1] : null;
    setLocalGrid(prevEntry ? JSON.parse(JSON.stringify(prevEntry.grid)) : {});
    setHistoryIdx((i) => i - 1);
  }, [historyIdx, editHistory]);

  const handleRedo = useCallback(() => {
    if (historyIdx >= editHistory.length - 1) return;
    const nextEntry = editHistory[historyIdx + 1];
    setLocalGrid(JSON.parse(JSON.stringify(nextEntry.grid)));
    setHistoryIdx((i) => i + 1);
  }, [historyIdx, editHistory]);

  const canUndo = historyIdx >= 0;
  const canRedo = historyIdx < editHistory.length - 1;

  // ── Filter + sort pipeline ────────────────────────────────────────────────
  const filtered = useMemo<GoldenSetEmployee[]>(() => {
    const result = allEmps.filter((e) => {
      if (
        search &&
        !`${e.name} ${e.olmid} ${e.role}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (filter.levels.length && !filter.levels.includes(e.level))
        return false;
      if (filter.roles.length && !filter.roles.includes(e.role)) return false;
      const shifts = getShifts(e);
      const s = summarise(shifts);
      if (s.work < filter.workRange[0] || s.work > filter.workRange[1])
        return false;
      if (s.night < filter.nightRange[0] || s.night > filter.nightRange[1])
        return false;
      if (filter.showHighLoad && s.night <= 8) return false;
      if (filter.showLowRest && s.off >= 6) return false;
      if (
        filter.shiftCodes.length &&
        !filter.shiftCodes.every((c) => shifts.includes(c))
      )
        return false;
      return true;
    });

    return [...result].sort((a, b) => {
      const sA = summarise(getShifts(a));
      const sB = summarise(getShifts(b));
      let vA: string | number;
      let vB: string | number;
      switch (sort.field) {
        case "name":
          vA = a.name;
          vB = b.name;
          break;
        case "olmid":
          vA = a.olmid;
          vB = b.olmid;
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
          vA = sA.night;
          vB = sB.night;
          break;
        case "off":
          vA = sA.off;
          vB = sB.off;
          break;
        case "load":
          vA = sA.loadPct;
          vB = sB.loadPct;
          break;
        default:
          vA = a.name;
          vB = b.name;
      }
      const cmp =
        typeof vA === "number"
          ? vA - (vB as number)
          : String(vA).localeCompare(String(vB));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [allEmps, search, filter, sort, getShifts]);

  const dayTotals = useMemo<Record<string, number>[]>(
    () => Array.from({ length: TOTAL_COLS }, (_, i) => colTotals(filtered, i)),
    [filtered],
  );

  // ── Row selection ─────────────────────────────────────────────────────────
  const handleRowCheck = useCallback(
    (prefId: number, checked: boolean, shiftKey: boolean) => {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        const ids = filtered.map((e) => e.prefId);
        if (shiftKey && lastSelectedRowRef.current !== null) {
          const a = ids.indexOf(lastSelectedRowRef.current);
          const b = ids.indexOf(prefId);
          const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
          for (let i = lo; i <= hi; i++) {
            if (checked) next.add(ids[i]);
            else next.delete(ids[i]);
          }
        } else {
          if (checked) next.add(prefId);
          else next.delete(prefId);
          lastSelectedRowRef.current = prefId;
        }
        return next;
      });
    },
    [filtered],
  );

  const selectAllRows = useCallback(() => {
    setSelectedRows(new Set(filtered.map((e) => e.prefId)));
  }, [filtered]);

  const clearSelection = useCallback(() => setSelectedRows(new Set()), []);

  // ── Bulk apply ────────────────────────────────────────────────────────────
  const handleBulkApply = useCallback(
    (code: string) => {
      if (selectedRows.size === 0) return;
      pushHistory(localGrid);
      setLocalGrid((prev) => {
        const next = { ...prev };
        selectedRows.forEach((prefId) => {
          const emp = allEmps.find((e) => e.prefId === prefId);
          if (!emp) return;
          const base = next[prefId] ? [...next[prefId]] : [...emp.shifts];
          for (let i = 0; i < TOTAL_COLS; i++) {
            const w = Math.floor(i / 7);
            const d = i % 7;
            if (bulkWeek !== "all" && w !== bulkWeek) continue;
            if (bulkDay !== "all" && d !== bulkDay) continue;
            base[i] = code;
          }
          next[prefId] = base;
        });
        return next;
      });
      setToast({
        msg: `Applied "${code}" to ${selectedRows.size} employee${selectedRows.size !== 1 ? "s" : ""}`,
        severity: "success",
      });
    },
    [selectedRows, localGrid, allEmps, bulkWeek, bulkDay, pushHistory],
  );

  // ── Week override ─────────────────────────────────────────────────────────
  const handleWeekOverride = useCallback(
    (code: string, weekIdx: number) => {
      const targets =
        selectedRows.size > 0
          ? filtered.filter((e) => selectedRows.has(e.prefId))
          : filtered;

      pushHistory(localGrid);
      setLocalGrid((prev) => {
        const next = { ...prev };
        targets.forEach((emp) => {
          const base = next[emp.prefId]
            ? [...next[emp.prefId]]
            : [...emp.shifts];
          for (let d = 0; d < 7; d++) base[weekIdx * 7 + d] = code;
          next[emp.prefId] = base;
        });
        return next;
      });
      setWeekPopover(null);
      setToast({
        msg: `Set Week ${weekIdx + 1} → "${code}" for ${targets.length} employee${targets.length !== 1 ? "s" : ""}`,
        severity: "success",
      });
    },
    [selectedRows, filtered, localGrid, pushHistory],
  );

  // ── Cell paint (drag mode) ────────────────────────────────────────────────
  const paintCell = useCallback(
    (prefId: number, colIdx: number) => {
      setLocalGrid((prev) => {
        const base =
          prev[prefId] ??
          allEmps.find((e) => e.prefId === prefId)?.shifts ??
          [];
        const next = [...base];
        if (next[colIdx] === brush) return prev;
        next[colIdx] = brush;
        return { ...prev, [prefId]: next };
      });
    },
    [brush, allEmps],
  );

  const handleCellMouseDown = useCallback(
    (prefId: number, colIdx: number) => {
      painting.current = true;
      dragStarted.current = false;
      if (!dragStarted.current) {
        pushHistory(localGrid);
        dragStarted.current = true;
      }
      paintCell(prefId, colIdx);
    },
    [localGrid, paintCell, pushHistory],
  );

  const handleCellMouseEnter = useCallback(
    (prefId: number, colIdx: number) => {
      if (!painting.current || editMode !== "drag") return;
      paintCell(prefId, colIdx);
    },
    [editMode, paintCell],
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSaveChanges = useCallback(async () => {
    const changedPrefIds = Object.keys(localGrid).map(Number);
    if (changedPrefIds.length === 0) {
      setToast({ msg: "No changes to save", severity: "success" });
      return;
    }
    const payload: DailyGoldenSetPayload[] = allEmps
      .filter((e) => changedPrefIds.includes(e.prefId))
      .map((e) => buildDailyGoldenSetPayload({ ...e, shifts: getShifts(e) }));
    try {
      await updateDailyGoldenSet(payload).unwrap();
      setToast({
        msg: `Saved ${payload.length} employee(s) successfully`,
        severity: "success",
      });
      setLocalGrid({});
      setEditHistory([]);
      setHistoryIdx(-1);
      setSelectedRows(new Set());
      setEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      setToast({
        msg: "Failed to save changes. Please try again.",
        severity: "error",
      });
    }
  }, [localGrid, allEmps, getShifts, updateDailyGoldenSet]);

  // ── Discard ───────────────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    setLocalGrid({});
    setEditHistory([]);
    setHistoryIdx(-1);
    setSelectedRows(new Set());
    setEditing(false);
    setToast({ msg: "Changes discarded", severity: "success" });
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSaveChanges();
        return;
      }
      if (e.ctrlKey && e.key === "a" && editMode === "select") {
        e.preventDefault();
        selectAllRows();
        return;
      }
      if (e.key === "Escape") {
        clearSelection();
        return;
      }
      if (editMode === "drag" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const upper = e.key.toUpperCase();
        if (SHIFT_CODES.includes(upper) && upper.length === 1) setBrush(upper);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    editing,
    editMode,
    handleUndo,
    handleRedo,
    handleSaveChanges,
    selectAllRows,
    clearSelection,
  ]);

  useEffect(() => {
    const up = () => {
      painting.current = false;
      dragStarted.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCsv = useCallback(() => {
    const header = [
      "Name",
      "OLM ID",
      "Role",
      "Level",
      ...Array.from(
        { length: TOTAL_COLS },
        (_, i) => `W${Math.floor(i / 7) + 1}D${(i % 7) + 1}`,
      ),
    ];
    const rows = filtered.map((e) =>
      [e.name, e.olmid, e.role, e.level, ...getShifts(e)].join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "golden-set.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast({ msg: "CSV exported", severity: "success" });
  }, [filtered, getShifts]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilters = useMemo(() => {
    const def = defaultFilter();
    let c = 0;
    if (search) c++;
    if (filter.levels.length) c++;
    if (filter.roles.length) c++;
    if (filter.shiftCodes.length) c++;
    if (
      filter.workRange[0] !== def.workRange[0] ||
      filter.workRange[1] !== def.workRange[1]
    )
      c++;
    if (
      filter.nightRange[0] !== def.nightRange[0] ||
      filter.nightRange[1] !== def.nightRange[1]
    )
      c++;
    if (filter.showHighLoad) c++;
    if (filter.showLowRest) c++;
    return c;
  }, [filter, search]);

  const changedCount = Object.keys(localGrid).length;

  // ── Derived style helpers ─────────────────────────────────────────────────
  const nightColor = getShiftColor("N").color;
  const offColor = getShiftColor("W").color;
  const empColBg = tk.isDark ? "rgba(30,30,46,1)" : "rgba(248,250,252,1)";
  const weekHeaderBg = tk.isDark
    ? "rgba(24,95,165,0.13)"
    : "rgba(24,95,165,0.07)";
  const dayHeaderBg = tk.isDark
    ? "rgba(15,110,86,0.10)"
    : "rgba(15,110,86,0.05)";

  // ─────────────────────────────────────────────────────────────────────────
  // Z-INDEX hierarchy
  // ─────────────────────────────────────────────────────────────────────────
  const Z_INDEX = {
    HEADER_CORNER: 150, // corner cells that span both header rows
    WEEK_HEADER: 110, // "Week N" row
    DAY_HEADER: 100, // "Mo Tu We …" row
    STICKY_COLUMN: 90, // employee name column in body rows
  };

  const paperBg = theme.palette.background.paper;

  // ─────────────────────────────────────────────────────────────────────────
  // BASE HEADER STYLES
  // Using `background` (not `bgcolor`) with `!important` so they win over
  // MUI's .MuiTableCell-stickyHeader class which also uses background.
  // ─────────────────────────────────────────────────────────────────────────
  const baseHeadSx = {
    whiteSpace: "nowrap" as const,
    boxSizing: "border-box" as const,
    py: "6px",
    px: "4px",
    fontWeight: 650,
    color: tk.textSecondary,
    textAlign: "center" as const,
    fontSize: 11,
  };

  // ── Week header row (top: 0) ───────────────────────────────────────────
  const weekHeadSx = {
    ...baseHeadSx,
    position: "sticky" as const,
    top: 0,
    zIndex: Z_INDEX.WEEK_HEADER,
    // `background` (not bgcolor) with !important beats MUI's stickyHeader override
    background: `${paperBg} !important`,
    borderBottom: `1px solid ${tk.border} !important`,
  };

  // ── Day header row (top: exact height of week row) ─────────────────────
  // Week row: py="6px" = 12px padding + ~16px font line-height = ~38px rendered.
  // DAY_ROW_TOP is defined at the top of this file as WEEK_ROW_H = 38.
  const dayHeadSx = {
    ...baseHeadSx,
    position: "sticky" as const,
    top: DAY_ROW_TOP,
    zIndex: Z_INDEX.DAY_HEADER,
    background: `${paperBg} !important`,
    borderBottom: `2px solid ${tk.border} !important`,
  };

  const stickyCellSx = {
    position: "sticky" as const,
    left: 0,
    zIndex: Z_INDEX.STICKY_COLUMN,
    width: EMP_COL_W,
    minWidth: EMP_COL_W,
    maxWidth: EMP_COL_W,
    backgroundColor: theme.palette.background.paper,
    boxShadow: tk.isDark
      ? "3px 0 8px -2px rgba(0,0,0,0.5)"
      : "3px 0 8px -2px rgba(13,27,42,0.1)",
    borderRight: `1.5px solid ${tk.border} !important`,
    py: "4px",
    px: "14px",
  };

  const dayCellSx = (i: number) => {
    const d = i % 7;
    const w = Math.floor(i / 7);
    return {
      width: CELL_W + 6,
      minWidth: CELL_W + 6,
      p: "2px 3px",
      textAlign: "center" as const,
      verticalAlign: "middle" as const,
      borderLeft:
        d === 0 && w > 0
          ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
          : undefined,
      bgcolor:
        d >= 5
          ? tk.isDark
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,0,0,0.015)"
          : undefined,
    };
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Failed to load roster data
          </Typography>
          <Typography variant="body2">
            {typeof error === "object" && error !== null && "data" in error
              ? String((error as any).data)
              : "An error occurred. Please try again."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!isLoading && (!allEmps || allEmps.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography>
            No roster data available. Please check your configuration and try
            again.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        p: 1.5,
        gap: 1,
        bgcolor: tk.bg,
        "@keyframes tkPulse": {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
        "@keyframes fadeSlideIn": {
          from: { opacity: 0, transform: "translateY(-6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* ── TOOLBAR ── */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
        sx={{ flexShrink: 0 }}
      >
        {/* Search */}
        <Stack
          direction="row"
          alignItems="center"
          gap={0.75}
          sx={{
            bgcolor: tk.surface,
            border: `1.5px solid ${tk.border}`,
            borderRadius: tk.radius,
            px: 1.25,
            py: 0.5,
            width: 200,
            transition: "border-color 0.2s,box-shadow 0.2s",
            "&:focus-within": {
              borderColor: tk.accent,
              boxShadow: `0 0 0 3px ${tk.accentDim}`,
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: tk.textSecondary }} />
          <InputBase
            placeholder="Search name, ID, role…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            sx={{
              fontSize: 12.5,
              width: "100%",
              fontWeight: 500,
              color: tk.textPrimary,
            }}
          />
          {searchRaw && (
            <IconButton
              size="small"
              onClick={() => setSearchRaw("")}
              sx={{ p: 0.25 }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Stack>

        {/* Filter */}
        <Badge badgeContent={activeFilters || undefined} color="primary">
          <Button
            size="small"
            variant={filterOpen ? "contained" : "outlined"}
            startIcon={<FilterListIcon sx={{ fontSize: 15 }} />}
            onClick={() => setFilterOpen(true)}
            disableElevation
            sx={{
              fontSize: 12,
              height: 34,
              borderRadius: tk.radius,
              fontWeight: 600,
            }}
          >
            Filters
          </Button>
        </Badge>

        {/* Quick-sort chips */}
        <Stack
          direction="row"
          gap={0.5}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {(["name", "work", "night"] as SortField[]).map((f) => (
            <Chip
              key={f}
              label={f.charAt(0).toUpperCase() + f.slice(1)}
              size="small"
              variant={sort.field === f ? "filled" : "outlined"}
              color={sort.field === f ? "primary" : "default"}
              icon={
                sort.field === f ? (
                  sort.dir === "asc" ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : undefined
              }
              onClick={() =>
                setSort((s) => ({
                  field: f,
                  dir: s.field === f && s.dir === "asc" ? "desc" : "asc",
                }))
              }
              sx={{
                fontSize: 11,
                height: 26,
                fontWeight: 600,
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
          ))}
        </Stack>

        <Box flex={1} />

        {/* Analytics */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<BarChartIcon sx={{ fontSize: 15 }} />}
          onClick={() => setAnalyticsOpen(true)}
          sx={{
            fontSize: 12,
            height: 34,
            borderRadius: tk.radius,
            fontWeight: 600,
          }}
        >
          Analytics
        </Button>

        {/* Undo / Redo */}
        {editing && (
          <>
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton
                  size="small"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  sx={{
                    border: `1.5px solid ${tk.border}`,
                    borderRadius: tk.radius,
                    width: 34,
                    height: 34,
                  }}
                >
                  <UndoIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <IconButton
                  size="small"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  sx={{
                    border: `1.5px solid ${tk.border}`,
                    borderRadius: tk.radius,
                    width: 34,
                    height: 34,
                  }}
                >
                  <RedoIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {/* Edit mode tabs */}
        {editing && (
          <Stack
            direction="row"
            sx={{
              border: `1.5px solid ${tk.border}`,
              borderRadius: tk.radius,
              overflow: "hidden",
            }}
          >
            {EDIT_MODES.map((m, idx) => (
              <Tooltip key={m.id} title={m.tooltip} arrow>
                <Box
                  onClick={() => {
                    setEditMode(m.id);
                    clearSelection();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.25,
                    py: 0.6,
                    cursor: "pointer",
                    bgcolor: editMode === m.id ? tk.accentDim : "transparent",
                    color: editMode === m.id ? tk.accent : tk.textSecondary,
                    borderRight:
                      idx < EDIT_MODES.length - 1
                        ? `1px solid ${tk.border}`
                        : "none",
                    transition: "all .15s",
                    "&:hover": { bgcolor: tk.accentDim },
                  }}
                >
                  {m.icon}
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1,
                      ml: 0.3,
                    }}
                  >
                    {m.label}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Stack>
        )}

        {/* Unsaved badge */}
        {editing && changedCount > 0 && (
          <Chip
            label={`${changedCount} row${changedCount !== 1 ? "s" : ""} changed`}
            size="small"
            color="warning"
            sx={{
              height: 26,
              fontSize: 10.5,
              borderRadius: "6px",
              fontWeight: 650,
            }}
          />
        )}

        {/* Edit toggle */}
        <Button
          size="small"
          variant="outlined"
          color={editing ? "error" : "inherit"}
          startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={() => {
            if (editing) {
              setEditing(false);
              clearSelection();
            } else {
              setEditing(true);
              setEditMode("select");
            }
          }}
          disableElevation
          sx={{
            fontSize: 12,
            height: 34,
            borderRadius: tk.radius,
            fontWeight: 600,
          }}
        >
          {editing ? "Exit edit" : "Edit"}
        </Button>

        {/* Save */}
        {editing && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={
              isSaving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveOutlinedIcon sx={{ fontSize: 15 }} />
              )
            }
            onClick={handleSaveChanges}
            disabled={isSaving || changedCount === 0}
            disableElevation
            sx={{
              fontSize: 12,
              height: 34,
              borderRadius: tk.radius,
              fontWeight: 600,
            }}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        )}

        {/* Discard */}
        {editing && changedCount > 0 && (
          <Tooltip title="Discard all unsaved changes">
            <IconButton
              size="small"
              onClick={handleDiscard}
              sx={{
                border: `1.5px solid ${alpha(theme.palette.error.main, 0.4)}`,
                borderRadius: tk.radius,
                width: 34,
                height: 34,
                color: "error.main",
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* CSV export */}
        <Tooltip title="Export visible rows as CSV">
          <IconButton
            size="small"
            onClick={downloadCsv}
            sx={{
              border: `1.5px solid ${tk.border}`,
              borderRadius: tk.radius,
              width: 34,
              height: 34,
            }}
          >
            <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        {/* Reload */}
        <Tooltip title="Reload data">
          <IconButton
            size="small"
            onClick={() => refetch()}
            sx={{
              border: `1.5px solid ${tk.border}`,
              borderRadius: tk.radius,
              width: 34,
              height: 34,
            }}
          >
            <RefreshIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── FILTER DRAWER ── */}
      <RosterFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filter={filter}
        allRoles={allRoles}
        onApply={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {/* ── BULK ACTION BAR ── */}
      {editing && editMode === "select" && selectedRows.size > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            px: 2,
            py: 1.25,
            flexShrink: 0,
            border: `1.5px solid ${tk.accentBorder}`,
            borderRadius: tk.radiusL,
            bgcolor: tk.accentDim,
            animation: "fadeSlideIn .18s ease",
          }}
        >
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: tk.accent,
              }}
            />
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: tk.accent }}
            >
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </Typography>
          </Stack>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: tk.accentBorder }}
          />

          <Button
            size="small"
            variant="text"
            sx={{
              fontSize: 11,
              height: 26,
              color: tk.accent,
              fontWeight: 600,
              minWidth: 0,
              px: 1,
            }}
            onClick={selectAllRows}
          >
            Select all ({filtered.length})
          </Button>
          <Button
            size="small"
            variant="text"
            sx={{
              fontSize: 11,
              height: 26,
              color: tk.textSecondary,
              fontWeight: 600,
              minWidth: 0,
              px: 1,
            }}
            onClick={clearSelection}
          >
            Clear
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: tk.accentBorder }}
          />

          <Typography
            sx={{ fontSize: 11, color: tk.textSecondary, fontWeight: 500 }}
          >
            Apply to:
          </Typography>

          <Box
            component="select"
            value={String(bulkWeek)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setBulkWeek(
                e.target.value === "all" ? "all" : parseInt(e.target.value),
              )
            }
            sx={{
              fontSize: 11,
              px: 1,
              py: 0.5,
              borderRadius: "6px",
              border: `1px solid ${tk.border}`,
              bgcolor: tk.surface,
              color: tk.textPrimary,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All weeks</option>
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i} value={i}>
                Week {i + 1}
              </option>
            ))}
          </Box>

          <Box
            component="select"
            value={String(bulkDay)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setBulkDay(
                e.target.value === "all" ? "all" : parseInt(e.target.value),
              )
            }
            sx={{
              fontSize: 11,
              px: 1,
              py: 0.5,
              borderRadius: "6px",
              border: `1px solid ${tk.border}`,
              bgcolor: tk.surface,
              color: tk.textPrimary,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All days</option>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: tk.accentBorder }}
          />

          <Typography
            sx={{ fontSize: 11, color: tk.textSecondary, fontWeight: 500 }}
          >
            Set shift:
          </Typography>

          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {SHIFT_CODES.map((code) => {
              const sc = getShiftColor(code);
              return (
                <Tooltip
                  key={code}
                  title={`Apply "${code}" — ${SHIFT_META[code]?.label}`}
                  arrow
                >
                  <Box
                    component="button"
                    onClick={() => handleBulkApply(code)}
                    sx={{
                      display: "inline-grid",
                      placeItems: "center",
                      minWidth: code === "Leave" ? 48 : 34,
                      height: 28,
                      px: 0.75,
                      borderRadius: "6px",
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      border: `1.5px solid ${sc.border}`,
                      bgcolor: sc.background,
                      color: sc.color,
                      cursor: "pointer",
                      transition: "all .12s",
                      "&:hover": {
                        filter: "brightness(.9)",
                        transform: "scale(1.08)",
                      },
                      "&:active": { transform: "scale(.97)" },
                    }}
                  >
                    {code}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* ── SELECT MODE HINT ── */}
      {editing && editMode === "select" && selectedRows.size === 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: tk.radiusL,
            flexShrink: 0,
            bgcolor: tk.isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(13,27,42,0.025)",
            border: `1px dashed ${tk.border}`,
            animation: "fadeSlideIn .18s ease",
          }}
        >
          <CheckBoxOutlineBlankIcon sx={{ fontSize: 15, color: tk.textDim }} />
          <Typography sx={{ fontSize: 11, color: tk.textDim }}>
            Check rows to select employees · <strong>Shift+click</strong> for
            range selection · <strong>Ctrl+A</strong> to select all
          </Typography>
        </Box>
      )}

      {/* ── WEEK OVERRIDE HINT ── */}
      {editing && editMode === "week" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: tk.radiusL,
            flexShrink: 0,
            bgcolor: tk.isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(13,27,42,0.025)",
            border: `1px dashed ${tk.border}`,
            animation: "fadeSlideIn .18s ease",
          }}
        >
          <CalendarViewWeekIcon sx={{ fontSize: 15, color: tk.textDim }} />
          <Typography sx={{ fontSize: 11, color: tk.textDim }}>
            <strong>Right-click</strong> any "Week N" column header to override
            all 7 days at once ·
            {selectedRows.size > 0
              ? ` Applies to ${selectedRows.size} selected row${selectedRows.size !== 1 ? "s" : ""}`
              : " Applies to all visible rows"}
          </Typography>
        </Box>
      )}

      {/* ── MAIN CARD ── */}
      <Card
        variant="outlined"
        sx={{
          flex: 1,
          borderRadius: tk.radiusL,
          overflow: "hidden",
          borderColor: tk.border,
          boxShadow: tk.isDark
            ? "0 4px 32px rgba(0,0,0,0.4)"
            : "0 2px 20px rgba(13,27,42,0.08)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          bgcolor: tk.surface,
        }}
      >
        {/* Card header */}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          sx={{
            p: "10px 16px",
            borderBottom: `1px solid ${tk.border}`,
            flexShrink: 0,
            background: tk.isDark
              ? "linear-gradient(135deg,rgba(24,95,165,0.06),rgba(15,110,86,0.03))"
              : "linear-gradient(135deg,rgba(24,95,165,0.03),rgba(15,110,86,0.015))",
          }}
        >
          <ShiftLegend />
          <Box flex={1} />
          <Typography
            variant="caption"
            sx={{ color: tk.textSecondary, fontWeight: 500 }}
          >
            Showing{" "}
            <Box component="strong" sx={{ color: tk.textPrimary }}>
              {filtered.length}
            </Box>{" "}
            of {allEmps.length} employees
          </Typography>
          <Chip
            icon={<LayersOutlinedIcon sx={{ fontSize: "13px !important" }} />}
            label="W1–W6 · 42 cols"
            size="small"
            variant="outlined"
            sx={{
              display: { xs: "none", md: "flex" },
              fontWeight: 650,
              height: 24,
              fontSize: 10.5,
              borderRadius: "6px",
              borderColor: tk.border,
              color: tk.textSecondary,
            }}
          />
          {editing && changedCount > 0 && (
            <Chip
              label={`${changedCount} unsaved`}
              size="small"
              color="warning"
              sx={{
                height: 24,
                fontSize: 10.5,
                borderRadius: "6px",
                fontWeight: 650,
              }}
            />
          )}
        </Stack>

        {/* Brush bar */}
        {editing && editMode === "drag" && (
          <BrushBar brush={brush} onSelect={setBrush} />
        )}

        {/* Loading */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              p: 4,
            }}
          >
            <CircularProgress size={36} />
          </Box>
        )}

        {/* ── TABLE ── */}
        {!isLoading && (
          <TableContainer
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              position: "relative",
              "&::-webkit-scrollbar": { width: 6, height: 6 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: tk.isDark
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.15)",
                borderRadius: 6,
                "&:hover": {
                  bgcolor: tk.isDark
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.25)",
                },
              },
              maxHeight: `calc(100vh - 320px)`,
            }}
          >
            {/*
              ─────────────────────────────────────────────────────────────
              KEY FIX: stickyHeader prop is REMOVED from <Table>.
              MUI's stickyHeader only auto-stickies the first <TableRow>
              in <TableHead> and injects a .MuiTableCell-stickyHeader CSS
              class that fights our manual `top` values on the second row.
              By removing it we take full manual control of all sticky
              positioning via the sx props on each cell below.
              ─────────────────────────────────────────────────────────────
            */}
            <Table size="small">
              {/* ── TableHead ── */}
              <TableHead>
                {/* ── Row 1: Week headers ── */}
                <TableRow>
                  {/*
                    Corner: checkbox column.
                    rowSpan=2 so it covers both header rows.
                    top=0, zIndex highest so it sits above everything.
                  */}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      position: "sticky",
                      top: 0,
                      left: 0,
                      zIndex: Z_INDEX.HEADER_CORNER + 10,
                      width: editing ? 40 : 0,
                      minWidth: editing ? 40 : 0,
                      maxWidth: editing ? 40 : 0,
                      p: 0,
                      // Use `background` not `bgcolor` so !important wins over MUI defaults
                      background: `${empColBg} !important`,
                      borderBottom: `2px solid ${tk.border} !important`,
                      borderRight: editing
                        ? `0.5px solid ${tk.border} !important`
                        : "none",
                      overflow: "hidden",
                      transition: "width .2s, min-width .2s",
                    }}
                  >
                    {editing && editMode === "select" && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Checkbox
                          size="small"
                          indeterminate={
                            selectedRows.size > 0 &&
                            selectedRows.size < filtered.length
                          }
                          checked={
                            filtered.length > 0 &&
                            selectedRows.size === filtered.length
                          }
                          onChange={(e) =>
                            e.target.checked
                              ? selectAllRows()
                              : clearSelection()
                          }
                          sx={{ p: 0.5 }}
                        />
                      </Box>
                    )}
                  </TableCell>

                  {/*
                    Corner: "Employee" label.
                    rowSpan=2, top=0, left=checkbox-width.
                  */}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      position: "sticky",
                      top: 0,
                      left: editing ? 40 : 0,
                      zIndex: Z_INDEX.HEADER_CORNER,
                      width: EMP_COL_W,
                      minWidth: EMP_COL_W,
                      maxWidth: EMP_COL_W,
                      background: `${empColBg} !important`,
                      textAlign: "left",
                      borderBottom: `2px solid ${tk.border} !important`,
                      borderRight: `1.5px solid ${tk.border} !important`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: tk.textSecondary,
                      }}
                    >
                      Employee
                    </Typography>
                  </TableCell>

                  {/* Week N headers — sticky at top: 0 */}
                  {Array.from({ length: 6 }, (_, w) => (
                    <TableCell
                      key={w}
                      colSpan={7}
                      onContextMenu={(e) => {
                        if (!editing || editMode !== "week") return;
                        e.preventDefault();
                        setWeekPopover({
                          anchorEl: e.currentTarget as HTMLElement,
                          weekIdx: w,
                        });
                      }}
                      sx={{
                        ...weekHeadSx,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        borderLeft:
                          w > 0
                            ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
                            : undefined,
                        // Alternate week shading; override background per-cell via !important
                        background: `${
                          w % 2 === 1
                            ? tk.isDark
                              ? "rgba(24,95,165,0.18)"
                              : "rgba(24,95,165,0.10)"
                            : weekHeaderBg
                        } !important`,
                        color: w % 2 === 1 ? tk.accent : tk.textSecondary,
                        cursor:
                          editing && editMode === "week"
                            ? "context-menu"
                            : "default",
                        "&:hover":
                          editing && editMode === "week"
                            ? {
                                background: `${alpha(tk.accent, 0.12)} !important`,
                              }
                            : undefined,
                        position: "relative",
                      }}
                    >
                      Week {w + 1}
                      {editing && editMode === "week" && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontSize: 9,
                            opacity: 0.5,
                            fontWeight: 400,
                            letterSpacing: 0,
                            textTransform: "none",
                          }}
                        >
                          (right-click)
                        </Typography>
                      )}
                    </TableCell>
                  ))}

                  {/* Summary column headers — rowSpan=2, top=0 */}
                  {(["Work", "N", "OFF"] as const).map((h, i) => (
                    <TableCell
                      key={h}
                      rowSpan={2}
                      sx={{
                        ...weekHeadSx,
                        width: 48,
                        minWidth: 48,
                        borderLeft:
                          i === 0
                            ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
                            : undefined,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>

                {/*
                  ── Row 2: Day headers (Mo / Tu / …) ──
                  top = DAY_ROW_TOP (= WEEK_ROW_H = 38px)
                  This is the key fix: without an explicit `top` matching the
                  week row's rendered height, browsers default to top:0 and
                  both header rows overlap at the same vertical position.
                */}
                <TableRow>
                  {Array.from({ length: TOTAL_COLS }, (_, i) => {
                    const d = i % 7;
                    const w = Math.floor(i / 7);
                    return (
                      <TableCell
                        key={i}
                        sx={{
                          ...dayHeadSx,
                          width: CELL_W + 6,
                          minWidth: CELL_W + 6,
                          fontSize: 10.5,
                          fontWeight: 600,
                          borderLeft:
                            d === 0 && w > 0
                              ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
                              : undefined,
                          background: `${
                            d >= 5
                              ? tk.isDark
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(0,0,0,0.02)"
                              : dayHeaderBg
                          } !important`,
                        }}
                      >
                        {DOW_SHORT[d]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              {/* ── TableBody ── */}
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TOTAL_COLS + 6}
                      sx={{
                        textAlign: "center",
                        py: "48px",
                        color: tk.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      No employees match the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp) => {
                    const shifts = getShifts(emp);
                    const s = summarise(shifts);
                    const isHighLoad = s.night > 8;
                    const isLowRest = s.off < 6;
                    const hasLocalChanges = !!localGrid[emp.prefId];
                    const isSelected = selectedRows.has(emp.prefId);

                    return (
                      <TableRow
                        key={emp.prefId}
                        sx={{
                          height: CELL_H + 8,
                          transition: "background 0.1s",
                          bgcolor: isSelected
                            ? alpha(tk.accent, 0.05)
                            : hasLocalChanges && editing
                              ? alpha(theme.palette.warning.main, 0.03)
                              : undefined,
                          "&:hover td": {
                            bgcolor: tk.isDark
                              ? "rgba(255,255,255,0.025)"
                              : "rgba(13,27,42,0.025)",
                          },
                        }}
                      >
                        {/* Checkbox cell */}
                        <TableCell
                          sx={{
                            width: editing ? 40 : 0,
                            minWidth: editing ? 40 : 0,
                            p: editing ? "0 4px" : 0,
                            textAlign: "center",
                            overflow: "hidden",
                            transition: "width .2s, min-width .2s",
                            borderRight:
                              editing && editMode === "select"
                                ? `0.5px solid ${tk.border}`
                                : "none",
                          }}
                        >
                          {editing && editMode === "select" && (
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={(e) =>
                                handleRowCheck(
                                  emp.prefId,
                                  e.target.checked,
                                  (e.nativeEvent as MouseEvent).shiftKey,
                                )
                              }
                              sx={{ p: 0.5 }}
                            />
                          )}
                        </TableCell>

                        {/* Sticky employee cell */}
                        <TableCell
                          sx={{
                            ...stickyCellSx,
                            left: editing ? 40 : 0,
                            zIndex: Z_INDEX.STICKY_COLUMN,
                            backgroundColor: isSelected
                              ? `${alpha(tk.accent, 0.07)} !important`
                              : `${theme.palette.background.paper} !important`,
                            borderLeft: isSelected
                              ? `2.5px solid ${tk.accent}`
                              : undefined,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <EmployeeCell emp={emp} isEditing={editing} />
                            {(isHighLoad || isLowRest) && (
                              <Stack
                                direction="row"
                                gap={0.5}
                                sx={{ flexShrink: 0 }}
                              >
                                {isHighLoad && (
                                  <Tooltip
                                    title="High night load (>8 nights)"
                                    arrow
                                  >
                                    <Box
                                      sx={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        bgcolor: "warning.main",
                                        boxShadow: `0 0 6px ${alpha(theme.palette.warning.main, 0.5)}`,
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {isLowRest && (
                                  <Tooltip title="Low rest (<6 days off)" arrow>
                                    <Box
                                      sx={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        bgcolor: "error.main",
                                        boxShadow: `0 0 6px ${alpha(theme.palette.error.main, 0.5)}`,
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Shift cells */}
                        {shifts.map((code, i) => {
                          const sc = getShiftColor(code);
                          const isChanged =
                            hasLocalChanges &&
                            localGrid[emp.prefId]?.[i] !== emp.shifts[i];
                          return (
                            <TableCell key={i} sx={dayCellSx(i)}>
                              <Tooltip
                                title={`${emp.name} · W${Math.floor(i / 7) + 1} ${DOW_LONG[i % 7]} · ${SHIFT_META[code]?.label ?? code}`}
                                arrow
                                disableInteractive
                              >
                                <Box
                                  component="button"
                                  sx={{
                                    display: "inline-grid",
                                    placeItems: "center",
                                    width: CELL_W,
                                    height: CELL_H,
                                    lineHeight: 1,
                                    border: "1.5px solid",
                                    borderRadius: "6px",
                                    fontFamily: MONO,
                                    fontWeight: 700,
                                    fontSize: 10.5,
                                    cursor:
                                      editing && editMode === "drag"
                                        ? "crosshair"
                                        : "default",
                                    padding: 0,
                                    userSelect: "none",
                                    transition:
                                      "box-shadow 0.12s, border-color 0.12s, filter 0.12s",
                                    bgcolor: sc.background,
                                    color: sc.color,
                                    borderColor: sc.border,
                                    ...(isChanged && {
                                      boxShadow: `0 0 0 2px ${alpha(theme.palette.warning.main, 0.5)}`,
                                      borderColor: `${theme.palette.warning.main} !important`,
                                    }),
                                    ...(editing &&
                                      editMode === "select" &&
                                      isSelected && {
                                        outline: `1.5px dashed ${alpha(tk.accent, 0.4)}`,
                                        outlineOffset: -1,
                                      }),
                                    ...(editing &&
                                      editMode === "drag" && {
                                        "&:hover": {
                                          boxShadow: `0 0 0 2.5px ${tk.accent}, 0 2px 12px ${tk.accentDim}`,
                                          borderColor: `${tk.accent} !important`,
                                          filter:
                                            "brightness(0.92) saturate(1.2)",
                                        },
                                      }),
                                  }}
                                  onMouseDown={() => {
                                    if (!editing || editMode !== "drag") return;
                                    handleCellMouseDown(emp.prefId, i);
                                  }}
                                  onMouseEnter={() => {
                                    if (!editing || editMode !== "drag") return;
                                    handleCellMouseEnter(emp.prefId, i);
                                  }}
                                >
                                  {code}
                                </Box>
                              </Tooltip>
                            </TableCell>
                          );
                        })}

                        {/* Summary cells */}
                        <TableCell
                          sx={{
                            fontFamily: MONO,
                            fontWeight: 600,
                            textAlign: "center",
                            fontSize: 11,
                            bgcolor: tk.isDark
                              ? "rgba(255,255,255,0.01)"
                              : "rgba(0,0,0,0.008)",
                            color: tk.textSecondary,
                            px: "8px",
                            borderLeft: `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                          }}
                        >
                          {s.work}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: MONO,
                            textAlign: "center",
                            fontSize: 11,
                            bgcolor: tk.isDark
                              ? "rgba(255,255,255,0.01)"
                              : "rgba(0,0,0,0.008)",
                            px: "8px",
                            color: isHighLoad ? nightColor : tk.textSecondary,
                            fontWeight: isHighLoad ? 700 : 600,
                          }}
                        >
                          {s.night}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: MONO,
                            textAlign: "center",
                            fontSize: 11,
                            bgcolor: tk.isDark
                              ? "rgba(255,255,255,0.01)"
                              : "rgba(0,0,0,0.008)",
                            px: "8px",
                            color: isLowRest ? offColor : tk.textSecondary,
                            fontWeight: isLowRest ? 700 : 600,
                          }}
                        >
                          {s.off}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {/* ── TableFooter ── */}
              <TableFooter>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      bottom: 0,
                      width: editing ? 40 : 0,
                      minWidth: editing ? 40 : 0,
                      p: 0,
                      background: `${empColBg} !important`,
                      borderTop: `2px solid ${tk.border}`,
                    }}
                  />
                  <TableCell
                    sx={{
                      position: "sticky",
                      bottom: 0,
                      left: editing ? 40 : 0,
                      zIndex: 5,
                      borderTop: `2px solid ${tk.border}`,
                      fontWeight: 600,
                      color: tk.textSecondary,
                      px: "14px",
                      py: "6px",
                      fontSize: 11,
                      textAlign: "left",
                      boxShadow: tk.isDark
                        ? "3px 0 8px -2px rgba(0,0,0,0.5)"
                        : "3px 0 8px -2px rgba(13,27,42,0.1)",
                      borderRight: `1.5px solid ${tk.border} !important`,
                      background: `${empColBg} !important`,
                    }}
                  >
                    Staffed / Day
                  </TableCell>

                  {dayTotals.map((c, i) => {
                    const d = i % 7;
                    const w = Math.floor(i / 7);
                    const wt = workingCount(c);
                    return (
                      <TableCell
                        key={i}
                        sx={{
                          position: "sticky",
                          bottom: 0,
                          zIndex: 2,
                          background: `${empColBg} !important`,
                          borderTop: `2px solid ${tk.border}`,
                          fontFamily: MONO,
                          fontWeight: 700,
                          fontSize: 11,
                          textAlign: "center",
                          py: "6px",
                          px: "4px",
                          borderLeft:
                            d === 0 && w > 0
                              ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
                              : undefined,
                        }}
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
                                  : tk.textPrimary,
                          }}
                        >
                          {wt}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    colSpan={3}
                    sx={{
                      position: "sticky",
                      bottom: 0,
                      zIndex: 2,
                      background: `${empColBg} !important`,
                      borderTop: `2px solid ${tk.border}`,
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ── WEEK OVERRIDE POPOVER ── */}
      <Popover
        open={!!weekPopover}
        anchorEl={weekPopover?.anchorEl ?? null}
        onClose={() => setWeekPopover(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            borderRadius: tk.radiusL,
            border: `1px solid ${tk.border}`,
            p: 2,
            boxShadow: tk.isDark
              ? "0 8px 32px rgba(0,0,0,.5)"
              : "0 8px 32px rgba(13,27,42,.15)",
            minWidth: 280,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: tk.textSecondary,
            mb: 0.5,
            letterSpacing: ".05em",
            textTransform: "uppercase",
          }}
        >
          Override Week {weekPopover ? weekPopover.weekIdx + 1 : ""}
        </Typography>
        <Typography sx={{ fontSize: 11, color: tk.textDim, mb: 1.5 }}>
          {selectedRows.size > 0
            ? `Applies to ${selectedRows.size} selected row${selectedRows.size !== 1 ? "s" : ""}`
            : `Applies to all ${filtered.length} visible rows`}
        </Typography>
        <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mb: 1 }}>
          {SHIFT_CODES.map((code) => {
            const sc = getShiftColor(code);
            return (
              <Tooltip key={code} title={SHIFT_META[code]?.label} arrow>
                <Box
                  component="button"
                  onClick={() => handleWeekOverride(code, weekPopover!.weekIdx)}
                  sx={{
                    display: "inline-grid",
                    placeItems: "center",
                    minWidth: code === "Leave" ? 50 : 38,
                    height: 32,
                    px: 1,
                    borderRadius: "7px",
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `1.5px solid ${sc.border}`,
                    bgcolor: sc.background,
                    color: sc.color,
                    cursor: "pointer",
                    transition: "all .12s",
                    "&:hover": {
                      filter: "brightness(.9)",
                      transform: "scale(1.1)",
                    },
                    "&:active": { transform: "scale(.96)" },
                  }}
                >
                  {code}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography sx={{ fontSize: 10, color: tk.textDim }}>
          This will overwrite all 7 days of Week{" "}
          {weekPopover ? weekPopover.weekIdx + 1 : ""} with the chosen shift
        </Typography>
      </Popover>

      {/* ── Analytics modal ── */}
      <AnalyticsModal
        open={analyticsOpen}
        emps={filtered}
        onClose={() => setAnalyticsOpen(false)}
      />

      {/* ── Toast ── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity ?? "success"}
          variant="filled"
          icon={toast?.severity === "success" ? <CheckIcon /> : undefined}
          sx={{ alignItems: "center", borderRadius: tk.radiusL }}
          onClose={() => setToast(null)}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
