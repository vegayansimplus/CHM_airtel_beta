import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from "react-router";
import { usePermission } from "../rbac/usePermission";
import { getRequiredAccess } from "../rbac/routeAccess";
import AccessDenied from "../rbac/AccessDenied";

export const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const { hasModule, hasSubModule } = usePermission();

  if (!hydrated) {
    return null;

  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Undefined means the current path isn't in the nav registry at all — allow
  // it through rather than silently locking out a route nobody registered.
  const access = getRequiredAccess(location.pathname);
  if (access && access.requiredModule !== null) {
    const allowed = access.requiredSubModule
      ? hasSubModule(access.requiredModule, access.requiredSubModule)
      : hasModule(access.requiredModule);
    if (!allowed) return <AccessDenied reason="forbidden" />;
  }

  return element;
};
