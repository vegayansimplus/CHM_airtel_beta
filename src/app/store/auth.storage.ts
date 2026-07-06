import type { StoredUser } from "../../features/auth/types/auth.types";


const USER_KEY = "auth_user";
const TOKEN_KEY = "access_token";

// Session-scoped storage: the app is served over plain HTTP in this
// deployment, so the JWT cannot be protected in transit by a `Secure`
// cookie flag. Keeping it in sessionStorage (cleared when the browser/tab
// closes) instead of localStorage limits how long a stolen token or an
// XSS payload can reuse it, without requiring any backend change.
export const authStorage = {
  setUser(user: StoredUser) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  clear() {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};
