// ─── Types ─────────────────────────────────────────────────────────────────
export type ShiftCode = "A" | "B" | "G" | "LG" | "N" | "OFF";
export type SortField = "name" | "id" | "role" | "level" | "work" | "night" | "off" | "load";
export type SortDir = "asc" | "desc";

export interface Employee {
  id: string;
  name: string;
  role: string;
  level: "L1" | "L2" | "L3" | "L4";
}

export interface FilterState {
  query: string;
  levels: string[];
  roles: string[];
  shiftCodes: ShiftCode[];
  sortField: SortField;
  sortDir: SortDir;
  workRange: [number, number];
  nightRange: [number, number];
  showHighLoad: boolean;
  showLowRest: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────
export const MONO =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
export const TOTAL_COLS = 7;
export const DOW = ["M", "T", "W", "T", "F", "S", "S"] as const;
export const DOW_LONG = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
] as const;
export const TODAY = new Date();
export const SHIFT_ORDER: ShiftCode[] = ["A", "B", "G", "LG", "N", "OFF"];
export const ALL_LEVELS = ["L1", "L2", "L3", "L4"] as const;
export const ALL_ROLES = ["NOC Engineer", "Shift Lead", "Incident Owner", "Field Coordinator"];

export const API_SHIFT_MAP: Record<string, ShiftCode> = {
  A: "A", B: "B", G: "G", LG: "LG", N: "N", OFF: "OFF", WO: "OFF", H: "G",
};

// ─── Colour palettes ────────────────────────────────────────────────────────
export const SHIFT_COLORS: Record<
  ShiftCode,
  { bg: string; bgDark: string; text: string; textDark: string; solid: string; label: string }
> = {
  A:   { bg: "#FFF9E6", bgDark: "rgba(245,158,11,0.12)",  text: "#B25E00", textDark: "#FBBF24", solid: "#F59E0B", label: "Alpha"     },
  B:   { bg: "#EFF6FF", bgDark: "rgba(37,99,235,0.12)",   text: "#1E40AF", textDark: "#93C5FD", solid: "#3B82F6", label: "Bravo"     },
  G:   { bg: "#F8FAFC", bgDark: "rgba(100,116,139,0.12)", text: "#475569", textDark: "#E2E8F0", solid: "#64748B", label: "Golf"      },
  LG:  { bg: "#ECFDF5", bgDark: "rgba(16,185,129,0.12)",  text: "#065F46", textDark: "#34D399", solid: "#10B981", label: "Lima Golf" },
  N:   { bg: "#EEF2FF", bgDark: "rgba(79,70,229,0.12)",   text: "#3730A3", textDark: "#A5B4FC", solid: "#6366F1", label: "Night"     },
  OFF: { bg: "#FFF5F5", bgDark: "rgba(239,68,68,0.12)",   text: "#9B1C1C", textDark: "#FCA5A5", solid: "#EF4444", label: "Off Day"   },
};

export const LEVEL_COLORS: Record<string, { bg: string; text: string; solid: string }> = {
  L1: { bg: "#F0FDF4", text: "#166534", solid: "#22C55E" },
  L2: { bg: "#EFF6FF", text: "#1E40AF", solid: "#3B82F6" },
  L3: { bg: "#FFF7ED", text: "#9A3412", solid: "#F97316" },
  L4: { bg: "#FDF4FF", text: "#6B21A8", solid: "#A855F7" },
};

// ─── Demo employees (replace with API data) ─────────────────────────────────
export const EMPLOYEES: Employee[] = Array.from({ length: 28 }, (_, i) => ({
  id: `EMP${String(i + 1).padStart(3, "0")}`,
  name: [
    "Aarav Sharma","Isha Nair","Kabir Mehta","Tara Singh","Rohan Das",
    "Meera Iyer","Nikhil Rao","Anaya Khan","Dev Patel","Sara Thomas",
    "Arjun Bose","Diya Menon","Vihaan Jain","Kiara Roy","Yash Verma",
    "Naina Pillai","Reyansh Gupta","Aditi Sinha","Vivaan Reddy","Myra Kapoor",
    "Atharv Joshi","Saanvi Shah","Ishaan Batra","Avni Kulkarni","Dhruv Malhotra",
    "Riya Chatterjee","Neil George","Maya Krishnan",
  ][i],
  role: ALL_ROLES[i % 4],
  level: (["L1", "L2", "L3", "L4"] as const)[i % 4],
}));

export const BASE_PATTERN: ShiftCode[][] = [
  ["G","G","LG","B","N","OFF","OFF"],
  ["A","A","G","G","LG","OFF","N"],
  ["N","OFF","OFF","A","B","G","G"],
  ["LG","B","B","N","OFF","G","A"],
  ["OFF","G","A","A","B","LG","N"],
  ["B","LG","N","OFF","G","A","OFF"],
];

export function buildWeekGrid(emps: Employee[]): Record<string, ShiftCode[]> {
  const grid: Record<string, ShiftCode[]> = {};
  emps.forEach((e, ei) => {
    grid[e.id] = Array.from({ length: 7 }, (_, di) =>
      BASE_PATTERN[(ei + Math.floor(di / 7)) % BASE_PATTERN.length][di % 7]
    );
  });
  return grid;
}

// // ─── Types ─────────────────────────────────────────────────────────────────
// export type ShiftCode = "A" | "B" | "G" | "LG" | "N" | "OFF";
// export type SortField = "name" | "id" | "role" | "level" | "work" | "night" | "off" | "load";
// export type SortDir = "asc" | "desc";

// export interface Employee {
//   id: string;
//   name: string;
//   role: string;
//   level: "L1" | "L2" | "L3" | "L4";
// }

// export interface FilterState {
//   query: string;
//   levels: string[];
//   roles: string[];
//   shiftCodes: ShiftCode[];
//   sortField: SortField;
//   sortDir: SortDir;
//   workRange: [number, number];
//   nightRange: [number, number];
//   showHighLoad: boolean;
//   showLowRest: boolean;
// }

// export interface GridScreenProps {
//   subDomainId?: number;
// }

// // ─── Constants ──────────────────────────────────────────────────────────────
// export const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
// export const TOTAL_COLS = 7;
// export const DOW = ["M", "T", "W", "T", "F", "S", "S"] as const;
// export const DOW_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
// export const TODAY = new Date();
// export const SHIFT_ORDER: ShiftCode[] = ["A", "B", "G", "LG", "N", "OFF"];
// export const ALL_LEVELS = ["L1", "L2", "L3", "L4"] as const;

// export const API_SHIFT_MAP: Record<string, ShiftCode> = {
//   A: "A", B: "B", G: "G", LG: "LG", N: "N", OFF: "OFF", WO: "OFF", H: "G",
// };

// export const toShiftCode = (raw: string): ShiftCode =>
//   API_SHIFT_MAP[raw?.toUpperCase()] ?? "G";

// // ─── Colour palettes ────────────────────────────────────────────────────────
// export const SHIFT_COLORS: Record<ShiftCode, { bg: string; bgDark: string; text: string; textDark: string; solid: string; label: string }> = {
//   A:   { bg: "#FFF9E6", bgDark: "rgba(245,158,11,0.12)",  text: "#B25E00", textDark: "#FBBF24", solid: "#F59E0B", label: "Alpha"     },
//   B:   { bg: "#EFF6FF", bgDark: "rgba(37,99,235,0.12)",   text: "#1E40AF", textDark: "#93C5FD", solid: "#3B82F6", label: "Bravo"     },
//   G:   { bg: "#F8FAFC", bgDark: "rgba(100,116,139,0.12)", text: "#475569", textDark: "#E2E8F0", solid: "#64748B", label: "Golf"      },
//   LG:  { bg: "#ECFDF5", bgDark: "rgba(16,185,129,0.12)",  text: "#065F46", textDark: "#34D399", solid: "#10B981", label: "Lima Golf" },
//   N:   { bg: "#EEF2FF", bgDark: "rgba(79,70,229,0.12)",   text: "#3730A3", textDark: "#A5B4FC", solid: "#6366F1", label: "Night"     },
//   OFF: { bg: "#FFF5F5", bgDark: "rgba(239,68,68,0.12)",   text: "#9B1C1C", textDark: "#FCA5A5", solid: "#EF4444", label: "Off Day"   },
// };

// export const LEVEL_COLORS: Record<string, { bg: string; text: string; solid: string }> = {
//   L1: { bg: "#F0FDF4", text: "#166534", solid: "#22C55E" },
//   L2: { bg: "#EFF6FF", text: "#1E40AF", solid: "#3B82F6" },
//   L3: { bg: "#FFF7ED", text: "#9A3412", solid: "#F97316" },
//   L4: { bg: "#FDF4FF", text: "#6B21A8", solid: "#A855F7" },
// };