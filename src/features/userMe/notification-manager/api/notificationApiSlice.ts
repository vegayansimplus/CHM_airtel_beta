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

// UI model matches API shape exactly
export interface TransformedNotificationSetting extends ApiNotificationSetting {}

//  helper to decide "status"
const getStatus = (item: ApiNotificationSetting) =>
  item.notifyDomainHead ||
  item.notifyFunctionHead ||
  item.notifySubDomainHead ||
  item.notifySuperAdmin ||
  item.notifyTeamMember ||
  item.notifyVerticalHead;

export const notificationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationConfigs: builder.query<ApiNotificationSetting[], void>({
      query: () => "/notification-manager/show",
      // no transform needed — UI model matches API shape exactly
    }),
    updateNotification: builder.mutation<void, any>({
      query: (u) => ({
        url: `/notificationmanager/insertupdatenotificationmanager`,
        method: "POST",
        body: {
          configId: u.configId,
          subModuleCode: u.subModuleCode,
          actionCode: u.actionCode,
          moduleCode: u.moduleCode,
          notifyDomainHead: u.notifyDomainHead,
          notifyFunctionHead: u.notifyFunctionHead,
          notifySubDomainHead: u.notifySubDomainHead,
          notifySuperAdmin: u.notifySuperAdmin,
          notifyTeamMember: u.notifyTeamMember,
          notifyVerticalHead: u.notifyVerticalHead,
        },
      }),
    }),

    deleteNotification: builder.mutation<void, { moduleId: number }>({
      query: ({ moduleId }) => ({
        url: "/notificationmanager/deletenotificationmanager",
        method: "POST",
        body: { configId: moduleId },
      }),
    }),
  }),
});

export const {
  // useGetNotificationsQuery,
  useGetNotificationConfigsQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApiSlice;
