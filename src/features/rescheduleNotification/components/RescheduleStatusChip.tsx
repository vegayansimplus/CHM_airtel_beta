import { Box, Chip } from "@mui/material";
import type { ActionStatus, ReadStatus } from "../types/rescheduleNotification.types";
import { ACCENT, ACTION_STATUS_STYLES } from "../constants/rescheduleNotification.styles";

export function ActionStatusChip({ status }: { status: ActionStatus }) {
  const s = ACTION_STATUS_STYLES[status];
  return (
    <Chip
      size="small"
      label={s.label}
      sx={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 800,
        borderRadius: "6px",
        border: `1.5px solid ${s.ring}`,
        height: "auto",
        "& .MuiChip-label": { px: "9px", py: "3px" },
      }}
    />
  );
}

export function ReadStatusIndicator({ status }: { status: ReadStatus }) {
  if (status === "READ") return null;
  return (
    <Box
      component="span"
      aria-label="Unread notification"
      title="Unread"
      sx={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: ACCENT,
        boxShadow: `0 0 0 3px ${ACCENT}25`,
        flexShrink: 0,
      }}
    />
  );
}
