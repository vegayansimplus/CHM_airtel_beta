import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { authStorage } from "../../../app/store/auth.storage";
import {
  authChannel,
  postAuthMessage,
  type AuthChannelMessage,
} from "../../../app/store/authChannel";
import {
  finishHydration,
  logout,
  setToken,
  setUser,
} from "../slices/auth.slice";

// How long a tab with no session of its own waits for another tab to
// answer a REQUEST_SESSION before concluding the user is genuinely logged
// out. Cross-tab BroadcastChannel delivery is effectively instant, so this
// only guards against a slow/unresponsive other tab.
const SESSION_REQUEST_TIMEOUT_MS = 400;

const AuthHydrator = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = authStorage.getToken();
    const user = authStorage.getUser();

    if (!authChannel) {
      if (token) {
        dispatch(setToken(token));
        if (user) dispatch(setUser({ ...user, authenticated: true }));
      } else {
        dispatch(logout());
      }
      dispatch(finishHydration());
      return;
    }

    let hydrated = false;
    const finish = () => {
      if (hydrated) return;
      hydrated = true;
      dispatch(finishHydration());
    };

    // Kept alive for the lifetime of the app (this component never
    // unmounts), so it also handles logout/login sync between tabs after
    // initial hydration is done, not just the first-load handshake below.
    const handleMessage = (event: MessageEvent<AuthChannelMessage>) => {
      const message = event.data;

      if (message.type === "REQUEST_SESSION") {
        const activeToken = authStorage.getToken();
        if (activeToken) {
          postAuthMessage({
            type: "SESSION_SYNC",
            token: activeToken,
            user: authStorage.getUser(),
          });
        }
        return;
      }

      if (message.type === "SESSION_SYNC") {
        if (!authStorage.getToken()) {
          authStorage.setToken(message.token);
          if (message.user) authStorage.setUser(message.user);
          dispatch(setToken(message.token));
          if (message.user) {
            dispatch(setUser({ ...message.user, authenticated: true }));
          }
        }
        finish();
        return;
      }

      if (message.type === "LOGOUT") {
        authStorage.clear();
        dispatch(logout());
      }
    };

    authChannel.addEventListener("message", handleMessage);

    let timeoutId: number | undefined;
    if (token) {
      dispatch(setToken(token));
      if (user) dispatch(setUser({ ...user, authenticated: true }));
      finish();
    } else {
      // No session in this tab — ask any other open tab before redirecting
      // to /login, so Ctrl+Click / middle-click / manual URL entry into a
      // protected route doesn't bounce an already-authenticated user.
      postAuthMessage({ type: "REQUEST_SESSION" });
      timeoutId = window.setTimeout(() => {
        if (!hydrated) {
          dispatch(logout());
          finish();
        }
      }, SESSION_REQUEST_TIMEOUT_MS);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      authChannel.removeEventListener("message", handleMessage);
    };
  }, [dispatch]);

  return null;
};

export default AuthHydrator;
