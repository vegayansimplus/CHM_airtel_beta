import { useCallback, useEffect, useState } from "react";
import { ROLES } from "../data/cabManager.mock";
import type { Persona, Role } from "../types/types";

const KEY = "cab.role";

/**
 * Persona / role switcher state.
 *
 * Persisted to localStorage. Kept synchronous so pages can call it during
 * render without flicker.
 *
 * Replace this with a real auth selector once role comes from the JWT.
 */
export function useCabRole() {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") return "admin";
    return ((localStorage.getItem(KEY) as Role) ?? "admin");
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, role);
  }, [role]);

  const setRole = useCallback((r: Role) => setRoleState(r), []);
  const persona: Persona = ROLES[role];

  return { role, setRole, persona };
}
