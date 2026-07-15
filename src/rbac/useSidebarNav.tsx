import { useMemo, type ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import Groups2Icon from "@mui/icons-material/Groups2";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";

import {
  CalendarMonth,
  SupervisedUserCircle,
} from "@mui/icons-material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import MailIcon from "@mui/icons-material/Mail";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
// import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { usePermission } from "./usePermission";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SchemaIcon from "@mui/icons-material/Schema";
import { useCabRole } from "../features/cabManager/hooks/useCabRole";
import { ROLE_SCREENS } from "../features/cabManager/data/cabManager.mock";

// import ChecklistIcon from "@mui/icons-material/Checklist";
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
    ],
  },
];

const isNavItemAllowed = (
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

export const useSidebarNav = (): NavItem[] => {
  const { hasModule, hasSubModule } = usePermission();
  const { role: cabRole } = useCabRole();

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

    return ALL_NAV_ITEMS.filter((item) =>
      isNavItemAllowed(item, hasModule, hasSubModule),
    ).map((item) => {
      // For Cab Manager apply role-based child filtering using the active CAB persona
      if (item.to === "/cabmanager") {
        const children = item.children ?? [];
        const allowed = ROLE_SCREENS[cabRole];
        const filtered = children.filter((c) =>
          allowed.includes(pathToScreenId[c.to]),
        );
        return { ...item, children: filtered };
      }

      return {
        ...item,
        children: item.children?.filter((child) =>
          isNavItemAllowed(child, hasModule, hasSubModule),
        ),
      };
    });
  }, [hasModule, hasSubModule, cabRole]);
};
