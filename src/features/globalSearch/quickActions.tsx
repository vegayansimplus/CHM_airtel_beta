import type { ReactNode } from "react";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import SupervisedUserCircleOutlined from "@mui/icons-material/SupervisedUserCircleOutlined";
import CloudSyncOutlined from "@mui/icons-material/CloudSyncOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { MY_DASHBOARD_BASE } from "../myDashboard/config/dashboardTabs";

export interface QuickAction {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  requiredModule: string | null;
  requiredSubModule?: string;
}

/**
 * A small curated set of deep links into pages that already exist — these
 * are shortcuts, not new business actions. Each is gated by the same
 * requiredModule/requiredSubModule fields navRegistry.tsx uses, so
 * `isNavItemAllowed` (already exported from there) can filter this list
 * with zero new permission logic.
 */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-my-roster",
    label: "View My Roster",
    path: `${MY_DASHBOARD_BASE}/monthly-view`,
    icon: <CalendarMonthOutlined fontSize="small" />,
    requiredModule: "Me",
  },
  {
    id: "qa-my-leave",
    label: "View My Leave",
    path: `${MY_DASHBOARD_BASE}/leave`,
    icon: <EventNoteOutlined fontSize="small" />,
    requiredModule: "Me",
  },
  {
    id: "qa-my-crqs",
    label: "My CRQs",
    path: "/cabmanager/mycrqs",
    icon: <CheckCircleOutlined fontSize="small" />,
    requiredModule: "Cab Manager",
    requiredSubModule: "My CRQs",
  },
  {
    id: "qa-all-crqs",
    label: "All CRQs",
    path: "/cabmanager/allcrqs",
    icon: <ListAltOutlined fontSize="small" />,
    requiredModule: "Cab Manager",
    requiredSubModule: "All CRQs",
  },
  {
    id: "qa-roster-view",
    label: "Roster View",
    path: "/roster/view",
    icon: <CalendarMonthOutlined fontSize="small" />,
    requiredModule: "Roster Managemement",
  },
  {
    id: "qa-inbox",
    label: "Open Inbox",
    path: "/inbox/notifications",
    icon: <MailOutlined fontSize="small" />,
    requiredModule: "Notification System",
  },
  {
    id: "qa-user-mgmt",
    label: "Manage Users",
    path: "/user-management/usermang",
    icon: <SupervisedUserCircleOutlined fontSize="small" />,
    requiredModule: "User Management",
  },
  {
    id: "qa-sftp",
    label: "SFTP Management",
    path: "/sftp-management/windows",
    icon: <CloudSyncOutlined fontSize="small" />,
    requiredModule: "SFTP Management",
  },
  {
    id: "qa-global-settings",
    label: "Admin Settings",
    path: "/global-settings/adminsetting",
    icon: <TuneOutlined fontSize="small" />,
    requiredModule: "Global Settings",
    requiredSubModule: "Admin Settings",
  },
];
