import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from "react-router";

export const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return element;
  }

  // Mirrors the `from` PrivateRoute/LoginPage already use, so an already-
  // authenticated visit to /login (bookmark, back button, race) lands back
  // where the user actually was instead of unconditionally at /home.
  const from = (location.state as { from?: string } | null)?.from;
  return <Navigate to={from && from !== "/login" ? from : "/home"} replace />;
};
