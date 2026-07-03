import { Box, Button, Stack, Typography } from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { ACCENT } from "../constants/rescheduleNotification.styles";

interface RescheduleNotificationEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function RescheduleNotificationEmptyState({
  hasActiveFilters,
  onResetFilters,
}: RescheduleNotificationEmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.25} sx={{ py: "40px", px: 2 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EventBusyIcon sx={{ fontSize: 26, color: ACCENT }} />
      </Box>
      <Typography sx={{ fontSize: 12.5, color: "#64748b", fontWeight: 700 }}>
        {hasActiveFilters ? "No reschedule requests match your filters" : "No reschedule requests"}
      </Typography>
      {hasActiveFilters && (
        <Button
          size="small"
          onClick={onResetFilters}
          sx={{ fontSize: 12, fontWeight: 700, textTransform: "none", color: ACCENT, "&:hover": { background: "#eef2ff" } }}
        >
          Reset filters
        </Button>
      )}
    </Stack>
  );
}
