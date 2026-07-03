import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import type {
  ActionStatusFilter,
  ReadStatusFilter,
  RescheduleSummaryCounts,
} from "../types/rescheduleNotification.types";
import { CARD_BORDER, SUMMARY_TILE_ACCENTS } from "../constants/rescheduleNotification.styles";

interface SummaryTileConfig {
  key: string;
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
}

interface RescheduleNotificationSummaryProps {
  counts: RescheduleSummaryCounts;
  readFilter: ReadStatusFilter;
  actionFilter: ActionStatusFilter;
  onSelectAll: () => void;
  onSelectUnread: () => void;
  onSelectPending: () => void;
  onSelectApproved: () => void;
  onSelectRejected: () => void;
}

export function RescheduleNotificationSummary({
  counts,
  readFilter,
  actionFilter,
  onSelectAll,
  onSelectUnread,
  onSelectPending,
  onSelectApproved,
  onSelectRejected,
}: RescheduleNotificationSummaryProps) {
  const isAllActive = readFilter === "ALL" && actionFilter === "ALL";

  const tiles: SummaryTileConfig[] = [
    {
      key: "total",
      label: "Total Requests",
      value: counts.total,
      isActive: isAllActive,
      onClick: onSelectAll,
      icon: <InboxIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: "unread",
      label: "Unread",
      value: counts.unread,
      isActive: readFilter === "UNREAD",
      onClick: onSelectUnread,
      icon: <MarkEmailUnreadIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: "pending",
      label: "Pending",
      value: counts.pending,
      isActive: actionFilter === "PENDING",
      onClick: onSelectPending,
      icon: <HourglassTopIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: "approved",
      label: "Approved",
      value: counts.approved,
      isActive: actionFilter === "APPROVED",
      onClick: onSelectApproved,
      icon: <TaskAltIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: "rejected",
      label: "Rejected",
      value: counts.rejected,
      isActive: actionFilter === "REJECTED",
      onClick: onSelectRejected,
      icon: <HighlightOffIcon sx={{ fontSize: 15 }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
        gap: "10px",
      }}
    >
      {tiles.map((tile) => {
        const accent = SUMMARY_TILE_ACCENTS[tile.key];
        return (
          <Box
            key={tile.key}
            onClick={tile.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") tile.onClick();
            }}
            aria-pressed={tile.isActive}
            sx={{
              position: "relative",
              cursor: "pointer",
              borderRadius: "12px",
              border: CARD_BORDER,
              borderColor: tile.isActive ? accent.color : undefined,
              background: tile.isActive ? accent.light : "#fff",
              p: "11px 12px",
              transition: "box-shadow .2s, border-color .2s, transform .2s",
              "&:hover": {
                boxShadow: "0 8px 22px rgba(60,60,140,.10)",
                borderColor: accent.color,
                transform: "translateY(-2px)",
              },
              "&:focus-visible": { outline: `2px solid ${accent.color}`, outlineOffset: 1 },
            }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "8px",
                background: accent.light,
                color: accent.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: "8px",
              }}
            >
              {tile.icon}
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#1e1b4b", lineHeight: 1, letterSpacing: "-0.5px" }}>
              {tile.value}
            </Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", mt: "4px", letterSpacing: ".3px", textTransform: "uppercase" }}>
              {tile.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
