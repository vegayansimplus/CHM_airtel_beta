import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { setToken } from "../features/auth/slices/auth.slice";
import { authStorage } from "./store/auth.storage";

const AuthBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return null;
};

export default AuthBootstrap;
