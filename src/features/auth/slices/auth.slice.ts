import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    finishHydration(state) {
      state.hydrated = true;
    },
    logout() {
      return { ...initialState, hydrated: true };
    },
  },
});

export const { setToken, setUser, logout, finishHydration } =
  authSlice.actions;
export default authSlice.reducer;

// import { createSlice,type  PayloadAction } from "@reduxjs/toolkit";
// import type { AuthUser } from "../types/auth.types";

// interface AuthState {
//   token: string | null;
//   user: AuthUser | null;
//   isAuthenticated: boolean;
// }

// const initialState: AuthState = {
//   token: null,
//   user: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setToken(state, action: PayloadAction<string>) {
//       state.token = action.payload;
//     },
//     setUser(state, action: PayloadAction<AuthUser>) {
//       state.user = action.payload;
//       state.isAuthenticated = true;
//     },
//     logout() {
//       return initialState;
//     },
//   },
// });

// export const { setToken, setUser, logout } = authSlice.actions;
// export default authSlice.reducer;

// // import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// // import type { AuthUser } from "../types/auth.types";

// // interface AuthState {
// //   user: AuthUser | null;
// //   token: string | null;
// //   isAuthenticated: boolean;
// // }

// // const initialState: AuthState = {
// //   user: null,
// //   token: null,
// //   isAuthenticated: false,
// // };

// // const authSlice = createSlice({
// //   name: "auth",
// //   initialState,
// //   reducers: {
// //     setAuth(
// //       state,
// //       action: PayloadAction<{ user: AuthUser; token: string }>
// //     ) {
// //       state.user = action.payload.user;
// //       state.token = action.payload.token;
// //       state.isAuthenticated = true;
// //     },
// //     logout() {
// //       return initialState;
// //     },
// //   },
// // });

// // export const { setAuth, logout } = authSlice.actions;
// // export default authSlice.reducer;
