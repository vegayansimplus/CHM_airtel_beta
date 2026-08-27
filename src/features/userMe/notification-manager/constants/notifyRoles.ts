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
<<<<<<< Updated upstream
  /** Shorter form for narrow column headers; `label` stays the full,
   * descriptive text used in tooltips and aria-labels. */
  shortLabel: string;
=======
  /** DB column name behind sp_update_notification_manager's columnName param. */
  column: string;
>>>>>>> Stashed changes
}

/** Single source of truth for the per-role toggle columns. */
export const NOTIFY_ROLES: readonly NotifyRoleColumn[] = [
<<<<<<< Updated upstream
  { field: "notifyDomainHead", label: "Domain Head", shortLabel: "Domain" },
  { field: "notifyFunctionHead", label: "Function Head", shortLabel: "Function" },
  { field: "notifySubDomainHead", label: "Sub-Domain Head", shortLabel: "Sub-Domain" },
  { field: "notifySuperAdmin", label: "Super Admin", shortLabel: "Admin" },
  { field: "notifyTeamMember", label: "Team Member", shortLabel: "Team" },
  { field: "notifyVerticalHead", label: "Vertical Head", shortLabel: "Vertical" },
=======
  { field: "notifyDomainHead", label: "Domain Head", column: "notify_domain_head" },
  { field: "notifyFunctionHead", label: "Function Head", column: "notify_function_head" },
  { field: "notifySubDomainHead", label: "Sub-Domain Head", column: "notify_sub_domain_head" },
  { field: "notifySuperAdmin", label: "Super Admin", column: "notify_super_admin" },
  { field: "notifyTeamMember", label: "Team Member", column: "notify_team_member" },
  { field: "notifyVerticalHead", label: "Vertical Head", column: "notify_vertical_head" },
>>>>>>> Stashed changes
];

/** DB column behind the row's real lifecycle flag (not a "recipient" role). */
export const STATUS_COLUMN = "is_active";

/** camelCase field -> snake_case DB column, for the generic update mutation. */
export const FIELD_TO_COLUMN: Record<string, string> = Object.fromEntries(
  NOTIFY_ROLES.map(({ field, column }) => [field, column]),
);

/** snake_case DB column -> camelCase field, for patching the RTK Query cache. */
export const COLUMN_TO_FIELD: Record<string, string> = Object.fromEntries(
  NOTIFY_ROLES.map(({ field, column }) => [column, field]),
);
