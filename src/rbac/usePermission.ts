// src/rbac/usePermission.ts
import { useMemo } from "react";
import { useAppSelector } from "../app/hooks";

export type PermAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";

export interface PermissionUtils {
  /** Check if the user has a specific action on a module */
  can: (moduleName: string, action: PermAction) => boolean;
  /** Check if the user has any access to a module at all */
  hasModule: (moduleName: string) => boolean;
  /** Check multiple actions at once — returns true if user has ALL of them */
  canAll: (moduleName: string, actions: PermAction[]) => boolean;
  /** Check multiple actions — returns true if user has ANY of them */
  canAny: (moduleName: string, actions: PermAction[]) => boolean;
  /** Shorthand: is the user a super admin */
  isSuperAdmin: boolean;
  /** The raw roleCode from the API */
  roleCode: string | null;
}

export const usePermission = (): PermissionUtils => {
  const user = useAppSelector((s) => s.auth.user);

  return useMemo(() => {
    const modules = user?.modules ?? {};
    const roleCode = user?.roleCode ?? null;
    const isSuperAdmin = roleCode === "SUPER_ADMIN";

    const can = (moduleName: string, action: PermAction): boolean => {
      // Super admins bypass all checks — they always have full access
      if (isSuperAdmin) return true;
      return modules[moduleName]?.includes(action) ?? false;
    };

    const hasModule = (moduleName: string): boolean => {
      if (isSuperAdmin) return true;
      return !!modules[moduleName] && modules[moduleName].length > 0;
    };

    const canAll = (moduleName: string, actions: PermAction[]): boolean =>
      actions.every((a) => can(moduleName, a));

    const canAny = (moduleName: string, actions: PermAction[]): boolean =>
      actions.some((a) => can(moduleName, a));

    return { can, hasModule, canAll, canAny, isSuperAdmin, roleCode };
  }, [user]);
};