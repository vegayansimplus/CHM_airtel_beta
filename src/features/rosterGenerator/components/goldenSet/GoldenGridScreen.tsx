import React, {
  useCallback,
  useDeferredValue,
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
  type Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

// ── Components ────────────────────────────────────────────────────────────────
import RosterFilterDrawer, {
  type FilterState,
  type SortConfig,
  type SortField,
} from "./RosterFilterDrawer";

// ── Icons ─────────────────────────────────────────────────────────────────────
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";

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

interface LevelBadgeProps {
  level: string;
}

interface ShiftPillProps {
  code: string;
  size?: "sm" | "md";
  onClick?: () => void;
  active?: boolean;
}

interface EmployeeCellProps {
  emp: GoldenSetEmployee;
  accent?: boolean;
}

interface BrushBarProps {
  brush: string;
  onSelect: (code: string) => void;
}

interface AnalyticsModalProps {
  open: boolean;
  emps: GoldenSetEmployee[];
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────
function useTabColorTokens(theme: Theme): TabColorTokens {
  const isDark = theme.palette.mode === "dark";
  return {
    isDark,
    accent: theme.palette.primary.main,
    accentDim: alpha(theme.palette.primary.main, 0.08),
    accentBorder: alpha(theme.palette.primary.main, 0.35),
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
const EMP_COL_W = 230;
const AVATAR = 28;
const MONO = "'Roboto Mono', 'Fira Mono', monospace";

const DOW_SHORT: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DOW_LONG: string[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
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
  ["New Joinee", { background: "#FFFBEB", color: "#92400E", border: "#FCD34D" }],
  ["N", { background: "#EEF2FF", color: "#3730A3", border: "#818CF8" }],
  ["A", { background: "#F5F3FF", color: "#6B21A8", border: "#C4B5FD" }],
  ["B", { background: "#ECFEFF", color: "#155E75", border: "#67E8F9" }],
  ["G", { background: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" }],
  ["L", { background: "#ECFDF5", color: "#065F46", border: "#6EE7B7" }],
  ["W", { background: "#F8FAFC", color: "#475569", border: "#CBD5F5" }],
  ["H", { background: "#FFF7ED", color: "#C2410C", border: "#FDBA74" }],
  ["C", { background: "#F1F5F9", color: "#475569", border: "#CBD5E1" }],
]);

const DEFAULT_SHIFT_COLOR: ShiftColor = {
  background: "#EFF6FF",
  color: "#1D4ED8",
  border: "#93C5FD",
};

// ── Shift code → numeric value for API ───────────────────────────────────────
// 1 = working shift, 2 = off/rest — adjust if your backend uses different values
const SHIFT_CODE_TO_NUM: Record<string, number> = {
  G: 1,
  N: 1,
  A: 1,
  B: 1,
  L: 1,
  W: 2,
  H: 2,
  C: 2,
  Leave: 2,
};

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

function transformApiDataToEmployees(apiRows: GoldenSetApiRow[]): GoldenSetEmployee[] {
  return apiRows.map(transformApiRowToEmployee);
}

/**
 * Converts a GoldenSetEmployee's shifts array into the DailyGoldenSetPayload
 * shape expected by POST /goldenset/dailygoldenset
 */
function buildDailyGoldenSetPayload(emp: GoldenSetEmployee): DailyGoldenSetPayload {
  const fields: Record<string, number> = {};
  for (let w = 1; w <= 6; w++) {
    for (let d = 1; d <= 7; d++) {
      const idx = (w - 1) * 7 + (d - 1);
      const code = emp.shifts[idx] ?? "W";
      fields[`W${w}D${d}`] = SHIFT_CODE_TO_NUM[code] ?? 1;
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
  const work = shifts.filter((s) => !["W", "H", "C", "Leave"].includes(s)).length;
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

function colTotals(emps: GoldenSetEmployee[], idx: number): Record<string, number> {
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
function LevelBadge({ level }: LevelBadgeProps): React.ReactElement {
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

function ShiftPill({ code, size = "md", onClick, active }: ShiftPillProps): React.ReactElement {
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

function EmployeeCell({ emp, accent }: EmployeeCellProps): React.ReactElement {
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
          bgcolor: accent
            ? tk.accentDim
            : alpha(theme.palette.text.primary, 0.05),
          color: accent ? tk.accent : tk.textSecondary,
          border: "1.5px solid",
          borderColor: accent ? tk.accentBorder : "transparent",
          transition: "all 0.2s",
        }}
      >
        {inits}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography
            sx={{ fontSize: 12, fontWeight: 650, lineHeight: 1.15, color: tk.textPrimary }}
            noWrap
          >
            {emp.name}
          </Typography>
          <LevelBadge level={emp.level} />
        </Stack>
        <Typography
          sx={{ fontSize: 9.5, color: tk.textSecondary, fontWeight: 500, mt: 0.1, lineHeight: 1.2 }}
          noWrap
        >
          {emp.olmid} · {emp.role.replace(/_/g, " ")}
        </Typography>
      </Box>
    </Stack>
  );
}

function ShiftLegend(): React.ReactElement {
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

function BrushBar({ brush, onSelect }: BrushBarProps): React.ReactElement {
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
        <Typography sx={{ fontSize: 11, color: tk.accent, fontWeight: 700, letterSpacing: "0.02em" }}>
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
        Click or drag cells to paint
      </Typography>
    </Stack>
  );
}

function AnalyticsModal({ open, emps, onClose }: AnalyticsModalProps): React.ReactElement {
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

  const kpis: Array<{ label: string; value: number; color: string }> = [
    { label: "Total Shifts", value: totalShifts, color: tk.accent },
    { label: "Balanced", value: balanced, color: theme.palette.success.main },
    { label: "High Night Load", value: nightHeavy, color: theme.palette.warning.main },
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
                sx={{ fontSize: 24, fontWeight: 800, color: k.color, fontFamily: MONO, lineHeight: 1 }}
              >
                {k.value}
              </Typography>
              <Typography
                sx={{ fontSize: 10, color: tk.textSecondary, fontWeight: 600, mt: 0.5, lineHeight: 1.3 }}
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
                  sx={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, mt: 1, lineHeight: 1, color: sc.color }}
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
                    "& .MuiLinearProgress-bar": { bgcolor: sc.border, borderRadius: 2 },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: tk.textSecondary, fontWeight: 600, mt: 0.5, display: "block", fontFamily: MONO }}
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
      <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${tk.border}` }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{ textTransform: "none", px: 3, borderRadius: tk.radius, fontWeight: 650 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<SortConfig>({ field: "name", dir: "asc" });
  const [editing, setEditing] = useState<boolean>(false);
  const [brush, setBrush] = useState<string>("G");
  const [analyticsOpen, setAnalyticsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);
  const [searchRaw, setSearchRaw] = useState<string>("");
  const search = useDeferredValue(searchRaw);
  const painting = useRef<boolean>(false);

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaveChanges = useCallback(async (): Promise<void> => {
    const changedPrefIds = Object.keys(localGrid).map(Number);

    if (changedPrefIds.length === 0) {
      setToast({ msg: "No changes to save", severity: "success" });
      setEditing(false);
      return;
    }

    // Build payload only for employees that were edited
    const payload: DailyGoldenSetPayload[] = allEmps
      .filter((e) => changedPrefIds.includes(e.prefId))
      .map((e) => buildDailyGoldenSetPayload({ ...e, shifts: getShifts(e) }));

    try {
      await updateDailyGoldenSet(payload).unwrap();
      setToast({ msg: `Saved ${payload.length} employee(s) successfully`, severity: "success" });
      setEditing(false);
    } catch (err) {
      console.error("Failed to save golden set:", err);
      setToast({ msg: "Failed to save changes. Please try again.", severity: "error" });
      // Keep editing mode open so the user can retry
    }
  }, [localGrid, allEmps, getShifts, updateDailyGoldenSet]);

  // ── Filter + sort pipeline ────────────────────────────────────────────────
  const filtered = useMemo<GoldenSetEmployee[]>(() => {
    const result = allEmps.filter((e) => {
      if (
        search &&
        !`${e.name} ${e.olmid} ${e.role}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filter.levels.length && !filter.levels.includes(e.level)) return false;
      if (filter.roles.length && !filter.roles.includes(e.role)) return false;
      const shifts = getShifts(e);
      const s = summarise(shifts);
      if (s.work < filter.workRange[0] || s.work > filter.workRange[1]) return false;
      if (s.night < filter.nightRange[0] || s.night > filter.nightRange[1]) return false;
      if (filter.showHighLoad && s.night <= 8) return false;
      if (filter.showLowRest && s.off >= 6) return false;
      if (filter.shiftCodes.length && !filter.shiftCodes.every((c) => shifts.includes(c)))
        return false;
      return true;
    });

    return [...result].sort((a, b) => {
      const sA = summarise(getShifts(a));
      const sB = summarise(getShifts(b));
      let vA: string | number;
      let vB: string | number;
      switch (sort.field) {
        case "name":   vA = a.name;     vB = b.name;     break;
        case "olmid":  vA = a.olmid;    vB = b.olmid;    break;
        case "role":   vA = a.role;     vB = b.role;     break;
        case "level":  vA = a.level;    vB = b.level;    break;
        case "work":   vA = sA.work;    vB = sB.work;    break;
        case "night":  vA = sA.night;   vB = sB.night;   break;
        case "off":    vA = sA.off;     vB = sB.off;     break;
        case "load":   vA = sA.loadPct; vB = sB.loadPct; break;
        default:       vA = a.name;     vB = b.name;
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

  // ── Paint handler ─────────────────────────────────────────────────────────
  const paintCell = useCallback(
    (prefId: number, colIdx: number): void => {
      setLocalGrid((prev) => {
        const base =
          prev[prefId] ?? allEmps.find((e) => e.prefId === prefId)?.shifts ?? [];
        const next = [...base];
        next[colIdx] = brush;
        return { ...prev, [prefId]: next };
      });
    },
    [brush, allEmps],
  );

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilters = useMemo<number>(() => {
    const def = defaultFilter();
    let c = 0;
    if (search) c++;
    if (filter.levels.length) c++;
    if (filter.roles.length) c++;
    if (filter.shiftCodes.length) c++;
    if (filter.workRange[0] !== def.workRange[0] || filter.workRange[1] !== def.workRange[1]) c++;
    if (filter.nightRange[0] !== def.nightRange[0] || filter.nightRange[1] !== def.nightRange[1]) c++;
    if (filter.showHighLoad) c++;
    if (filter.showLowRest) c++;
    return c;
  }, [filter, search]);

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCsv = useCallback((): void => {
    const header = [
      "Name", "OLM ID", "Role", "Level",
      ...Array.from({ length: TOTAL_COLS }, (_, i) => `W${Math.floor(i / 7) + 1}D${(i % 7) + 1}`),
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
    setToast({ msg: "CSV exported successfully", severity: "success" });
  }, [filtered, getShifts]);

  // ── Derived style helpers ─────────────────────────────────────────────────
  const nightColor = getShiftColor("N").color;
  const offColor = getShiftColor("W").color;
  const headerBg = tk.surface2;
  const weekHeaderBg = tk.isDark ? "rgba(24,95,165,0.13)" : "rgba(24,95,165,0.07)";
  const dayHeaderBg = tk.isDark ? "rgba(15,110,86,0.10)" : "rgba(15,110,86,0.05)";
  const empColBg = tk.isDark ? "rgba(30,30,46,1)" : "rgba(248,250,252,1)";

  const baseHeadSx = {
    position: "sticky" as const,
    whiteSpace: "nowrap" as const,
    boxSizing: "border-box" as const,
    py: "6px",
    px: "4px",
    fontWeight: 650,
    color: tk.textSecondary,
    textAlign: "center" as const,
    fontSize: 11,
  };

  const Z_INDEX = {
    HEADER_CORNER: 150,
    WEEK_HEADER: 110,
    DAY_HEADER: 100,
    STICKY_COLUMN: 90,
    BODY: 1,
  };

  const WEEK_ROW_H = 28;

  const weekHeadSx = {
    ...baseHeadSx,
    position: "sticky",
    top: 0,
    zIndex: Z_INDEX.WEEK_HEADER,
    bgcolor: `${theme.palette.background.paper} !important`,
    borderBottom: `1px solid ${tk.border} !important`,
  };

  const dayHeadSx = {
    ...baseHeadSx,
    position: "sticky",
    top: WEEK_ROW_H,
    zIndex: Z_INDEX.DAY_HEADER,
    bgcolor: `${theme.palette.background.paper} !important`,
    borderBottom: `2px solid ${tk.border} !important`,
  };

  const stickyCellSx = {
    position: "sticky",
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
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

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
              : "An error occurred while fetching the data. Please try again."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!allEmps || allEmps.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography>
            No roster data available. Please check your configuration and try again.
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
      }}
      onMouseUp={() => { painting.current = false; }}
    >
      {/* ── Toolbar ── */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
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
            sx={{ fontSize: 12.5, width: "100%", fontWeight: 500, color: tk.textPrimary }}
          />
          {searchRaw && (
            <IconButton size="small" onClick={() => setSearchRaw("")} sx={{ p: 0.25 }}>
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
            sx={{ fontSize: 12, height: 34, borderRadius: tk.radius, fontWeight: 600 }}
          >
            Filters
          </Button>
        </Badge>

        {/* Quick-sort chips */}
        <Stack direction="row" gap={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
          {(["name", "work", "night"] as SortField[]).map((f) => (
            <Chip
              key={f}
              label={f.charAt(0).toUpperCase() + f.slice(1)}
              size="small"
              variant={sort.field === f ? "filled" : "outlined"}
              color={sort.field === f ? "primary" : "default"}
              icon={
                sort.field === f ? (
                  sort.dir === "asc" ? <ExpandLessIcon /> : <ExpandMoreIcon />
                ) : undefined
              }
              onClick={() =>
                setSort((s) => ({
                  field: f,
                  dir: s.field === f && s.dir === "asc" ? "desc" : "asc",
                }))
              }
              sx={{ fontSize: 11, height: 26, fontWeight: 600, borderRadius: "6px", cursor: "pointer" }}
            />
          ))}
        </Stack>

        <Box flex={1} />

        <Button
          size="small"
          variant="outlined"
          startIcon={<BarChartIcon sx={{ fontSize: 15 }} />}
          onClick={() => setAnalyticsOpen(true)}
          sx={{ fontSize: 12, height: 34, borderRadius: tk.radius, fontWeight: 600 }}
        >
          Analytics
        </Button>

        {/* Edit / Done Editing button */}
        <Button
          size="small"
          variant={editing ? "contained" : "outlined"}
          color={editing ? "warning" : "inherit"}
          startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={() => {
            if (!editing) {
              // Enter edit mode
              setEditing(true);
            } else {
              // Exit edit mode without saving
              setEditing(false);
              setToast({ msg: "Edit cancelled — changes not saved", severity: "success" });
            }
          }}
          disableElevation
          sx={{ fontSize: 12, height: 34, borderRadius: tk.radius, fontWeight: 600 }}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>

        {/* Save button — only visible in edit mode */}
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
            disabled={isSaving}
            disableElevation
            sx={{ fontSize: 12, height: 34, borderRadius: tk.radius, fontWeight: 600 }}
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        )}

        <Tooltip title="Export visible rows as CSV">
          <IconButton
            size="small"
            onClick={downloadCsv}
            sx={{ border: `1.5px solid ${tk.border}`, borderRadius: tk.radius, width: 34, height: 34 }}
          >
            <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reload data">
          <IconButton
            size="small"
            onClick={() => refetch()}
            sx={{ border: `1.5px solid ${tk.border}`, borderRadius: tk.radius, width: 34, height: 34 }}
          >
            <RefreshIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── Filter Drawer ── */}
      <RosterFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filter={filter}
        allRoles={allRoles}
        onApply={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {/* ── Main grid card ── */}
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
            p: "12px 18px",
            borderBottom: `1px solid ${tk.border}`,
            flexShrink: 0,
            background: tk.isDark
              ? "linear-gradient(135deg,rgba(24,95,165,0.06),rgba(15,110,86,0.03))"
              : "linear-gradient(135deg,rgba(24,95,165,0.03),rgba(15,110,86,0.015))",
          }}
        >
          <ShiftLegend />
          <Box flex={1} />
          <Typography variant="caption" sx={{ color: tk.textSecondary, fontWeight: 500 }}>
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
          {/* Unsaved changes indicator */}
          {editing && Object.keys(localGrid).length > 0 && (
            <Chip
              label={`${Object.keys(localGrid).length} unsaved`}
              size="small"
              color="warning"
              sx={{ height: 24, fontSize: 10.5, borderRadius: "6px", fontWeight: 650 }}
            />
          )}
        </Stack>

        {/* Paint brush bar */}
        {editing && <BrushBar brush={brush} onSelect={setBrush} />}

        {/* ── Table ── */}
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            position: "relative",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: tk.isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
              borderRadius: 6,
              "&:hover": {
                bgcolor: tk.isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
              },
            },
            maxHeight: `calc(100vh - 320px)`,
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              "& .MuiTableCell-stickyHeader": {
                backgroundColor: `${theme.palette.background.paper} !important`,
              },
              "& .sticky-corner": { left: 0, zIndex: 9999 },
            }}
          >
            {/* ── TableHead ── */}
            <TableHead>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    zIndex: Z_INDEX.HEADER_CORNER,
                    width: EMP_COL_W,
                    minWidth: EMP_COL_W,
                    maxWidth: EMP_COL_W,
                    bgcolor: `${empColBg} !important`,
                    textAlign: "left",
                    borderBottom: `2px solid ${tk.border} !important`,
                    borderRight: `1.5px solid ${tk.border} !important`,
                  }}
                >
                  Employee
                </TableCell>

                {Array.from({ length: 6 }, (_, w) => (
                  <TableCell
                    key={w}
                    colSpan={7}
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
                      bgcolor: `${
                        w % 2 === 1
                          ? tk.isDark
                            ? "rgba(24,95,165,0.18)"
                            : "rgba(24,95,165,0.10)"
                          : weekHeaderBg
                      } !important`,
                      color: w % 2 === 1 ? tk.accent : tk.textSecondary,
                    }}
                  >
                    Week {w + 1}
                  </TableCell>
                ))}

                {(["Work", "N", "OFF"] as const).map((h, i) => (
                  <TableCell
                    key={h}
                    rowSpan={2}
                    sx={{
                      ...weekHeadSx,
                      width: 64,
                      minWidth: 64,
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
                        bgcolor: `${
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
                    colSpan={TOTAL_COLS + 5}
                    sx={{ textAlign: "center", py: "48px", color: tk.textSecondary, fontSize: 13 }}
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

                  return (
                    <TableRow
                      key={emp.prefId}
                      sx={{
                        height: CELL_H + 8,
                        transition: "background 0.1s",
                        // Subtle tint on rows with unsaved local edits
                        bgcolor: hasLocalChanges && editing
                          ? alpha(theme.palette.warning.main, 0.04)
                          : undefined,
                        "&:hover td": {
                          bgcolor: tk.isDark
                            ? "rgba(255,255,255,0.025)"
                            : "rgba(13,27,42,0.025)",
                        },
                        "&:hover td.sticky-emp": {
                          bgcolor: `${alpha(empColBg, 0.92)} !important`,
                        },
                      }}
                    >
                      {/* Sticky employee cell */}
                      <TableCell
                        className="sticky-emp"
                        sx={{
                          ...stickyCellSx,
                          zIndex: Z_INDEX.STICKY_COLUMN,
                          backgroundColor: `${theme.palette.background.paper} !important`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <EmployeeCell emp={emp} accent={editing} />
                          {(isHighLoad || isLowRest) && (
                            <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
                              {isHighLoad && (
                                <Tooltip title="High night load (>8 nights)" arrow>
                                  <Box
                                    sx={{
                                      width: 7, height: 7, borderRadius: "50%",
                                      bgcolor: "warning.main",
                                      boxShadow: `0 0 6px ${alpha(theme.palette.warning.main, 0.5)}`,
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {isLowRest && (
                                <Tooltip title="Low rest violation (<6 days off)" arrow>
                                  <Box
                                    sx={{
                                      width: 7, height: 7, borderRadius: "50%",
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
                        const d = i % 7;
                        const w = Math.floor(i / 7);
                        return (
                          <TableCell key={i} sx={dayCellSx(i)}>
                            <Tooltip
                              title={`${emp.name} · W${w + 1} ${DOW_LONG[d]} · ${SHIFT_META[code]?.label ?? code}`}
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
                                  cursor: editing ? "pointer" : "default",
                                  padding: 0,
                                  userSelect: "none",
                                  transition: "box-shadow 0.12s,border-color 0.12s,filter 0.12s",
                                  bgcolor: sc.background,
                                  color: sc.color,
                                  borderColor: sc.border,
                                  ...(editing && {
                                    "&:hover": {
                                      position: "relative",
                                      boxShadow: `0 0 0 2.5px ${tk.accent},0 2px 12px ${tk.accentDim}`,
                                      borderColor: `${tk.accent} !important`,
                                      filter: "brightness(0.93) saturate(1.2)",
                                    },
                                  }),
                                }}
                                onMouseDown={() => {
                                  if (!editing) return;
                                  painting.current = true;
                                  paintCell(emp.prefId, i);
                                }}
                                onMouseEnter={() => {
                                  if (editing && painting.current) paintCell(emp.prefId, i);
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
                          fontFamily: MONO, fontWeight: 600, textAlign: "center", fontSize: 11,
                          bgcolor: tk.isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.008)",
                          color: tk.textSecondary, px: "8px",
                          borderLeft: `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                        }}
                      >
                        {s.work}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: MONO, textAlign: "center", fontSize: 11,
                          bgcolor: tk.isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.008)",
                          px: "8px",
                          color: isHighLoad ? nightColor : tk.textSecondary,
                          fontWeight: isHighLoad ? 700 : 600,
                        }}
                      >
                        {s.night}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: MONO, textAlign: "center", fontSize: 11,
                          bgcolor: tk.isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.008)",
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
                    position: "sticky", bottom: 0, left: 0, zIndex: 5,
                    borderTop: `2px solid ${tk.border}`,
                    fontWeight: 600, color: tk.textSecondary,
                    px: "14px", py: "6px", fontSize: 11, textAlign: "left",
                    boxShadow: tk.isDark
                      ? "3px 0 8px -2px rgba(0,0,0,0.5)"
                      : "3px 0 8px -2px rgba(13,27,42,0.1)",
                    borderRight: `1.5px solid ${tk.border} !important`,
                    bgcolor: `${empColBg} !important`,
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
                        position: "sticky", bottom: 0, zIndex: 2,
                        bgcolor: `${empColBg} !important`,
                        borderTop: `2px solid ${tk.border}`,
                        fontFamily: MONO, fontWeight: 700, fontSize: 11,
                        textAlign: "center", py: "6px", px: "4px",
                        borderLeft:
                          d === 0 && w > 0
                            ? `2.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
                            : undefined,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11.5, fontFamily: MONO, fontWeight: 700,
                          color:
                            wt < 5 ? "error.main" : wt > 15 ? "warning.main" : tk.textPrimary,
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
                    position: "sticky", bottom: 0, zIndex: 2,
                    bgcolor: `${headerBg} !important`,
                    borderTop: `2px solid ${tk.border}`,
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

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