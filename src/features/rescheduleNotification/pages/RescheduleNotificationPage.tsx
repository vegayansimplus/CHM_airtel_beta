import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { toast } from "react-toastify";
import { useRescheduleNotifications } from "../hooks/useRescheduleNotifications";
import { RescheduleNotificationSummary } from "../components/RescheduleNotificationSummary";
import { RescheduleNotificationToolbar } from "../components/RescheduleNotificationToolbar";
import { RescheduleNotificationList } from "../components/RescheduleNotificationList";
import { ApproveRescheduleDialog } from "../components/ApproveRescheduleDialog";
import { RejectRescheduleDialog } from "../components/RejectRescheduleDialog";
import type { RescheduleNotification } from "../types/rescheduleNotification.types";
import { ACCENT, CARD_BORDER, CARD_SHADOW } from "../constants/rescheduleNotification.styles";

export function RescheduleNotificationPage() {
  const {
    notifications,
    totalCount,
    summaryCounts,
    search,
    setSearch,
    readFilter,
    setReadFilter,
    actionFilter,
    setActionFilter,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    markAsRead,
    approve,
    reject,
    resetFilters,
    filterByUnread,
    filterByAction,
    filterAll,
  } = useRescheduleNotifications();

  const [approveTarget, setApproveTarget] = useState<RescheduleNotification | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RescheduleNotification | null>(null);

  const hasActiveFilters =
    search.trim().length > 0 || readFilter !== "ALL" || actionFilter !== "ALL";

  const handleApproveConfirm = (id: string) => {
    approve(id);
    setApproveTarget(null);
    toast.success("Reschedule request approved successfully");
  };

  const handleRejectConfirm = (id: string, reason: string) => {
    reject(id, reason);
    setRejectTarget(null);
    toast.success("Reschedule request rejected successfully");
  };

  return (
    <Box
      sx={{
        p: { xs: "14px", md: "16px" },
        border: CARD_BORDER,
        borderRadius: "16px",
        boxShadow: CARD_SHADOW,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        minWidth: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={"12px"} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: `linear-gradient(135deg,${ACCENT},#8b5cf6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,.35)",
              flexShrink: 0,
            }}
          >
            <EventRepeatIcon sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>
              Reschedule Notifications
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "#94a3b8", mt: "1px", fontWeight: 500 }}>
              Review and act on CRQ execution reschedule requests
            </Typography>
          </Box>
        </Stack>
        {summaryCounts.pending > 0 && (
          <Chip
            label={`${summaryCounts.pending} awaiting action`}
            size="small"
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: "#ea580c",
              background: "#fff7ed",
              border: "1.5px solid #fed7aa",
              borderRadius: "20px",
              height: "auto",
              "& .MuiChip-label": { px: "9px", py: "3px" },
            }}
          />
        )}
      </Stack>

      <RescheduleNotificationSummary
        counts={summaryCounts}
        readFilter={readFilter}
        actionFilter={actionFilter}
        onSelectAll={filterAll}
        onSelectUnread={filterByUnread}
        onSelectPending={() => filterByAction("PENDING")}
        onSelectApproved={() => filterByAction("APPROVED")}
        onSelectRejected={() => filterByAction("REJECTED")}
      />

      <RescheduleNotificationToolbar
        search={search}
        onSearchChange={setSearch}
        readFilter={readFilter}
        onReadFilterChange={setReadFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        sort={sort}
        onSortChange={setSort}
        onReset={resetFilters}
      />

      <RescheduleNotificationList
        notifications={notifications}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onMarkAsRead={markAsRead}
        onApprove={(id) => {
          const target = notifications.find((n) => n.id === id) ?? null;
          setApproveTarget(target);
        }}
        onReject={(id) => {
          const target = notifications.find((n) => n.id === id) ?? null;
          setRejectTarget(target);
        }}
      />

      <ApproveRescheduleDialog
        notification={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />
      <RejectRescheduleDialog
        notification={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
    </Box>
  );
}
