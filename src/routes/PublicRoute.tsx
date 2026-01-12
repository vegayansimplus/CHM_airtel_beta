import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate } from "react-router";

export const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuth ? <Navigate to="/home" replace /> : element;
};

// import { Navigate } from "react-router";
// import { useAppSelector } from "../app/hooks";
// import type { JSX } from "react";

// export const PublicRoute = ({ element }: { element: JSX.Element }) => {
//   const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
//   return isAuth ? <Navigate to="/home" replace /> : element;
// };
