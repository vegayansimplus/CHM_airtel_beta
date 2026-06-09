import {
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Switch,
  useTheme,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import HighlightIcon from "@mui/icons-material/Highlight";
import { CompactShiftCountBar } from "./RosterShiftCountBar";
import { useState, type KeyboardEvent } from "react";

/* ─── Shift palette (mirrors MonthlyRosterMain PALETTE) ──────────────── */
const SHIFT_FILTER_PALETTE: Record<
  string,
  { label: string; badge: string; bg: string; border: string; text: string }
> = {
  G: {
    label: "General",
    badge: "#3B82F6",
    bg: "#EEF5FF",
    border: "#C3D9FE",
    text: "#1E40AF",
  },
  LG: {
    label: "LG Shift",
    badge: "#10B981",
    bg: "#EDFBF3",
    border: "#9DECBF",
    text: "#065F46",
  },
  B: {
    label: "B Shift",
    badge: "#F59E0B",
    bg: "#FFF8EE",
    border: "#FCD97D",
    text: "#854D0E",
  },
  N: {
    label: "Night",
    badge: "#6366F1",
    bg: "#F1F0FF",
    border: "#C0B8FD",
    text: "#3730A3",
  },
  A: {
    label: "Afternoon",
    badge: "#FBBF24",
    bg: "#FFFCEE",
    border: "#FCE98D",
    text: "#78350F",
  },
  L: {
    label: "Leave",
    badge: "#EC4899",
    bg: "#FEF0FA",
    border: "#F9C4E8",
    text: "#9D174D",
  },
  H: {
    label: "Holiday",
    badge: "#F43F5E",
    bg: "#FFF0F2",
    border: "#FECDD3",
    text: "#881337",
  },
  C: {
    label: "Comp Off",
    badge: "#94A3B8",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#475569",
  },
  NJ: {
    label: "New Joinee",
    badge: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#78350F",
  },
  W: {
    label: "Week Off",
    badge: "#D1D5DB",
    bg: "#FAFAFA",
    border: "#E4E7EC",
    text: "#98A2B3",
  },
};

/* ─── Props ───────────────────────────────────────────────────────────── */
interface Props {
  startDate: string;
  endDate: string;
  domainId?: number;
  subDomainId?: number;
  isSwapMode: boolean;
  onToggleSwapMode: () => void;
  selectedSwapCount: number;
  onApplySwap: () => void;
  isSwapping: boolean;
  searchTerms: string[];
  onSearchChange: (terms: string[]) => void;
  isDetailed: boolean;
  onToggleDetailed: () => void;
  // Filter / highlight props
  filterShift: string[];
  onFilterShiftChange: (v: string[]) => void;
  filterLevel: string[];
  onFilterLevelChange: (v: string[]) => void;
  jobLevels: string[];
  highlightShift: string;
  onHighlightShiftChange: (v: string) => void;
}

/* ─── Component ───────────────────────────────────────────────────────── */
export const RosterToolbar = ({
  startDate,
  endDate,
  domainId,
  subDomainId,
  isSwapMode,
  onToggleSwapMode,
  selectedSwapCount,
  onApplySwap,
  isSwapping,
  searchTerms,
  onSearchChange,
  isDetailed,
  onToggleDetailed,
  filterShift,
  onFilterShiftChange,
  filterLevel,
  onFilterLevelChange,
  jobLevels,
  highlightShift,
  onHighlightShiftChange,
}: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const bgColor = isDark ? theme.palette.background.paper : "#F3F4F6";
  const CELL_BORDER = isDark ? "rgba(255,255,255,.06)" : "#F0F0F2";

  const [inputVal, setInputVal] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* ── Multi-search helpers ─────────────────────────────────────────── */
  const commitInput = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !searchTerms.includes(s));
    if (parts.length > 0) onSearchChange([...searchTerms, ...parts]);
    setInputVal("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitInput(inputVal);
    }
    if (e.key === "Backspace" && inputVal === "" && searchTerms.length > 0)
      onSearchChange(searchTerms.slice(0, -1));
  };

  const removeChip = (term: string) =>
    onSearchChange(searchTerms.filter((t) => t !== term));

  const clearAll = () => {
    onSearchChange([]);
    setInputVal("");
  };

  const hasSearch = searchTerms.length > 0 || inputVal.trim().length > 0;
  const hasActiveFilters = Boolean(
    searchTerms.length || filterShift.length || filterLevel.length,
  );

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <Box sx={{ mb: 0.5 }}>
      {/* ══════════ MAIN TOOLBAR ROW ══════════ */}
      <Paper
        elevation={0}
        sx={{
          p: 0.75,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.75,
        }}
      >
        {/* LEFT: today's shift count */}
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          bgcolor={bgColor}
          borderRadius={6}
          px={1.75}
          py={0.75}
          border={`0.5px solid ${theme.palette.divider}`}
        >
          <Box
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Typography
              sx={{
                fontSize: "0.525rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              Today's shift count :
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CompactShiftCountBar
                domainId={domainId}
                subDomainId={subDomainId}
              />
            </Stack>
          </Box>

                    {/* ── Multi-search input ─────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px",
              minWidth: 220,
              maxWidth: 380,
              minHeight: 36,
              px: "10px",
              py: "4px",
              borderRadius: "20px",
              border: `1px solid ${hasSearch ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: bgColor,
              cursor: "text",
              transition: "border-color .15s",
            }}
            onClick={() =>
              document.getElementById("roster-search-input")?.focus()
            }
          >
            <SearchIcon
              sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
            />

            {searchTerms.map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                onDelete={() => removeChip(term)}
                deleteIcon={<CloseIcon style={{ fontSize: 11 }} />}
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: isDark ? "primary.dark" : "#EEF5FF",
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: isDark ? "primary.main" : "#C3D9FE",
                  "& .MuiChip-deleteIcon": {
                    color: "primary.main",
                    "&:hover": { color: "error.main" },
                  },
                }}
              />
            ))}

            <Box
              id="roster-search-input"
              component="input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputVal.trim()) commitInput(inputVal);
              }}
              placeholder={
                searchTerms.length === 0 ? "Search employee…" : "Add more…"
              }
              sx={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.75rem",
                color: "text.primary",
                flex: 1,
                minWidth: 90,
                fontFamily: "inherit",
              }}
            />

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
                <CloseIcon sx={{ fontSize: 14 }} />
              </Box>
            )}
          </Box>

          {/* Search hint */}
          {hasSearch && (
            <Typography
              sx={{ fontSize: "0.6rem", color: "text.disabled", mt: 0.25 }}
            >
              {searchTerms.length} filter{searchTerms.length !== 1 ? "s" : ""}{" "}
              active · Press Enter or comma to add
            </Typography>
          )}

          {/* ── Highlight picker ───────────────────────────────────── */}
          <Stack direction="row" alignItems="center" gap={0.5}>
            <HighlightIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Select
              size="small"
              displayEmpty
              value={highlightShift}
              onChange={(e) => onHighlightShiftChange(e.target.value)}
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
              {Object.entries(SHIFT_FILTER_PALETTE)
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

          {/* ── Filters toggle button ──────────────────────────────── */}
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

          {/* Clear all chip */}
          {hasActiveFilters && (
            <Chip
              label="Clear all"
              size="small"
              onDelete={() => {
                onFilterShiftChange([]);
                onFilterLevelChange([]);
                onSearchChange([]);
                setInputVal("");
              }}
              sx={{ height: 22, fontSize: 10 }}
            />
          )}
        </Stack>

        {/* RIGHT: controls */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flexWrap="wrap"
        >
          {/* Detailed toggle */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            bgcolor={bgColor}
            borderRadius={6}
            px={1.5}
            py={0.5}
            border={`0.5px solid ${theme.palette.divider}`}
          >
            <Switch
              checked={isDetailed}
              onChange={onToggleDetailed}
              size="small"
              color="primary"
              sx={{
                "& .MuiSwitch-thumb": { width: 14, height: 14 },
                "& .MuiSwitch-track": { borderRadius: 8 },
              }}
            />
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: isDetailed ? "primary.main" : "text.secondary",
                userSelect: "none",
              }}
            >
              Detailed
            </Typography>
          </Stack>

          {/* Swap buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant={isSwapMode ? "contained" : "outlined"}
              color={isSwapMode ? "error" : "primary"}
              startIcon={<SwapHorizIcon />}
              onClick={onToggleSwapMode}
              size="small"
            >
              {isSwapMode ? "Cancel Swap" : "Shift Swap"}
            </Button>
            {isSwapMode && (
              <Button
                variant="contained"
                color="success"
                size="small"
                disabled={selectedSwapCount !== 2 || isSwapping}
                onClick={onApplySwap}
                startIcon={
                  isSwapping ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                Apply Swap ({selectedSwapCount}/2)
              </Button>
            )}
          </Stack>


        </Stack>
       
      </Paper>

      {/* ══════════ COLLAPSIBLE FILTER PANEL ══════════ */}
      <Collapse in={showFilters}>
        <Box
          display="flex"
          gap={1}
          mt={0.5}
          p={1.5}
          sx={{
            border: `1px solid ${CELL_BORDER}`,
            borderRadius: "8px",
            bgcolor: isDark ? theme.palette.background.paper : "#FAFAFA",
          }}
        >
          {/* Shift type multi-select */}
          <Select
            size="small"
            displayEmpty
            multiple
            value={filterShift}
            onChange={(e) => onFilterShiftChange(e.target.value as string[])}
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
                    .map((k) => SHIFT_FILTER_PALETTE[k]?.label ?? k)
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
            {Object.entries(SHIFT_FILTER_PALETTE)
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

          {/* Job level multi-select */}
          <Select
            size="small"
            displayEmpty
            multiple
            value={filterLevel}
            onChange={(e) => onFilterLevelChange(e.target.value as string[])}
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

          {/* Active filter chip previews */}
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
                  label={SHIFT_FILTER_PALETTE[k]?.label ?? k}
                  onDelete={() =>
                    onFilterShiftChange(filterShift.filter((x) => x !== k))
                  }
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: isDark
                      ? alpha(SHIFT_FILTER_PALETTE[k]?.badge ?? "#000", 0.15)
                      : SHIFT_FILTER_PALETTE[k]?.bg,
                    color: SHIFT_FILTER_PALETTE[k]?.text,
                    border: `1px solid ${SHIFT_FILTER_PALETTE[k]?.border}`,
                  }}
                />
              ))}
              {filterLevel.map((lvl) => (
                <Chip
                  key={lvl}
                  size="small"
                  label={lvl}
                  onDelete={() =>
                    onFilterLevelChange(filterLevel.filter((x) => x !== lvl))
                  }
                  sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600 }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// import {
//   Paper,
//   Stack,
//   Typography,
//   Button,
//   CircularProgress,
//   Switch,
//   useTheme,
//   Box,
//   Chip,
// } from "@mui/material";
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// import SearchIcon from "@mui/icons-material/Search";
// import CloseIcon from "@mui/icons-material/Close";
// import { CompactShiftCountBar } from "./RosterShiftCountBar";
// import { useState, type KeyboardEvent } from "react";

// interface Props {
//   startDate: string;
//   endDate: string;
//   domainId?: number;
//   subDomainId?: number;
//   isSwapMode: boolean;
//   onToggleSwapMode: () => void;
//   selectedSwapCount: number;
//   onApplySwap: () => void;
//   isSwapping: boolean;
//   // Multi-search: parent receives string[]
//   searchTerms: string[];
//   onSearchChange: (terms: string[]) => void;
//   isDetailed: boolean;
//   onToggleDetailed: () => void;
// }

// export const RosterToolbar = ({
//   startDate,
//   endDate,
//   domainId,
//   subDomainId,
//   isSwapMode,
//   onToggleSwapMode,
//   selectedSwapCount,
//   onApplySwap,
//   isSwapping,
//   searchTerms,
//   onSearchChange,
//   isDetailed,
//   onToggleDetailed,
// }: Props) => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";
//   const bgColor = isDark ? theme.palette.background.paper : "#F3F4F6";

//   const [inputVal, setInputVal] = useState("");

//   // Commit current input as chips (split by comma)
//   const commitInput = (raw: string) => {
//     const parts = raw
//       .split(",")
//       .map((s) => s.trim())
//       .filter((s) => s.length > 0 && !searchTerms.includes(s));
//     if (parts.length > 0) onSearchChange([...searchTerms, ...parts]);
//     setInputVal("");
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       commitInput(inputVal);
//     }
//     // Backspace on empty input removes last chip
//     if (e.key === "Backspace" && inputVal === "" && searchTerms.length > 0) {
//       onSearchChange(searchTerms.slice(0, -1));
//     }
//   };

//   const removeChip = (term: string) =>
//     onSearchChange(searchTerms.filter((t) => t !== term));

//   const clearAll = () => {
//     onSearchChange([]);
//     setInputVal("");
//   };

//   const hasSearch = searchTerms.length > 0 || inputVal.trim().length > 0;

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 0.75,
//         mb: 0.5,
//         borderRadius: 2,
//         border: `1px solid ${theme.palette.divider}`,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         flexWrap: "wrap",
//         gap: 0.75,
//       }}
//     >
//       {/* ── LEFT: today's shift count ────────────────────────────── */}
//       <Stack
//         direction="row"
//         alignItems="center"
//         gap={1.5}
//         bgcolor={bgColor}
//         borderRadius={6}
//         px={1.75}
//         py={0.75}
//         border={`0.5px solid ${theme.palette.divider}`}
//       >
//         <Box
//           sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
//         >
//           <Typography
//             sx={{
//               fontSize: "0.525rem",
//               fontWeight: 600,
//               letterSpacing: "0.06em",
//               textTransform: "uppercase",
//               color: "text.primary",
//               lineHeight: 1,
//             }}
//           >
//             Today's shift count :
//           </Typography>
//           <Stack direction="row" alignItems="center" spacing={1}>
//             <CompactShiftCountBar
//               domainId={domainId}
//               subDomainId={subDomainId}
//             />
//           </Stack>
//         </Box>
//       </Stack>

//       {/* ── RIGHT: controls ──────────────────────────────────────── */}
//       <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
//         {/* Detailed toggle */}
//         <Stack
//           direction="row"
//           alignItems="center"
//           spacing={0.5}
//           bgcolor={bgColor}
//           borderRadius={6}
//           px={1.5}
//           py={0.5}
//           border={`0.5px solid ${theme.palette.divider}`}
//         >
//           <Switch
//             checked={isDetailed}
//             onChange={onToggleDetailed}
//             size="small"
//             color="primary"
//             sx={{
//               "& .MuiSwitch-thumb": { width: 14, height: 14 },
//               "& .MuiSwitch-track": { borderRadius: 8 },
//             }}
//           />
//           <Typography
//             sx={{
//               fontSize: "0.8rem",
//               fontWeight: 500,
//               color: isDetailed ? "primary.main" : "text.secondary",
//               userSelect: "none",
//             }}
//           >
//             Detailed
//           </Typography>
//         </Stack>

//         {/* Swap buttons */}
//         <Stack direction="row" spacing={1}>
//           <Button
//             variant={isSwapMode ? "contained" : "outlined"}
//             color={isSwapMode ? "error" : "primary"}
//             startIcon={<SwapHorizIcon />}
//             onClick={onToggleSwapMode}
//             size="small"
//           >
//             {isSwapMode ? "Cancel Swap" : "Shift Swap"}
//           </Button>

//           {isSwapMode && (
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               disabled={selectedSwapCount !== 2 || isSwapping}
//               onClick={onApplySwap}
//               startIcon={
//                 isSwapping ? (
//                   <CircularProgress size={16} color="inherit" />
//                 ) : null
//               }
//             >
//               Apply Swap ({selectedSwapCount}/2)
//             </Button>
//           )}
//         </Stack>

//         {/* ── Multi-search input ─────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: "4px",
//             minWidth: 220,
//             maxWidth: 380,
//             minHeight: 36,
//             px: "10px",
//             py: "4px",
//             borderRadius: "20px",
//             border: `1px solid ${hasSearch ? theme.palette.primary.main : theme.palette.divider}`,
//             bgcolor: bgColor,
//             cursor: "text",
//             transition: "border-color .15s",
//           }}
//           onClick={() => {
//             const el = document.getElementById("roster-search-input");
//             el?.focus();
//           }}
//         >
//           {/* Search icon */}
//           <SearchIcon
//             sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
//           />

//           {/* Chips */}
//           {searchTerms.map((term) => (
//             <Chip
//               key={term}
//               label={term}
//               size="small"
//               onDelete={() => removeChip(term)}
//               deleteIcon={<CloseIcon style={{ fontSize: 11 }} />}
//               sx={{
//                 height: 20,
//                 fontSize: "0.65rem",
//                 fontWeight: 600,
//                 bgcolor: isDark ? "primary.dark" : "#EEF5FF",
//                 color: "primary.main",
//                 border: "1px solid",
//                 borderColor: isDark ? "primary.main" : "#C3D9FE",
//                 "& .MuiChip-deleteIcon": {
//                   color: "primary.main",
//                   "&:hover": { color: "error.main" },
//                 },
//               }}
//             />
//           ))}

//           {/* Text input */}
//           <Box
//             id="roster-search-input"
//             component="input"
//             value={inputVal}
//             onChange={(e) => setInputVal(e.target.value)}
//             onKeyDown={handleKeyDown}
//             onBlur={() => {
//               if (inputVal.trim()) commitInput(inputVal);
//             }}
//             placeholder={
//               searchTerms.length === 0 ? "Search employee…" : "Add more…"
//             }
//             sx={{
//               border: "none",
//               outline: "none",
//               background: "transparent",
//               fontSize: "0.75rem",
//               color: "text.primary",
//               flex: 1,
//               minWidth: 90,
//               fontFamily: "inherit",
//             }}
//           />

//           {/* Clear all */}
//           {hasSearch && (
//             <Box
//               onClick={(e) => {
//                 e.stopPropagation();
//                 clearAll();
//               }}
//               sx={{
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 color: "text.disabled",
//                 flexShrink: 0,
//                 "&:hover": { color: "error.main" },
//                 transition: "color .15s",
//               }}
//             >
//               <CloseIcon sx={{ fontSize: 14 }} />
//             </Box>
//           )}
//         </Box>

//         {/* Search hint */}
//         {hasSearch && (
//           <Typography
//             sx={{ fontSize: "0.6rem", color: "text.disabled", mt: 0.25 }}
//           >
//             {searchTerms.length} filter{searchTerms.length !== 1 ? "s" : ""}{" "}
//             active · Press Enter or comma to add
//           </Typography>
//         )}
//       </Stack>
//     </Paper>
//   );
// };

// import {
//   Paper,
//   Stack,
//   // IconButton,
//   Typography,
//   Button,
//   CircularProgress,
//   Switch,
//   useTheme,
//   TextField,
//   InputAdornment,
//   Box,
// } from "@mui/material";
// // import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
// // import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// // import dayjs from "dayjs";
// import { CompactShiftCountBar } from "./RosterShiftCountBar";
// import SearchIcon from "@mui/icons-material/Search";

// interface Props {
//   startDate: string;
//   endDate: string;
//   // goPrevWeek: () => void;
//   // goNextWeek: () => void;
//   domainId?: number;
//   subDomainId?: number;
//   isSwapMode: boolean;
//   onToggleSwapMode: () => void;
//   selectedSwapCount: number;
//   onApplySwap: () => void;
//   isSwapping: boolean;
//   onSearchChange: (value: string) => void;
//   searchTerm: string;
//   // ── NEW ──
//   isDetailed: boolean;
//   onToggleDetailed: () => void;
// }

// export const RosterToolbar = ({
//   startDate,
//   endDate,
//   // goPrevWeek,
//   // goNextWeek,
//   domainId,
//   subDomainId,
//   isSwapMode,
//   onToggleSwapMode,
//   selectedSwapCount,
//   onApplySwap,
//   isSwapping,
//   onSearchChange,
//   searchTerm,
//   isDetailed,
//   onToggleDetailed,
// }: Props) => {
//   const theme = useTheme();
//   const bgColor =
//     theme.palette.mode === "dark" ? theme.palette.background.paper : "#F3F4F6";

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 0.5,
//         mb: 0.5,
//         borderRadius: 2,
//         border: `1px solid ${theme.palette.divider}`,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         flexWrap: "wrap",
//         gap: 0.5,
//       }}
//     >
//       {/* LEFT — shift count bar */}
//       <Stack
//         direction="row"
//         alignItems="center"
//         gap={1.5}
//         bgcolor={bgColor}
//         borderRadius={6}
//         px={1.75}
//         py={0.75}
//         border={`0.5px solid ${theme.palette.divider}`}
//       >
//         <Stack spacing={0.25}>
//           <Box
//             sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
//           >
//             <Typography
//               sx={{
//                 fontSize: "0.525rem",
//                 fontWeight: 600,
//                 letterSpacing: "0.06em",
//                 textTransform: "uppercase",
//                 color: "text.primary",
//                 lineHeight: 1,
//                 display: "flex",
//               }}
//             >
//               Today's shift count :
//             </Typography>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <CompactShiftCountBar
//                 domainId={domainId}
//                 subDomainId={subDomainId}
//               />
//             </Stack>
//           </Box>
//         </Stack>
//       </Stack>

//       {/* RIGHT — controls */}
//       <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
//         {/* ── NEW: Detailed toggle — matches Image 1 exactly ── */}
//         <Stack
//           direction="row"
//           alignItems="center"
//           spacing={0.5}
//           bgcolor={bgColor}
//           borderRadius={6}
//           px={1.5}
//           py={0.5}
//           border={`0.5px solid ${theme.palette.divider}`}
//         >
//           <Switch
//             checked={isDetailed}
//             onChange={onToggleDetailed}
//             size="small"
//             color="primary"
//             sx={{
//               "& .MuiSwitch-thumb": { width: 14, height: 14 },
//               "& .MuiSwitch-track": { borderRadius: 8 },
//             }}
//           />
//           <Typography
//             sx={{
//               fontSize: "0.8rem",
//               fontWeight: 500,
//               color: isDetailed ? "primary.main" : "text.secondary",
//               userSelect: "none",
//             }}
//           >
//             Detailed
//           </Typography>
//         </Stack>

//         {/* Swap buttons */}
//         <Stack direction="row" spacing={1}>
//           <Button
//             variant={isSwapMode ? "contained" : "outlined"}
//             color={isSwapMode ? "error" : "primary"}
//             startIcon={<SwapHorizIcon />}
//             onClick={onToggleSwapMode}
//             size="small"
//           >
//             {isSwapMode ? "Cancel Swap" : "Shift Swap"}
//           </Button>

//           {isSwapMode && (
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               disabled={selectedSwapCount !== 2 || isSwapping}
//               onClick={onApplySwap}
//               startIcon={
//                 isSwapping ? (
//                   <CircularProgress size={16} color="inherit" />
//                 ) : null
//               }
//             >
//               Apply Swap ({selectedSwapCount}/2)
//             </Button>
//           )}
//         </Stack>

//         {/* Week navigator */}
//         {/* <Stack
//           direction="row"
//           alignItems="center"
//           bgcolor={bgColor}
//           borderRadius={6}
//         >
//           <IconButton size="small" onClick={goPrevWeek}>
//             <NavigateBeforeIcon fontSize="small" />
//           </IconButton>
//           <Typography sx={{ mx: 2, fontSize: "0.875rem", fontWeight: 500 }}>
//             {dayjs(startDate).format("DD MMM")} – {dayjs(endDate).format("DD MMM")}
//           </Typography>
//           <IconButton size="small" onClick={goNextWeek}>
//             <NavigateNextIcon fontSize="small" />
//           </IconButton>
//         </Stack> */}

//         {/* Search */}
//         <TextField
//           size="small"
//           placeholder="Search Employee..."
//           value={searchTerm}
//           onChange={(e) => onSearchChange(e.target.value)}
//           sx={{
//             width: 220,
//             "& .MuiOutlinedInput-root": {
//               borderRadius: 6,
//               backgroundColor: bgColor,
//               height: 36,
//             },
//           }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon fontSize="small" />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Stack>
//     </Paper>
//   );
// };

// import {
//   Paper,
//   Stack,
//   IconButton,
//   Typography,
//   Button,
//   CircularProgress,
//   useTheme,
//   TextField,
//   InputAdornment,
//   Box,
// } from "@mui/material";
// import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
// import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// import dayjs from "dayjs";
// import { CompactShiftCountBar } from "./RosterShiftCountBar";
// import SearchIcon from "@mui/icons-material/Search";
// interface Props {
//   startDate: string;
//   endDate: string;
//   goPrevWeek: () => void;
//   goNextWeek: () => void;
//   domainId?: number;
//   subDomainId?: number;
//   isSwapMode: boolean;
//   onToggleSwapMode: () => void;
//   selectedSwapCount: number;
//   onApplySwap: () => void;
//   isSwapping: boolean;
//   onSearchChange: (value: string) => void;
//   searchTerm: string;
// }

// export const RosterToolbar = ({
//   startDate,
//   endDate,
//   goPrevWeek,
//   goNextWeek,
//   domainId,
//   subDomainId,
//   isSwapMode,
//   onToggleSwapMode,
//   selectedSwapCount,
//   onApplySwap,
//   isSwapping,
//   onSearchChange,
//   searchTerm,
// }: Props) => {
//   const theme = useTheme();
//   const bgColor =
//     theme.palette.mode === "dark" ? theme.palette.background.paper : "#F3F4F6";

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 0.5,
//         mb: 0.5,
//         borderRadius: 2,
//         border: `1px solid ${theme.palette.divider}`,
//         display: "flex",
//         justifyContent: "space-between",
//       }}
//     >
//       <Stack
//         direction="row"
//         alignItems="center"
//         gap={1.5}
//         bgcolor={bgColor}
//         borderRadius={6}
//         px={1.75}
//         py={0.75}
//         border={`0.5px solid ${theme.palette.divider}`}
//       >
//         <Stack spacing={0.25}>
//           <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

//             <Typography
//             sx={{
//               fontSize: "0.525rem", // 10px
//               fontWeight: 600,
//               letterSpacing: "0.06em",
//               textTransform: "uppercase",
//               color: "text.primary",
//               lineHeight: 1,
//               display: "flex",

//             }}
//           >
//             Today's shift count :
//           </Typography>

//           <Stack direction="row" alignItems="center" spacing={1}>
//             <CompactShiftCountBar
//               domainId={domainId}
//               subDomainId={subDomainId}
//             />
//           </Stack>
//           </Box>
//         </Stack>
//       </Stack>
//       {/* <Stack direction="row" bgcolor={bgColor} borderRadius={6}>
//         Tody's shift count<CompactShiftCountBar domainId={domainId} subDomainId={subDomainId} />
//       </Stack> */}

//       <Stack direction="row" alignItems="center" spacing={2}>
//         {/* --- SWAP ACTION BUTTONS --- */}
//         <Stack direction="row" spacing={1}>
//           <Button
//             variant={isSwapMode ? "contained" : "outlined"}
//             color={isSwapMode ? "error" : "primary"}
//             startIcon={<SwapHorizIcon />}
//             onClick={onToggleSwapMode}
//             size="small"
//           >
//             {isSwapMode ? "Cancel Swap" : "Shift Swap"}
//           </Button>

//           {isSwapMode && (
//             <Button
//               variant="contained"
//               color="success"
//               size="small"
//               disabled={selectedSwapCount !== 2 || isSwapping}
//               onClick={onApplySwap}
//               startIcon={
//                 isSwapping ? (
//                   <CircularProgress size={16} color="inherit" />
//                 ) : null
//               }
//             >
//               Apply Swap ({selectedSwapCount}/2)
//             </Button>
//           )}
//         </Stack>

//         <Stack
//           direction="row"
//           alignItems="center"
//           bgcolor={bgColor}
//           borderRadius={6}
//         >
//           <IconButton size="small" onClick={goPrevWeek}>
//             <NavigateBeforeIcon fontSize="small" />
//           </IconButton>

//           <Typography sx={{ mx: 2, fontSize: "0.875rem", fontWeight: 500 }}>
//             {dayjs(startDate).format("DD MMM")} -{" "}
//             {dayjs(endDate).format("DD MMM")}
//           </Typography>

//           <IconButton size="small" onClick={goNextWeek}>
//             <NavigateNextIcon fontSize="small" />
//           </IconButton>
//         </Stack>
//         <Stack>
//           <TextField
//             size="small"
//             placeholder="Search Employee..."
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             sx={{
//               width: 220,
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: 6,
//                 backgroundColor: bgColor,
//                 height: 36,
//               },
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon fontSize="small" />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Stack>
//       </Stack>
//     </Paper>
//   );
// };
