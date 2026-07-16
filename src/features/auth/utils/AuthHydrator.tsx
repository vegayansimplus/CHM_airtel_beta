import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { authStorage, TOKEN_KEY } from "../../../app/store/auth.storage";
import { useLazyGetLoggedUserQuery } from "../api/auth.api";
import {
  normalizeRBAC,
  normalizeModuleHierarchy,
} from "../utils/rbacNormalizer";
import { finishHydration, logout, setToken, setUser } from "../slices/auth.slice";
import type { AuthUser } from "../types/auth.types";

const AuthHydrator = () => {
  const dispatch = useAppDispatch();
  const [fetchUser] = useLazyGetLoggedUserQuery();

  useEffect(() => {
    const validateAndHydrate = async (token: string) => {
      dispatch(setToken(token));

      // Paint the last-known user immediately so the UI doesn't blank out
      // while the validation call below is in flight; it gets overwritten
      // with the server's response (or discarded on failure) either way.
      const cachedUser = authStorage.getUser();
      if (cachedUser) {
        dispatch(setUser({ ...cachedUser, authenticated: true }));
      }

      try {
        const userRes = await fetchUser().unwrap();

        const user: AuthUser = {
          olmId: userRes.olmId,
          employeeName: userRes.employeeName,
          roleCode: userRes.roleCode,
          userId: userRes.userId,
          modules: normalizeRBAC(userRes),
          moduleHierarchy: normalizeModuleHierarchy(userRes),
          authenticated: true,
        };

        dispatch(setUser(user));
        authStorage.setToken(token);
        authStorage.setUser({
          olmId: user.olmId,
          employeeName: user.employeeName,
          roleCode: user.roleCode,
          userId: user.userId,
          modules: user.modules,
          moduleHierarchy: user.moduleHierarchy,
        });
      } catch {
        // Backend rejected the token (expired / invalid / revoked) — only
        // now is it correct to treat the user as logged out.
        authStorage.clear();
        dispatch(logout());
      } finally {
        dispatch(finishHydration());
      }
    };

    const token = authStorage.getToken();
    if (token) {
      void validateAndHydrate(token);
    } else {
      dispatch(logout());
      dispatch(finishHydration());
    }

    // Cross-tab sync: this fires in every OTHER tab whenever localStorage
    // changes here (never in the tab that made the write), so there's no
    // race to lose — a brand-new tab reads localStorage synchronously on
    // its very first render via authStorage.getToken() above.
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;

      if (!event.newValue) {
        dispatch(logout());
        return;
      }

      if (event.newValue !== event.oldValue) {
        void validateAndHydrate(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [dispatch, fetchUser]);

  return null;
};

export default AuthHydrator;
