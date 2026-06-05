import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Stack, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import GridIcon from "@mui/icons-material/GridOnOutlined";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import {
  AnalyticsModal,
  applyFilters,
  buildGrid,
  colCounts,
  countActiveFilters,
  defaultFilter,
  DOW,
  EMPLOYEES,
  ExcelUploadModal,
  FilterPanel,
  RosterTable,
  RosterToast,
  scopeEmployees,
  SearchBox,
  ValidationPanel,
} from "./roster-shared";

// import {
//   EMPLOYEES, DOW, buildGrid, scopeEmployees,
//   colCounts, defaultFilter, applyFilters, countActiveFilters,
//   FilterPanel, RosterTable, ValidationPanel,
//   ExcelUploadModal, AnalyticsModal, RosterToast, SearchBox,
// } from "./roster-shared";

export function GoldenGridScreen({ teamId, subTeamId }) {
  const theme = useTheme();
  const allEmps = useMemo(
    () => scopeEmployees(teamId, subTeamId),
    [teamId, subTeamId],
  );
  const [grid, setGrid] = useState(() => buildGrid(EMPLOYEES));
  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState("G");
  const [showVal, setShowVal] = useState(false);
  const [upload, setUpload] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [filter, setFilter] = useState(defaultFilter());
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState(null);
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
  const setCell = (id, day, code) =>
    setGrid((prev) => ({
      ...prev,
      [id]: prev[id].map((c, i) => (i === day ? code : c)),
    }));
  const dayTotals = Array.from({ length: 42 }, (_, i) =>
    colCounts(grid, emps, i),
  );

  const headerActions = (
    <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
      <SearchBox
        value={filter.query}
        onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
        onClear={() => setFilter((f) => ({ ...f, query: "" }))}
        placeholder="Search staff..."
      />
      <Badge badgeContent={activeCount || undefined} color="primary">
        <Button
          size="small"
          variant={filterOpen || activeCount > 0 ? "contained" : "outlined"}
          color={activeCount > 0 ? "primary" : "inherit"}
          startIcon={<TuneIcon />}
          onClick={() => setFilterOpen((v) => !v)}
          sx={{
            textTransform: "none",
            height: 34,
            fontSize: 12,
            borderRadius: "8px",
            fontWeight: 650,
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
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          fontWeight: 600,
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
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          fontWeight: 600,
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
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          fontWeight: 600,
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
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          fontWeight: 650,
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
        allEmps={undefined}
        days={undefined}
      />
      {showVal && <ValidationPanel grid={grid} emps={emps} />}
      <ExcelUploadModal
        open={upload}
        title="Upload Golden Set"
        subtitle="Import employee × 42-day shift matrix"
        onClose={() => setUpload(false)}
        onImport={(f) => {
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

export default GoldenGridScreen;
