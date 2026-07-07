import type {
  Holiday,
  LeaveTeamMember,
  StatCardConfig,
  Task,
  WeekDay,
  WorkModeDay,
} from "../types/dashboard.types";

export const PROFILE = {
  name: "Karthika P",
  role: "IP Access · CCB Division",
  id: "B0324261",
};

export const TODAY_DATE_LABEL = "Fri, Mar 20, 2025";
export const WORK_LOCATION_DATE_LABEL = "Fri, Mar 21";
export const WEEKLY_SCHEDULE_RANGE_LABEL = "Mar 15 – 21, 2025";

export const WEEK: WeekDay[] = [
  { day: "SU", date: 15, shift: null, isOff: true },
  { day: "MO", date: 16, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "TU", date: 17, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "WE", date: 18, shift: { name: "Gen", start: "09:30", end: "18:00", dur: "510m" } },
  { day: "TH", date: 19, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" } },
  { day: "FR", date: 20, shift: { name: "Gen", start: "09:30", end: "18:30", dur: "540m" }, isToday: true },
  { day: "SA", date: 21, shift: null, isOff: true },
];

export const TASKS: Task[] = [
  { id: 1, title: "Review Q1 Performance Report", dept: "Management", time: "10:00 AM", status: "Done" },
  { id: 2, title: "Update IP Access Protocols", dept: "Security", time: "2:30 PM", status: "Urgent" },
  { id: 3, title: "Submit weekly attendance report", dept: "HR", time: "5:00 PM", status: "Pending" },
  { id: 4, title: "Review team shift requests", dept: "Rostering", time: "EOD", status: "Rostering" },
];

export const HOLIDAYS: Holiday[] = [
  { month: "MAR", day: "29", name: "Good Friday", type: "Public holiday", countdown: "8 days", tone: "accent" },
  { month: "APR", day: "10", name: "Eid al-Fitr", type: "Public holiday", countdown: "20 days", tone: "danger" },
];

export const LEAVE_TEAM: LeaveTeamMember[] = [
  { name: "Rahul Sharma", role: "UI/UX Designer", type: "Sick leave", tone: "danger", avatarTone: "info", initials: "RS", returnDate: "Mar 22" },
  { name: "Priya Patel", role: "Frontend Dev", type: "Annual leave", tone: "success", avatarTone: "accent", initials: "PP", returnDate: "Mar 25" },
];

export const WFH_WEEK: WorkModeDay[] = [
  { d: "M", t: "WFH" },
  { d: "T", t: "WFH" },
  { d: "W", t: "WFH" },
  { d: "T", t: "WFO" },
  { d: "F", t: "WFO", active: true },
];

export const STAT_CARDS: StatCardConfig[] = [
  {
    key: "tasks",
    label: "Total tasks",
    display: 12,
    sub: "8 done today",
    tone: "accent",
    icon: "trending",
    delta: { text: "▲ 8%", tone: "success" },
    trend: [5, 7, 6, 9, 8, 11, 12],
  },
  {
    key: "pending",
    label: "Pending",
    display: 4,
    sub: "1 urgent",
    tone: "warning",
    icon: "clock",
    delta: { text: "▼ 2 today", tone: "success" },
    trend: [9, 7, 8, 6, 6, 5, 4],
  },
  {
    key: "shift",
    label: "Shift duration",
    display: "9h",
    sub: "General · 09:30–18:30",
    tone: "success",
    icon: "calendar",
    trend: [9, 9, 8.5, 9, 9, 8.5, 9],
  },
  {
    key: "holiday",
    label: "Next holiday",
    display: "8d",
    sub: "Good Friday · Mar 29",
    tone: "info",
    icon: "event",
    trend: [13, 12, 11, 10, 9, 8.5, 8],
  },
];
