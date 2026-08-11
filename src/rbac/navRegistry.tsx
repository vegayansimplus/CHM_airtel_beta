import { type ReactNode } from "react";
// Every nav icon below is the "Outlined" (thin-line) variant of its MUI
// icon — previously a mix of filled/Rounded/Outlined imports depending on
// who added each entry. One consistent family reads as more deliberate
// and matches the app's overall enterprise-line-icon direction; which
// icon maps to which module is unchanged, only the visual variant is.
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import Groups2Icon from "@mui/icons-material/Groups2Outlined";
import AltRouteIcon from "@mui/icons-material/AltRouteOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenterOutlined";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";

import CalendarMonth from "@mui/icons-material/CalendarMonthOutlined";
import SupervisedUserCircle from "@mui/icons-material/SupervisedUserCircleOutlined";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import MailIcon from "@mui/icons-material/MailOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsOutlined";
import InsightsRoundedIcon from "@mui/icons-material/InsightsOutlined";
import DashboardRoundedIcon from "@mui/icons-material/DashboardOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsOutlined";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import SchemaIcon from "@mui/icons-material/SchemaOutlined";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import TerminalIcon from "@mui/icons-material/TerminalOutlined";

/**
 * Single source of truth for "what pages exist, what route they live at, and
 * what module/sub-module permission they require". Both the sidebar
 * (useSidebarNav) and route protection (routeAccess/PrivateRoute) read from
 * this same list so they can never drift apart the way the old, now-dead
 * routeConfig.tsx/moduleRouteMap.ts did.
 */
export interface NavItem {
  to: string;
  text: string;
  icon: ReactNode;
  requiredModule: string | null;
  /** When set, gates this item on a specific sub-module of requiredModule instead of the whole module. */
  requiredSubModule?: string;
  showBadge?: boolean;

  matchPaths?: string[];
  children?: Omit<NavItem, "children">[];
}

export const ALL_NAV_ITEMS: NavItem[] = [
  {
    to: "/home",
    text: "Dashboard",
    icon: <DashboardIcon />,
    requiredModule: "Dashboard",
  },
  {
    to: "/me",
    text: "Me",
    icon: <PersonIcon />,
    requiredModule: "Me",
  },
  {
    to: "/cabmanager",
    text: "Cab Manager",
    icon: <BusinessCenterIcon />,
    requiredModule: "Cab Manager",
    children: [
      {
        to: "/cabmanager/dashboard",
        text: "Dashboard",
        icon: <DashboardIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "Dashboard",
        matchPaths: ["/cabmanager/dashboard"],
      },
      {
        to: "/cabmanager/planning",
        text: "Cab Planning",
        icon: <EventNoteOutlinedIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "Cab Planning",
        matchPaths: ["/cabmanager/planning"],
      },
      {
        to: "/cabmanager/sessions",
        text: "Cab Sessions",
        icon: <Groups2Icon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "Cab Sessions",
        matchPaths: ["/cabmanager/sessions"],
      },
      {
        to: "/cabmanager/mycrqs",
        text: "My CRQs",
        icon: <CheckCircleOutlineIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "My CRQs",
        matchPaths: ["/cabmanager/mycrqs"],
      },
      {
        to: "/cabmanager/allcrqs",
        text: "All CRQs",
        icon: <ListAltOutlinedIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "All CRQs",
        matchPaths: ["/cabmanager/allcrqs"],
      },
      {
        to: "/cabmanager/journey",
        text: "CRQ Journey",
        icon: <AltRouteIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "CRQ Journey",
        matchPaths: ["/cabmanager/journey"],
      },
      {
        to: "/cabmanager/implementation",
        text: "Implementation",
        icon: <PlayArrowOutlinedIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "Implementation",
        matchPaths: ["/cabmanager/implementation"],
      },
      {
        to: "/cabmanager/admin",
        text: "Admin Config",
        icon: <SettingsIcon />,
        requiredModule: "Cab Manager",
        requiredSubModule: "Admin Config",
        matchPaths: ["/cabmanager/admin"],
      },
    ],
  },
  {
    to: "/team",
    text: "Team Management",
    icon: <Groups2Icon />,
    requiredModule: "Team Management",
  },
  {
    to: "/scheduler",
    text: "Scheduler",
    icon: <ScheduleIcon />,
    requiredModule: "Scheduler",
    children: [
      {
        // Default child — matches /scheduler AND /scheduler/crqWorkflow (and detail pages)
        to: "/scheduler/crqWorkflow",
        text: "Shift Scheduler",
        icon: <CalendarMonthIcon />,
        requiredModule: "Role-Based Access Control",
        // Also highlight when drilling into a CRQ detail: /scheduler/crqWorkflow/ABC123
        matchPaths: ["/scheduler/crqWorkflow"],
      },
      {
        to: "/scheduler/planviewandsetup",
        text: "Plan",
        icon: <AssignmentIcon />,
        requiredModule: "Role-Based Access Control",
        matchPaths: ["/scheduler/taskconfig", "/scheduler/planviewandsetup"],
      },
      {
        to: "/scheduler/taskplanning",
        text: "Task Planning",
        icon: <SchemaIcon />,
        requiredModule: "Role-Based Access Control",
        matchPaths: ["/scheduler/taskplanning"],
      },
      {
        to: "/scheduler/crqjourney",
        text: "CRQ Journey",
        icon: <AltRouteIcon />,
        requiredModule: "Role-Based Access Control",
        matchPaths: ["/scheduler/crqjourney"],
      },
    ],
  },
  {
    to: "/roster",
    text: "Roster",
    icon: <CalendarMonth />,
    requiredModule: "Roster Managemement",
    children: [
      {
        to: "/roster/view",
        text: "Roster View",
        icon: <CalendarMonth />,
        requiredModule: "Roster Managemement",
        matchPaths: ["/roster/view"],
      },
      {
        to: "/roster/generation",
        text: "Roster Generation",
        icon: <ViewTimelineOutlinedIcon />,
        requiredModule: "Roster Managemement",
        matchPaths: ["/roster/generation"],
      },
    ],
  },
  {
    to: "/inbox",
    text: "Inbox",
    icon: <MailIcon />,
    requiredModule: "Notification System",
    showBadge: true,
  },
  {
    to: "/user-management",
    text: "User Management",
    icon: <SupervisedUserCircle />,
    requiredModule: "User Management",
  },
  {
    to: "/analytics",
    text: "Analytics",
    icon: <InsightsRoundedIcon />,
    requiredModule: "CRQ Analytics",
    children: [
      {
        to: "/analytics/dashboard",
        text: "Dashboard",
        icon: <DashboardRoundedIcon />,
        requiredModule: "CRQ Analytics",
        matchPaths: ["/analytics/dashboard"],
      },
      {
        to: "/analytics/crq-analytics",
        text: "CRQ Analytics",
        icon: <QueryStatsRoundedIcon />,
        requiredModule: "CRQ Analytics",
        matchPaths: ["/analytics/crq-analytics"],
      },
      {
        to: "/analytics/reports",
        text: "Reports",
        icon: <SummarizeRoundedIcon />,
        requiredModule: "CRQ Analytics",
        matchPaths: ["/analytics/reports"],
      },
    ],
  },
  {
    to: "/data-agent",
    text: "Data Agent",
    icon: <AutoAwesomeRoundedIcon />,
    requiredModule: "Data Agent",
  },
  {
    to: "/sftp-management",
    text: "SFTP Management",
    icon: <CloudSyncOutlinedIcon />,
    requiredModule: "SFTP Management",
    children: [
      {
        to: "/sftp-management/windows",
        text: "Windows",
        icon: <DnsOutlinedIcon />,
        requiredModule: "SFTP Management",
        requiredSubModule: "Windows",
        matchPaths: ["/sftp-management/windows"],
      },
      {
        to: "/sftp-management/linux",
        text: "Linux",
        icon: <TerminalIcon />,
        requiredModule: "SFTP Management",
        requiredSubModule: "Linux",
        matchPaths: ["/sftp-management/linux"],
      },
    ],
  },
  {
    to: "/global-settings",
    text: "Global Settings",
    icon: <SettingsIcon />,
    requiredModule: "Global Settings",
    children: [
      {
        to: "/global-settings/networkfreezsetting",
        text: "Network Settings",
        icon: <NotificationsNoneIcon />,
        requiredModule: "Global Settings",
        requiredSubModule: "Network Settings",
      },
      {
        to: "/global-settings/adminsetting",
        text: "Admin Settings",
        icon: <TuneIcon />,
        requiredModule: "Global Settings",
        requiredSubModule: "Admin Settings",
      },
      {
        to: "/global-settings/orgconfig",
        text: "Organization Settings",
        icon: <SchemaIcon />,
        requiredModule: "Global Settings",
        requiredSubModule: "Organization Settings",
      },
    ],
  },
];

export const isNavItemAllowed = (
  item: Pick<NavItem, "requiredModule" | "requiredSubModule">,
  hasModule: (moduleName: string) => boolean,
  hasSubModule: (moduleName: string, subModuleName: string) => boolean,
): boolean => {
  if (item.requiredModule === null) return true;
  if (item.requiredSubModule) {
    return hasSubModule(item.requiredModule, item.requiredSubModule);
  }
  return hasModule(item.requiredModule);
};
