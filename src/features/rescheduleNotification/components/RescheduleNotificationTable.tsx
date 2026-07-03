import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
} from "@mui/material";
import type { RescheduleNotification } from "../types/rescheduleNotification.types";
import { ActionStatusChip, ReadStatusIndicator } from "./RescheduleStatusChip";
import { RescheduleTimeComparison } from "./RescheduleTimeComparison";
import { RescheduleNotificationActions } from "./RescheduleNotificationActions";
import { ACCENT } from "../constants/rescheduleNotification.styles";

interface RescheduleNotificationTableProps {
  notifications: readonly RescheduleNotification[];
  onMarkAsRead: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const headCellSx = {
  fontSize: 10,
  fontWeight: 800,
  color: "#94a3b8",
  letterSpacing: ".4px",
  textTransform: "uppercase" as const,
  borderBottom: "1.5px solid #f1f5f9",
  background: "#fbfbff",
};

export function RescheduleNotificationTable({
  notifications,
  onMarkAsRead,
  onApprove,
  onReject,
}: RescheduleNotificationTableProps) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={headCellSx}>CRQ No.</TableCell>
          <TableCell sx={headCellSx}>Current → Rescheduled Execution Time</TableCell>
          <TableCell sx={headCellSx}>Status</TableCell>
          <TableCell sx={headCellSx} align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow
            key={notification.id}
            sx={{
              transition: "background .15s",
              "&:hover": { background: "#f8f9ff" },
              "& td": {
                borderBottom: "1px solid #f4f5fa",
                background: notification.readStatus === "UNREAD" ? "#f8f9ff" : "transparent",
              },
              "&:hover td": { background: "#f2f3ff" },
            }}
          >
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <ReadStatusIndicator status={notification.readStatus} />
                <Typography
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 12.5,
                    fontWeight: notification.readStatus === "UNREAD" ? 800 : 600,
                    color: notification.readStatus === "UNREAD" ? ACCENT : "#1e1b4b",
                  }}
                >
                  {notification.crqNo}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>
              <RescheduleTimeComparison
                currentExecutionTime={notification.currentExecutionTime}
                rescheduledExecutionTime={notification.rescheduledExecutionTime}
                variant="inline"
              />
            </TableCell>
            <TableCell>
              <Stack spacing={0.5} alignItems="flex-start">
                <ActionStatusChip status={notification.actionStatus} />
                {notification.actionStatus === "REJECTED" && notification.rejectionReason && (
                  <Typography sx={{ fontSize: 10, color: "#94a3b8", maxWidth: 220, display: "block" }}>
                    {notification.rejectionReason}
                  </Typography>
                )}
              </Stack>
            </TableCell>
            <TableCell align="right">
              <RescheduleNotificationActions
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onApprove={onApprove}
                onReject={onReject}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
