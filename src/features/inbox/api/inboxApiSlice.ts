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
  notificationId: string;
  createdAt: string;
  isActionable: string;
  payload: string;
  readFlag: string;
  requestStatus: string;
  senderUserId: number | null;
  subModule: string | null;
  subject: string | null;
}

export interface NotificationCountResponse {
  notificationCount: number;
export const inboxApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    }),

    getUnreadNotificationCount: builder.query<NotificationCountResponse, void>({
      query: () => `/notification/notificationcount?readFlag=0`,
      providesTags: ["NotificationCount"],
      query: ({ readFlag }) => `/notification/unread?readFlag=${readFlag}`,
    }),
  }),
});

export const {
  useGetUnreadNotificationsQuery,
  useGetUnreadNotificationCountQuery,
} = inboxApiSlice;
export const { useGetUnreadNotificationsQuery } = inboxApiSlice;
