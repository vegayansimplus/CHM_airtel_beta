export interface Task {
  id: string;
  title: string;
  assignee: string;
  time: string;
  status: "Pending" | "Tomorrow" | "Completed" | "Leave";
}

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: "success" | "error" | "info";
}

export interface RosterItem {
  day: string;
  mode: "WFO" | "WFH" | "Leave";
  start: string;
  end: string;
}
