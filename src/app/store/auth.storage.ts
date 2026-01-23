import type { StoredUser } from "../../features/auth/types/auth.types";


const USER_KEY = "auth_user";
const TOKEN_KEY = "access_token";


export const authStorage = {
  setUser(user: StoredUser) {
    // sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  clear() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
