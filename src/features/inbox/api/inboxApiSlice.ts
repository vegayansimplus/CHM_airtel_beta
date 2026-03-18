import { api } from "../../../service/api";

export interface NotificationPayload {
  body: string;
  subject: string;
  entity_id: number;
  event_key: string;
  action_code: string;
  module_code: string;
  actor_user_id: number;
  recipient_type: string;
  sub_module_code: string;
}

export interface NotificationItem {
  createdAt: string;
  isActionable: string;
  payload: string;
  readFlag: string;
  requestStatus: string;
  senderUserId: number | null;
  subModule: string | null;
  subject: string | null;
}

export const inboxApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadNotifications: builder.query<NotificationItem[], { readFlag: number }>({
      query: ({ readFlag }) => `/notification/unread?readFlag=${readFlag}`,
    }),

    getUnreadNotificationCount: builder.query<{ notificationCount: number }[], void>({
      query: () => `/notification/notificationcount?readFlag=0`,
    }),
  }),


});

export const { useGetUnreadNotificationsQuery, useGetUnreadNotificationCountQuery } = inboxApiSlice;
