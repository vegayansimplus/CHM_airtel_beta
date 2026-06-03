import { alpha, Stack, InputBase, IconButton, Badge, Button, Box, Typography, useTheme } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";
import { addDays } from "date-fns";
import { useMemo, useState, useRef, useEffect } from "react";

interface GridScreenProps {
  teamId?: number;
  subTeamId?: number;
}


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
      <Box>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 750,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Future Preview — Week 7
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mt: 0.5 }}
        >
          {fmtShort(wkMon)} – {fmtShort(addDays(wkMon, 6))},{" "}
          {wkMon.getFullYear()} · ISO Week {isoWeek(wkMon)} · Rotating golden
          pattern
        </Typography>
      </Box>

      {/* Stat band */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4,1fr)" },
          gap: "1px",
          bgcolor: "divider",
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {band.map((b) => (
          <Stack
            key={b.lbl}
            direction="row"
            alignItems="center"
            gap={1.75}
            sx={{ bgcolor: "background.paper", p: "12px 16px" }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                bgcolor: b.bg,
                color: b.color,
              }}
            >
              {b.ico}
            </Box>
            <Box>
              <Box
                sx={{
                  fontFamily: MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "text.primary",
                }}
              >
                {b.val}
              </Box>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "text.secondary",
                  fontWeight: 600,
                  mt: 0.4,
                }}
              >
                {b.lbl}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

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