
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
  futureId : number;
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

/** A single employee row with a typed 7-element tuple */
export interface NormalisedEmployee {
  /** Unique key for React (row id from API) */
  rowKey: number;
  employeeName: string;
  olmid: string;
  jobLevel: string;
  roleCode: string;
  userId: number;
  futureId: number;
  /** Mon–Sun shifts, index 0–6 */
  shifts: ShiftCode[];
}

// ─── Column metadata ──────────────────────────────────────────────────────────

export interface DayColumn {
  /** 0 = Mon … 6 = Sun */
  dayIndex: number;
  /** "Mon" | "Tue" … "Sun" */
  shortLabel: string;
  /** "Monday" … "Sunday" */
  longLabel: string;
  /** true for Sat (5) and Sun (6) */
  isWeekend: boolean;
  /** true for Sat (5) only — used to draw left separator */
  isWeekendStart: boolean;
}