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

export interface CabRejectReason {
  reasonId: number;
  reasonText: string;
}

const notificationListTags = (result?: NotificationItem[]) =>
  result
    ? [
        ...result.map((n) => ({ type: "NotificationList" as const, id: n.notificationId })),
        { type: "NotificationList" as const, id: "LIST" },
      ]
    : [{ type: "NotificationList" as const, id: "LIST" }];

const notificationActionTags = [
  "NotificationCount" as const,
  { type: "NotificationList" as const, id: "LIST" },
];

export const inboxApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadNotifications: builder.query<
      NotificationItem[],
      { readFlag: number }
    >({
      query: ({ readFlag }) => `/notification/unread?readFlag=${readFlag}`,
      providesTags: notificationListTags,
    }),

    getUnreadNotificationCount: builder.query<
      { notificationCount: number },
      void
    >({
      query: () => `/notification/notificationcount?readFlag=0`,
      providesTags: ["NotificationCount"],
    }),

    // Generic mark-as-read for any notification (actionable or not).
    acknowledgeNotification: builder.mutation<any, { notificationId: number }>({
      query: ({ notificationId }) => ({
        url: `/notification/changedreadstatus?notificationId=${notificationId}`,
        method: "POST",
      }),
      invalidatesTags: notificationActionTags,
    }),

    // SHIFT_SWAP
    managerShiftSwapAction: builder.mutation<any, { notificationId: number; status: string; reason?: string }>({
      query: ({ notificationId, status, reason }) => ({
        url: `/notification/swapreqmanageraction?notificationId=${notificationId}&status=${status}&shiftSwapRejectReason=${encodeURIComponent(reason || "")}`,
        method: "POST",
      }),
      invalidatesTags: [...notificationActionTags, "RosterVIew"],
    }),
    employeeShiftSwapAction: builder.mutation<
      any,
      { notificationId: number; status: string; reason?: string }
    >({
      query: ({ notificationId, status, reason }) => ({
        url: `/notification/swapreqempaction?notificationId=${notificationId}&status=${status}&rejectReason=${encodeURIComponent(reason || "")}`,
        method: "POST",
      }),
      invalidatesTags: [...notificationActionTags, "RosterVIew"],
    }),

    // SHIFT_CHANGE (self-service shift change requests approved/rejected by a manager)
    shiftChangeNotificationAction: builder.mutation<
      any,
      { notificationId: number; status: string; rejectReason?: string }
    >({
      query: ({ notificationId, status, rejectReason }) => ({
        url: `/notification/shiftchangenotificationaction?notificationId=${notificationId}&status=${status}&rejectReason=${encodeURIComponent(rejectReason || "")}`,
        method: "POST",
      }),
      invalidatesTags: [...notificationActionTags, "RosterVIew"],
    }),

    // LEAVE
    rosterLeaveAction: builder.mutation<
      any,
      { notificationId: number; status: string; rejectReason?: string }
    >({
      query: ({ notificationId, status, rejectReason }) => ({
        url: `/notification/leave-requests/${notificationId}/status?notificationId=${notificationId}&status=${status}&rejectReason=${encodeURIComponent(rejectReason || "")}`,
        method: "PATCH",
      }),
      invalidatesTags: [...notificationActionTags, "Leave", "RosterVIew"],
    }),

    // CRQ CAB approvals
    cabCrqNotificationAction: builder.mutation<
      any,
      { notificationId: number; status: string; reason?: string; comment?: string }
    >({
      query: ({ notificationId, status, reason, comment }) => ({
        url: `/notification/cabcrqnotificationaction?notificationId=${notificationId}&status=${status}&reason=${encodeURIComponent(reason || "")}&comment=${encodeURIComponent(comment || "")}`,
        method: "POST",
      }),
      invalidatesTags: [...notificationActionTags, "CabCrq", "CabQueue", "CabDashboard"],
    }),
    getCabRejectReasons: builder.query<CabRejectReason[], void>({
      query: () => `/cab/crqs/cabrejectreasons`,
    }),

    // CAB reschedule requests (Requested_Start/End proposed by sp_reschedule_cab_crq)
    cabRescheduleNotificationAction: builder.mutation<
      any,
      { notificationId: number; status: string; reason?: string; comment?: string }
    >({
      query: ({ notificationId, status, reason, comment }) => ({
        url: `/notification/cabreschedulenotificationaction?notificationId=${notificationId}&status=${status}&reason=${encodeURIComponent(reason || "")}&comment=${encodeURIComponent(comment || "")}`,
        method: "POST",
      }),
      invalidatesTags: [...notificationActionTags, "CabCrq", "CabQueue", "CabDashboard"],
    }),
  }),
});

export const {
  useGetUnreadNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useEmployeeShiftSwapActionMutation,
  useAcknowledgeNotificationMutation,
  useManagerShiftSwapActionMutation,
  useShiftChangeNotificationActionMutation,
  useRosterLeaveActionMutation,
  useCabCrqNotificationActionMutation,
  useGetCabRejectReasonsQuery,
  useCabRescheduleNotificationActionMutation,
} = inboxApiSlice;
