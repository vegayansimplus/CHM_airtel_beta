export interface ShiftColorTriple {
  background: string;
  color: string;
  border: string;
}

// Accessible tint/text/border triples — one hue family per shift/status code.
export const shiftColorMap = new Map<string, ShiftColorTriple>([
  ["Leave", { background: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" }],
  [
    "New Joinee",
    { background: "#FFFBEB", color: "#92400E", border: "#FCD34D" },
  ],
  ["N", { background: "#EEF2FF", color: "#3730A3", border: "#818CF8" }],
  ["A", { background: "#FEF9C3", color: "#854D0E", border: "#FDE047" }],
  ["B", { background: "#ECFEFF", color: "#155E75", border: "#67E8F9" }],
  ["G", { background: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" }],
  ["L", { background: "#ECFDF5", color: "#065F46", border: "#6EE7B7" }],
  ["W", { background: "#F8FAFC", color: "#475569", border: "#CBD5E1" }],
  ["H", { background: "#FFF7ED", color: "#C2410C", border: "#FDBA74" }],
  ["C", { background: "#F5F3FF", color: "#5B21B6", border: "#C4B5FD" }],
]);

const DEFAULT_SHIFT_COLORS: ShiftColorTriple = {
  background: "#F1F5F9",
  color: "#475569",
  border: "#CBD5E1",
};

// Resolve the color triple for a shift/event title (e.g. "N (WFO)" -> "N", "WO" -> "W")
export const getShiftColors = (title: string): ShiftColorTriple => {
  const baseShift = title.split("(")[0].trim();
  const shiftLookup = baseShift === "WO" ? "W" : baseShift;
  return shiftColorMap.get(shiftLookup) || DEFAULT_SHIFT_COLORS;
};
