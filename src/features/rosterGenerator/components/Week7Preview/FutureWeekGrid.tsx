import React, { memo, useMemo, useRef, useCallback, useState } from "react";
import {
  alpha,
  Box,
  Skeleton,
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
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

import {
  buildDayColumns,
  colDistribution,
  shiftSummary,
} from "../../util/Futureweek.utils";
import { MONO, SHIFT_COLORS } from "../../util/Shiftconstants";
import type {
  NormalisedEmployee,
  ShiftCode,
} from "../../types/Futureweek.types";
import { EmployeeCell } from "./Employeecell";
import { ShiftChip } from "./Shiftchip";
import { useVirtualRows, VIRTUAL_ROW_HEIGHT } from "./Usevirtualrows";

// ─── Layout constants ──────────────────────────────────────────────────────────

const EMP_COL_WIDTH = 230;
const DAY_COL_WIDTH = 60;
const STAT_COL_WIDTH = 52;
const TOTAL_DAY_COLS = 7;
const TOTAL_COLS = 11;

// ─── Pending-changes type (exposed to parent for save) ────────────────────────
/** keyed by futureId; value = full 7-day shift array after local edits */
export type PendingChangesMap = Record<number, ShiftCode[]>;

// ─── Grid color helpers ────────────────────────────────────────────────────────

function getGridColors(isDark: boolean) {
  return {
    headerBg: isDark ? "#1E293B" : "#F8FAFC",
    weekendBg: isDark ? "#1E293B" : "#F8FAFC",
    footerBg: isDark ? "#1E293B" : "#F8FAFC",
    stickyColBg: isDark ? "#111827" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.08)",
    weekendBorder: isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.15)",
  };
}

function stickyHeaderCellSx(isDark: boolean) {
  const colors = getGridColors(isDark);
  return {
    position: "sticky" as const,
    top: 0,
    zIndex: 4,
    bgcolor: colors.headerBg,
    backgroundImage: "none",
    backdropFilter: "none",
    borderBottom: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.10)"}`,
    whiteSpace: "nowrap" as const,
    padding: "8px 6px",
  };
}

function stickyEmpCellSx(isDark: boolean) {
  const bg = isDark ? "#0F1825" : "#FAFCFF";
  return {
    position: "sticky" as const,
    left: 0,
    zIndex: 2,
    bgcolor: bg,
    backgroundImage: "none",
    borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
    py: 0.75,
    px: 1.5,
    width: EMP_COL_WIDTH,
    minWidth: EMP_COL_WIDTH,
    maxWidth: EMP_COL_WIDTH,
  };
}

function stickyEmpHeadCellSx(isDark: boolean) {
  const bg = getGridColors(isDark).headerBg;
  return {
    position: "sticky" as const,
    left: 0,
    top: 0,
    zIndex: 6,
    bgcolor: bg,
    backgroundImage: "none",
    backdropFilter: "none",
    borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.10)"}`,
    borderBottom: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.10)"}`,
    padding: "8px 12px",
    width: EMP_COL_WIDTH,
    minWidth: EMP_COL_WIDTH,
  };
}

function weekendBodyCellSx(isDark: boolean) {
  return {
    bgcolor: isDark ? "rgba(236,72,153,0.04)" : "rgba(236,72,153,0.025)",
  };
}

function weekendHeaderCellSx(isDark: boolean) {
  return {
    ...stickyHeaderCellSx(isDark),
    bgcolor: isDark ? "#1A1629" : "#F5F0FA",
    backgroundImage: "none",
  };
}

function weekendStartBorderSx() {
  return { borderLeft: "2px solid rgba(236,72,153,0.25)" };
}

function statCellSx() {
  return {
    textAlign: "center" as const,
    px: 0.5,
    width: STAT_COL_WIDTH,
    minWidth: STAT_COL_WIDTH,
  };
}

function statFirstCellSx(isDark: boolean) {
  return {
    ...statCellSx(),
    borderLeft: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.08)"}`,
  };
}

// ─── DayHeaderCell ─────────────────────────────────────────────────────────────

interface DayHeaderCellProps {
  dayIndex: number;
  shortLabel: string;
  isWeekend: boolean;
  isWeekendStart: boolean;
  distribution?: Partial<Record<ShiftCode, number>>;
  isDark: boolean;
}

const DayHeaderCell = memo(function DayHeaderCell({
  shortLabel,
  isWeekend,
  isWeekendStart,
  distribution,
  isDark,
}: DayHeaderCellProps) {
  const baseSx = isWeekend
    ? weekendHeaderCellSx(isDark)
    : stickyHeaderCellSx(isDark);
  const workingCodes: ShiftCode[] = ["A", "B", "G", "LG", "N", "H"];

  return (
    <TableCell
      align="center"
      sx={[
        baseSx,
        { width: DAY_COL_WIDTH, minWidth: DAY_COL_WIDTH },
        isWeekendStart ? weekendStartBorderSx() : {},
      ]}
    >
      <Stack alignItems="center" gap={0.3}>
        {isWeekend && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mb: 0.25 }}>
            <WbSunnyOutlinedIcon
              sx={{ fontSize: 9, color: isDark ? "#F9A8D4" : "#BE185D", opacity: 0.8 }}
            />
            <Typography
              sx={{
                fontSize: 8.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: isDark ? "#F9A8D4" : "#BE185D",
                lineHeight: 1,
              }}
            >
              Wknd
            </Typography>
          </Box>
        )}
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: isWeekend ? 700 : 650,
            lineHeight: 1,
            color: isWeekend ? (isDark ? "#F9A8D4" : "#BE185D") : "text.secondary",
          }}
        >
          {shortLabel}
        </Typography>
        {distribution && (
          <Box
            sx={{
              display: "flex",
              height: 3,
              width: 40,
              borderRadius: 2,
              overflow: "hidden",
              mt: 0.4,
              bgcolor: "action.hover",
            }}
          >
            {workingCodes
              .filter((k) => (distribution[k] ?? 0) > 0)
              .map((k) => (
                <Box
                  key={k}
                  sx={{ flex: distribution[k], height: "100%", bgcolor: SHIFT_COLORS[k].solid }}
                />
              ))}
          </Box>
        )}
      </Stack>
    </TableCell>
  );
});

// ─── EmpRow ────────────────────────────────────────────────────────────────────

interface EmpRowProps {
  employee: NormalisedEmployee;
  isDark: boolean;
  editing: boolean;
  brush: ShiftCode;
  paintingRef: React.MutableRefObject<boolean>;
  localShifts: ShiftCode[];
  isDirty: boolean;
  onPaintCell: (rowId: number, dayIndex: number, newValue: ShiftCode) => void;
}

const EmpRow = memo(
  function EmpRow({
    employee,
    isDark,
    editing,
    brush,
    paintingRef,
    localShifts,
    isDirty,
    onPaintCell,
  }: EmpRowProps) {
    const theme = useTheme();
    const accent = theme.palette.primary.main;
    const accentDim = alpha(accent, 0.08);

    const summary = useMemo(() => shiftSummary(localShifts), [localShifts]);
    const loadPct = Math.round((summary.work / TOTAL_DAY_COLS) * 100);
    const isHighNight = summary.night > 2;
    const isLowRest = summary.off >= 3;

    // Start painting on mousedown
    const handleMouseDown = useCallback(
      (dayIndex: number) => {
        if (!editing) return;
        paintingRef.current = true;
        onPaintCell(employee.futureId, dayIndex, brush);
      },
      [editing, brush, employee.futureId, onPaintCell, paintingRef],
    );

    // Continue painting on hover (drag)
    const handleMouseEnter = useCallback(
      (dayIndex: number) => {
        if (!editing || !paintingRef.current) return;
        onPaintCell(employee.futureId, dayIndex, brush);
      },
      [editing, brush, employee.futureId, onPaintCell, paintingRef],
    );

    // Dirty row highlight: subtle left border accent
    const dirtyRowSx = isDirty
      ? {
          "& td:first-of-type": {
            boxShadow: `inset 3px 0 0 ${alpha(accent, 0.7)}`,
          },
        }
      : {};

    return (
      <TableRow
        sx={{
          height: VIRTUAL_ROW_HEIGHT,
          "&:last-child td": { borderBottom: 0 },
          "&:hover td": {
            bgcolor: isDark ? "rgba(255,255,255,0.025)" : "rgba(13,27,42,0.02)",
          },
          ...(editing && {
            "&:hover td.sticky-emp-cell": {
              bgcolor: `${isDark ? "#0F1825" : "#FAFCFF"} !important`,
            },
          }),
          ...dirtyRowSx,
        }}
      >
        {/* Sticky employee column */}
        <TableCell className="sticky-emp-cell" sx={stickyEmpCellSx(isDark)}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <EmployeeCell employee={employee} accent={editing} />
            <Stack direction="row" gap={0.4} sx={{ ml: 1, flexShrink: 0 }}>
              {/* Unsaved-change dot */}
              {isDirty && (
                <Tooltip title="Unsaved changes" arrow>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: accent,
                      boxShadow: `0 0 5px ${alpha(accent, 0.6)}`,
                      animation: "tkPulse 2s infinite",
                    }}
                  />
                </Tooltip>
              )}
              {isHighNight && (
                <Tooltip title="High night load (>2 nights)" arrow>
                  <Box
                    sx={{
                      width: 7, height: 7, borderRadius: "50%",
                      bgcolor: "warning.main",
                      boxShadow: "0 0 5px rgba(245,158,11,0.55)",
                    }}
                  />
                </Tooltip>
              )}
              {isLowRest && (
                <Tooltip title="Low rest (≥3 days off)" arrow>
                  <Box
                    sx={{
                      width: 7, height: 7, borderRadius: "50%",
                      bgcolor: "error.main",
                      boxShadow: "0 0 5px rgba(239,68,68,0.55)",
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </TableCell>

        {/* Day shift cells */}
        {localShifts.map((code, dayIndex) => {
          const isWeekend = dayIndex === 5 || dayIndex === 6;
          const isWeekendStart = dayIndex === 5;
          const colName = `W7D${dayIndex + 1}`;

          return (
            <TableCell
              key={dayIndex}
              align="center"
              sx={[
                { padding: "4px 3px", width: DAY_COL_WIDTH, minWidth: DAY_COL_WIDTH },
                isWeekend ? weekendBodyCellSx(isDark) : {},
                isWeekendStart ? weekendStartBorderSx() : {},
              ]}
            >
              <Tooltip
                title={`${employee.employeeName} · ${colName} · ${code}`}
                arrow
                disableInteractive
                disableHoverListener={editing}
              >
                <Box
                  component="button"
                  onMouseDown={() => handleMouseDown(dayIndex)}
                  onMouseEnter={() => handleMouseEnter(dayIndex)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border: "none",
                    background: "none",
                    cursor: editing ? "crosshair" : "default",
                    borderRadius: "6px",
                    transition: "box-shadow 0.1s, transform 0.08s",
                    userSelect: "none",
                    // Smooth scale feedback on hover during paint mode
                    ...(editing && {
                      "&:hover": {
                        boxShadow: `0 0 0 2.5px ${accent}, 0 2px 10px ${accentDim}`,
                        transform: "scale(1.08)",
                        zIndex: 1,
                      },
                      "&:active": {
                        transform: "scale(0.96)",
                      },
                    }),
                  }}
                >
                  <ShiftChip code={code} size="md" />
                </Box>
              </Tooltip>
            </TableCell>
          );
        })}

        {/* Work count stat */}
        <TableCell sx={statFirstCellSx(isDark)}>
          <Stack alignItems="center" gap={0.25}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "text.primary" }}>
              {summary.work}
            </Typography>
            <Box
              sx={{
                width: 28, height: 2, borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${loadPct}%`,
                  height: "100%",
                  borderRadius: 1,
                  bgcolor:
                    loadPct >= 85 ? "error.main" : loadPct >= 65 ? "warning.main" : "primary.main",
                }}
              />
            </Box>
          </Stack>
        </TableCell>

        {/* Night stat */}
        <TableCell sx={[statCellSx(), isHighNight ? { color: SHIFT_COLORS.N.fgLight, fontWeight: 700 } : {}]}>
          <Typography sx={{ fontSize: 11, fontWeight: isHighNight ? 700 : 500, fontFamily: MONO }}>
            {summary.night}
          </Typography>
        </TableCell>

        {/* Off stat */}
        <TableCell sx={[statCellSx(), isLowRest ? { color: SHIFT_COLORS.OFF.fgLight, fontWeight: 700 } : {}]}>
          <Typography sx={{ fontSize: 11, fontWeight: isLowRest ? 700 : 500, fontFamily: MONO }}>
            {summary.off}
          </Typography>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.employee === next.employee &&
    prev.isDark === next.isDark &&
    prev.editing === next.editing &&
    prev.brush === next.brush &&
    prev.localShifts === next.localShifts &&
    prev.isDirty === next.isDirty,
);

// ─── SkeletonRow ───────────────────────────────────────────────────────────────

function SkeletonRow({ isDark }: { isDark: boolean }) {
  return (
    <TableRow sx={{ height: VIRTUAL_ROW_HEIGHT }}>
      <TableCell sx={stickyEmpCellSx(isDark)}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "9px", flexShrink: 0 }} />
          <Stack gap={0.5}>
            <Skeleton variant="text" width={120} height={14} />
            <Skeleton variant="text" width={80} height={10} />
          </Stack>
        </Stack>
      </TableCell>
      {Array.from({ length: TOTAL_DAY_COLS }).map((_, i) => (
        <TableCell key={i} align="center" sx={{ padding: "4px 3px" }}>
          <Skeleton variant="rounded" width={40} height={28} sx={{ mx: "auto", borderRadius: "6px" }} />
        </TableCell>
      ))}
      {["W", "N", "OFF"].map((s) => (
        <TableCell key={s} sx={statCellSx()}>
          <Skeleton variant="text" width={22} height={14} sx={{ mx: "auto" }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── FooterDayCell ─────────────────────────────────────────────────────────────

interface FooterCellProps {
  count: number;
  totalEmps: number;
  isWeekend: boolean;
  isWeekendStart: boolean;
  isDark: boolean;
}

const FooterDayCell = memo(function FooterDayCell({
  count,
  totalEmps,
  isWeekend,
  isWeekendStart,
  isDark,
}: FooterCellProps) {
  const bg = isDark ? "#141E2D" : "#F1F5FA";
  return (
    <TableCell
      align="center"
      sx={[
        {
          position: "sticky" as const,
          bottom: 0,
          zIndex: 2,
          bgcolor: bg,
          backgroundImage: "none",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
          padding: "6px 3px",
          width: DAY_COL_WIDTH,
          minWidth: DAY_COL_WIDTH,
        },
        isWeekend ? { bgcolor: isDark ? "#1A1629" : "#F5F0FA", backgroundImage: "none" } : {},
        isWeekendStart ? weekendStartBorderSx() : {},
      ]}
    >
      <Stack alignItems="center" gap={0}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "text.primary" }}>
          {count}
        </Typography>
        <Typography sx={{ fontSize: 8.5, color: "text.disabled" }}>/{totalEmps}</Typography>
      </Stack>
    </TableCell>
  );
});

// ─── FutureWeekGrid ────────────────────────────────────────────────────────────

interface FutureWeekGridProps {
  employees: NormalisedEmployee[];
  isLoading: boolean;
  totalEmployees: number;
  isoYear: number;
  isoWeek: number;
  editing: boolean;
  brush: ShiftCode;
  paintingRef: React.MutableRefObject<boolean>;
  /** Called whenever local pending-changes map updates (for parent to drive Save) */
  onPendingChanges?: (changes: PendingChangesMap) => void;
  /** Parent calls this to clear all pending overrides after a successful save */
  clearPendingRef?: React.MutableRefObject<(() => void) | null>;
}

const DAY_COLUMNS = buildDayColumns();

export function FutureWeekGrid({
  employees,
  isLoading,
  totalEmployees,
  isoYear,
  isoWeek,
  editing,
  brush,
  paintingRef,
  onPendingChanges,
  clearPendingRef,
}: FutureWeekGridProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── Local optimistic overrides: futureId → ShiftCode[] ───────────────────
  const [localGrid, setLocalGrid] = useState<PendingChangesMap>({});
  const localGridRef = useRef<PendingChangesMap>({});

  // Expose a clear function so parent can wipe state after save
  if (clearPendingRef) {
    clearPendingRef.current = () => {
      setLocalGrid({});
      localGridRef.current = {};
    };
  }

  const getShifts = useCallback(
    (emp: NormalisedEmployee): ShiftCode[] =>
      localGrid[emp.futureId] ?? emp.shifts,
    [localGrid],
  );

  // ── Cell paint — local only, no API ──────────────────────────────────────
  const handlePaintCell = useCallback(
    (rowId: number, dayIndex: number, newValue: ShiftCode) => {
      const emp = employees.find((e) => e.futureId === rowId);
      const base: ShiftCode[] =
        localGridRef.current[rowId] ?? emp?.shifts ?? [];

      if (base[dayIndex] === newValue) return; // no-op

      const nextShifts = [...base] as ShiftCode[];
      nextShifts[dayIndex] = newValue;

      const next = { ...localGridRef.current, [rowId]: nextShifts };
      localGridRef.current = next;
      setLocalGrid(next);
      onPendingChanges?.(next);
    },
    [employees, onPendingChanges],
  );

  const STAT_HEADERS = useMemo(
    () => [
      { key: "W", icon: <WorkOutlineIcon sx={{ fontSize: 12 }} />, label: "W", tooltip: "Working days" },
      { key: "N", icon: <NightsStayOutlinedIcon sx={{ fontSize: 12 }} />, label: "N", tooltip: "Night shifts" },
      { key: "OFF", icon: <EventBusyOutlinedIcon sx={{ fontSize: 12 }} />, label: "OFF", tooltip: "Off days (OFF + WO)" },
    ],
    [],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { visibleRows, paddingTop, paddingBottom } = useVirtualRows(employees, containerRef);

  const distributions = useMemo(
    () => DAY_COLUMNS.map((col) => colDistribution(employees, col.dayIndex)),
    [employees],
  );

  const staffedPerDay = useMemo(
    () =>
      DAY_COLUMNS.map((col) => {
        const dist = colDistribution(employees, col.dayIndex);
        return Object.entries(dist)
          .filter(([k]) => k !== "OFF" && k !== "WO")
          .reduce((s, [, v]) => s + v, 0);
      }),
    [employees],
  );

  const footerBg = isDark ? "#141E2D" : "#F1F5FA";

  return (
    <TableContainer
      ref={containerRef}
      sx={{
        flex: 1,
        overflow: "auto",
        willChange: "transform",
        "&::-webkit-scrollbar": { width: 6, height: 6 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
          borderRadius: 6,
          "&:hover": {
            bgcolor: isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.24)",
          },
        },
        maxHeight: `calc(100vh - 265px)`,
        ...(editing && {
          outline: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          outlineOffset: -2,
        }),
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: EMP_COL_WIDTH + TOTAL_DAY_COLS * DAY_COL_WIDTH + 3 * STAT_COL_WIDTH,
        }}
      >
        <colgroup>
          <col style={{ width: EMP_COL_WIDTH, minWidth: EMP_COL_WIDTH }} />
          {Array.from({ length: TOTAL_DAY_COLS }).map((_, i) => (
            <col key={i} style={{ width: DAY_COL_WIDTH, minWidth: DAY_COL_WIDTH }} />
          ))}
          {Array.from({ length: 3 }).map((_, i) => (
            <col key={`stat-${i}`} style={{ width: STAT_COL_WIDTH, minWidth: STAT_COL_WIDTH }} />
          ))}
        </colgroup>

        {/* ── HEAD ── */}
        <TableHead>
          <TableRow>
            <TableCell sx={stickyEmpHeadCellSx(isDark)}>
              <Stack direction="row" alignItems="center" gap={0.75}>
                <PersonIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                  Employee
                </Typography>
              </Stack>
            </TableCell>

            {DAY_COLUMNS.map((col) => (
              <DayHeaderCell
                key={col.dayIndex}
                dayIndex={col.dayIndex}
                shortLabel={col.shortLabel}
                isWeekend={col.isWeekend}
                isWeekendStart={col.isWeekendStart}
                distribution={isLoading ? undefined : distributions[col.dayIndex]}
                isDark={isDark}
              />
            ))}

            {STAT_HEADERS.map((stat, i) => (
              <Tooltip key={stat.key} title={stat.tooltip} arrow placement="top">
                <TableCell
                  align="center"
                  sx={[
                    stickyHeaderCellSx(isDark),
                    i === 0 ? statFirstCellSx(isDark) : statCellSx(),
                    { zIndex: 4 },
                  ]}
                >
                  <Stack alignItems="center" gap={0.25}>
                    <Box sx={{ color: "text.secondary" }}>{stat.icon}</Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary" }}>
                      {stat.label}
                    </Typography>
                  </Stack>
                </TableCell>
              </Tooltip>
            ))}
          </TableRow>
        </TableHead>

        {/* ── BODY ── */}
        <TableBody>
          {paddingTop > 0 && (
            <TableRow style={{ height: paddingTop }}>
              <TableCell colSpan={TOTAL_COLS} sx={{ border: 0, p: 0 }} />
            </TableRow>
          )}

          {isLoading &&
            Array.from({ length: 12 }).map((_, i) => (
              <SkeletonRow key={`sk-${i}`} isDark={isDark} />
            ))}

          {!isLoading &&
            visibleRows.map((emp) => (
              <EmpRow
                key={emp.rowKey}
                employee={emp}
                isDark={isDark}
                editing={editing}
                brush={brush}
                paintingRef={paintingRef}
                localShifts={getShifts(emp)}
                isDirty={emp.futureId in localGrid}
                onPaintCell={handlePaintCell}
              />
            ))}

          {paddingBottom > 0 && (
            <TableRow style={{ height: paddingBottom }}>
              <TableCell colSpan={TOTAL_COLS} sx={{ border: 0, p: 0 }} />
            </TableRow>
          )}

          {!isLoading && employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={TOTAL_COLS} sx={{ textAlign: "center", py: 8, border: 0 }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>
                  No schedule data available for this period
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: 0.5 }}>
                  Check the selected sub-domain or try again later
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {/* ── FOOTER ── */}
        {!isLoading && employees.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky" as const,
                  left: 0,
                  bottom: 0,
                  zIndex: 5,
                  bgcolor: footerBg,
                  backgroundImage: "none",
                  borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
                  borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
                  py: 0.75,
                  px: 1.5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                Staffed / Day
              </TableCell>

              {DAY_COLUMNS.map((col) => (
                <FooterDayCell
                  key={col.dayIndex}
                  count={staffedPerDay[col.dayIndex]}
                  totalEmps={employees.length}
                  isWeekend={col.isWeekend}
                  isWeekendStart={col.isWeekendStart}
                  isDark={isDark}
                />
              ))}

              {Array.from({ length: 3 }).map((_, i) => (
                <TableCell
                  key={`stat-footer-${i}`}
                  sx={{
                    position: "sticky" as const,
                    bottom: 0,
                    zIndex: 2,
                    bgcolor: footerBg,
                    backgroundImage: "none",
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(13,27,42,0.07)"}`,
                    ...(i === 0
                      ? { borderLeft: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.08)"}` }
                      : {}),
                  }}
                />
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}