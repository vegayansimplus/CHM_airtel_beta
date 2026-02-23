import type { Task, NotificationItem, RosterItem } from "../types/dashboard.types";

export const stats = {
  totalTasks: 4,
  pendingTasks: 2,
  attendance: 92,
  notifications: 3,
};

export const tasks: Task[] = [
  {
    id: "1",
    title: "Complete sales report",
    assignee: "Sujit Kumar",
    time: "9:00 AM - 6 PM",
    status: "Pending",
  },
  {
    id: "2",
    title: "Prepare presentation slides",
    assignee: "Rohan Singh",
    time: "9:00 AM - 6 PM",
    status: "Tomorrow",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "1",
    message: "Shift swap successfully by manager",
    time: "2 min ago",
    type: "success",
  },
  {
    id: "2",
    message: "Shift swap request rejected by manager",
    time: "1 hr ago",
    type: "error",
  },
];

export const weeklyRoster: RosterItem[] = [
  { day: "Mon", mode: "WFO", start: "9:00 AM", end: "6 PM" },
  { day: "Tue", mode: "WFH", start: "9:00 AM", end: "6 PM" },
  { day: "Wed", mode: "WFO", start: "9:00 AM", end: "6 PM" },
  { day: "Thu", mode: "WFO", start: "9:00 AM", end: "6 PM" },
  { day: "Fri", mode: "Leave", start: "-", end: "-" },
];
