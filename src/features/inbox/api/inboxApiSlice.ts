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
  notificationId: number;
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
    getUnreadNotifications: builder.query<
      NotificationItem[],
      { readFlag: number }
    >({
      query: ({ readFlag }) => `/notification/unread?readFlag=${readFlag}`,
    }),

    getUnreadNotificationCount: builder.query<
      { notificationCount: number },
      void
    >({
      query: () => `/notification/notificationcount?readFlag=0`,
    }),

      managerShiftSwapAction: builder.mutation<any, { notificationId: number; status: string; reason?: string }>({
      query: ({ notificationId, status, reason }) => ({
        url: `/notification/swapreqmanageraction?notificationId=${notificationId}&status=${status}&shiftSwapRejectReason=${encodeURIComponent(reason || '')}`,
        method: "POST",
      }),
      // invalidatesTags: ['Notifications'], // Refreshes the inbox automatically
    }),
    employeeShiftSwapAction: builder.mutation<
      any,
      { notificationId: number; status: string; reason?: string }
    >({
      query: ({ notificationId, status, reason }) => ({
        url: `/notification/swapreqempaction?notificationId=${notificationId}&status=${status}&rejectReason=${encodeURIComponent(reason || "")}`,
        method: "POST",
      }),
      // invalidatesTags: ['Notifications'],
    }),

    // --- NEW: GENERIC ACKNOWLEDGE (READ) API ---
    acknowledgeNotification: builder.mutation<any, { notificationId: number }>({
      query: ({ notificationId }) => ({
        url: `/notification/acknowledge?notificationId=${notificationId}`, // Update with your actual ACK API
        method: "POST",
      }),
      // invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetUnreadNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useEmployeeShiftSwapActionMutation,
  useAcknowledgeNotificationMutation,
  useManagerShiftSwapActionMutation,
} = inboxApiSlice;
