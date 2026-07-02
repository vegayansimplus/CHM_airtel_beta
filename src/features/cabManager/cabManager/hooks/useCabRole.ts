import { useMemo } from "react";
import { usePermission } from "../../../../rbac/usePermission";
import { ROLES } from "../data/cabManager.mock";
import type { Persona, Role } from "../types/types";

const DEFAULT_ROLE: Role = "requester";

function isKnownRole(code: string | null): code is Role {
  return !!code && code in ROLES;
}

/**
 * Cab Manager persona for the current user, derived from the common
 * auth roleCode (src/rbac/usePermission.ts) rather than local state.
 */
export function useCabRole() {
  const { roleCode } = usePermission();

  return useMemo(() => {
    const role: Role = isKnownRole(roleCode) ? roleCode : DEFAULT_ROLE;
    const persona: Persona = ROLES[role];
    return { role, persona };
  }, [roleCode]);
}
