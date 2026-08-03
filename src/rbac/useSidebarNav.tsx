import { useMemo } from "react";
import { usePermission } from "./usePermission";
import { ALL_NAV_ITEMS, isNavItemAllowed, type NavItem } from "./navRegistry";
import { useCabRole } from "../features/cabManager/hooks/useCabRole";
import { ROLE_SCREENS } from "../features/cabManager/data/cabManager.mock";

export type { NavItem };

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
