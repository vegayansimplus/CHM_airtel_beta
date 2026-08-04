// src/rbac/routeAccess.ts
import { ALL_NAV_ITEMS, isNavItemAllowed, type NavItem } from "./navRegistry";

export interface RequiredAccess {
  requiredModule: string | null;
  requiredSubModule?: string;
}

/**
 * Modules whose sub-module-level gating is known to be unreliable at the
 * route layer, so route protection falls back to module-level only for
 * them (sidebar visibility is unaffected — this only concerns direct-URL
 * enforcement in PrivateRoute):
 *
 * - "Cab Manager": child visibility is governed entirely by the separate
 *   ROLE_SCREENS/useCabRole persona system (see useSidebarNav.tsx), not by
 *   WEB_* sub-module grants — those are not guaranteed to agree.
 * - "SFTP Management": live WEB_SUB_MODULE rows are named
 *   "Dashboard/Files/Servers", not the "Windows/Linux" sub-module names
 *   referenced in navRegistry.ts, so enforcing requiredSubModule here would
 *   incorrectly block real users of this module on both of its pages.
 */
const MODULE_ONLY_GUARD = new Set(["Cab Manager", "SFTP Management"]);

const matchesPath = (pathname: string, to: string, matchPaths?: string[]): boolean => {
  const candidates = matchPaths ?? [to];
  return candidates.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

interface FlatEntry {
  to: string;
  matchPaths?: string[];
  requiredModule: string | null;
  requiredSubModule?: string;
}

const flatten = (items: NavItem[]): FlatEntry[] => {
  const entries: FlatEntry[] = [];
  for (const item of items) {
    entries.push({
      to: item.to,
      matchPaths: item.matchPaths,
      requiredModule: item.requiredModule,
      requiredSubModule: item.requiredSubModule,
    });
    for (const child of item.children ?? []) {
      entries.push({
        to: child.to,
        matchPaths: child.matchPaths,
        requiredModule: child.requiredModule,
        requiredSubModule: child.requiredSubModule,
      });
    }
  }
  // Longest `to` first so a child route (more specific) is matched before its parent.
  return entries.sort((a, b) => b.to.length - a.to.length);
};

const FLAT_ENTRIES = flatten(ALL_NAV_ITEMS);

/**
 * Resolves what module/sub-module a given pathname requires, using the same
 * registry (and prefix-matching convention) the sidebar is built from.
 * Returns undefined if the path isn't represented in the registry at all —
 * callers should treat that as "allowed" (a safety net for routes added
 * without a matching nav entry, rather than silently locking everyone out).
 */
export const getRequiredAccess = (pathname: string): RequiredAccess | undefined => {
  const entry = FLAT_ENTRIES.find((e) => matchesPath(pathname, e.to, e.matchPaths));
  if (!entry) return undefined;

  if (entry.requiredSubModule && MODULE_ONLY_GUARD.has(entry.requiredModule ?? "")) {
    return { requiredModule: entry.requiredModule };
  }

  return { requiredModule: entry.requiredModule, requiredSubModule: entry.requiredSubModule };
};

/**
 * Returns the first top-level nav item's path the user actually has access
 * to (in the registry's declared order — Dashboard first when assigned),
 * or null if the user has no accessible module at all.
 */
export const getFirstAccessiblePath = (
  hasModule: (moduleName: string) => boolean,
  hasSubModule: (moduleName: string, subModuleName: string) => boolean,
): string | null => {
  const item = ALL_NAV_ITEMS.find((i) => isNavItemAllowed(i, hasModule, hasSubModule));
  return item?.to ?? null;
};
