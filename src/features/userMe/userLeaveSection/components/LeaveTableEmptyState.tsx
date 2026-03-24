import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

interface LeaveTableEmptyStateProps {
  message?: string;
}

export const LeaveTableEmptyState = ({
  message = "No leave records found",
}: LeaveTableEmptyStateProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={10}
    gap={1.5}
  >
    <InboxIcon sx={{ fontSize: 56, color: "text.disabled" }} />
    <Typography variant="h6" color="text.secondary" fontWeight={500}>
      {message}
    </Typography>
    <Typography variant="body2" color="text.disabled">
      Requests you apply for will appear here.
    </Typography>
  </Box>
);