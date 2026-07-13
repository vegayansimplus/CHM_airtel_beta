import type { ApiNotificationSetting } from "../api/notificationApiSlice";

/** The boolean notify* keys of a notification rule. */
export type NotifyToggleField = {
  [K in keyof ApiNotificationSetting]: ApiNotificationSetting[K] extends boolean
    ? K
    : never;
}[keyof ApiNotificationSetting];

export interface NotifyRoleColumn {
  field: NotifyToggleField;
  label: string;
}

/** Single source of truth for the per-role toggle columns. */
export const NOTIFY_ROLES: readonly NotifyRoleColumn[] = [
  { field: "notifyDomainHead", label: "Domain Head" },
  { field: "notifyFunctionHead", label: "Function Head" },
  { field: "notifySubDomainHead", label: "Sub-Domain Head" },
  { field: "notifySuperAdmin", label: "Super Admin" },
  { field: "notifyTeamMember", label: "Team Member" },
  { field: "notifyVerticalHead", label: "Vertical Head" },
];

/** A rule is "Active" when at least one role toggle is on. */
export const isAnyNotifyEnabled = (rule: ApiNotificationSetting): boolean =>
  NOTIFY_ROLES.some(({ field }) => rule[field]);
