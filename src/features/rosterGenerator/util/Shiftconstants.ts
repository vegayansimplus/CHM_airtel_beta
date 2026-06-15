// import type { ShiftCode } from "./futureWeek.types";

import type { ShiftCode } from "../types/Futureweek.types";

// ─── Day column helpers ───────────────────────────────────────────────────────

export const DOW_SHORT = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export const DOW_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Keys that come back from the API for a weekly row */
export const DAY_KEYS = [
  "W7D1",
  "W7D2",
  "W7D3",
  "W7D4",
  "W7D5",
  "W7D6",
  "W7D7",
] as const;

// ─── Shift display order ──────────────────────────────────────────────────────

export const SHIFT_DISPLAY_ORDER: ShiftCode[] = [
  "A",
  "B",
  "G",
  "LG",
  "N",
  "H",
  "WO",
  "OFF",
];

// ─── Mapping: raw API value → normalised ShiftCode ───────────────────────────

export const API_TO_SHIFT: Record<string, ShiftCode> = {
  A: "A",
  B: "B",
  G: "G",
  LG: "LG",
  N: "N",
  H: "H",
  WO: "WO",
  OFF: "OFF",
};

// ─── Shift colour tokens ──────────────────────────────────────────────────────

export interface ShiftTokens {
  label: string;
  solid: string;
  bgLight: string;
  bgDark: string;
  fgLight: string;
  fgDark: string;
  borderLight: string;
  borderDark: string;
}

export const SHIFT_COLORS: Record<ShiftCode, ShiftTokens> = {
  A: {
    label: "Alpha",
    solid: "#6B21A8",
    bgLight: "#F5F3FF",
    bgDark: "#F5F3FF",
    fgLight: "#6B21A8",
    fgDark: "#6B21A8",
    borderLight: "#C4B5FD",
    borderDark: "#C4B5FD",
  },

  B: {
    label: "Bravo",
    solid: "#155E75",
    bgLight: "#ECFEFF",
    bgDark: "#ECFEFF",
    fgLight: "#155E75",
    fgDark: "#155E75",
    borderLight: "#67E8F9",
    borderDark: "#67E8F9",
  },

  G: {
    label: "Golf",
    solid: "#1D4ED8",
    bgLight: "#EFF6FF",
    bgDark: "#EFF6FF",
    fgLight: "#1D4ED8",
    fgDark: "#1D4ED8",
    borderLight: "#93C5FD",
    borderDark: "#93C5FD",
  },

  LG: {
    label: "Lima Golf",
    solid: "#065F46",
    bgLight: "#ECFDF5",
    bgDark: "#ECFDF5",
    fgLight: "#065F46",
    fgDark: "#065F46",
    borderLight: "#6EE7B7",
    borderDark: "#6EE7B7",
  },

  N: {
    label: "Night",
    solid: "#3730A3",
    bgLight: "#EEF2FF",
    bgDark: "#EEF2FF",
    fgLight: "#3730A3",
    fgDark: "#3730A3",
    borderLight: "#818CF8",
    borderDark: "#818CF8",
  },

  H: {
    label: "Holiday",
    solid: "#C2410C",
    bgLight: "#FFF7ED",
    bgDark: "#FFF7ED",
    fgLight: "#C2410C",
    fgDark: "#C2410C",
    borderLight: "#FDBA74",
    borderDark: "#FDBA74",
  },

  WO: {
    label: "Week Off",
    solid: "#475569",
    bgLight: "#F8FAFC",
    bgDark: "#F8FAFC",
    fgLight: "#475569",
    fgDark: "#475569",
    borderLight: "#CBD5E1",
    borderDark: "#CBD5E1",
  },

  OFF: {
    label: "Off Day",
    solid: "#B91C1C",
    bgLight: "#FEF2F2",
    bgDark: "#FEF2F2",
    fgLight: "#B91C1C",
    fgDark: "#B91C1C",
    borderLight: "#FCA5A5",
    borderDark: "#FCA5A5",
  },
};
// ─── Level colour tokens ──────────────────────────────────────────────────────

export interface LevelTokens {
  bg: string;
  text: string;
  solid: string;
}

export const LEVEL_COLORS: Record<string, LevelTokens> = {
  L1: { bg: "#F0FDF4", text: "#166534", solid: "#22C55E" },
  L2: { bg: "#EFF6FF", text: "#1E40AF", solid: "#3B82F6" },
  L3: { bg: "#FFF7ED", text: "#9A3412", solid: "#F97316" },
  L4: { bg: "#FDF4FF", text: "#6B21A8", solid: "#A855F7" },
};

// ─── Monospace font stack ─────────────────────────────────────────────────────

export const MONO =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
