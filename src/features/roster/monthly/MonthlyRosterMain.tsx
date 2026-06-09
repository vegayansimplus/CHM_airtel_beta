import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  MenuItem,
  Select,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import HighlightIcon from "@mui/icons-material/Highlight";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState,type KeyboardEvent } from "react";
import dayjs from "dayjs";
import { useGetRosterViewQuery } from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import FilterSvg from "../../../assets/svg/RosterEmpty.svg";
import { CompactShiftCountBar } from "../components/RosterShiftCountBar";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Props {
  startDate: string;
  endDate: string;
  domainId?: number;
  subDomainId?: number;
}
interface Shift {
  assignActCount: number;
  availableMins: number;
  shiftDisplay: string;
  workMode: string | null;
}
interface UserRoster {
  userId: number;
  olmid: string;
  jobLevel: string;
  mobileNo: string;
  officeLocation: string;
  roster: Record<string, Shift>;
}

/* ─── Palette ────────────────────────────────────────────────────────────── */
interface ShiftPalette {
  bg: string;
  border: string;
  text: string;
  badge: string;
  label: string;
  time: string;
}
const PALETTE: Record<string, ShiftPalette> = {
  G: {
    bg: "#EEF5FF",
    border: "#C3D9FE",
    text: "#1E40AF",
    badge: "#3B82F6",
    label: "General",
    time: "9:30 AM – 6:30 PM",
  },
  LG: {
    bg: "#EDFBF3",
    border: "#9DECBF",
    text: "#065F46",
    badge: "#10B981",
    label: "LG Shift",
    time: "11:00 AM – 8:00 PM",
  },
  B: {
    bg: "#FFF8EE",
    border: "#FCD97D",
    text: "#854D0E",
    badge: "#F59E0B",
    label: "B Shift",
    time: "2:00 PM – 10:00 PM",
  },
  N: {
    bg: "#F1F0FF",
    border: "#C0B8FD",
    text: "#3730A3",
    badge: "#6366F1",
    label: "Night",
    time: "10:00 PM – 7:00 AM",
  },
  A: {
    bg: "#FFFCEE",
    border: "#FCE98D",
    text: "#78350F",
    badge: "#FBBF24",
    label: "Afternoon",
    time: "2:00 PM – 10:00 PM",
  },
  L: {
    bg: "#FEF0FA",
    border: "#F9C4E8",
    text: "#9D174D",
    badge: "#EC4899",
    label: "Leave",
    time: "—",
  },
  H: {
    bg: "#FFF0F2",
    border: "#FECDD3",
    text: "#881337",
    badge: "#F43F5E",
    label: "Holiday",
    time: "—",
  },
  C: {
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#475569",
    badge: "#94A3B8",
    label: "Comp Off",
    time: "—",
  },
  NJ: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#78350F",
    badge: "#F59E0B",
    label: "New Joinee",
    time: "9:00 AM – 5:00 PM",
  },
  W: {
    bg: "transparent",
    border: "#E5E7EB",
    text: "#D1D5DB",
    badge: "#D1D5DB",
    label: "Week Off",
    time: "—",
  },
};
const FALLBACK = PALETTE.W;

function resolveKey(shiftDisplay?: string | null): string {
  if (!shiftDisplay || shiftDisplay === "WO") return "W";
  const d = shiftDisplay.trim();
  if (d.toLowerCase() === "leave") return "L";
  if (d === "New Joinee") return "NJ";
  if (d === "Holiday") return "H";
  if (d === "Comp Off" || d === "CO") return "C";
  if (d.startsWith("LG")) return "LG";
  return d.charAt(0).toUpperCase();
}
const getPalette = (s?: string | null) => PALETTE[resolveKey(s)] ?? FALLBACK;

/* ─── Component ─────────────────────────────────────────────────────────── */
export const MonthlyRosterMain = ({
  startDate,
  endDate,
  domainId,
  subDomainId,
}: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const CELL_BORDER = isDark ? "rgba(255,255,255,.06)" : "#F0F0F2";

  /* ── State ──────────────────────────────────────────────────────────── */
  const [detailedView, setDetailedView] = useState(false);
  const [filterShift, setFilterShift] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [highlightShift, setHighlightShift] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Multi-search state ──
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const [selectedShiftModal, setSelectedShiftModal] = useState<{
    user: UserRoster;
    date: string;
    shift: Shift | undefined;
  } | null>(null);

  /* ── Multi-search helpers ───────────────────────────────────────────── */
  const commitInput = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !searchTerms.includes(s));
    if (parts.length) setSearchTerms((prev) => [...prev, ...parts]);
    setSearchInput("");
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitInput(searchInput);
    }
    if (e.key === "Backspace" && searchInput === "" && searchTerms.length > 0)
      setSearchTerms((prev) => prev.slice(0, -1));
  };

  const removeChip = (t: string) =>
    setSearchTerms((prev) => prev.filter((x) => x !== t));
  const clearAll = () => {
    setSearchTerms([]);
    setSearchInput("");
  };
  const hasSearch = searchTerms.length > 0 || searchInput.trim().length > 0;

  /* ── API ────────────────────────────────────────────────────────────── */
  const shouldSkip = !subDomainId || subDomainId === 0;
  const { data, isLoading, isError } = useGetRosterViewQuery(
    {
      domainId: domainId ?? 0,
      subDomainId: subDomainId ?? 0,
      startDate,
      endDate,
    },
    { skip: shouldSkip },
  );

  /* ── Dates ──────────────────────────────────────────────────────────── */
  const allDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates: string[] = [];
    let cur = dayjs(startDate);
    const end = dayjs(endDate);
    while (cur.isBefore(end) || cur.isSame(end, "day")) {
      dates.push(cur.format("YYYY-MM-DD"));
      cur = cur.add(1, "day");
    }
    return dates;
  }, [startDate, endDate]);

  const users: UserRoster[] = data?.data ?? [];

  /* ── Filtered users (multi-search + shift + level) ──────────────────── */
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        // Multi-search: user must match ALL active terms (AND logic)
        if (searchTerms.length > 0) {
          const haystack = JSON.stringify(user).toLowerCase();
          const allMatch = searchTerms.every((t) =>
            haystack.includes(t.toLowerCase()),
          );
          if (!allMatch) return false;
        }
        if (filterLevel.length && !filterLevel.includes(user.jobLevel))
          return false;
        if (filterShift.length) {
          const has = allDates.some((d) =>
            filterShift.includes(resolveKey(user.roster?.[d]?.shiftDisplay)),
          );
          if (!has) return false;
        }
        return true;
      }),
    [users, searchTerms, filterShift, filterLevel, allDates],
  );

  /* ── Daily coverage ─────────────────────────────────────────────────── */
  const dailyCoverage = useMemo(
    () =>
      allDates.map((date) => {
        let n = 0;
        filteredUsers.forEach((u) => {
          const k = resolveKey(u.roster?.[date]?.shiftDisplay);
          if (k !== "W" && k !== "L") n++;
        });
        return n;
      }),
    [filteredUsers, allDates],
  );

  const jobLevels = useMemo(
    () => Array.from(new Set(users.map((u) => u.jobLevel))).sort(),
    [users],
  );

  const usedShiftKeys = useMemo(() => {
    const s = new Set<string>();
    filteredUsers.forEach((u) =>
      allDates.forEach((d) => s.add(resolveKey(u.roster?.[d]?.shiftDisplay))),
    );
    return Array.from(s).filter((k) => PALETTE[k]);
  }, [filteredUsers, allDates]);

  /* ── Guards ─────────────────────────────────────────────────────────── */
  if (shouldSkip)
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={FilterSvg} alt="Select Filter" width={650} />
      </Box>
    );
  if (isError || data?.success === false)
    return (
      <Alert severity="error">Roster not generated for selected range</Alert>
    );
  if (!users.length)
    return (
      <Alert severity="info">No roster available for selected range</Alert>
    );

  const todayStr = dayjs().format("YYYY-MM-DD");
  const hasActiveFilters = Boolean(
    searchTerms.length || filterShift.length || filterLevel.length,
  );

  const getCoverageColor = (count: number) => {
    const pct = filteredUsers.length > 0 ? count / filteredUsers.length : 0;
    if (pct > 0.7) return theme.palette.success.main;
    if (pct > 0.4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <Box>
      {/* ══════════════════ TOOLBAR ══════════════════ */}
      <Paper
        elevation={0}
        sx={{
          px: "10px",
          py: "6px",
          mb: 1,
          borderRadius: "10px",
          border: `1px solid ${CELL_BORDER}`,
          bgcolor: isDark ? theme.palette.background.paper : "#FAFAFA",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {/* ── Multi-search input ───────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "4px",
            minWidth: 200,
            maxWidth: 340,
            minHeight: 30,
            px: "10px",
            py: "3px",
            borderRadius: "8px",
            border: `1px solid ${hasSearch ? theme.palette.primary.main : isDark ? "rgba(255,255,255,.15)" : "#E5E7EB"}`,
            bgcolor: isDark ? "background.default" : "#fff",
            cursor: "text",
            transition: "border-color .15s",
          }}
          onClick={() =>
            document.getElementById("monthly-search-input")?.focus()
          }
        >
          <SearchIcon
            sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }}
          />

          {/* Chips */}
          {searchTerms.map((term) => (
            <Chip
              key={term}
              label={term}
              size="small"
              onDelete={() => removeChip(term)}
              deleteIcon={<CloseIcon style={{ fontSize: 10 }} />}
              sx={{
                height: 18,
                fontSize: "0.6rem",
                fontWeight: 600,
                bgcolor: isDark
                  ? alpha(theme.palette.primary.main, 0.2)
                  : "#EEF5FF",
                color: "primary.main",
                border: "1px solid",
                borderColor: isDark ? "primary.dark" : "#C3D9FE",
                "& .MuiChip-deleteIcon": {
                  color: "primary.main",
                  "&:hover": { color: "error.main" },
                },
              }}
            />
          ))}

          {/* Text input */}
          <Box
            id="monthly-search-input"
            component="input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => {
              if (searchInput.trim()) commitInput(searchInput);
            }}
            placeholder={
              searchTerms.length === 0 ? "Search employee…" : "Add more…"
            }
            sx={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "11px",
              color: "text.primary",
              flex: 1,
              minWidth: 80,
              fontFamily: "inherit",
            }}
          />

          {/* Clear all */}
          {hasSearch && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "text.disabled",
                flexShrink: 0,
                "&:hover": { color: "error.main" },
                transition: "color .15s",
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </Box>
          )}
        </Box>

        {/* Search hint */}
        {searchTerms.length > 0 && (
          <Typography sx={{ fontSize: "0.58rem", color: "text.disabled" }}>
            {searchTerms.length} filter{searchTerms.length !== 1 ? "s" : ""} ·
            Enter or , to add
          </Typography>
        )}

        {/* ── Detailed view toggle ─────────────────────────────────────── */}
        <Tooltip
          title={
            detailedView ? "Switch to compact view" : "Switch to detailed view"
          }
        >
          <IconButton
            size="small"
            onClick={() => setDetailedView((p) => !p)}
            sx={{
              border: `1px solid ${CELL_BORDER}`,
              borderRadius: "8px",
              p: "4px",
              bgcolor: detailedView
                ? alpha(theme.palette.primary.main, 0.08)
                : isDark
                  ? "background.default"
                  : "#fff",
              color: detailedView ? "primary.main" : "inherit",
            }}
          >
            {detailedView ? (
              <ViewCompactIcon sx={{ fontSize: 16 }} />
            ) : (
              <ViewAgendaIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* ── Filters toggle ───────────────────────────────────────────── */}
        <Tooltip title="Filters">
          <IconButton
            size="small"
            onClick={() => setShowFilters((p) => !p)}
            sx={{
              border: `1px solid ${CELL_BORDER}`,
              borderRadius: "8px",
              p: "4px",
              position: "relative",
              bgcolor: showFilters
                ? alpha(theme.palette.primary.main, 0.08)
                : isDark
                  ? "background.default"
                  : "#fff",
              color: hasActiveFilters ? "primary.main" : "inherit",
            }}
          >
            <FilterListIcon sx={{ fontSize: 16 }} />
            {hasActiveFilters && (
              <Box
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        {/* ── Highlight picker ─────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" gap={0.5}>
          <HighlightIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Select
            size="small"
            displayEmpty
            value={highlightShift}
            onChange={(e) => setHighlightShift(e.target.value)}
            sx={{
              fontSize: 11,
              borderRadius: "8px",
              height: 30,
              minWidth: 130,
              bgcolor: isDark ? "background.default" : "#fff",
            }}
          >
            <MenuItem value="">
              <em>No highlight</em>
            </MenuItem>
            {Object.entries(PALETTE)
              .filter(([k]) => k !== "W")
              .map(([k, p]) => (
                <MenuItem key={k} value={k}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "2px",
                        bgcolor: p.badge,
                      }}
                    />
                    <Typography fontSize={11}>{p.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
          </Select>
        </Stack>

        {/* Shift count bar */}
        <CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />

        {/* Clear filters chip */}
        {hasActiveFilters && (
          <Chip
            label="Clear all"
            size="small"
            onDelete={() => {
              setFilterShift([]);
              setFilterLevel([]);
              setSearchTerms([]);
              setSearchInput("");
            }}
            sx={{ height: 22, fontSize: 10 }}
          />
        )}
      </Paper>

      {/* ══════════════════ FILTER PANEL ══════════════════ */}
      <Collapse in={showFilters}>
        <Box
          display="flex"
          gap={1}
          mb={1}
          p={1.5}
          sx={{
            border: `1px solid ${CELL_BORDER}`,
            borderRadius: "8px",
            bgcolor: isDark ? theme.palette.background.paper : "#FAFAFA",
          }}
        >
          {/* Multi-select shift filter */}
          <Select
            size="small"
            displayEmpty
            multiple
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value as string[])}
            renderValue={(selected) =>
              (selected as string[]).length === 0 ? (
                <em
                  style={{
                    fontSize: 11,
                    color: isDark ? "#6B7280" : "#9CA3AF",
                  }}
                >
                  All shift types
                </em>
              ) : (
                <Typography fontSize={11} noWrap>
                  {(selected as string[])
                    .map((k) => PALETTE[k]?.label ?? k)
                    .join(", ")}
                </Typography>
              )
            }
            sx={{
              fontSize: 11,
              borderRadius: "8px",
              height: 30,
              minWidth: 190,
              bgcolor: isDark ? "background.default" : "#fff",
            }}
            MenuProps={{
              PaperProps: { sx: { maxHeight: 280, borderRadius: "8px" } },
            }}
          >
            {Object.entries(PALETTE)
              .filter(([k]) => k !== "W")
              .map(([k, p]) => (
                <MenuItem key={k} value={k} sx={{ py: "4px" }}>
                  <Checkbox
                    checked={filterShift.includes(k)}
                    size="small"
                    sx={{ p: "2px", mr: "6px" }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "2px",
                      bgcolor: p.badge,
                      flexShrink: 0,
                      mr: "6px",
                    }}
                  />
                  <ListItemText
                    primary={`${k} – ${p.label}`}
                    primaryTypographyProps={{ fontSize: 11 }}
                  />
                </MenuItem>
              ))}
          </Select>

          {/* Multi-select level filter */}
          <Select
            size="small"
            displayEmpty
            multiple
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as string[])}
            renderValue={(selected) =>
              (selected as string[]).length === 0 ? (
                <em
                  style={{
                    fontSize: 11,
                    color: isDark ? "#6B7280" : "#9CA3AF",
                  }}
                >
                  All job levels
                </em>
              ) : (
                <Typography fontSize={11} noWrap>
                  {(selected as string[]).join(", ")}
                </Typography>
              )
            }
            sx={{
              fontSize: 11,
              borderRadius: "8px",
              height: 30,
              minWidth: 150,
              bgcolor: isDark ? "background.default" : "#fff",
            }}
            MenuProps={{
              PaperProps: { sx: { maxHeight: 280, borderRadius: "8px" } },
            }}
          >
            {jobLevels.map((lvl) => (
              <MenuItem key={lvl} value={lvl} sx={{ py: "4px" }}>
                <Checkbox
                  checked={filterLevel.includes(lvl)}
                  size="small"
                  sx={{ p: "2px", mr: "6px" }}
                />
                <ListItemText
                  primary={lvl}
                  primaryTypographyProps={{ fontSize: 11 }}
                />
              </MenuItem>
            ))}
          </Select>

          {/* Active filter chips preview */}
          {(filterShift.length > 0 || filterLevel.length > 0) && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap="4px"
              alignItems="center"
            >
              {filterShift.map((k) => (
                <Chip
                  key={k}
                  size="small"
                  label={PALETTE[k]?.label ?? k}
                  onDelete={() =>
                    setFilterShift((prev) => prev.filter((x) => x !== k))
                  }
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: isDark
                      ? alpha(PALETTE[k]?.badge ?? "#000", 0.15)
                      : PALETTE[k]?.bg,
                    color: PALETTE[k]?.text,
                    border: `1px solid ${PALETTE[k]?.border}`,
                  }}
                />
              ))}
              {filterLevel.map((lvl) => (
                <Chip
                  key={lvl}
                  size="small"
                  label={lvl}
                  onDelete={() =>
                    setFilterLevel((prev) => prev.filter((x) => x !== lvl))
                  }
                  sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600 }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>

      {/* ══════════════════ TABLE ══════════════════ */}
      <Box
        sx={{
          borderRadius: "10px 10px 0 0",
          overflow: "hidden",
          boxShadow: isDark
            ? "0 1px 4px rgba(0,0,0,.3)"
            : "0 1px 4px rgba(0,0,0,.07)",
        }}
      >
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "10px 10px 0 0",
            bgcolor: theme.palette.background.paper,
            position: "relative",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.background.paper, 0.75),
                zIndex: 50,
                borderRadius: "10px",
              }}
            >
              <CircularProgress size={30} />
            </Box>
          )}

          <SmartScrollContainer height={420} enableHorizontal>
            <Table
              size="small"
              sx={{
                tableLayout: detailedView ? "auto" : "fixed",
                width: detailedView ? "max-content" : "100%",
                minWidth: detailedView ? 1400 : "100%",
                borderCollapse: "collapse",
              }}
            >
              {/* ── HEAD ───────────────────────────────────────── */}
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 190,
                      minWidth: 190,
                      position: "sticky",
                      left: 0,
                      zIndex: 30,
                      bgcolor: isDark
                        ? theme.palette.background.paper
                        : "#F9FAFB",
                      borderBottom: `1px solid ${CELL_BORDER}`,
                      borderRight: `1px solid ${CELL_BORDER}`,
                      py: "8px",
                      px: "12px",
                    }}
                  >
                    <Typography
                      fontSize={10}
                      fontWeight={600}
                      color="text.secondary"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                      }}
                    >
                      Employee
                    </Typography>
                  </TableCell>

                  {allDates.map((date) => {
                    const isToday = date === todayStr;
                    const isWeekend = [0, 6].includes(dayjs(date).day());
                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          minWidth: detailedView ? 130 : 34,
                          px: "2px",
                          py: "6px",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          bgcolor: isToday
                            ? isDark
                              ? alpha("#3B82F6", 0.15)
                              : "#EBF3FF"
                            : isWeekend
                              ? isDark
                                ? alpha("#fff", 0.02)
                                : "#FAFAFA"
                              : theme.palette.background.paper,
                          boxShadow: isToday
                            ? "inset 0 -2px 0 #3B82F6"
                            : "none",
                          borderBottom: isToday
                            ? "none"
                            : `1px solid ${CELL_BORDER}`,
                        }}
                      >
                        <Typography
                          fontSize={isToday ? 12 : 11}
                          fontWeight={700}
                          color={isToday ? "#1D4ED8" : "text.primary"}
                          lineHeight={1}
                        >
                          {dayjs(date).format("DD")}
                        </Typography>
                        <Typography
                          fontSize={9}
                          fontWeight={600}
                          color={isToday ? "#3B82F6" : "text.secondary"}
                          sx={{ letterSpacing: ".05em", mt: "1px" }}
                        >
                          {dayjs(date).format("ddd")}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              {/* ── BODY ───────────────────────────────────────── */}
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={allDates.length + 1}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography color="text.secondary" fontSize={13}>
                        No employees match the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.userId}
                    sx={{
                      "&:hover": {
                        bgcolor: isDark ? alpha("#fff", 0.02) : "#FAFAFA",
                      },
                      "&:last-child td": { borderBottom: "none" },
                    }}
                  >
                    {/* Sticky employee cell */}
                    <TableCell
                      sx={{
                        width: 190,
                        minWidth: 190,
                        position: "sticky",
                        left: 0,
                        zIndex: 20,
                        bgcolor: theme.palette.background.paper,
                        borderBottom: `1px solid ${CELL_BORDER}`,
                        borderRight: `1px solid ${CELL_BORDER}`,
                        py: "5px",
                        px: "10px",
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap="7px">
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "7px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isDark ? alpha("#fff", 0.07) : "#F3F4F6",
                            color: "text.secondary",
                            fontSize: 9,
                            fontWeight: 700,
                          }}
                        >
                          {user.olmid.slice(0, 2).toUpperCase()}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={600}
                            fontSize={11.5}
                            noWrap
                            color="text.primary"
                          >
                            {user.olmid}
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap="4px"
                            mt="2px"
                          >
                            <Typography
                              fontSize={9}
                              fontWeight={600}
                              sx={{
                                px: "5px",
                                py: "1px",
                                borderRadius: "3px",
                                bgcolor: isDark
                                  ? alpha("#fff", 0.07)
                                  : "#F3F4F6",
                                color: "text.secondary",
                                letterSpacing: ".03em",
                              }}
                            >
                              {user.jobLevel}
                            </Typography>
                            {user.officeLocation && (
                              <Typography
                                fontSize={9}
                                sx={{
                                  px: "5px",
                                  py: "1px",
                                  borderRadius: "3px",
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                }}
                              >
                                {user.officeLocation}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>

                    {allDates.map((date) => {
                      const shift = user.roster?.[date];
                      const isToday = date === todayStr;
                      const isWeekend = [0, 6].includes(dayjs(date).day());
                      const key = resolveKey(shift?.shiftDisplay);
                      const p = getPalette(shift?.shiftDisplay);
                      const isWO = key === "W";
                      const isDimmed =
                        highlightShift !== "" && key !== highlightShift;

                      return (
                        <TableCell
                          key={date}
                          align="center"
                          sx={{
                            px: "2px",
                            py: "4px",
                            borderBottom: `1px solid ${CELL_BORDER}`,
                            bgcolor: isToday
                              ? isDark
                                ? alpha("#3B82F6", 0.04)
                                : alpha("#EBF3FF", 0.4)
                              : isWeekend
                                ? isDark
                                  ? alpha("#fff", 0.01)
                                  : "#FAFAFA"
                                : "transparent",
                          }}
                        >
                          <Tooltip
                            arrow
                            placement="top"
                            title={
                              <Box>
                                <Typography fontSize={12} fontWeight={600}>
                                  {user.olmid} · {user.jobLevel}
                                </Typography>
                                <Typography fontSize={11}>
                                  {dayjs(date).format("ddd, DD MMM YYYY")}
                                </Typography>
                                <Typography fontSize={11}>
                                  Shift: {shift?.shiftDisplay ?? "Week Off"}
                                </Typography>
                                {shift?.workMode && (
                                  <Typography fontSize={11}>
                                    Mode: {shift.workMode}
                                  </Typography>
                                )}
                                {shift?.availableMins !== undefined && (
                                  <Typography fontSize={11}>
                                    Available:{" "}
                                    {Math.round(shift.availableMins / 60)}h
                                  </Typography>
                                )}
                              </Box>
                            }
                          >
                            {isWO ? (
                              /* ── Week Off ── */
                              <Box
                                onClick={() =>
                                  setSelectedShiftModal({ user, date, shift })
                                }
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: detailedView ? 72 : 26,
                                  height: 22,
                                  borderRadius: "5px",
                                  border: "1px dashed",
                                  borderColor: isDark
                                    ? "rgba(255,255,255,.1)"
                                    : "#E5E7EB",
                                  bgcolor: "transparent",
                                  color: isDark
                                    ? "rgba(255,255,255,.18)"
                                    : "#D1D5DB",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  userSelect: "none",
                                  opacity: isDimmed ? 0.1 : 1,
                                  transition:
                                    "border-color .14s, color .14s, transform .14s",
                                  "&:hover": {
                                    borderColor: isDark
                                      ? "rgba(255,255,255,.25)"
                                      : "#CBD5E1",
                                    color: isDark
                                      ? "rgba(255,255,255,.4)"
                                      : "#94A3B8",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                {detailedView ? "Week Off" : "WO"}
                              </Box>
                            ) : (
                              /* ── Regular shift ── */
                              <Box
                                onClick={() =>
                                  setSelectedShiftModal({ user, date, shift })
                                }
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: detailedView ? "4px" : 0,
                                  width: detailedView ? "auto" : 26,
                                  minWidth: detailedView ? 90 : 26,
                                  height: detailedView ? 26 : 22,
                                  px: detailedView ? "8px" : 0,
                                  borderRadius: "5px",
                                  border: `1px solid ${isDark ? alpha(p.badge, 0.3) : p.border}`,
                                  bgcolor: isDark ? alpha(p.badge, 0.15) : p.bg,
                                  opacity: isDimmed ? 0.12 : 1,
                                  cursor: "pointer",
                                  userSelect: "none",
                                  transition:
                                    "opacity .14s, transform .14s, box-shadow .14s",
                                  "&:hover": {
                                    opacity: isDimmed ? 0.25 : 1,
                                    transform: "scale(1.1)",
                                    boxShadow: `0 2px 8px ${p.badge}44`,
                                  },
                                }}
                              >
                                {/* Colored dot in detailed mode */}
                                {detailedView && (
                                  <Box
                                    sx={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: "2px",
                                      bgcolor: p.badge,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: detailedView ? 11 : 10,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    letterSpacing: key.length > 1 ? "-.4px" : 0,
                                    color: isDark
                                      ? alpha(p.badge, 0.9)
                                      : p.text,
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {detailedView
                                    ? (shift?.shiftDisplay ?? "WO")
                                    : key}
                                </Typography>
                              </Box>
                            )}
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Active staff summary row */}
                {filteredUsers.length > 0 && (
                  <TableRow
                    sx={{
                      bgcolor: isDark ? alpha("#fff", 0.03) : "#F9FAFB",
                      position: "sticky",
                      bottom: 0,
                      zIndex: 5,
                    }}
                  >
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                        bgcolor: isDark ? alpha("#fff", 0.03) : "#F9FAFB",
                        borderTop: `1px solid ${CELL_BORDER}`,
                        borderRight: `1px solid ${CELL_BORDER}`,
                        borderBottom: "none",
                        py: "5px",
                        px: "12px",
                      }}
                    >
                      <Typography
                        fontSize={10}
                        fontWeight={600}
                        color="text.secondary"
                      >
                        Active staff / day
                      </Typography>
                    </TableCell>
                    {dailyCoverage.map((count, i) => (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{
                          py: "4px",
                          borderTop: `1px solid ${CELL_BORDER}`,
                          borderBottom: "none",
                        }}
                      >
                        <Typography
                          fontSize={10}
                          fontWeight={700}
                          color={getCoverageColor(count)}
                        >
                          {count}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SmartScrollContainer>
        </TableContainer>
      </Box>

      {/* ══════════════════ SHIFT LEGEND ══════════════════ */}
      <Box
        sx={{
          borderRadius: "0 0 10px 10px",
          bgcolor: isDark ? theme.palette.background.paper : "#F9FAFB",
          border: `1px solid ${CELL_BORDER}`,
          borderTop: "none",
          px: "14px",
          py: "10px",
        }}
      >
        <Typography
          fontSize={9}
          fontWeight={600}
          color="text.disabled"
          sx={{ textTransform: "uppercase", letterSpacing: ".08em", mb: "8px" }}
        >
          Shift legend · click to highlight
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap="5px">
          {usedShiftKeys.map((k) => {
            const p = PALETTE[k];
            const isWO = k === "W";
            const isHL = highlightShift === k;
            return (
              <Stack
                key={k}
                direction="row"
                alignItems="center"
                gap="4px"
                onClick={() =>
                  setHighlightShift((prev) => (prev === k ? "" : k))
                }
                sx={{
                  bgcolor: isDark ? alpha(p.badge, 0.08) : "#fff",
                  border: `1px solid ${isHL ? p.badge : isDark ? alpha(p.badge, 0.25) : p.border}`,
                  borderRadius: "6px",
                  px: "8px",
                  py: "4px",
                  cursor: "pointer",
                  transition:
                    "box-shadow .12s, transform .12s, border-color .12s",
                  "&:hover": {
                    boxShadow: `0 2px 8px ${p.badge}30`,
                    transform: "translateY(-1px)",
                  },
                  ...(isHL && { boxShadow: `0 0 0 2px ${p.badge}44` }),
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "2px",
                    bgcolor: isWO ? "transparent" : p.badge,
                    border: isWO
                      ? `1.5px dashed ${isDark ? "#6B7280" : "#D1D5DB"}`
                      : "none",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  fontSize={10}
                  fontWeight={800}
                  sx={{ color: p.badge }}
                >
                  {k}
                </Typography>
                <Box
                  sx={{
                    width: "1px",
                    height: 10,
                    bgcolor: isDark ? "rgba(255,255,255,.1)" : "#E5E7EB",
                  }}
                />
                <Typography
                  fontSize={9.5}
                  fontWeight={500}
                  color="text.secondary"
                  noWrap
                >
                  {p.label}
                </Typography>
                {!isWO && p.time !== "—" && (
                  <>
                    <Box
                      sx={{
                        width: "1px",
                        height: 10,
                        bgcolor: isDark ? "rgba(255,255,255,.1)" : "#E5E7EB",
                      }}
                    />
                    <Typography fontSize={8.5} color="text.disabled" noWrap>
                      {p.time}
                    </Typography>
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Box>

      {/* ══════════════════ DETAIL MODAL ══════════════════ */}
      <Dialog
        open={Boolean(selectedShiftModal)}
        onClose={() => setSelectedShiftModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        {(() => {
          const p = getPalette(selectedShiftModal?.shift?.shiftDisplay);
          const k = resolveKey(selectedShiftModal?.shift?.shiftDisplay);
          return (
            <>
              <DialogTitle
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  bgcolor: isDark ? alpha(p.badge, 0.1) : p.bg,
                  borderBottom: `1px solid ${isDark ? alpha(p.badge, 0.2) : p.border}`,
                  py: "12px",
                  px: "16px",
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "9px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: p.badge,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: k.length > 1 ? 11 : 17,
                    letterSpacing: "-.4px",
                  }}
                >
                  {k}
                </Box>
                <Box>
                  <Typography fontSize={15} fontWeight={700}>
                    {p.label}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    {selectedShiftModal?.user.olmid} ·{" "}
                    {dayjs(selectedShiftModal?.date).format("DD MMM YYYY")}
                  </Typography>
                </Box>
              </DialogTitle>

              <DialogContent sx={{ pt: "18px !important", px: "20px" }}>
                {selectedShiftModal && (
                  <Stack gap={2}>
                    <Box>
                      <Typography
                        fontSize={10}
                        fontWeight={600}
                        color="text.disabled"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          mb: "8px",
                        }}
                      >
                        Employee
                      </Typography>
                      {[
                        ["OLMID", selectedShiftModal.user.olmid],
                        ["Level", selectedShiftModal.user.jobLevel],
                        [
                          "Location",
                          selectedShiftModal.user.officeLocation || "N/A",
                        ],
                        ["Mobile", selectedShiftModal.user.mobileNo || "N/A"],
                      ].map(([label, value]) => (
                        <Box
                          key={label}
                          display="flex"
                          justifyContent="space-between"
                          py="4px"
                          sx={{ borderBottom: `1px solid ${CELL_BORDER}` }}
                        >
                          <Typography fontSize={12} color="text.secondary">
                            {label}
                          </Typography>
                          <Typography fontSize={12} fontWeight={600}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ borderColor: CELL_BORDER }} />

                    <Box>
                      <Typography
                        fontSize={10}
                        fontWeight={600}
                        color="text.disabled"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          mb: "8px",
                        }}
                      >
                        Shift details
                      </Typography>
                      {[
                        [
                          "Date",
                          dayjs(selectedShiftModal.date).format(
                            "DD MMM YYYY (dddd)",
                          ),
                        ],
                        [
                          "Shift",
                          selectedShiftModal.shift?.shiftDisplay ?? "Week Off",
                        ],
                        ["Time", p.time !== "—" ? p.time : "—"],
                        [
                          "Work Mode",
                          selectedShiftModal.shift?.workMode ?? "—",
                        ],
                        [
                          "Available",
                          selectedShiftModal.shift?.availableMins !== undefined
                            ? `${Math.round(selectedShiftModal.shift.availableMins / 60)} hrs`
                            : "—",
                        ],
                        [
                          "Assignments",
                          String(
                            selectedShiftModal.shift?.assignActCount ?? "—",
                          ),
                        ],
                      ].map(([label, value]) => (
                        <Box
                          key={label}
                          display="flex"
                          justifyContent="space-between"
                          py="4px"
                          sx={{ borderBottom: `1px solid ${CELL_BORDER}` }}
                        >
                          <Typography fontSize={12} color="text.secondary">
                            {label}
                          </Typography>
                          <Typography fontSize={12} fontWeight={600}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                )}
              </DialogContent>

              <DialogActions sx={{ px: "16px", py: "12px" }}>
                <Button
                  onClick={() => setSelectedShiftModal(null)}
                  variant="contained"
                  disableElevation
                  size="small"
                  sx={{
                    bgcolor: p.badge,
                    borderRadius: "8px",
                    "&:hover": { bgcolor: alpha(p.badge, 0.85) },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};
