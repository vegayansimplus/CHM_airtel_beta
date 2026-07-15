import type { StoredUser } from "../../features/auth/types/auth.types";

const CHANNEL_NAME = "chm_auth_sync";

export type AuthChannelMessage =
  | { type: "REQUEST_SESSION" }
  | { type: "SESSION_SYNC"; token: string; user: StoredUser | null }
  | { type: "LOGOUT" };

// sessionStorage (see auth.storage.ts) is deliberately per-tab, so a new
// tab has no way to read another tab's session directly. This channel lets
// tabs hand a session to each other (or announce a logout) without ever
// persisting the token outside sessionStorage.
export const authChannel: BroadcastChannel | null =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(CHANNEL_NAME);

export function postAuthMessage(message: AuthChannelMessage) {
  authChannel?.postMessage(message);
}
