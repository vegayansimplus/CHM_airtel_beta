import { Box, Stack, TablePagination, useMediaQuery, useTheme } from "@mui/material";
import type { RescheduleNotification } from "../types/rescheduleNotification.types";
import { RescheduleNotificationTable } from "./RescheduleNotificationTable";
import { RescheduleNotificationCard } from "./RescheduleNotificationCard";
import { RescheduleNotificationEmptyState } from "./RescheduleNotificationEmptyState";
import { PAGE_SIZE_OPTIONS } from "../constants/rescheduleNotification.constants";

interface RescheduleNotificationListProps {
  notifications: readonly RescheduleNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onMarkAsRead: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RescheduleNotificationList({
  notifications,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasActiveFilters,
  onResetFilters,
  onMarkAsRead,
  onApprove,
  onReject,
}: RescheduleNotificationListProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  if (notifications.length === 0) {
    return (
      <RescheduleNotificationEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {isCompact ? (
        <Stack spacing={1.25}>
          {notifications.map((notification) => (
            <RescheduleNotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ overflowX: "auto", borderRadius: "12px", border: "1.5px solid #f1f5f9" }}>
          <RescheduleNotificationTable
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onApprove={onApprove}
            onReject={onReject}
          />
        </Box>
      )}

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        sx={{
          borderTop: "1px solid #f1f5f9",
          "& .MuiTablePagination-toolbar": { minHeight: 44, px: 0 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: 11.5,
            color: "#94a3b8",
            fontWeight: 600,
          },
        }}
      />
    </Stack>
  );
}
