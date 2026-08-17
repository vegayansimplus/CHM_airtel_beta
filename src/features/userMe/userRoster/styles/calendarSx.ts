import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import type { CalendarTokens } from "../constants/calendarTokens";

/**
 * Full visual override for react-big-calendar's stock stylesheet.
 *
 * Everything here is scoped under the wrapper's generated class, so every
 * rule is one class more specific than the vendor CSS it replaces — no
 * `!important` anywhere, and nothing leaks to the rest of the app.
 *
 * Day-cell state colours are driven by `data-*` attributes stamped on
 * `.rbc-day-bg` by `DayBackgroundCell`, rather than inline styles, so the
 * hover layer can sit *on top of* a today/selected/holiday fill instead of
 * being overridden by it.
 */
export const buildCalendarSx = (
  t: CalendarTokens,
  theme: Theme,
): SxProps<Theme> => ({
  // No sizing at this level on purpose — the host Box owns the height, and
  // a `height: 100%` here would win the merge and flatten it.
  // The host is a flex column, so the calendar takes the remainder via
  // `flex` rather than the vendor's `height: 100%`. A percentage height
  // against a flex-sized parent is exactly the ambiguity that produces a
  // zero-height or overflowing grid depending on the browser.
  "& .rbc-calendar": {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    fontFamily: "inherit",
    color: t.text,
  },

  /* ── Frame ─────────────────────────────────────────────────────────── */
  "& .rbc-month-view, & .rbc-time-view": {
    border: `1px solid ${t.grid}`,
    borderRadius: `${t.radius}px`,
    background: t.surface,
    overflow: "hidden",
    minHeight: 0,
  },

  /* ── Weekday header row ────────────────────────────────────────────── */
  "& .rbc-month-header": {
    background: t.surfaceHeader,
    borderBottom: `1px solid ${t.grid}`,
  },
  "& .rbc-header": {
    padding: "10px 8px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: t.textMuted,
    borderBottom: "none",
    minHeight: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .rbc-header + .rbc-header": { borderLeft: `1px solid ${t.grid}` },
  "& .rbc-header.rbc-today": { color: t.accent },
  "& .rbc-header .rbc-button-link": { cursor: "default", fontWeight: "inherit" },

  /* ── Month grid ────────────────────────────────────────────────────── */
  "& .rbc-month-row": {
    borderTop: `1px solid ${t.grid}`,
    minHeight: 78,
  },
  "& .rbc-month-row:first-of-type": { borderTop: "none" },

  "& .rbc-day-bg": {
    position: "relative",
    transition: "background-color .16s ease, box-shadow .16s ease",
  },
  "& .rbc-day-bg + .rbc-day-bg": { borderLeft: `1px solid ${t.grid}` },

  // Hover lives on a pseudo-element so it layers over the state fill below
  // rather than competing with it.
  "& .rbc-day-bg::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundColor: "transparent",
    transition: "background-color .16s ease",
    pointerEvents: "none",
  },
  "& .rbc-day-bg:hover::after": { backgroundColor: t.hoverBg },

  /* Day states — ordered weakest → strongest; later rules win ties. */
  '& .rbc-day-bg[data-weekend="1"]': { backgroundColor: t.weekendBg },
  '& .rbc-day-bg[data-state="offrange"]': { backgroundColor: t.offRangeBg },
  '& .rbc-day-bg[data-state="holiday"]': {
    backgroundColor: t.holidayBg,
    boxShadow: `inset 3px 0 0 ${alpha(t.holiday, 0.5)}`,
  },
  '& .rbc-day-bg[data-state="today"]': {
    backgroundColor: t.todayBg,
    boxShadow: `inset 0 2px 0 ${t.accent}`,
  },
  '& .rbc-day-bg[data-state="selected"]': {
    backgroundColor: t.selectedBg,
    boxShadow: `inset 0 0 0 2px ${t.accent}`,
  },

  /* Stock "today" fill in the time views (no dateCellWrapper there). */
  "& .rbc-time-view .rbc-today, & .rbc-time-view .rbc-day-slot.rbc-today": {
    backgroundColor: t.todayBg,
  },
  "& .rbc-off-range-bg": { backgroundColor: t.offRangeBg },
  "& .rbc-off-range": { color: t.offRangeText },

  /* Drag-to-select feedback. */
  "& .rbc-slot-selection, & .rbc-selected-cell": {
    backgroundColor: alpha(t.accent, 0.18),
    color: t.text,
  },

  /* ── Row content ───────────────────────────────────────────────────── */
  // The event/date layer normally covers the whole row and swallows the
  // hover intended for the day cell underneath, which is why cell hover
  // used to only work in the lower half of a cell. Making the layer
  // transparent to the pointer — and re-arming the pieces that are
  // genuinely interactive — gives every cell an even hover target.
  // Slot selection is coordinate-based in rbc, so it is unaffected.
  "& .rbc-month-view .rbc-row-content": { pointerEvents: "none" },
  "& .rbc-month-view .rbc-event, & .rbc-month-view .rbc-show-more": {
    pointerEvents: "auto",
  },

  "& .rbc-date-cell": {
    padding: 0,
    textAlign: "left",
    minWidth: 0,
  },
  "& .rbc-row-segment": { padding: "0 3px 3px" },

  /* ── Events ────────────────────────────────────────────────────────── */
  // Colours come from `eventPropGetter` (inline); only the things inline
  // styles cannot express live here.
  "& .rbc-event": {
    outline: "none",
    transition: "transform .14s ease, box-shadow .14s ease",
  },
  "& .rbc-event:hover": {
    transform: "translateY(-1px)",
    boxShadow: t.shadowCard,
    zIndex: 6,
  },
  "& .rbc-event:focus-visible": {
    outline: `2px solid ${t.accent}`,
    outlineOffset: 1,
  },
  "& .rbc-event.rbc-selected": { boxShadow: `0 0 0 2px ${t.accent}` },
  "& .rbc-event-label": { fontSize: 10, opacity: 0.85 },

  "& .rbc-show-more": {
    background: "transparent",
    color: t.accent,
    fontWeight: 700,
    fontSize: 10.5,
    padding: "1px 5px",
    letterSpacing: "0.01em",
  },
  "& .rbc-show-more:hover, & .rbc-show-more:focus": {
    color: t.accent,
    textDecoration: "underline",
    background: "transparent",
  },

  /* ── "+ n more" popup ──────────────────────────────────────────────── */
  "& .rbc-overlay": {
    background: t.surfaceRaised,
    border: `1px solid ${t.grid}`,
    borderRadius: `${t.radius}px`,
    boxShadow: t.shadowPop,
    padding: 10,
    minWidth: 200,
  },
  "& .rbc-overlay-header": {
    background: t.surfaceHeader,
    borderBottom: `1px solid ${t.grid}`,
    borderRadius: `${t.radius}px ${t.radius}px 0 0`,
    margin: "-10px -10px 8px",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: t.text,
  },

  /* ── Week / Day (time) views ───────────────────────────────────────── */
  "& .rbc-time-header": { borderBottom: `1px solid ${t.grid}` },
  "& .rbc-time-header.rbc-overflowing": { borderRight: `1px solid ${t.grid}` },
  "& .rbc-time-header-content": { borderLeft: `1px solid ${t.grid}` },
  "& .rbc-time-header-cell .rbc-header": { borderBottom: `1px solid ${t.grid}` },
  "& .rbc-time-header-gutter": { background: t.surfaceHeader },
  "& .rbc-time-view .rbc-time-header-content > .rbc-row": {
    background: t.surfaceHeader,
  },
  "& .rbc-allday-cell": { maxHeight: 64 },
  "& .rbc-time-content": {
    borderTop: `2px solid ${t.grid}`,
    "&::-webkit-scrollbar": { width: 6, height: 6 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: t.isDark ? "#1E2D40" : "#CBD5E1",
      borderRadius: 6,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: t.isDark ? "#2A3E57" : "#94A3B8",
    },
  },
  "& .rbc-time-content > * + * > *": { borderLeft: `1px solid ${t.grid}` },
  "& .rbc-timeslot-group": {
    borderBottom: `1px solid ${t.grid}`,
    minHeight: 46,
  },
  "& .rbc-day-slot .rbc-time-slot": {
    borderTop: `1px dotted ${t.isDark ? "rgba(255,255,255,0.05)" : "rgba(13,27,42,0.05)"}`,
  },
  "& .rbc-time-gutter .rbc-timeslot-group": { borderBottom: "none" },
  "& .rbc-label": {
    fontSize: 10.5,
    fontWeight: 600,
    color: t.textMuted,
    padding: "0 8px",
  },
  "& .rbc-current-time-indicator": {
    backgroundColor: t.accent,
    height: 2,
  },
  "& .rbc-day-slot .rbc-event, & .rbc-day-slot .rbc-background-event": {
    border: "none",
  },
  "& .rbc-time-view .rbc-row": { minHeight: 0 },

  /* ── Drag & drop addon ─────────────────────────────────────────────── */
  "& .rbc-addons-dnd-dragged-event": { opacity: 0.45 },
  "& .rbc-addons-dnd .rbc-addons-dnd-resize-ns-anchor, & .rbc-addons-dnd .rbc-addons-dnd-resize-ew-anchor":
    { display: "none" },

  /* ── Responsive ────────────────────────────────────────────────────── */
  [theme.breakpoints.down("lg")]: {
    "& .rbc-month-row": { minHeight: 68 },
  },
  [theme.breakpoints.down("md")]: {
    "& .rbc-header": { fontSize: 10, padding: "8px 4px", letterSpacing: "0.05em" },
    "& .rbc-month-row": { minHeight: 60 },
    "& .rbc-timeslot-group": { minHeight: 40 },
  },
  [theme.breakpoints.down("sm")]: {
    "& .rbc-header": { fontSize: 9, padding: "7px 1px", letterSpacing: 0 },
    "& .rbc-month-row": { minHeight: 52 },
    "& .rbc-row-segment": { padding: "0 1px 1px" },
    "& .rbc-label": { fontSize: 9, padding: "0 4px" },
    "& .rbc-time-header-gutter, & .rbc-time-gutter": { minWidth: 44 },
  },
});
