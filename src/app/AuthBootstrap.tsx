import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { setToken } from "../features/auth/slices/auth.slice";

const AuthBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return null;
};

export default AuthBootstrap;
