import { api } from "../../../../service/api";

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
  subModuleCode: string;
}

// UI model matches the API shape exactly
export type TransformedNotificationSetting = ApiNotificationSetting;

export const notificationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationConfigs: builder.query<ApiNotificationSetting[], void>({
      query: () => "/notification-manager/show",
      providesTags: ["NotificationConfig"],
    }),

    // Upsert. configId > 0 edits an existing rule (patched optimistically
    // below so toggles flip instantly); configId 0 creates a new rule, and
    // only that case refetches the list to pick up the server-assigned id.
    updateNotification: builder.mutation<void, ApiNotificationSetting>({
      query: (body) => ({
        url: "/notificationmanager/insertupdatenotificationmanager",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) =>
        arg.configId ? [] : ["NotificationConfig"],
      async onQueryStarted(updated, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApiSlice.util.updateQueryData(
            "getNotificationConfigs",
            undefined,
            (draft) => {
              const row = draft.find((r) => r.configId === updated.configId);
              if (row) Object.assign(row, updated);
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
      query: (body) => ({
        url: "/notificationmanager/deletenotificationmanager",
        method: "POST",
        body,
      }),
      async onQueryStarted({ configId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApiSlice.util.updateQueryData(
            "getNotificationConfigs",
            undefined,
            (draft) => draft.filter((r) => r.configId !== configId),
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
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApiSlice;
