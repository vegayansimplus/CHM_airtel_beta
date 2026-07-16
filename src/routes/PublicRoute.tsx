import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate } from "react-router";

export const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  if (!hydrated) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : element;
};
