import { Button, Stack, Tooltip, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { RescheduleNotification } from "../types/rescheduleNotification.types";
import { ACCENT } from "../constants/rescheduleNotification.styles";

interface RescheduleNotificationActionsProps {
  notification: RescheduleNotification;
  onMarkAsRead: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const pillButtonSx = {
  minWidth: 0,
  whiteSpace: "nowrap" as const,
  fontSize: 11,
  fontWeight: 700,
  borderRadius: "8px",
  textTransform: "none" as const,
  px: "10px",
  py: "3px",
};

export function RescheduleNotificationActions({
  notification,
  onMarkAsRead,
  onApprove,
  onReject,
}: RescheduleNotificationActionsProps) {
  const isDecided = notification.actionStatus !== "PENDING";

  if (isDecided) {
    return (
      <Typography sx={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>
        No further action
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end">
      {notification.readStatus === "UNREAD" && (
        <Tooltip title="Mark as read" arrow>
          <Button
            size="small"
            variant="text"
            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
            onClick={() => onMarkAsRead(notification.id)}
            aria-label={`Mark ${notification.crqNo} as read`}
            sx={{ ...pillButtonSx, color: ACCENT, "&:hover": { background: "#eef2ff" } }}
          >
            Read
          </Button>
        </Tooltip>
      )}
      <Tooltip title="Approve reschedule request" arrow>
        <Button
          size="small"
          startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
          onClick={() => onApprove(notification.id)}
          aria-label={`Approve reschedule for ${notification.crqNo}`}
          sx={{
            ...pillButtonSx,
            color: "#059669",
            border: "1.5px solid #a7f3d0",
            background: "#ecfdf5",
            "&:hover": { background: "#d1fae5", borderColor: "#6ee7b7" },
          }}
        >
          Approve
        </Button>
      </Tooltip>
      <Tooltip title="Reject reschedule request" arrow>
        <Button
          size="small"
          startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
          onClick={() => onReject(notification.id)}
          aria-label={`Reject reschedule for ${notification.crqNo}`}
          sx={{
            ...pillButtonSx,
            color: "#dc2626",
            border: "1.5px solid #fecaca",
            background: "#fef2f2",
            "&:hover": { background: "#fee2e2", borderColor: "#fca5a5" },
          }}
        >
          Reject
        </Button>
      </Tooltip>
    </Stack>
  );
}
