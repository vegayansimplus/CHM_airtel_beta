import { useMemo, type ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";
import Groups2Icon from "@mui/icons-material/Groups2";
import AltRouteIcon from '@mui/icons-material/AltRoute';

import {
  FilterTiltShift,
  CalendarMonth,
  SupervisedUserCircle,
} from "@mui/icons-material";
import MailIcon from "@mui/icons-material/Mail";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
// import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { usePermission } from "./usePermission";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SchemaIcon from "@mui/icons-material/Schema";
// import ChecklistIcon from "@mui/icons-material/Checklist";
export interface NavItem {
  to: string;
  text: string;
  icon: ReactNode;
  requiredModule: string | null;
  showBadge?: boolean;

  matchPaths?: string[];
  children?: Omit<NavItem, "children">[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    to: "/home",
    text: "Dashboard",
    icon: <DashboardIcon />,
    requiredModule: null,
  },
  {
    to: "/me",
    text: "Me",
    icon: <PersonIcon />,
    requiredModule: null,
  },
  {
    to: "/generateroster",
    text: "Roster Generator",
    icon: <ViewTimelineOutlinedIcon />,
    requiredModule: "Roster Managemement",
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
    icon: <FilterTiltShift />,
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
        icon: <SchemaIcon />,
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
    text: "Roster View",
    icon: <CalendarMonth />,
    requiredModule: "Roster Managemement",
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
      },
      {
        to: "/global-settings/adminsetting",
        text: "Admin Settings",
        icon: <TuneIcon />,
        requiredModule: "Global Settings",
      },
    ],
  },
];

export const useSidebarNav = (): NavItem[] => {
  const { hasModule } = usePermission();

  return useMemo(
    () =>
      ALL_NAV_ITEMS.filter(
        (item) =>
          item.requiredModule === null || hasModule(item.requiredModule),
      ).map((item) => ({
        ...item,
        children: item.children?.filter(
          (child) =>
            child.requiredModule === null || hasModule(child.requiredModule),
        ),
      })),
    [hasModule],
  );
};
