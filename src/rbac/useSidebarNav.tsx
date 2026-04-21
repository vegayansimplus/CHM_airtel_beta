// src/rbac/useSidebarNav.ts
import { useMemo, type ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";
import Groups2Icon from "@mui/icons-material/Groups2";
import {
  FilterTiltShift,
  CalendarMonth,
  SupervisedUserCircle,
} from "@mui/icons-material";
import MailIcon from "@mui/icons-material/Mail";
import { usePermission } from "./usePermission";
import SettingsIcon from "@mui/icons-material/Settings";
export interface NavItem {
  to: string;
  text: string;
  icon: ReactNode;
  requiredModule: string | null;
  /** Sidebar will wrap this icon with a notification Badge when true */
  showBadge?: boolean;
}

// ALL possible nav items. requiredModule must exactly match the API moduleName string.
const ALL_NAV_ITEMS: NavItem[] = [
  {
    to: "/home",
    text: "Dashboard",
    icon: <DashboardIcon />,
    requiredModule: null, // visible to every authenticated user
  },
  {
    to: "/me",
    text: "Me",
    icon: <PersonIcon />,
    requiredModule: null, // every user has a "Me" section
  },
  {
    to: "/generateroster",
    text: "Roster Generator",
    icon: <ViewTimelineOutlinedIcon />,
    requiredModule: "Roster Managemement", // keep API typo intentionally
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
    requiredModule: "Role-Based Access Control",
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
    showBadge: true, // sidebar will inject the Badge around this icon
  },
  {
    to: "/user-management",
    text: "User Management",
    icon: <SupervisedUserCircle />,
    requiredModule: "User Management",
  },
  {
    to: "/global-settings/globalsettings",
    text: "Global Settings",
    icon: <SettingsIcon />,
    requiredModule: "Global Settings",
  },
];

export const useSidebarNav = (): NavItem[] => {
  const { hasModule } = usePermission();

  return useMemo(
    () =>
      ALL_NAV_ITEMS.filter(
        (item) =>
          item.requiredModule === null || hasModule(item.requiredModule),
      ),
    [hasModule],
  );
};
