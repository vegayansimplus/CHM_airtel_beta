import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { authStorage } from "../../../app/store/auth.storage";
import {
  finishHydration,
  logout,
  setToken,
  setUser,
} from "../slices/auth.slice";
const AuthHydrator = () => {
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   const token = authStorage.getToken();
  //   const user = authStorage.getUser();

  //   if (token && user) {
  //     dispatch(setToken(token));
  //     dispatch(setUser({ ...user, authenticated: true }));
  //   } else {
  //     dispatch(logout());
  //   }

  //   dispatch(finishHydration());
  // }, [dispatch]);

  useEffect(() => {
    const token = authStorage.getToken();
    const user = authStorage.getUser();

    if (token) {
      dispatch(setToken(token)); // token decides auth

      if (user) {
        dispatch(setUser({ ...user, authenticated: true }));
      }
    } else {
      dispatch(logout());
    }

    dispatch(finishHydration());
  }, [dispatch]);

  return null;
};

export default AuthHydrator;

// // features/auth/utils/AuthHydrator.tsx
// import { useEffect, useState } from "react";
// import { useAppDispatch } from "../../../app/hooks";
// import { logout, setToken, setUser } from "../slices/auth.slice";

// const AuthHydrator = () => {
//   const dispatch = useAppDispatch();
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     const token = sessionStorage.getItem("access_token");
//     const rawUser = localStorage.getItem("auth_user");

//     if (token && rawUser) {
//       dispatch(setToken(token));
//       dispatch(setUser({ ...JSON.parse(rawUser), authenticated: true }));
//     } else {
//       dispatch(logout());
//     }

//     setHydrated(true);
//   }, [dispatch]);

//   if (!hydrated) return null;

//   return null;
// };

// export default AuthHydrator;
