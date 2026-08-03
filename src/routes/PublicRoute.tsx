import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from "react-router";
import { usePermission } from "../rbac/usePermission";
import { getFirstAccessiblePath } from "../rbac/routeAccess";

export const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const { hasModule, hasSubModule } = usePermission();

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return element;
  }

  // Mirrors the `from` PrivateRoute/LoginPage already use, so an already-
  // authenticated visit to /login (bookmark, back button, race) lands back
  // where the user actually was instead of unconditionally at a fixed route.
  // Falls back to "/" (resolved by DefaultRedirect in AppRoutes) rather than
  // a hardcoded module, since which module (if any) is accessible depends
  // entirely on the logged-in user's assigned permissions.
  const from = (location.state as { from?: string } | null)?.from;
  const fallback = getFirstAccessiblePath(hasModule, hasSubModule) ?? "/";
  return <Navigate to={from && from !== "/login" ? from : fallback} replace />;
};
