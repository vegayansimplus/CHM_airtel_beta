import { useAppSelector } from "../../../app/hooks";
import { useGetUserProfileQuery, type UserProfile } from "../../userManagement/api/userManagementApi";

export type DashboardProfileStatus = "loading" | "error" | "empty" | "ready";

export interface DashboardProfileState {
  profile?: UserProfile;
  status: DashboardProfileStatus;
  errorMessage?: string;
}

/** Owns the dashboard's live "My Profile" data, backed by /teamoverview/getuserprofile/{userId}. */
export function useDashboardProfile(): DashboardProfileState {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.userId ? Number(user.userId) : undefined;

  const { data, isLoading, isFetching, isError } = useGetUserProfileQuery(userId as number, {
    skip: !userId,
  });

  const profile = data?.profile;

  const status: DashboardProfileStatus = isError
    ? "error"
    : isLoading || isFetching
      ? "loading"
      : !profile
        ? "empty"
        : "ready";

  const errorMessage = status === "error" ? "Failed to load your profile. Please try again." : undefined;

  return { profile, status, errorMessage };
}
