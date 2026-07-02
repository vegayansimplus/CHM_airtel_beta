import { useEffect, useMemo, useState, type ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";
import Groups2Icon from "@mui/icons-material/Groups2";
import AltRouteIcon from '@mui/icons-material/AltRoute';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

import {
  FilterTiltShift,
  CalendarMonth,
  SupervisedUserCircle,
} from "@mui/icons-material";
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import MailIcon from "@mui/icons-material/Mail";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
// import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { usePermission } from "./usePermission";
import { ROLE_SCREENS } from "../features/cabManager/data/cabManager.mock";
import type { Role } from "../features/cabManager/types/types";
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
    to: "/cabmanager",
    text: "Cab Manager",
    icon: <BusinessCenterIcon />,
    requiredModule: "Cab Manager",
    children: [
      { to: "/cabmanager/dashboard", text: "Dashboard", icon: <DashboardIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/dashboard"] },
      { to: "/cabmanager/planning", text: "Cab Planning", icon: <EventNoteOutlinedIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/planning"] },
      { to: "/cabmanager/sessions", text: "Cab Sessions", icon: <Groups2Icon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/sessions"] },
      { to: "/cabmanager/mycrqs", text: "My CRQs", icon: <CheckCircleOutlineIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/mycrqs"] },
      { to: "/cabmanager/allcrqs", text: "All CRQs", icon: <ListAltOutlinedIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/allcrqs"] },
      { to: "/cabmanager/journey", text: "CRQ Journey", icon: <AltRouteIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/journey"] },
      { to: "/cabmanager/implementation", text: "Implementation", icon: <PlayArrowOutlinedIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/implementation"] },
      { to: "/cabmanager/admin", text: "Admin Config", icon: <SettingsIcon />, requiredModule: "Cab Manager", matchPaths: ["/cabmanager/admin"] },
    ],
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
  const [cabRole, setCabRole] = useState<Role>("requester");

  useEffect(() => {
    const syncRole = () => {
      const stored = window.localStorage.getItem("cab.role") as Role | null;
      setCabRole(stored && ROLE_SCREENS[stored] ? stored : "requester");
    };

    syncRole();
    window.addEventListener("cab-role-changed", syncRole);
    window.addEventListener("storage", syncRole);

    return () => {
      window.removeEventListener("cab-role-changed", syncRole);
      window.removeEventListener("storage", syncRole);
    };
  }, []);

  return useMemo(() => {
    // map cab child path -> screen id used in ROLE_SCREENS
    const pathToScreenId: Record<string, string> = {
      "/cabmanager/dashboard": "dashboard",
      "/cabmanager/planning": "cabPlanning",
      "/cabmanager/sessions": "cabSessions",
      "/cabmanager/mycrqs": "mycrqs",
      "/cabmanager/allcrqs": "allcrqs",
      "/cabmanager/journey": "journey",
      "/cabmanager/implementation": "implementation",
      "/cabmanager/admin": "admin",
    };

    return ALL_NAV_ITEMS.filter((item) => item.requiredModule === null || hasModule(item.requiredModule))
      .map((item) => {
        // For Cab Manager apply role-based child filtering using the active CAB persona
        if (item.to === "/cabmanager") {
          const children = item.children ?? [];
          const effectiveRole: Role | null = cabRole;
          if (effectiveRole && ROLE_SCREENS[effectiveRole]) {
            const allowed = ROLE_SCREENS[effectiveRole];
            const filtered = children.filter((c) => allowed.includes(pathToScreenId[c.to]));
            return { ...item, children: filtered };
          }
          // otherwise fall back to permission module filtering per child
          return { ...item, children: children.filter((child) => child.requiredModule === null || hasModule(child.requiredModule)) };
        }

        return {
          ...item,
          children: item.children?.filter((child) => child.requiredModule === null || hasModule(child.requiredModule)),
        };
      });
  }, [hasModule, cabRole]);
};
