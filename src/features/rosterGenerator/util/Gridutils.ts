import { alpha } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { MONO, SHIFT_COLORS, SHIFT_ORDER, TOTAL_COLS, type Employee, type FilterState, type ShiftCode } from "../types/Gridtypes";


// ─── Shift helpers ────────────────────────────────────────────────────────────
export const toShiftCode = (raw: string): ShiftCode => {
  const map: Record<string, ShiftCode> = {
    A: "A", B: "B", G: "G", LG: "LG", N: "N", OFF: "OFF", WO: "OFF", H: "G",
  };
  return map[raw?.toUpperCase()] ?? "G";
};

export const shiftStyle = (code: ShiftCode, mode: "light" | "dark") => {
  const c = SHIFT_COLORS[code];
  return {
    bgcolor: mode === "dark" ? c.bgDark : c.bg,
    color: mode === "dark" ? c.textDark : c.text,
    borderColor: alpha(c.solid, 0.25),
  };
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const mondayOf = (d: Date): Date => {
  const x = new Date(d);
  const day = x.getDay() || 7;
  x.setDate(x.getDate() - day + 1);
  return x;
};

export const fmtShort = (d: Date): string =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export const isoWeek = (d: Date): number => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  const ys = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - ys.getTime()) / 86400000 + 1) / 7);
};

// ─── Stat helpers ─────────────────────────────────────────────────────────────
export const emptyCounts = (): Record<ShiftCode, number> =>
  SHIFT_ORDER.reduce((a, c) => ({ ...a, [c]: 0 }), {} as Record<ShiftCode, number>);

export const spanCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  from: number,
  len: number,
): Record<ShiftCode, number> =>
  emps.reduce((acc, e) => {
    grid[e.id]?.slice(from, from + len).forEach((c) => {
      if (c) acc[c]++;
    });
    return acc;
  }, emptyCounts());

export const colCounts = (
  grid: Record<string, ShiftCode[]>,
  emps: Employee[],
  idx: number,
): Record<ShiftCode, number> =>
  emps.reduce((acc, e) => {
    const c = grid[e.id]?.[idx];
    if (c) acc[c]++;
    return acc;
  }, emptyCounts());

export const workingTotal = (c: Record<ShiftCode, number>): number =>
  SHIFT_ORDER.filter((x) => x !== "OFF").reduce((s, x) => s + c[x], 0);

export const empSummary = (row: ShiftCode[] = []) => ({
  work: row.filter((c) => c !== "OFF").length,
  n: row.filter((c) => c === "N").length,
  off: row.filter((c) => c === "OFF").length,
});

// ─── Filter helpers ───────────────────────────────────────────────────────────
export const defaultFilter = (): FilterState => ({
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

export function applyFilters(
  emps: Employee[],
  grid: Record<string, ShiftCode[]>,
  f: FilterState,
): Employee[] {
  const result = emps.filter((e) => {
    if (
      f.query &&
      !`${e.name} ${e.id} ${e.role}`.toLowerCase().includes(f.query.toLowerCase())
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

  return result.sort((a, b) => {
    const rA = grid[a.id] ?? [],
      sA = empSummary(rA);
    const rB = grid[b.id] ?? [],
      sB = empSummary(rB);
    let vA: string | number = "";
    let vB: string | number = "";
    switch (f.sortField) {
      case "name":  vA = a.name;  vB = b.name;  break;
      case "id":    vA = a.id;    vB = b.id;    break;
      case "role":  vA = a.role;  vB = b.role;  break;
      case "level": vA = a.level; vB = b.level; break;
      case "work":  vA = sA.work; vB = sB.work; break;
      case "night": vA = sA.n;    vB = sB.n;    break;
      case "off":   vA = sA.off;  vB = sB.off;  break;
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
}

export function countActiveFilters(f: FilterState): number {
  const def = defaultFilter();
  let n = 0;
  if (f.query) n++;
  if (f.levels.length) n++;
  if (f.roles.length) n++;
  if (f.shiftCodes.length) n++;
  if (f.workRange[0] !== def.workRange[0] || f.workRange[1] !== def.workRange[1]) n++;
  if (f.nightRange[0] !== def.nightRange[0] || f.nightRange[1] !== def.nightRange[1]) n++;
  if (f.showHighLoad) n++;
  if (f.showLowRest) n++;
  return n;
}

// ─── Shared SX helpers (use in sx={[...]} array, never spread with ...) ───────
export const stickyColSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  position: "sticky",
  left: 0,
  zIndex: 4,
  background: theme.palette.background.paper,
  textAlign: "left",
  whiteSpace: "nowrap",
  boxShadow: isDark
    ? "4px 0 12px -4px rgba(0,0,0,0.5)"
    : "4px 0 10px -4px rgba(13,27,42,0.1)",
  borderRight: `1px solid ${theme.palette.divider}`,
});

export const stickyHeadColSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  position: "sticky",
  left: 0,
  top: 0,
  zIndex: 6,
  background: isDark ? "#1A2436" : "#F4F7FB",
  textAlign: "left",
  whiteSpace: "nowrap",
  boxShadow: isDark
    ? "4px 0 12px -4px rgba(0,0,0,0.5)"
    : "4px 0 10px -4px rgba(13,27,42,0.1)",
  borderRight: `1px solid ${theme.palette.divider}`,
  borderBottom: `1.5px solid ${theme.palette.divider}`,
});

export const headerCellSx = (isDark: boolean): SxProps<Theme> => ({
  background: isDark ? "#1A2436" : "#F4F7FB",
  position: "sticky",
  top: 0,
  zIndex: 3,
  padding: "7px 4px",
  fontWeight: 650,
  textAlign: "center" as const,
  fontSize: 11,
  whiteSpace: "nowrap",
  borderBottom: "none",
  minWidth: 56,
  width: 56,
});

export const wkendCellSx = (isDark: boolean): SxProps<Theme> => ({
  background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
});

export const wsepCellSx = (theme: Theme): SxProps<Theme> => ({
  borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
});

export const sumCellSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  fontFamily: MONO,
  fontWeight: 600,
  textAlign: "center" as const,
  fontSize: 11,
  background: isDark ? "rgba(255,255,255,0.008)" : "rgba(0,0,0,0.006)",
  color: theme.palette.text.secondary,
  padding: "6px 8px",
  whiteSpace: "nowrap",
  minWidth: 48,
  width: 48,
});

export const sumCellFirstSx = (theme: Theme, isDark: boolean): SxProps<Theme> => ({
  fontFamily: MONO,
  fontWeight: 600,
  textAlign: "center" as const,
  fontSize: 11,
  background: isDark ? "rgba(255,255,255,0.008)" : "rgba(0,0,0,0.006)",
  color: theme.palette.text.secondary,
  padding: "6px 8px",
  whiteSpace: "nowrap",
  minWidth: 48,
  width: 48,
  borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
});

export const footerCellBaseSx = (isDark: boolean): SxProps<Theme> => ({
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  bgcolor: isDark ? "#141E2E" : "#EEF2F8",
  borderTop: `1.5px solid`,
  borderColor: "divider",
});
