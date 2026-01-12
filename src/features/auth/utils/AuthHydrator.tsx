// features/auth/utils/AuthHydrator.tsx
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { logout, setToken, setUser } from "../slices/auth.slice";

const AuthHydrator = () => {
  const dispatch = useAppDispatch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const rawUser = localStorage.getItem("auth_user");

    if (token && rawUser) {
      dispatch(setToken(token));
      dispatch(setUser({ ...JSON.parse(rawUser), authenticated: true }));
    } else {
      dispatch(logout());
    }

    setHydrated(true);
  }, [dispatch]);

  if (!hydrated) return null;

  return null;
};

export default AuthHydrator;

