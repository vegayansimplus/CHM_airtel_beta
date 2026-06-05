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
  TextField,
  MenuItem,
  Select,
  InputAdornment,
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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import HighlightIcon from "@mui/icons-material/Highlight";
import InfoIcon from "@mui/icons-material/Info";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetRosterViewQuery } from "../api/rosterApiSlice";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
import FilterSvg from "../../../assets/svg/RosterEmpty.svg";
import { CompactShiftCountBar } from "../components/RosterShiftCountBar";

/* ================= TYPES ================= */

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

const getShiftLetter = (shift?: string | null): string => {
  if (!shift) return "W";
  if (shift === "LEAVE") return "L";
  if (shift === "WO") return "W";
  return shift.charAt(0);
};

/*  — original business logic */
const getShiftColor = (
  shift: string | null | undefined,
  mode: "light" | "dark",
) => {
  if (!shift) {
    return {
      bg: mode === "dark" ? alpha("#ffffff", 0.06) : "#f5f5f5",
      color: mode === "dark" ? "#aaa" : "#666",
    };
  }

  const code = shift.charAt(0);

  const map: Record<string, string> = {
    N: "#1a237e",
    A: "#fbc02d",
    B: "#ef6c00",
    M: "#1976d2",
    L: "#e53935",
    W: "#9e9e9e",
  };

  const base = map[code] ?? "#9e9e9e";

  return {
    bg: alpha(base, 0.18),
    color: base,
  };
};

/* ================= COMPONENT ================= */

export const MonthlyRosterMain = ({
  startDate,
  endDate,
  domainId,
  subDomainId,
}: Props) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  /* ── Original state ──  */
  const [detailedView, setDetailedView] = useState(false);

  /* ── NEW UI-only state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShift, setFilterShift] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [highlightShift, setHighlightShift] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  /* ── Detailed shift modal state ── */
  const [selectedShiftModal, setSelectedShiftModal] = useState<{
    user: UserRoster;
    date: string;
    shift: Shift | undefined;
  } | null>(null);

  /* ── Original API logic ──  */
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

  /* ── Original date generation ──  */
  const allDates = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const dates: string[] = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    return dates;
  }, [startDate, endDate]);

  const users: UserRoster[] = data?.data ?? [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !user.olmid.toLowerCase().includes(q) &&
          !user.jobLevel.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filterLevel && user.jobLevel !== filterLevel) return false;

      if (filterShift) {
        const hasShift = allDates.some((date) => {
          const sh = user.roster?.[date]?.shiftDisplay;
          return sh && getShiftLetter(sh) === filterShift;
        });
        if (!hasShift) return false;
      }

      return true;
    });
  }, [users, searchQuery, filterShift, filterLevel, allDates]);

  /*  daily active-staff count per date */
  const dailyCoverage = useMemo(() => {
    return allDates.map((date) => {
      let active = 0;
      filteredUsers.forEach((user) => {
        const letter = getShiftLetter(user.roster?.[date]?.shiftDisplay);
        if (letter !== "W" && letter !== "L") active++;
      });
      return active;
    });
  }, [filteredUsers, allDates]);

  /*  unique sorted job levels for dropdown */
  const jobLevels = useMemo(
    () => Array.from(new Set(users.map((u) => u.jobLevel))).sort(),
    [users],
  );

  /* ── Original guard returns ──  */
  if (shouldSkip) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <img src={FilterSvg} alt="Select Filter" width={650} />
      </Box>
    );
  }

  if (isError || data?.success === false) {
    return (
      <Alert severity="error">Roster not generated for selected range</Alert>
    );
  }

  if (!users.length) {
    return (
      <Alert severity="info">No roster available for selected range</Alert>
    );
  }

  /* ── Post-guard derived values ── */
  const todayStr = dayjs().format("YYYY-MM-DD");
  const hasActiveFilters = Boolean(searchQuery || filterShift || filterLevel);

  const getCoverageColor = (count: number): string => {
    const pct = filteredUsers.length > 0 ? count / filteredUsers.length : 0;
    if (pct > 0.7) return theme.palette.success.main;
    if (pct > 0.4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  /* ===== RENDER ===== */
  return (
    <Box>
      {/* ===== HEADER CARD ===== */}

      {/*  toolbar */}
      <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by ID or level..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 200,
            "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Detailed View Toggle */}
        <Tooltip title={detailedView ? "Compact view" : "Detailed view"}>
          <IconButton
            size="small"
            onClick={() => setDetailedView((p) => !p)}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              background: detailedView
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Filter panel toggle */}
        <Tooltip title="Toggle filters">
          <IconButton
            size="small"
            onClick={() => setShowFilters((p) => !p)}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              background: showFilters
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Highlight shift */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <HighlightIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Select
            size="small"
            displayEmpty
            value={highlightShift}
            onChange={(e) => setHighlightShift(e.target.value)}
            sx={{ fontSize: 12, borderRadius: 2, minWidth: 140 }}
          >
            <MenuItem value="">
              <em>No highlight</em>
            </MenuItem>
            <MenuItem value="N">Highlight Night</MenuItem>
            <MenuItem value="A">Highlight Afternoon</MenuItem>
            <MenuItem value="M">Highlight Morning</MenuItem>
            <MenuItem value="L">Highlight Leave</MenuItem>
            <MenuItem value="B">Highlight Break</MenuItem>
            <MenuItem value="W">Highlight WO</MenuItem>
          </Select>
        </Box>

        <CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />

        {/* Legend */}
        <Box display="flex" gap={0.5} flexWrap="wrap" ml="auto">
          {[
            { letter: "N", label: "Night", base: "#1a237e" },
            { letter: "A", label: "Aft", base: "#fbc02d" },
            { letter: "M", label: "Morn", base: "#1976d2" },
            { letter: "L", label: "Leave", base: "#e53935" },
            { letter: "B", label: "Break", base: "#ef6c00" },
            { letter: "W", label: "WO", base: "#9e9e9e" },
          ].map(({ letter, label, base }) => (
            <Chip
              key={letter}
              label={`${letter} · ${label}`}
              size="small"
              sx={{
                fontSize: 10,
                height: 20,
                background: alpha(base, 0.15),
                color: base,
                fontWeight: 600,
              }}
            />
          ))}
        </Box>

        {/*  */}
      </Box>

      {/*  collapsible filter bar */}
      <Collapse in={showFilters}>
        <Box
          display="flex"
          gap={1}
          mb={1.5}
          p={1.5}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            background: theme.palette.background.default,
          }}
        >
          <Select
            size="small"
            displayEmpty
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            sx={{ fontSize: 12, borderRadius: 2, minWidth: 140 }}
          >
            <MenuItem value="">
              <em>All shift types</em>
            </MenuItem>
            <MenuItem value="N">Night (N)</MenuItem>
            <MenuItem value="A">Afternoon (A)</MenuItem>
            <MenuItem value="M">Morning (M)</MenuItem>
            <MenuItem value="L">Leave (L)</MenuItem>
            <MenuItem value="B">Break (B)</MenuItem>
            <MenuItem value="W">WO (W)</MenuItem>
          </Select>

          <Select
            size="small"
            displayEmpty
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            sx={{ fontSize: 12, borderRadius: 2, minWidth: 130 }}
          >
            <MenuItem value="">
              <em>All job levels</em>
            </MenuItem>
            {jobLevels.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {lvl}
              </MenuItem>
            ))}
          </Select>

          {hasActiveFilters && (
            <Chip
              label="Clear filters"
              size="small"
              onDelete={() => {
                setFilterShift("");
                setFilterLevel("");
                setSearchQuery("");
              }}
              sx={{ alignSelf: "center" }}
            />
          )}
        </Box>
      </Collapse>

      {/* ===== TABLE ===== */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          position: "relative",
        }}
      >
        {/*  loading overlay — reads original isLoading, no logic change */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: alpha(theme.palette.background.paper, 0.7),
              zIndex: 50,
              borderRadius: 3,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        <SmartScrollContainer height={420} enableHorizontal>
          <Table
            size="small"
            sx={{
              tableLayout: detailedView ? "auto" : "fixed",
              width: detailedView ? "max-content" : "100%",
              minWidth: detailedView ? 1400 : "100%",
            }}
          >
            {/* ===== HEADER ===== */}
            <TableHead>
              <TableRow>
                {/*  sticky employee header */}
                <TableCell
                  sx={{
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200,
                    position: "sticky",
                    left: 0,
                    zIndex: 30,
                    background: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  Employee
                </TableCell>

                {allDates.map((date) => {
                  const isToday = date === todayStr;
                  const isWeekend = [0, 6].includes(dayjs(date).day());

                  return (
                    <TableCell
                      key={date}
                      align="center"
                      sx={{
                        minWidth: detailedView ? 150 : undefined,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        /*  today gets primary tint, weekend gets subtle grey.
                           Single borderBottom key — fixes duplicate-property lint error. */
                        background: isToday
                          ? alpha(theme.palette.primary.main, 0.1)
                          : isWeekend
                            ? alpha(theme.palette.action.hover, 0.5)
                            : theme.palette.background.paper,
                        borderBottom: isToday
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography
                        fontSize={11}
                        fontWeight={600}
                        color={isToday ? "primary" : "text.primary"}
                      >
                        {dayjs(date).format("DD")}
                      </Typography>
                      <Typography fontSize={9} color="text.secondary">
                        {dayjs(date).format("ddd")}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* ===== BODY ===== */}
            <TableBody>
              {/*  empty state when all employees are filtered out */}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={allDates.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary" fontSize={13}>
                      No employees match the current filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {filteredUsers.map((user) => (
                <TableRow key={user.userId} hover>
                  {/*  sticky employee column */}
                  <TableCell
                    sx={{
                      width: 200,
                      minWidth: 200,
                      maxWidth: 200,
                      position: "sticky",
                      left: 0,
                      zIndex: 30,
                      background: theme.palette.background.paper,
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography fontWeight={600} fontSize={13}>
                      {user.olmid}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                      <Typography fontSize={11} color="text.secondary">
                        {user.jobLevel}
                      </Typography>
                      {/*  office location pill (renders only when field is set) */}
                      {user.officeLocation && (
                        <Typography
                          fontSize={9}
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            background: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                          }}
                        >
                          {user.officeLocation}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {allDates.map((date) => {
                    const shift = user.roster?.[date];
                    const isToday = date === todayStr;
                    const isWeekend = [0, 6].includes(dayjs(date).day());

                    const originalColor = getShiftColor(
                      shift?.shiftDisplay,
                      mode,
                    );

                    const color = originalColor;

                    const letter = getShiftLetter(shift?.shiftDisplay);
                    const isDimmed =
                      highlightShift !== "" && letter !== highlightShift;

                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          minWidth: detailedView ? 150 : undefined,
                          background: isToday
                            ? alpha(theme.palette.primary.main, 0.04)
                            : isWeekend
                              ? alpha(theme.palette.action.hover, 0.3)
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
                                Shift: {shift?.shiftDisplay ?? "WO"}
                              </Typography>
                              {shift?.workMode && (
                                <Typography fontSize={11}>
                                  Mode: {shift.workMode}
                                </Typography>
                              )}
                              {shift?.availableMins !== undefined && (
                                <Typography fontSize={11}>
                                  6 Available:{" "}
                                  {Math.round(shift.availableMins / 60)}h
                                </Typography>
                              )}
                            </Box>
                          }
                        >
                          {/*  ORIGINAL badge Box — sx additions only */}
                          <Box
                            onClick={() =>
                              setSelectedShiftModal({ user, date, shift })
                            }
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: color.bg,
                              color: color.color,
                              borderRadius: 1,
                              px: 1,
                              fontWeight: 600,
                              fontSize: detailedView ? 12 : 11,
                              minHeight: detailedView ? 36 : 24,
                              /*  fade non-highlighted shifts */
                              opacity: isDimmed ? 0.15 : 1,
                              transition: "opacity 0.15s, transform 0.15s",
                              cursor: "pointer",
                              "&:hover": {
                                opacity: isDimmed ? 0.25 : 0.9,
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            {/*  ORIGINAL display logic — untouched */}
                            {detailedView
                              ? (shift?.shiftDisplay ?? "WO")
                              : getShiftLetter(shift?.shiftDisplay)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/*  sticky daily active-staff summary row */}
              {filteredUsers.length > 0 && (
                <TableRow
                  sx={{
                    background: theme.palette.action.hover,
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                  }}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      background: theme.palette.action.hover,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      zIndex: 10,
                    }}
                  >
                    <Typography
                      fontSize={11}
                      fontWeight={600}
                      color="text.secondary"
                    >
                      Active staff / day
                    </Typography>
                  </TableCell>

                  {dailyCoverage.map((count, i) => (
                    <TableCell key={i} align="center" sx={{ py: 0.5 }}>
                      <Typography
                        fontSize={10}
                        fontWeight={600}
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

      {/* ===== DETAILED SHIFT MODAL ===== */}
      <Dialog
        open={Boolean(selectedShiftModal)}
        onClose={() => setSelectedShiftModal(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: alpha(theme.palette.primary.main, 0.08),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selectedShiftModal?.shift
                ? getShiftColor(
                    selectedShiftModal.shift.shiftDisplay,
                    mode,
                  ).bg
                : "#f5f5f5",
              color: selectedShiftModal?.shift
                ? getShiftColor(selectedShiftModal.shift.shiftDisplay, mode)
                    .color
                : "#666",
              borderRadius: 1,
              width: 36,
              height: 36,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {selectedShiftModal?.shift
              ? getShiftLetter(selectedShiftModal.shift.shiftDisplay)
              : "W"}
          </Box>
          <Typography variant="h6">
            Shift Details - {selectedShiftModal?.user.olmid}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedShiftModal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Employee Info */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
                >
                  Employee Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>OLMID:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {selectedShiftModal.user.olmid}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>Job Level:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {selectedShiftModal.user.jobLevel}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>Office Location:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {selectedShiftModal.user.officeLocation || "N/A"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={13}>Mobile:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {selectedShiftModal.user.mobileNo || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Date Info */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
                >
                  Date & Time
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>Date:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {dayjs(selectedShiftModal.date).format("DD MMM YYYY")}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={13}>Day:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {dayjs(selectedShiftModal.date).format("dddd")}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Shift Info */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
                >
                  Shift Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={13}>Shift:</Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      {selectedShiftModal.shift?.shiftDisplay ?? "WO"}
                    </Typography>
                  </Box>
                  {selectedShiftModal.shift?.workMode && (
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography fontSize={13}>Work Mode:</Typography>
                      <Chip
                        label={selectedShiftModal.shift.workMode}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                  {selectedShiftModal.shift?.availableMins !== undefined && (
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography fontSize={13}>Available Hours:</Typography>
                      <Typography fontSize={13} fontWeight={600}>
                        {Math.round(
                          selectedShiftModal.shift.availableMins / 60,
                        )}{" "}
                        hrs
                      </Typography>
                    </Box>
                  )}
                  {selectedShiftModal.shift?.assignActCount !== undefined && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontSize={13}>
                        Assignment Count:
                      </Typography>
                      <Typography fontSize={13} fontWeight={600}>
                        {selectedShiftModal.shift.assignActCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button
            onClick={() => setSelectedShiftModal(null)}
            variant="contained"
            disableElevation
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
