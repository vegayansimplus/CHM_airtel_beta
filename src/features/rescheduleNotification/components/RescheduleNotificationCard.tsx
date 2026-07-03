import { Box, Divider, Stack, Typography } from "@mui/material";
import type { RescheduleNotification } from "../types/rescheduleNotification.types";
import { ActionStatusChip, ReadStatusIndicator } from "./RescheduleStatusChip";
import { RescheduleTimeComparison } from "./RescheduleTimeComparison";
import { RescheduleNotificationActions } from "./RescheduleNotificationActions";
import { formatExecutionTime } from "../utils/rescheduleNotification.utils";
import { ACCENT, CARD_BORDER } from "../constants/rescheduleNotification.styles";

interface RescheduleNotificationCardProps {
  notification: RescheduleNotification;
  onMarkAsRead: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RescheduleNotificationCard({
  notification,
  onMarkAsRead,
  onApprove,
  onReject,
}: RescheduleNotificationCardProps) {
  const isUnread = notification.readStatus === "UNREAD";
  return (
    <Box
      sx={{
        p: "12px 14px",
        borderRadius: "12px",
        border: CARD_BORDER,
        borderLeft: "3px solid",
        borderLeftColor: isUnread ? ACCENT : "#e8edf6",
        background: isUnread ? "#f8f9ff" : "#fff",
        transition: "box-shadow .2s, transform .2s",
        "&:hover": { boxShadow: "0 6px 18px rgba(60,60,140,.09)", transform: "translateX(2px)" },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <ReadStatusIndicator status={notification.readStatus} />
            <Typography
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 12.5,
                fontWeight: isUnread ? 800 : 600,
                color: isUnread ? ACCENT : "#1e1b4b",
              }}
            >
              {notification.crqNo}
            </Typography>
          </Stack>
          <ActionStatusChip status={notification.actionStatus} />
        </Stack>

        <RescheduleTimeComparison
          currentExecutionTime={notification.currentExecutionTime}
          rescheduledExecutionTime={notification.rescheduledExecutionTime}
          variant="stacked"
        />

        {notification.actionStatus === "REJECTED" && notification.rejectionReason && (
          <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
            Reason: {notification.rejectionReason}
          </Typography>
        )}

        <Typography sx={{ fontSize: 10, color: "#cbd5e1" }}>
          Requested {formatExecutionTime(notification.requestedAt)}
        </Typography>

        <Divider sx={{ borderColor: "#f1f5f9" }} />

        <RescheduleNotificationActions
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onApprove={onApprove}
          onReject={onReject}
        />
      </Stack>
    </Box>
  );
}
