import React, { memo, useCallback, useMemo, useRef } from "react";
import {
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
  alpha,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import {
  DOW,
  DOW_LONG,
  MONO,
  SHIFT_COLORS,
  TOTAL_COLS,
  TODAY,
  type Employee,
  type ShiftCode,
} from "../../types/Gridtypes";
import {
  colCounts,
  empSummary,
  headerCellSx,
  stickyColSx,
  stickyHeadColSx,
  sumCellFirstSx,
  sumCellSx,
  sumCellFirstSx as footerFirstSx,
  wkendCellSx,
  workingTotal,
  wsepCellSx,
  footerCellBaseSx,
  shiftStyle,
} from "../../util/Gridutils";
import { EmployeeCell, ShiftBadge } from "../Week7Preview/Gridsharedui";
import { useVirtualRows, VIRTUAL_ROW_HEIGHT } from "./Usevirtualrows";

// ─── Sub-components ────────────────────────────────────────────────────────────

interface EmpRowProps {
  emp: Employee;
  grid: Record<string, ShiftCode[]>;
  dates: Date[];
  editing: boolean;
  brush: ShiftCode;
  paintingRef: React.MutableRefObject<boolean>;
  onCellChange: (empId: string, colIdx: number, code: ShiftCode) => void;
  isDark: boolean;
}

const EmpRow = memo(function EmpRow({
  emp,
  grid,
  dates,
  editing,
  brush,
  paintingRef,
  onCellChange,
  isDark,
}: EmpRowProps) {
  const theme = useTheme();
  const row = grid[emp.id] ?? ([] as ShiftCode[]);
  const { work, n, off } = useMemo(() => empSummary(row), [row]);
  const loadPct = Math.round((work / TOTAL_COLS) * 100);
  const isHighLoad = n > 2;
  const isLowRest = off >= 3;

  return (
    <TableRow
      sx={{
        height: VIRTUAL_ROW_HEIGHT,
        "&:last-child td": { borderBottom: 0 },
      }}
    >
      {/* Sticky employee column */}
      <TableCell
        sx={[
          stickyColSx(theme, isDark),
          { py: 0.75, px: 1.5 },
        ]}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <EmployeeCell employee={emp} accent={editing} />
          {(isHighLoad || isLowRest) && (
            <Stack direction="row" gap={0.5} sx={{ ml: 1, flexShrink: 0 }}>
              {isHighLoad && (
                <Tooltip title="High night load" arrow>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                      boxShadow: "0 0 6px rgba(245,158,11,0.5)",
                    }}
                  />
                </Tooltip>
              )}
              {isLowRest && (
                <Tooltip title="Low rest violation" arrow>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                      boxShadow: "0 0 6px rgba(239,68,68,0.5)",
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>
      </TableCell>

      {/* Shift cells */}
      {Array.from({ length: TOTAL_COLS }).map((_, colIdx) => {
        const dow = colIdx % 7;
        const isSat = dow === 5;
        const isWkend = dow === 5 || dow === 6;
        const isToday = dates[colIdx]?.toDateString() === TODAY.toDateString();
        const code: ShiftCode = row[colIdx] ?? "G";

        return (
          <TableCell
            key={colIdx}
            sx={[
              {
                textAlign: "center",
                padding: "4px 3px",
                minWidth: 56,
                width: 56,
              },
              isWkend ? wkendCellSx(isDark) : {},
              isSat ? wsepCellSx(theme) : {},
              isToday
                ? {
                    bgcolor: isDark
                      ? "rgba(59,130,246,0.06)"
                      : "rgba(59,130,246,0.03)",
                  }
                : {},
            ]}
          >
            <Tooltip
              title={`${emp.name} · ${DOW_LONG[dow]}: ${SHIFT_COLORS[code].label}`}
              arrow
              disableInteractive
              enterDelay={400}
            >
              <Box
                component="button"
                aria-label={`${emp.name} ${DOW_LONG[dow]}: ${SHIFT_COLORS[code].label}`}
                tabIndex={editing ? 0 : -1}
                onMouseDown={() => {
                  if (!editing) return;
                  paintingRef.current = true;
                  onCellChange(emp.id, colIdx, brush);
                }}
                onMouseEnter={() => {
                  if (editing && paintingRef.current) {
                    onCellChange(emp.id, colIdx, brush);
                  }
                }}
                sx={[
                  {
                    width: 36,
                    height: 28,
                    border: "1.5px solid",
                    borderRadius: "6px",
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 10.5,
                    cursor: editing ? "pointer" : "default",
                    padding: 0,
                    userSelect: "none",
                    transition:
                      "box-shadow 0.1s ease, filter 0.1s ease, border-color 0.1s ease",
                  },
                  shiftStyle(code, isDark ? "dark" : "light"),
                  editing
                    ? {
                        "&:hover": {
                          boxShadow: `0 0 0 2.5px ${theme.palette.primary.main}, 0 2px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
                          borderColor: `${theme.palette.primary.main} !important`,
                          filter: "brightness(1.1) saturate(1.2)",
                          zIndex: 1,
                          position: "relative",
                        },
                      }
                    : {},
                ]}
              >
                {code}
              </Box>
            </Tooltip>
          </TableCell>
        );
      })}

      {/* Summary cells */}
      <TableCell sx={[sumCellFirstSx(theme, isDark)]}>
        <Stack alignItems="center" gap={0.3}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "text.primary",
              fontFamily: MONO,
            }}
          >
            {work}
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 2,
              borderRadius: 1,
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
                  loadPct >= 80
                    ? "error.main"
                    : loadPct >= 60
                      ? "warning.main"
                      : "primary.main",
              }}
            />
          </Box>
        </Stack>
      </TableCell>
      <TableCell
        sx={[
          sumCellSx(theme, isDark),
          isHighLoad
            ? { color: SHIFT_COLORS.N.text, fontWeight: 700 }
            : {},
        ]}
      >
        {n}
      </TableCell>
      <TableCell
        sx={[
          sumCellSx(theme, isDark),
          isLowRest
            ? { color: SHIFT_COLORS.OFF.text, fontWeight: 700 }
            : {},
        ]}
      >
        {off}
      </TableCell>
    </TableRow>
  );
},
// Custom comparator — only re-render when this employee's row data changes
(prev, next) =>
  prev.emp === next.emp &&
  prev.grid[prev.emp.id] === next.grid[next.emp.id] &&
  prev.editing === next.editing &&
  prev.brush === next.brush &&
  prev.isDark === next.isDark,
);

// ─── Main RosterGrid ──────────────────────────────────────────────────────────

interface RosterGridProps {
  emps: Employee[];
  grid: Record<string, ShiftCode[]>;
  dates: Date[];
  dimmed?: boolean;
  editing: boolean;
  brush: ShiftCode;
  paintingRef: React.MutableRefObject<boolean>;
  onCellChange: (empId: string, colIdx: number, code: ShiftCode) => void;
  isLoading?: boolean;
}

export function RosterGrid({
  emps,
  grid,
  dates,
  dimmed = false,
  editing,
  brush,
  paintingRef,
  onCellChange,
  isLoading = false,
}: RosterGridProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleRows, paddingTop, paddingBottom } = useVirtualRows(
    emps,
    containerRef,
  );

  // Memoize footer column counts — expensive, only recompute when data changes
  const footerCounts = useMemo(
    () => Array.from({ length: TOTAL_COLS }, (_, i) => colCounts(grid, emps, i)),
    [grid, emps],
  );

  const headerBg = isDark ? "#1A2436" : "#F4F7FB";

  // ── Day header cell ──────────────────────────────────────────────────────
  const renderDayHeader = useCallback(
    (colIdx: number) => {
      const date = dates[colIdx];
      const dow = colIdx % 7;
      const isSat = dow === 5;
      const isWkend = dow === 5 || dow === 6;
      const isToday = date?.toDateString() === TODAY.toDateString();

      return (
        <TableCell
          key={colIdx}
          sx={[
            headerCellSx(isDark),
            isWkend ? wkendCellSx(isDark) : {},
            isSat ? wsepCellSx(theme) : {},
            isToday
              ? {
                  background: isDark
                    ? `linear-gradient(180deg,rgba(59,130,246,0.15) 0%,${headerBg} 100%)`
                    : `linear-gradient(180deg,rgba(59,130,246,0.08) 0%,${headerBg} 100%)`,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    bgcolor: "primary.main",
                    borderRadius: "0 0 2px 2px",
                  },
                  position: "relative",
                }
              : {},
          ]}
        >
          <Stack alignItems="center" gap={0.3}>
            <Typography
              sx={{
                fontSize: 11.5,
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
              {date?.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              }) ?? ""}
            </Typography>
            {/* Mini shift distribution bar */}
            {!isLoading && (
              <Box
                sx={{
                  display: "flex",
                  height: 2,
                  width: 36,
                  borderRadius: 1,
                  overflow: "hidden",
                  mt: 0.5,
                  bgcolor: "action.hover",
                }}
              >
                {footerCounts[colIdx] &&
                  (["A","B","G","LG","N"] as ShiftCode[])
                    .filter((k) => (footerCounts[colIdx][k] ?? 0) > 0)
                    .map((k) => (
                      <Box
                        key={k}
                        sx={{
                          flex: footerCounts[colIdx][k],
                          height: "100%",
                          bgcolor: SHIFT_COLORS[k].solid,
                        }}
                      />
                    ))}
              </Box>
            )}
          </Stack>
        </TableCell>
      );
    },
    [dates, isDark, theme, footerCounts, isLoading, headerBg],
  );

  // ── Footer day cell ──────────────────────────────────────────────────────
  const renderFooterCell = useCallback(
    (colIdx: number) => {
      const dow = colIdx % 7;
      const isSat = dow === 5;
      const isWkend = dow === 5 || dow === 6;
      const counts = footerCounts[colIdx];
      const total = workingTotal(counts);

      return (
        <TableCell
          key={colIdx}
          sx={[
            sumCellSx(theme, isDark),
            isWkend ? wkendCellSx(isDark) : {},
            isSat ? wsepCellSx(theme) : {},
            footerCellBaseSx(isDark),
            { minWidth: 56, width: 56, zIndex: 2 },
          ]}
        >
          <Stack alignItems="center" gap={0.15}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: MONO,
                color:
                  total < 5
                    ? "error.main"
                    : total > 15
                      ? "warning.main"
                      : "text.primary",
              }}
            >
              {total}
            </Typography>
            <Typography sx={{ fontSize: 8.5, color: "text.disabled" }}>
              /{emps.length}
            </Typography>
          </Stack>
        </TableCell>
      );
    },
    [footerCounts, theme, isDark, emps.length],
  );

  // ── Skeleton loading rows ────────────────────────────────────────────────
  const skeletonRows = isLoading
    ? Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={`sk-${i}`} sx={{ height: VIRTUAL_ROW_HEIGHT }}>
          <TableCell sx={[stickyColSx(theme, isDark), { py: 0.75, px: 1.5 }]}>
            <Stack direction="row" alignItems="center" gap={1.25}>
              <Skeleton
                variant="rounded"
                width={32}
                height={32}
                sx={{ borderRadius: "8px", flexShrink: 0 }}
              />
              <Stack gap={0.5}>
                <Skeleton variant="text" width={110} height={14} />
                <Skeleton variant="text" width={75} height={10} />
              </Stack>
            </Stack>
          </TableCell>
          {Array.from({ length: TOTAL_COLS }).map((_, j) => (
            <TableCell
              key={j}
              sx={{ textAlign: "center", padding: "4px 3px" }}
            >
              <Skeleton
                variant="rounded"
                width={36}
                height={28}
                sx={{ mx: "auto", borderRadius: "6px" }}
              />
            </TableCell>
          ))}
          {["W", "N", "OFF"].map((s) => (
            <TableCell key={s} sx={{ textAlign: "center" }}>
              <Skeleton variant="text" width={24} height={14} sx={{ mx: "auto" }} />
            </TableCell>
          ))}
        </TableRow>
      ))
    : null;

  return (
    <TableContainer
      ref={containerRef}
      sx={{
        flex: 1,
        overflow: "auto",
        willChange: "transform",
        contain: "strict",
        transition: "opacity 0.15s ease",
        opacity: dimmed ? 0.5 : 1,
        pointerEvents: dimmed ? "none" : "auto",
        "&::-webkit-scrollbar": { width: 6, height: 6 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
          borderRadius: 6,
          "&:hover": {
            bgcolor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
          },
        },
      }}
    >
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
          {/* W, N, OFF stat cols */}
          <col style={{ width: 52, minWidth: 52 }} />
          <col style={{ width: 52, minWidth: 52 }} />
          <col style={{ width: 52, minWidth: 52 }} />
        </colgroup>

        {/* ── HEAD ──────────────────────────────────────────────────── */}
        <TableHead>
          <TableRow>
            <TableCell sx={[stickyHeadColSx(theme, isDark), { top: 0 }]}>
              <Stack direction="row" alignItems="center" gap={1}>
                <PersonIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                <Typography
                  sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}
                >
                  Employee
                </Typography>
              </Stack>
            </TableCell>
            {Array.from({ length: TOTAL_COLS }).map((_, i) =>
              renderDayHeader(i),
            )}
            {(["W", "N", "OFF"] as const).map((stat) => (
              <TableCell
                key={stat}
                sx={[
                  headerCellSx(isDark),
                  {
                    top: 0,
                    zIndex: 3,
                    minWidth: 52,
                    width: 52,
                  },
                  stat === "W"
                    ? { borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}` }
                    : {},
                ]}
              >
                <Typography
                  sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}
                >
                  {stat}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <TableBody>
          {/* Top virtual spacer */}
          {paddingTop > 0 && (
            <TableRow style={{ height: paddingTop }}>
              <TableCell
                colSpan={TOTAL_COLS + 4}
                sx={{ border: 0, padding: 0 }}
              />
            </TableRow>
          )}

          {/* Skeleton rows while loading */}
          {skeletonRows}

          {/* Visible employee rows */}
          {!isLoading &&
            visibleRows.map((emp) => (
              <EmpRow
                key={emp.id}
                emp={emp}
                grid={grid}
                dates={dates}
                editing={editing}
                brush={brush}
                paintingRef={paintingRef}
                onCellChange={onCellChange}
                isDark={isDark}
              />
            ))}

          {/* Bottom virtual spacer */}
          {paddingBottom > 0 && (
            <TableRow style={{ height: paddingBottom }}>
              <TableCell
                colSpan={TOTAL_COLS + 4}
                sx={{ border: 0, padding: 0 }}
              />
            </TableRow>
          )}

          {/* Empty state */}
          {!isLoading && emps.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={TOTAL_COLS + 4}
                sx={{ textAlign: "center", py: 8, border: 0 }}
              >
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  No employees match the current filters
                </Typography>
                <Typography
                  sx={{ fontSize: 11.5, color: "text.disabled", mt: 0.5 }}
                >
                  Try adjusting your search or clearing filters
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        {!isLoading && (
          <TableFooter>
            <TableRow>
              <TableCell
                sx={[
                  stickyColSx(theme, isDark),
                  footerCellBaseSx(isDark),
                  {
                    bottom: 0,
                    left: 0,
                    zIndex: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "text.secondary",
                    py: 1,
                    px: 1.5,
                  },
                ]}
              >
                Staffed / Day
              </TableCell>
              {Array.from({ length: TOTAL_COLS }).map((_, i) =>
                renderFooterCell(i),
              )}
              {(["W", "N", "OFF"] as const).map((stat) => (
                <TableCell
                  key={stat}
                  sx={[
                    sumCellSx(theme, isDark),
                    footerCellBaseSx(isDark),
                    { zIndex: 2 },
                    stat === "W"
                      ? { borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}` }
                      : {},
                  ]}
                />
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}

// import { useRef } from "react";
// import {
//   Box,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableFooter,
//   TableHead,
//   TableRow,
//   Tooltip,
//   Typography,
//   alpha,
//   useTheme,
// } from "@mui/material";
// import PersonIcon from "@mui/icons-material/Person";
// import {
//   DOW,
//   DOW_LONG,
//   MONO,
//   SHIFT_COLORS,
//   TOTAL_COLS,
//   TODAY,
//   type Employee,
//   type ShiftCode,
// } from "../../types/Gridtypes";
// import {
//   colCounts,
//   empSummary,
//   headerBgSx,
//   stickyColSx,
//   stickyHeadColSx,
//   sumCellFirstSx,
//   sumCellSx,
//   wkendSx,
//   workingTotal,
//   wsepSx,
// } from "../../util/Gridutils";
// import { EmployeeCell, ShiftBadge } from "../Week7Preview/Gridsharedui";
// import { useVirtualRows } from "./Usevirtualrows";
// import { ScrollSentinel } from "./Scrollsentinel";

// interface RosterGridProps {
//   emps: Employee[];
//   grid: Record<string, ShiftCode[]>;
//   dates: Date[];
//   /** Visually dim the grid while a refetch is in progress */
//   dimmed?: boolean;
//   // ── Pagination props ────────────────────────────────────────────────
//   isFetchingMore: boolean;
//   hasMore: boolean;
//   totalCount: number | null;
//   onLoadMore: () => void;
// }

// export function RosterGrid({
//   emps,
//   grid,
//   dates,
//   dimmed = false,
//   isFetchingMore,
//   hasMore,
//   totalCount,
//   onLoadMore,
// }: RosterGridProps) {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   // ── Virtual scroll ────────────────────────────────────────────────────────
//   const containerRef = useRef<HTMLDivElement>(null);
//   const { visibleRows, paddingTop, paddingBottom } = useVirtualRows(
//     emps,
//     containerRef
//   );

//   // ── Header cell ───────────────────────────────────────────────────────────
//   const renderDayHeader = (colIdx: number) => {
//     const date = dates[colIdx];
//     const dow = colIdx % 7;
//     const isWkend = dow === 5 || dow === 6;
//     const isSat = dow === 5;
//     const isToday = date.toDateString() === TODAY.toDateString();

//     return (
//       <TableCell
//         key={colIdx}
//         sx={{
//           ...headerBgSx(isDark),
//           ...(isWkend && wkendSx(isDark)),
//           ...(isSat && wsepSx(theme)),
//           position: "sticky",
//           top: 0,
//           zIndex: 3,
//           ...(isToday && {
//             "&::after": {
//               content: '""',
//               position: "absolute",
//               bottom: 0,
//               left: "50%",
//               transform: "translateX(-50%)",
//               width: 20,
//               height: 2,
//               borderRadius: 1,
//               bgcolor: "primary.main",
//             },
//           }),
//         }}
//       >
//         <Stack alignItems="center" gap={0.25}>
//           <Typography
//             sx={{
//               fontSize: 11,
//               fontWeight: isWkend ? 700 : 650,
//               lineHeight: 1,
//               color: isWkend
//                 ? isDark
//                   ? "#FBBF24"
//                   : "#B25E00"
//                 : "text.secondary",
//             }}
//           >
//             {DOW[dow]}
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: 9.5,
//               fontWeight: 500,
//               lineHeight: 1,
//               color: isToday ? "primary.main" : "text.disabled",
//             }}
//           >
//             {date.toLocaleDateString("en-IN", {
//               day: "2-digit",
//               month: "short",
//             })}
//           </Typography>
//         </Stack>
//       </TableCell>
//     );
//   };

//   // ── Summary stat header ────────────────────────────────────────────────────
//   const renderStatHeader = (label: string, key: string) => (
//     <TableCell
//       key={key}
//       sx={{
//         ...headerBgSx(isDark),
//         position: "sticky",
//         top: 0,
//         zIndex: 3,
//         ...(key === "W" && {
//           borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
//         }),
//         minWidth: 48,
//         width: 48,
//       }}
//     >
//       <Typography
//         sx={{
//           fontSize: 11,
//           fontWeight: 700,
//           color: "text.secondary",
//           textAlign: "center",
//         }}
//       >
//         {label}
//       </Typography>
//     </TableCell>
//   );

//   // ── Shift cell ─────────────────────────────────────────────────────────────
//   const renderShiftCell = (emp: Employee, colIdx: number) => {
//     const dow = colIdx % 7;
//     const isSat = dow === 5;
//     const isWkend = dow === 5 || dow === 6;
//     const isToday = dates[colIdx].toDateString() === TODAY.toDateString();
//     const code = grid[emp.id]?.[colIdx] ?? "G";
//     return (
//       <TableCell
//         key={colIdx}
//         sx={{
//           textAlign: "center",
//           padding: "6px 4px",
//           ...(isWkend && wkendSx(isDark)),
//           ...(isSat && wsepSx(theme)),
//           ...(isToday && {
//             bgcolor: isDark
//               ? "rgba(59,130,246,0.04)"
//               : "rgba(59,130,246,0.025)",
//           }),
//           minWidth: 56,
//           width: 56,
//         }}
//       >
//         <Tooltip title={`${SHIFT_COLORS[code].label} · ${DOW_LONG[dow]}`} arrow>
//           <Box>
//             <ShiftBadge code={code} />
//           </Box>
//         </Tooltip>
//       </TableCell>
//     );
//   };

//   // ── Summary cells per employee row ─────────────────────────────────────────
//   const renderEmpStats = (emp: Employee) => {
//     const row = grid[emp.id] ?? [];
//     const { work, n, off } = empSummary(row);
//     const loadPct = Math.round((work / TOTAL_COLS) * 100);

//     return (["W", "N", "OFF"] as const).map((stat) => {
//       const val = stat === "W" ? work : stat === "N" ? n : off;
//       const isFirst = stat === "W";
//       return (
//         <TableCell
//           key={stat}
//           sx={{
//             ...(isFirst
//               ? sumCellFirstSx(theme, isDark)
//               : sumCellSx(theme, isDark)),
//             minWidth: 48,
//             width: 48,
//           }}
//         >
//           <Stack alignItems="center" gap={0.2}>
//             <Typography
//               sx={{
//                 fontSize: 11,
//                 fontWeight: 700,
//                 color: "text.primary",
//                 fontFamily: MONO,
//               }}
//             >
//               {val}
//             </Typography>
//             {stat === "W" && (
//               <Box
//                 sx={{
//                   width: 28,
//                   height: 2,
//                   borderRadius: 1,
//                   bgcolor: alpha(theme.palette.primary.main, 0.15),
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     left: 0,
//                     top: 0,
//                     bottom: 0,
//                     width: `${loadPct}%`,
//                     bgcolor:
//                       loadPct >= 80
//                         ? "error.main"
//                         : loadPct >= 60
//                           ? "warning.main"
//                           : "primary.main",
//                     borderRadius: 1,
//                   }}
//                 />
//               </Box>
//             )}
//           </Stack>
//         </TableCell>
//       );
//     });
//   };

//   // ── Footer cells (column totals) ───────────────────────────────────────────
//   const renderFooterCell = (colIdx: number) => {
//     const dow = colIdx % 7;
//     const isSat = dow === 5;
//     const isWkend = dow === 5 || dow === 6;
//     const counts = colCounts(grid, emps, colIdx);
//     const total = workingTotal(counts);
//     return (
//       <TableCell
//         key={colIdx}
//         sx={{
//           ...sumCellFirstSx(theme, isDark),
//           ...(isWkend && wkendSx(isDark)),
//           ...(isSat && wsepSx(theme)),
//           minWidth: 56,
//           width: 56,
//           position: "sticky",
//           bottom: 0,
//           zIndex: 2,
//           bgcolor: isDark ? "#141E2E" : "#EEF2F8",
//         }}
//       >
//         <Stack alignItems="center" gap={0.25}>
//           <Typography
//             sx={{ fontSize: 10, fontWeight: 700, color: "text.primary" }}
//           >
//             {total}
//           </Typography>
//           <Typography sx={{ fontSize: 9, color: "text.disabled" }}>
//             /{emps.length}
//           </Typography>
//         </Stack>
//       </TableCell>
//     );
//   };

//   const renderFooterStatCell = (stat: string, key: string) => (
//     <TableCell
//       key={key}
//       sx={{
//         ...sumCellSx(theme, isDark),
//         ...(key === "W" && {
//           borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
//         }),
//         minWidth: 48,
//         width: 48,
//         position: "sticky",
//         bottom: 0,
//         zIndex: 2,
//         bgcolor: isDark ? "#141E2E" : "#EEF2F8",
//       }}
//     />
//   );

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <TableContainer
//       ref={containerRef}
//       sx={{
//         flex: 1,
//         overflow: "auto",
//         position: "relative",
//         transition: "opacity 0.15s ease",
//         opacity: dimmed ? 0.5 : 1,
//         pointerEvents: dimmed ? "none" : "auto",
//       }}
//     >
//       <Table
//         stickyHeader
//         size="small"
//         sx={{
//           tableLayout: "fixed",
//           borderCollapse: "separate",
//           borderSpacing: 0,
//         }}
//       >
//         {/* Column widths */}
//         <colgroup>
//           <col style={{ width: 220, minWidth: 220 }} />
//           {Array.from({ length: TOTAL_COLS }).map((_, i) => (
//             <col key={i} style={{ width: 56, minWidth: 56 }} />
//           ))}
//           <col style={{ width: 48, minWidth: 48 }} />
//           <col style={{ width: 48, minWidth: 48 }} />
//           <col style={{ width: 48, minWidth: 48 }} />
//         </colgroup>

//         {/* ── HEAD ────────────────────────────────────────────────────── */}
//         <TableHead>
//           <TableRow>
//             <TableCell sx={{ ...stickyHeadColSx(theme, isDark), top: 0 }}>
//               <Stack direction="row" alignItems="center" gap={1}>
//                 <PersonIcon sx={{ fontSize: 13, color: "text.disabled" }} />
//                 <Typography
//                   sx={{
//                     fontSize: 11,
//                     fontWeight: 700,
//                     color: "text.secondary",
//                   }}
//                 >
//                   Employee
//                 </Typography>
//               </Stack>
//             </TableCell>
//             {Array.from({ length: TOTAL_COLS }).map((_, i) =>
//               renderDayHeader(i)
//             )}
//             {(["W", "N", "OFF"] as const).map((s) => renderStatHeader(s, s))}
//           </TableRow>
//         </TableHead>

//         {/* ── BODY ────────────────────────────────────────────────────── */}
//         <TableBody>
//           {/* ── TOP SPACER: represents off-screen rows above ─────────── */}
//           {paddingTop > 0 && (
//             <TableRow style={{ height: paddingTop }}>
//               <TableCell
//                 colSpan={TOTAL_COLS + 4}
//                 sx={{ border: 0, padding: 0 }}
//               />
//             </TableRow>
//           )}

//           {/* ── VISIBLE SLICE ONLY ───────────────────────────────────── */}
//           {visibleRows.map((emp, rowIdx) => (
//             <TableRow
//               key={emp.id}
//               hover
//               sx={{
//                 height: 40, // must match VIRTUAL_ROW_HEIGHT
//                 "&:last-child td": { borderBottom: 0 },
//                 bgcolor:
//                   rowIdx % 2 === 0
//                     ? "transparent"
//                     : isDark
//                       ? "rgba(255,255,255,0.008)"
//                       : "rgba(0,0,0,0.008)",
//               }}
//             >
//               <TableCell
//                 sx={{ ...stickyColSx(theme, isDark), py: 0.75, px: 1.5 }}
//               >
//                 <EmployeeCell employee={emp} />
//               </TableCell>
//               {Array.from({ length: TOTAL_COLS }).map((_, i) =>
//                 renderShiftCell(emp, i)
//               )}
//               {renderEmpStats(emp)}
//             </TableRow>
//           ))}

//           {/* ── BOTTOM SPACER: represents off-screen rows below ──────── */}
//           {paddingBottom > 0 && (
//             <TableRow style={{ height: paddingBottom }}>
//               <TableCell
//                 colSpan={TOTAL_COLS + 4}
//                 sx={{ border: 0, padding: 0 }}
//               />
//             </TableRow>
//           )}

//           {/* ── SENTINEL: triggers next API page when scrolled into view  */}
//           <TableRow>
//             <TableCell colSpan={TOTAL_COLS + 4} sx={{ border: 0, padding: 0 }}>
//               <ScrollSentinel
//                 onVisible={onLoadMore}
//                 isFetching={isFetchingMore}
//                 hasMore={hasMore}
//                 loadedCount={emps.length}
//                 totalCount={totalCount}
//               />
//             </TableCell>
//           </TableRow>

//           {/* ── EMPTY STATE ──────────────────────────────────────────── */}
//           {emps.length === 0 && !isFetchingMore && (
//             <TableRow>
//               <TableCell
//                 colSpan={TOTAL_COLS + 4}
//                 sx={{ textAlign: "center", py: 6 }}
//               >
//                 <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
//                   No employees match the current filters
//                 </Typography>
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>

//         {/* ── FOOTER ──────────────────────────────────────────────────── */}
//         <TableFooter>
//           <TableRow>
//             <TableCell
//               sx={{
//                 ...stickyColSx(theme, isDark),
//                 ...sumCellSx(theme, isDark),
//                 position: "sticky",
//                 bottom: 0,
//                 left: 0,
//                 zIndex: 5,
//                 bgcolor: isDark ? "#141E2E" : "#EEF2F8",
//                 borderTop: `1.5px solid ${theme.palette.divider}`,
//               }}
//             >
//               <Typography
//                 sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}
//               >
//                 Totals
//               </Typography>
//             </TableCell>
//             {Array.from({ length: TOTAL_COLS }).map((_, i) =>
//               renderFooterCell(i)
//             )}
//             {(["W", "N", "OFF"] as const).map((s) =>
//               renderFooterStatCell(s, s)
//             )}
//           </TableRow>
//         </TableFooter>
//       </Table>
//     </TableContainer>
//   );
// }