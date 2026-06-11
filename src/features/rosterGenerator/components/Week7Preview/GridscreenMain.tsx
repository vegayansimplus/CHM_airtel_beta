import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import TodayIcon from "@mui/icons-material/Today";

import {
  ALL_ROLES,
  EMPLOYEES,
  SHIFT_ORDER,
  TODAY,
  buildWeekGrid,
  type Employee,
  type FilterState,
  type ShiftCode,
} from "../../types/Gridtypes";
import {
  addDays,
  applyFilters,
  countActiveFilters,
  defaultFilter,
  empSummary,
  fmtShort,
  isoWeek,
  mondayOf,
} from "../../util/Gridutils";
import { BrushBar, SearchBox, ShiftLegend } from "./Gridsharedui";
import { FilterDrawer, FilterTriggerButton } from "./Filterdrawer";
import { RosterGrid } from "./Rostergrid";
import { AnalyticsModal } from "./Analyticsmodal";
// import { FilterDrawer, FilterTriggerButton } from "./Gridtoolbar";
// import { AnalyticsModal } from "./AnalyticsModal";
// import { RosterGrid } from "./RosterGrid";
// import type { FilterState } from "./Gridtypes";

// ─── Validation strip ──────────────────────────────────────────────────────────
function ValidationStrip({
  emps,
  grid,
}: {
  emps: Employee[];
  grid: Record<string, ShiftCode[]>;
}) {
  const nightHeavy = emps.filter((e) => empSummary(grid[e.id] ?? []).n > 2);
  const lowRest = emps.filter((e) => empSummary(grid[e.id] ?? []).off >= 3);
  const ok = Math.max(emps.length - nightHeavy.length - lowRest.length, 0);

  return (
    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
      <Chip
        size="small"
        color="success"
        icon={<CheckIcon sx={{ fontSize: "13px !important" }} />}
        label={`${ok} balanced`}
        sx={{ height: 24, fontSize: 11, fontWeight: 650, borderRadius: "6px" }}
      />
      <Chip
        size="small"
        color={nightHeavy.length ? "warning" : "default"}
        label={`${nightHeavy.length} high night load`}
        sx={{ height: 24, fontSize: 11, fontWeight: 650, borderRadius: "6px" }}
      />
      <Chip
        size="small"
        color={lowRest.length ? "error" : "default"}
        label={`${lowRest.length} low rest`}
        sx={{ height: 24, fontSize: 11, fontWeight: 650, borderRadius: "6px" }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: "auto", fontSize: 10.5 }}
      >
        Night &gt;2 = High · OFF ≥3 = Low Rest
      </Typography>
    </Stack>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RosterScreen() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── Week navigation ──────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(TODAY));
  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const weekLabel = `${fmtShort(dates[0])} – ${fmtShort(dates[6])}`;

  const goToWeek = useCallback((delta: number) => {
    setWeekStart((d) => addDays(d, delta * 7));
  }, []);
  const goToToday = useCallback(() => setWeekStart(mondayOf(TODAY)), []);

  // ── Employees + grid ─────────────────────────────────────────────────────
  // In production: replace EMPLOYEES and buildWeekGrid with your API data
  const allEmps: Employee[] = EMPLOYEES;
  const allRoles = useMemo(
    () => Array.from(new Set(allEmps.map((e) => e.role))),
    [allEmps],
  );

  // local grid — editable copy
  const [localGrid, setLocalGrid] = useState<Record<string, ShiftCode[]>>(() =>
    buildWeekGrid(allEmps),
  );

  // Saved snapshot for discard
  const savedGridRef = useRef<Record<string, ShiftCode[]>>(localGrid);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filter);

  const filteredEmps = useMemo(
    () => applyFilters(allEmps, localGrid, filter),
    [allEmps, localGrid, filter],
  );

  // ── Edit mode ────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState<ShiftCode>("A");
  const paintingRef = useRef(false);

  // Stop painting on mouse up anywhere
  useEffect(() => {
    const end = () => {
      paintingRef.current = false;
    };
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  const handleCellChange = useCallback(
    (empId: string, colIdx: number, code: ShiftCode) => {
      setLocalGrid((prev) => {
        const row = [...(prev[empId] ?? [])];
        row[colIdx] = code;
        return { ...prev, [empId]: row };
      });
    },
    [],
  );

  const handleEnterEdit = useCallback(() => {
    // Snapshot current grid for discard
    savedGridRef.current = JSON.parse(JSON.stringify(localGrid));
    setEditing(true);
  }, [localGrid]);

  const handleDiscardEdits = useCallback(() => {
    setLocalGrid(savedGridRef.current);
    setEditing(false);
    showToast("Changes discarded");
  }, []);

  const handleSave = useCallback(() => {
    // In production: dispatch API call here
    savedGridRef.current = JSON.parse(JSON.stringify(localGrid));
    setEditing(false);
    showToast("Schedule saved successfully");
  }, [localGrid]);

  // ── Analytics ────────────────────────────────────────────────────────────
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => setToast(msg);

  // ── Export CSV ───────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const header = [
      "ID",
      "Name",
      "Role",
      "Level",
      ...dates.map(fmtShort),
      "Work",
      "N",
      "OFF",
    ];
    const rows = filteredEmps.map((e) => {
      const row = localGrid[e.id] ?? [];
      const s = empSummary(row);
      return [e.id, e.name, e.role, e.level, ...row, s.work, s.n, s.off];
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roster-w${isoWeek(weekStart)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported");
  }, [filteredEmps, localGrid, dates, weekStart]);

  // ── Search shortcut ───────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter((f) => ({ ...f, query: e.target.value }));
    },
    [],
  );
  const handleSearchClear = useCallback(() => {
    setFilter((f) => ({ ...f, query: "" }));
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? "#0A111C" : "#F0F4FA",
        overflow: "hidden",
      }}
    >
      {/* ── Page header ──────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: 2.5,
          pb: 0,
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: 1.5 }}
        >
          {/* Identity */}
          <Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              Roster
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                fontWeight: 500,
                mt: 0.2,
              }}
            >
              {allEmps.length} employees · {weekLabel}
            </Typography>
          </Box>

          {/* Week navigation */}
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ ml: 1 }}>
            <IconButton
              size="small"
              onClick={() => goToWeek(-1)}
              sx={{ borderRadius: "8px", border: 1, borderColor: "divider" }}
            >
              <NavigateBeforeIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                minWidth: 160,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 650 }}>
                W{isoWeek(weekStart)} · {weekLabel}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => goToWeek(1)}
              sx={{ borderRadius: "8px", border: 1, borderColor: "divider" }}
            >
              <NavigateNextIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Tooltip title="Go to current week" arrow>
              <IconButton
                size="small"
                onClick={goToToday}
                sx={{ borderRadius: "8px", border: 1, borderColor: "divider" }}
              >
                <TodayIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ flex: 1 }} />

          {/* Showing count */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: { xs: "none", sm: "block" },
            }}
          >
            Showing{" "}
            <strong style={{ color: theme.palette.text.primary }}>
              {filteredEmps.length}
            </strong>{" "}
            of {allEmps.length}
          </Typography>

          {/* Actions */}
          <SearchBox
            value={filter.query}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
          />

          <FilterTriggerButton
            activeCount={activeFilterCount}
            onClick={() => setFilterOpen(true)}
          />

          <Tooltip title="Export CSV" arrow>
            <IconButton
              size="small"
              onClick={handleExport}
              sx={{ borderRadius: "8px", border: 1, borderColor: "divider" }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            startIcon={<BarChartIcon sx={{ fontSize: 15 }} />}
            onClick={() => setAnalyticsOpen(true)}
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 650,
              borderRadius: "8px",
              height: 32,
            }}
          >
            Analytics
          </Button>

          {editing ? (
            <Stack direction="row" gap={0.75}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                onClick={handleDiscardEdits}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 650,
                  borderRadius: "8px",
                  height: 32,
                }}
              >
                Discard
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                disableElevation
                startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                onClick={handleSave}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 650,
                  borderRadius: "8px",
                  height: 32,
                }}
              >
                Save
              </Button>
            </Stack>
          ) : (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon sx={{ fontSize: 15 }} />}
              onClick={handleEnterEdit}
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 650,
                borderRadius: "8px",
                height: 32,
              }}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: { xs: 2, md: 3 },
          pb: 2,
          gap: 1.25,
          minHeight: 0,
        }}
      >
        {/* Grid card */}
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            overflow: "hidden",
            borderColor: isDark ? alpha("#fff", 0.07) : alpha("#000", 0.07),
            boxShadow: isDark
              ? "0 4px 32px rgba(0,0,0,0.5)"
              : "0 2px 20px rgba(13,27,42,0.08)",
            minHeight: 0,
          }}
        >
          {/* Card toolbar */}
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1.5}
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
              background: isDark
                ? "linear-gradient(135deg,rgba(24,95,165,0.06),rgba(99,102,241,0.04))"
                : "linear-gradient(135deg,rgba(24,95,165,0.03),rgba(99,102,241,0.02))",
            }}
          >
            <ShiftLegend />
            <Box sx={{ flex: 1 }} />
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckIcon sx={{ fontSize: "11px !important" }} />}
              label="Cyclical Rotation"
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 650,
                borderRadius: "6px",
              }}
            />
          </Stack>

          {/* Paint brush bar (edit mode only) */}
          {editing && <BrushBar brush={brush} onSelect={setBrush} />}

          {/* The grid */}
          <RosterGrid
            emps={filteredEmps}
            grid={localGrid}
            dates={dates}
            editing={editing}
            brush={brush}
            paintingRef={paintingRef}
            onCellChange={handleCellChange}
          />
        </Card>

        {/* Validation strip */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "10px",
            px: 2,
            py: 1,
            flexShrink: 0,
            borderColor: isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06),
          }}
        >
          <ValidationStrip emps={allEmps} grid={localGrid} />
        </Card>
      </Box>

      {/* ── Filter Drawer ────────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        filter={filter}
        allRoles={allRoles}
        onApply={setFilter}
        onClose={() => setFilterOpen(false)}
      />

      {/* ── Analytics Modal ──────────────────────────────────────────── */}
      <AnalyticsModal
        open={analyticsOpen}
        grid={localGrid}
        emps={filteredEmps}
        dates={dates}
        onClose={() => setAnalyticsOpen(false)}
      />

      {/* ── Toast ───────────────────────────────────────────────────── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={2600}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          icon={<CheckIcon />}
          onClose={() => setToast(null)}
          sx={{ alignItems: "center", borderRadius: "10px" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Button,
//   Snackbar,
//   Stack,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import RestartAltIcon from "@mui/icons-material/RestartAlt";
// import LayersIcon from "@mui/icons-material/LayersOutlined";
// import {
//   TOTAL_COLS,
//   type FilterState,
//   type GridScreenProps,
// } from "../../types/Gridtypes";
// import {
//   applyFilters,
//   buildFromApi,
//   computeWeekStart,
//   countActiveFilters,
//   defaultFilter,
//   addDays,
// } from "../../util/Gridutils";
// // import { usePaginatedFutureWeek } from "../../hooks/usePaginatedFutureWeek";
// import { ShiftLegend } from "./Gridsharedui";
// import { GridToolbar } from "./Gridtoolbar";
// import { RosterGrid } from "./Rostergrid";
// import { FilterPanel } from "./Filterpanel";
// import { usePaginatedFutureWeek } from "./Usepaginatedfutureweek";

// export default function GridscreenMain({ subDomainId }: GridScreenProps) {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   // ── Normalise subDomainId ────────────────────────────────────────────────
//   const parsedSubDomainId =
//     typeof subDomainId === "string"
//       ? parseInt(subDomainId, 10)
//       : (subDomainId ?? 0);

//   // ── Paginated API ────────────────────────────────────────────────────────
//   // All fetching, accumulation, and load-more logic lives in this hook.
//   // GridscreenMain just renders what the hook exposes.
//   const {
//     rows,        // accumulated FutureWeekRow[] (grows page by page)
//     total,       // totalEmployees from server
//     isFetching,
//     isError,
//     hasMore,
//     loadMore,
//     refetch,
//   } = usePaginatedFutureWeek(parsedSubDomainId);

//   // ── Derived data ─────────────────────────────────────────────────────────
//   // buildFromApi + computeWeekStart run whenever rows grows.
//   // Because rows only ever appends, React memoises cheaply.
//   const { emps, grid, allRoles, weekStart } = useMemo(() => {
//     const built = buildFromApi(rows);
//     return { ...built, weekStart: computeWeekStart(rows) };
//   }, [rows]);

//   const dates = useMemo(
//     () => Array.from({ length: TOTAL_COLS }, (_, i) => addDays(weekStart, i)),
//     [weekStart]
//   );

//   // ── UI state ─────────────────────────────────────────────────────────────
//   const [filter, setFilter] = useState<FilterState>(defaultFilter());
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [snack, setSnack] = useState<string | null>(null);

//   // Placeholders — wire up real dialogs as needed
//   const [, setEditOpen] = useState(false);
//   const [, setAnalyticsOpen] = useState(false);

//   // Reset range sliders when the week changes (new subDomain / refetch)
//   useEffect(() => {
//     setFilter((f) => ({
//       ...f,
//       workRange: [0, TOTAL_COLS],
//       nightRange: [0, TOTAL_COLS],
//     }));
//   }, [weekStart]);

//   // ── Filtered view ─────────────────────────────────────────────────────────
//   // Filters apply to emps that are already loaded.
//   // As more pages load, filteredEmps automatically grows.
//   const filteredEmps = useMemo(
//     () => applyFilters(emps, grid, filter),
//     [emps, grid, filter]
//   );

//   const activeFilterCount = useMemo(
//     () => countActiveFilters(filter),
//     [filter]
//   );

//   // ── Error state ───────────────────────────────────────────────────────────
//   // Only show the full error screen when the very first page fails (rows empty).
//   // Subsequent page errors are shown inline via the sentinel.
//   if (isError && rows.length === 0) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           height: "100%",
//           gap: 2,
//         }}
//       >
//         <WarningAmberIcon sx={{ fontSize: 40, color: "error.main" }} />
//         <Typography
//           sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}
//         >
//           Failed to load roster
//         </Typography>
//         <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
//           Check network or API.
//         </Typography>
//         <Button
//           variant="outlined"
//           size="small"
//           startIcon={<RestartAltIcon />}
//           onClick={refetch}
//           sx={{ textTransform: "none" }}
//         >
//           Retry
//         </Button>
//       </Box>
//     );
//   }

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         maxHeight: `calc(100vh - 218px)`,
//         overflow: "hidden",
//         bgcolor: "background.default",
//       }}
//     >
//       {/* ── STICKY TOOLBAR ────────────────────────────────────────────────── */}
//       <GridToolbar
//         filter={filter}
//         activeFilterCount={activeFilterCount}
//         weekStart={weekStart}
//         filterOpen={filterOpen}
//         filteredEmps={filteredEmps}
//         grid={grid}
//         onFilterChange={setFilter}
//         onFilterToggle={() => setFilterOpen((v) => !v)}
//         onAnalyticsOpen={() => setAnalyticsOpen(true)}
//         onEditOpen={() => setEditOpen(true)}
//         onRefetch={refetch}
//         onSnack={setSnack}
//       />

//       {/* ── FILTER PANEL ──────────────────────────────────────────────────── */}
//       <Box sx={{ px: 2, flexShrink: 0 }}>
//         <FilterPanel
//           open={filterOpen}
//           filter={filter}
//           availableRoles={allRoles}
//           onFilter={setFilter}
//           onClose={() => setFilterOpen(false)}
//         />
//       </Box>

//       {/* ── LEGEND + COUNT BAR ────────────────────────────────────────────── */}
//       <Box
//         sx={{
//           px: 2,
//           py: 1,
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           flexShrink: 0,
//           borderBottom: `1px solid ${theme.palette.divider}`,
//         }}
//       >
//         <ShiftLegend />
//         <Box flex={1} />
//         <Stack direction="row" alignItems="center" gap={0.75}>
//           <LayersIcon sx={{ fontSize: 13, color: "text.disabled" }} />
//           <Typography
//             sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}
//           >
//             {filteredEmps.length}
//             {/* Show total once we know it */}
//             {total !== null ? ` / ${total}` : ""} employees
//             {/* Subtle indicator while more pages are being fetched */}
//             {isFetching && rows.length > 0 && (
//               <Box
//                 component="span"
//                 sx={{ ml: 1, color: "text.disabled", fontWeight: 400 }}
//               >
//                 · loading…
//               </Box>
//             )}
//           </Typography>
//         </Stack>
//       </Box>

//       {/* ── ROSTER GRID ───────────────────────────────────────────────────── */}
//       {/*
//         dimmed=true only during the initial page load (rows empty + fetching).
//         Subsequent page fetches are invisible — the sentinel spinner handles feedback.
//       */}
//       <RosterGrid
//         emps={filteredEmps}
//         grid={grid}
//         dates={dates}
//         dimmed={isFetching && rows.length === 0}
//         isFetchingMore={isFetching}
//         hasMore={hasMore}
//         totalCount={total}
//         onLoadMore={loadMore}
//       />

//       {/* ── SNACKBAR ──────────────────────────────────────────────────────── */}
//       <Snackbar
//         open={!!snack}
//         autoHideDuration={2000}
//         onClose={() => setSnack(null)}
//         message={snack}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       />
//     </Box>
//   );
// }

// // import { useEffect, useMemo, useState } from "react";
// // import {
// //   Box,
// //   Button,
// //   Snackbar,
// //   Stack,
// //   Typography,
// //   useTheme,
// // } from "@mui/material";
// // import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// // import RestartAltIcon from "@mui/icons-material/RestartAlt";
// // import LayersIcon from "@mui/icons-material/LayersOutlined";
// // import {
// //   TOTAL_COLS,
// //   type FilterState,
// //   type GridScreenProps,
// // } from "../../types/Gridtypes";
// // import {
// //   applyFilters,
// //   buildFromApi,
// //   computeWeekStart,
// //   countActiveFilters,
// //   defaultFilter,
// //   addDays,
// // } from "../../util/Gridutils";
// // import { useGetFutureWeekQuery } from "../../api/rosterGenerationApiSlice";
// // import { ShiftLegend } from "./Gridsharedui";
// // import { GridToolbar } from "./Gridtoolbar";
// // import { RosterGrid } from "./Rostergrid";
// // import { FilterPanel } from "./Filterpanel";
// // export default function GridscreenMain({ subDomainId }: GridScreenProps) {
// //   const theme = useTheme();
// //   const isDark = theme.palette.mode === "dark";

// //   // ── API ─────────────────────────────────────────────────────────────────────
// //   const parsedSubDomainId =
// //     typeof subDomainId === "string"
// //       ? parseInt(subDomainId, 10)
// //       : (subDomainId ?? 0);

// //   const {
// //     data: apiData,
// //     isLoading,
// //     isError,
// //     error,
// //     refetch,
// //   } = useGetFutureWeekQuery({ subDomainId: parsedSubDomainId });

// //   // ── Derived data ─────────────────────────────────────────────────────────────
// //   const { emps, grid, allRoles, weekStart } = useMemo(() => {
// //     const rows = apiData?.data ?? [];
// //     const built = buildFromApi(rows);
// //     return { ...built, weekStart: computeWeekStart(rows) };
// //   }, [apiData]);

// //   const dates = useMemo(
// //     () => Array.from({ length: TOTAL_COLS }, (_, i) => addDays(weekStart, i)),
// //     [weekStart],
// //   );

// //   // ── UI state ─────────────────────────────────────────────────────────────────
// //   const [filter, setFilter] = useState<FilterState>(defaultFilter());
// //   const [filterOpen, setFilterOpen] = useState(false);
// //   const [snack, setSnack] = useState<string | null>(null);

// //   // placeholders — wire up real dialogs as needed
// //   const [, setEditOpen] = useState(false);
// //   const [, setAnalyticsOpen] = useState(false);

// //   // Reset ranges when data changes
// //   useEffect(() => {
// //     setFilter((f) => ({
// //       ...f,
// //       workRange: [0, TOTAL_COLS],
// //       nightRange: [0, TOTAL_COLS],
// //     }));
// //   }, [apiData]);

// //   const filteredEmps = useMemo(
// //     () => applyFilters(emps, grid, filter),
// //     [emps, grid, filter],
// //   );
// //   const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

// //   // ── Error state ───────────────────────────────────────────────────────────────
// //   if (isError) {
// //     return (
// //       <Box
// //         sx={{
// //           display: "flex",
// //           flexDirection: "column",
// //           alignItems: "center",
// //           justifyContent: "center",
// //           height: "100%",
// //           gap: 2,
// //         }}
// //       >
// //         <WarningAmberIcon sx={{ fontSize: 40, color: "error.main" }} />
// //         <Typography
// //           sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}
// //         >
// //           Failed to load roster
// //         </Typography>
// //         <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
// //           {(error as any)?.data?.message ?? "Check network or API."}
// //         </Typography>
// //         <Button
// //           variant="outlined"
// //           size="small"
// //           startIcon={<RestartAltIcon />}
// //           onClick={() => refetch()}
// //           sx={{ textTransform: "none" }}
// //         >
// //           Retry
// //         </Button>
// //       </Box>
// //     );
// //   }

// //   // ── Render ────────────────────────────────────────────────────────────────────
// //   return (
// //     /**
// //      * Root: fills the parent container entirely.
// //      * overflow: hidden keeps scrolling contained to the table only.
// //      */
// //     <Box
// //       sx={{
// //         display: "flex",
// //         flexDirection: "column",
// //         height: "100%",
// //         maxHeight: `calc(100vh - 218px)`,
// //         overflow: "hidden",
// //         bgcolor: "background.default",
// //       }}
// //     >
// //       {/* ── STICKY TOOLBAR ──────────────────────────────────────────────────── */}
// //       <GridToolbar
// //         filter={filter}
// //         activeFilterCount={activeFilterCount}
// //         weekStart={weekStart}
// //         filterOpen={filterOpen}
// //         filteredEmps={filteredEmps}
// //         grid={grid}
// //         onFilterChange={setFilter}
// //         onFilterToggle={() => setFilterOpen((v) => !v)}
// //         onAnalyticsOpen={() => setAnalyticsOpen(true)}
// //         onEditOpen={() => setEditOpen(true)}
// //         onRefetch={refetch}
// //         onSnack={setSnack}
// //       />

// //       {/* ── FILTER PANEL (collapses below toolbar) ──────────────────────────── */}
// //       <Box sx={{ px: 2, flexShrink: 0 }}>
// //         <FilterPanel
// //           open={filterOpen}
// //           filter={filter}
// //           availableRoles={allRoles}
// //           onFilter={setFilter}
// //           onClose={() => setFilterOpen(false)}
// //         />
// //       </Box>

// //       {/* ── LEGEND + COUNT BAR ──────────────────────────────────────────────── */}
// //       <Box
// //         sx={{
// //           px: 2,
// //           py: 1,
// //           display: "flex",
// //           alignItems: "center",
// //           gap: 2,
// //           flexShrink: 0,
// //           borderBottom: `1px solid ${theme.palette.divider}`,
// //         }}
// //       >
// //         <ShiftLegend />
// //         <Box flex={1} />
// //         <Stack direction="row" alignItems="center" gap={0.75}>
// //           <LayersIcon sx={{ fontSize: 13, color: "text.disabled" }} />
// //           <Typography
// //             sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500 }}
// //           >
// //             {filteredEmps.length} / {emps.length} employees
// //           </Typography>
// //         </Stack>
// //       </Box>

// //       {/* ── ROSTER GRID (fills remaining space, scrolls internally) ─────────── */}
// //       <RosterGrid emps={filteredEmps} grid={grid} dates={dates} />

// //       {/* ── SNACKBAR ────────────────────────────────────────────────────────── */}
// //       <Snackbar
// //         open={!!snack}
// //         autoHideDuration={2000}
// //         onClose={() => setSnack(null)}
// //         message={snack}
// //         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
// //       />
// //     </Box>
// //   );
// // }
