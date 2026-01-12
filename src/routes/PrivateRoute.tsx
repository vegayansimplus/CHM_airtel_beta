import type { JSX } from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from "react-router";
import GlobalBackdrop from "../components/common/GlobalBackdrop";

export const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!hydrated) {
    // return null;
    return (
      <>
        <GlobalBackdrop />
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return element;
};

// import type { JSX } from "react";
// import { useAppSelector } from "../app/hooks";
// import { Navigate, useLocation } from "react-router";

// export const PrivateRoute = ({ element }: { element: JSX.Element }) => {
//   const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
//   const location = useLocation();

//   if (!isAuth) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//         state={{ from: location.pathname }}
//       />
//     );
//   }

//   return element;
// };

// import { Navigate, useLocation } from "react-router";
// import { useAppSelector } from "../app/hooks";
// import type { JSX } from "react";

// export const PrivateRoute = ({ element }: { element: JSX.Element }) => {
//   const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
//   const location = useLocation();

//   if (!isAuth) {
//     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
//   }

//   return element;
// };
