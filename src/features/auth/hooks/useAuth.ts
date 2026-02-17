import { useAppSelector } from "../../../app/hooks";

export const useAuth = () => {
  const auth = useAppSelector((s) => s.auth);

  return {
    isAuthenticated: Boolean(auth.token),
    user: auth.user,
    role: auth.user?.roleCode,
  };
};
