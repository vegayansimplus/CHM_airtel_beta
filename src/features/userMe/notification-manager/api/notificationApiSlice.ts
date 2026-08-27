import { api } from "../../../../service/api";
import { COLUMN_TO_FIELD } from "../constants/notifyRoles";

export interface ApiNotificationSetting {
  actionCode: string;
  configId: number;
  moduleCode: string;
  notifyDomainHead: boolean;
  notifyFunctionHead: boolean;
  notifySubDomainHead: boolean;
  notifySuperAdmin: boolean;
  notifyTeamMember: boolean;
  notifyVerticalHead: boolean;
<<<<<<< Updated upstream
  subModuleCode: string;
=======
>>>>>>> Stashed changes
  isActive: boolean;
}

// UI model matches the API shape exactly
export type TransformedNotificationSetting = ApiNotificationSetting;

<<<<<<< Updated upstream
/** The boolean columns the generic single-column update endpoint can touch. */
export type NotificationBooleanField = {
  [K in keyof ApiNotificationSetting]: ApiNotificationSetting[K] extends boolean
    ? K
    : never;
}[keyof ApiNotificationSetting];

export type NewNotificationInput = Omit<ApiNotificationSetting, "configId">;

// sp_update_notification_manager builds `SET <columnName> = ?` via raw SQL
// concatenation (no parameter binding for the column name itself), so this
// conversion must only ever be fed one of our own known boolean field names
// — never user-supplied text — to stay safe.
const toDbColumn = (field: string): string =>
  field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
=======
/** Payload for creating a new rule (server assigns configId and is_active=1). */
export type NewNotificationSetting = Omit<ApiNotificationSetting, "configId" | "isActive">;
>>>>>>> Stashed changes

export const notificationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationConfigs: builder.query<ApiNotificationSetting[], void>({
      query: () => "/notification-manager/show",
      providesTags: ["NotificationConfig"],
    }),

<<<<<<< Updated upstream
    createNotification: builder.mutation<void, NewNotificationInput>({
      query: (body) => ({
        url: "/notification-manager/add",
=======
    createNotification: builder.mutation<void, NewNotificationSetting>({
      query: (body) => ({
        url: "/notification-manager/create",
>>>>>>> Stashed changes
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationConfig"],
    }),

<<<<<<< Updated upstream
    // Single-column toggle (per-role recipients, or the master isActive
    // switch). Patched optimistically so switches flip instantly; rolled
    // back on failure.
    updateNotificationField: builder.mutation<
      void,
      { configId: number; field: NotificationBooleanField; value: boolean }
    >({
      query: ({ configId, field, value }) => ({
        url: "/notification-manager/update",
        method: "PATCH",
        params: {
          configId,
          columnName: toDbColumn(field),
          newValue: value,
        },
      }),
      async onQueryStarted(
        { configId, field, value },
        { dispatch, queryFulfilled },
      ) {
=======
    // Generic single-column update (mirrors sp_update_notification_manager,
    // which patches exactly one column per call). Used both by the inline
    // per-role switches and the edit dialog's Save (one call per changed
    // field). Patches the cache optimistically so switches flip instantly.
    updateNotificationField: builder.mutation<
      void,
      { configId: number; column: string; value: boolean }
    >({
      query: ({ configId, column, value }) => ({
        url: "/notification-manager/update",
        method: "PATCH",
        params: { configId, columnName: column, newValue: value },
      }),
      async onQueryStarted(
        { configId, column, value },
        { dispatch, queryFulfilled },
      ) {
        const field = COLUMN_TO_FIELD[column] ?? column;
>>>>>>> Stashed changes
        const patch = dispatch(
          notificationApiSlice.util.updateQueryData(
            "getNotificationConfigs",
            undefined,
            (draft) => {
              const row = draft.find((r) => r.configId === configId);
<<<<<<< Updated upstream
              if (row) row[field] = value;
=======
              if (row) (row as Record<string, unknown>)[field] = value;
>>>>>>> Stashed changes
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    deleteNotification: builder.mutation<void, { configId: number }>({
      query: ({ configId }) => ({
        url: `/notification-manager/delete/${configId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ configId }, { dispatch, queryFulfilled }) {
        // sp_delete_notification_manager is a soft delete (is_active=0), so
        // the row stays in the cache and reappears under the Inactive filter
        // rather than vanishing outright.
        const patch = dispatch(
          notificationApiSlice.util.updateQueryData(
            "getNotificationConfigs",
            undefined,
            (draft) => {
              const row = draft.find((r) => r.configId === configId);
              if (row) row.isActive = false;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationConfigsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationFieldMutation,
  useDeleteNotificationMutation,
} = notificationApiSlice;
