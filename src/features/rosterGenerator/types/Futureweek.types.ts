export type ShiftCode = "A" | "B" | "G" | "LG" | "N" | "H" | "WO" | "OFF";

export interface FutureWeekRow {
  W7D1: string;
  W7D2: string;
  W7D3: string;
  W7D4: string;
  W7D5: string;
  W7D6: string;
  W7D7: string;
  employeeName: string;
  futureId: number;
  isoWeek: number;
  isoYear: number;
  jobLevel: string;
  olmid: string;
  roleCode: string;
  userId: number;
}

export interface FutureWeekApiResponse {
  success: boolean;
  totalEmployees: number;
  isoYear: number;
  isoWeek: number;
  data: FutureWeekRow[];
}

export interface FutureWeekQueryParams {
  subDomainId: number;
  pageNumber?: number;
  pageSize?: number;
}

// ─── Normalised internal types ────────────────────────────────────────────────

export interface NormalisedEmployee {
  rowKey: number;
  employeeName: string;
  olmid: string;
  jobLevel: string;
  roleCode: string;
  userId: number;
  futureId: number;
  shifts: ShiftCode[];
}

// ─── Column metadata ──────────────────────────────────────────────────────────

export interface DayColumn {
  dayIndex: number;
  shortLabel: string;
  longLabel: string;
  isWeekend: boolean;
  isWeekendStart: boolean;
}