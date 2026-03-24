import { api } from "../../../../service/api";

export interface ApiNotificationSetting {
  moduleId: string;
  module: string;
  submodule: string;
  action: string;
  notificationStatus: "Enable" | "Disabled";
  self: "Yes" | "No";
  manager: "Yes" | "No";
  team: "Yes" | "No";
}

export interface AddNotificationPayload {
  module: string;
  subModule: string;
  action: string;
  notificationStatus: "Enable" | "Disabled";
  self: "Yes" | "No";
  manager: "Yes" | "No";
  team: "Yes" | "No";
}

export interface TransformedNotificationSetting {
  moduleId: string;
  module: string;
  submodule: string;
  action: string;
  status: boolean;
  self: boolean;
  manager: boolean;
  team: boolean;
}

export const notificationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<TransformedNotificationSetting[], void>({
      query: () => "/notificationmanager/shownotificationmanager",
      transformResponse: (rawResult: ApiNotificationSetting[]) =>
        rawResult.map((item) => ({
          ...item,
          status: item.notificationStatus === "Enable",
          self: item.self === "Yes",
          manager: item.manager === "Yes",
          team: item.team === "Yes",
        })),
    //   providesTags: ["NotificationManagerControl"],
    }),

    updateNotification: builder.mutation<void, any>({
      query: (u) => ({
        url: `/notificationmanager/insertupdatenotificationmanager`,
        method: "POST",
        params: {
          moduleId: u.moduleId,
          module: u.module,
          subModule: u.subModule,
          action: u.action,
          notificationStatus: u.notificationStatus,
          self: u.self,
          manager: u.manager,
          team: u.team,
        },
      }),
    //   invalidatesTags: ["NotificationManagerControl"],
    }),

    addNotification: builder.mutation<void, AddNotificationPayload>({
      query: (n) => ({
        url: `/notificationmanager/insertupdatenotificationmanager`,
        method: "POST",
        params: n,
      }),
    //   invalidatesTags: ["NotificationManagerControl"],
    }),

    deleteNotification: builder.mutation<void, { moduleId: string }>({
      query: ({ moduleId }) => ({
        url: "/notificationmanager/deletenotificationmanager",
        method: "POST",
        params: { moduleId },
      }),
    //   invalidatesTags: ["NotificationManagerControl"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useAddNotificationMutation,
} = notificationApiSlice;
