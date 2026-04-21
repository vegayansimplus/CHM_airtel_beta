import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from "react-router";

export const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!hydrated) {
    return null;

  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return element;
};