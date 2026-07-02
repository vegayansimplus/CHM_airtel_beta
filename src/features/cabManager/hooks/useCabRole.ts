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
    if (typeof window === "undefined") return "requester";

    const saved = localStorage.getItem(KEY) as Role | null;
    return saved && saved in ROLES ? (saved as Role) : "requester";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncRole = () => {
      const saved = localStorage.getItem(KEY) as Role | null;
      setRoleState(saved && saved in ROLES ? (saved as Role) : "requester");
    };

    syncRole();
    window.addEventListener("cab-role-changed", syncRole);

    return () => {
      window.removeEventListener("cab-role-changed", syncRole);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, role);
  }, [role]);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, r);
      window.dispatchEvent(new Event("cab-role-changed"));
    }
  }, []);

  const persona: Persona = ROLES[role];

  return { role, setRole, persona };
}
