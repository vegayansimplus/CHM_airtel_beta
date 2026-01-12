import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { logout } from "../features/auth/authSlice";
// import { setApiStatus } from "../store/slices/apiStatusSlice";
import { logout } from "../../features/auth/slices/auth.slice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_REACT_APP_BASE_URL,
  // baseUrl: "http://localhost:8082",
  prepareHeaders: (headers, { getState }) => {
    // const token = (getState() as RootState).auth.token;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user?.jwtToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (!result.error) {
    api.dispatch(setApiStatus("UP"));
  }

  if (result.error) {
    const status = result.error.status;

    if (status === 401) {
      console.error("Received 401 Unauthorized. Logging out.");
      api.dispatch(logout());
      // A 401 is an auth error, not a server outage. The API is working.
      api.dispatch(setApiStatus("UP"));
    }
    // Check for server errors (500-599) or network failures
    else if (
      (typeof status === "number" && status >= 500) ||
      status === "FETCH_ERROR"
    ) {
      console.error(`API Error Detected: ${status}. Marking API as DOWN.`);
      api.dispatch(setApiStatus("DOWN"));
    }
  }

  return result;
};
//++++++++++++++++++New change end here+++++++++++++++++++

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",

  ],
  endpoints: (builder) => ({}),
});

export default apiSlice;
