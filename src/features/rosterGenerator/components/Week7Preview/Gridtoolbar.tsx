import {
  Box, Chip, Divider, IconButton, InputBase, Stack, Tooltip, Typography, alpha, useTheme,
} from "@mui/material";
import GridIcon from "@mui/icons-material/GridOnOutlined";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { type FilterState, type SortField, type Employee, type ShiftCode } from "../../types/Gridtypes";
import { addDays, fmtShort, isoWeek } from "../../util/Gridutils";

interface GridToolbarProps {
  filter: FilterState;
  activeFilterCount: number;
  weekStart: Date;
  filterOpen: boolean;
  filteredEmps: Employee[];
  grid: Record<string, ShiftCode[]>;
  onFilterChange: (f: FilterState) => void;
  onFilterToggle: () => void;
  onAnalyticsOpen: () => void;
  onEditOpen: () => void;
  onRefetch: () => void;
  onSnack: (msg: string) => void;
}

function SortChip({
  field, label, activeField, sortDir, onCycle,
}: {
  field: SortField;
  label: string;
  activeField: SortField;
  sortDir: "asc" | "desc";
  onCycle: (f: SortField) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const active = activeField === field;
  return (
    <Chip
      size="small"
      label={
        <Stack direction="row" alignItems="center" gap={0.4}>
          {active && (
            <SwapVertIcon
              sx={{
                fontSize: 12,
                transform: sortDir === "desc" ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.2s",
              }}
            />
          )}
          <span>{label}</span>
        </Stack>
      }
      onClick={() => onCycle(field)}
      sx={{
        height: 28,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        bgcolor: active ? (isDark ? "primary.dark" : "#1A3A6B") : "transparent",
        color: active ? "#fff" : "text.secondary",
        border: "1px solid",
        borderColor: active ? (isDark ? "primary.dark" : "#1A3A6B") : "divider",
        borderRadius: "7px",
        "& .MuiChip-label": { px: 1.25 },
        "&:hover": {
          bgcolor: active
            ? isDark ? "primary.dark" : "#14306A"
            : alpha(theme.palette.text.primary, 0.04),
        },
      }}
    />
  );
}

export function GridToolbar({
  filter, activeFilterCount, weekStart, filterOpen,
  filteredEmps, grid,
  onFilterChange, onFilterToggle, onAnalyticsOpen, onEditOpen, onRefetch, onSnack,
}: GridToolbarProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cycleSortField = (field: SortField) =>
    onFilterChange({
      ...filter,
      sortField: field,
      sortDir: filter.sortField === field && filter.sortDir === "asc" ? "desc" : "asc",
    });

  const handleDownload = () => {
    const rows = filteredEmps.map((e) => {
      const shifts = grid[e.id] ?? [];
      return [e.id, e.name, e.role, e.level, ...shifts].join(",");
    });
    const csv = ["ID,Name,Role,Level,D1,D2,D3,D4,D5,D6,D7", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `roster-wk${isoWeek(weekStart)}.csv`;
    a.click();
    onSnack("CSV downloaded");
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 2,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexShrink: 0,
        flexWrap: "nowrap",
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
          onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
          sx={{ fontSize: 12.5, flex: 1, "& input": { p: 0 } }}
        />
        {filter.query && (
          <IconButton
            size="small"
            sx={{ p: 0.25 }}
            onClick={() => onFilterChange({ ...filter, query: "" })}
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
          ) : "Filters"
        }
        onClick={onFilterToggle}
        sx={{
          height: 28,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          border: "1px solid",
          borderColor: activeFilterCount > 0 ? "primary.main" : "divider",
          bgcolor: activeFilterCount > 0
            ? alpha(theme.palette.primary.main, 0.08)
            : "transparent",
          color: activeFilterCount > 0 ? "primary.main" : "text.secondary",
          borderRadius: "7px",
          "& .MuiChip-label": { px: 1.25 },
        }}
      />

      {/* Sort chips */}
      <SortChip field="name"  label="Name"  activeField={filter.sortField} sortDir={filter.sortDir} onCycle={cycleSortField} />
      <SortChip field="work"  label="Work"  activeField={filter.sortField} sortDir={filter.sortDir} onCycle={cycleSortField} />
      <SortChip field="night" label="Night" activeField={filter.sortField} sortDir={filter.sortDir} onCycle={cycleSortField} />

      <Box flex={1} />

      {/* Week info */}
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ mr: 0.5 }}>
        <GridIcon sx={{ fontSize: 13, color: "text.disabled" }} />
        <Typography sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 500, whiteSpace: "nowrap" }}>
          Wk {isoWeek(weekStart)} · {fmtShort(weekStart)} – {fmtShort(addDays(weekStart, 6))}
        </Typography>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

      {/* Analytics */}
      <Box
        component="button"
        onClick={onAnalyticsOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: 12.5,
          fontWeight: 500,
          color: "text.primary",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "8px",
          px: 1.5,
          py: 0.5,
          bgcolor: "transparent",
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) },
        }}
      >
        <InsightsIcon sx={{ fontSize: 16 }} />
        Analytics
      </Box>

      {/* Edit */}
      <Box
        component="button"
        onClick={onEditOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: 12.5,
          fontWeight: 700,
          color: "text.primary",
          border: `1.5px solid ${theme.palette.text.primary}`,
          borderRadius: "8px",
          px: 1.5,
          py: 0.5,
          bgcolor: "transparent",
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) },
        }}
      >
        <EditIcon sx={{ fontSize: 14 }} />
        Edit
      </Box>

      {/* Download */}
      <Tooltip title="Download CSV" arrow>
        <IconButton
          size="small"
          onClick={handleDownload}
          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "7px", p: "5px" }}
        >
          <DownloadIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {/* Refresh */}
      <Tooltip title="Refresh" arrow>
        <IconButton
          size="small"
          onClick={() => { onRefetch(); onSnack("Refreshed"); }}
          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "7px", p: "5px" }}
        >
          <RestartAltIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}