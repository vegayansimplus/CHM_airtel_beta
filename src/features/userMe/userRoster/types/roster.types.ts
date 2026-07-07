export interface RosterDay {
  assignActCount: number;
  availableMins: number;
  shiftDisplay: string;
  workMode: string | null;
}

export interface UserRoster {
  userId: number;
  olmid: string;
  roster: Record<string, RosterDay>;
}

export interface MonthlyRosterResponse {
  data: UserRoster[];
  startDate: string;
  endDate: string;
  success: boolean;
  totalUsers: number;
  // Present instead of the success fields when the backend returns an error payload.
  status?: "Error";
  message?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: unknown;
}

export type ToastSeverity = "success" | "info" | "warning" | "error";

export interface ToastState {
  message: string;
  severity: ToastSeverity;
}
