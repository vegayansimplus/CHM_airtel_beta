import type { ShiftColorTriple } from "../../userMe/userRoster/constants/shiftColors";

export type TaskStatus = "Done" | "Urgent" | "Pending" | "Rostering";

export interface Task {
  id: number;
  title: string;
  dept: string;
  time: string;
  status: TaskStatus;
}

export type TaskFilter = "All" | "Pending" | "Done";

/** Semantic colour tone — resolved against theme tokens at render time. */
export type ToneKey = "accent" | "success" | "warning" | "danger" | "info";

export interface Holiday {
  month: string;
  day: string;
  name: string;
  type: string;
  countdown: string;
  tone: ToneKey;
}

export interface LeaveTeamMember {
  name: string;
  role: string;
  type: string;
  tone: ToneKey;
  avatarTone: ToneKey;
  initials: string;
  returnDate: string;
}

export interface ShiftInfo {
  name: string;
  start: string;
  end: string;
  dur: string;
  code?: string;
  colors?: ShiftColorTriple;
}

export interface WeekDay {
  day: string;
  date: number;
  shift: ShiftInfo | null;
  isOff?: boolean;
  isToday?: boolean;
  /** Label shown on off tiles, e.g. "Week off" / "Holiday" / "On leave". */
  offLabel?: string;
}

export type WorkMode = "WFH" | "WFO";

export interface WorkModeDay {
  d: string;
  t: WorkMode;
  active?: boolean;
}

export type StatIconKey = "trending" | "clock" | "calendar" | "event";

export interface StatCardConfig {
  key: string;
  label: string;
  display: number | string;
  sub: string;
  tone: ToneKey;
  icon: StatIconKey;
  /** Small badge next to the label, e.g. "▲ 8%" — tone drives its colour. */
  delta?: { text: string; tone: ToneKey };
  /** Last few data points rendered as a mini sparkline at the card foot. */
  trend?: readonly number[];
}
