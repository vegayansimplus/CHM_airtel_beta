import { Paper, Stack, Button, Typography, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

interface Props {
  onRequestLeave: () => void;
  viewHistory: boolean;
  toggleHistory: () => void;
}

export default function LeaveActionPanel({
  onRequestLeave,
  viewHistory,
  toggleHistory,
}: Props) {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Quick Actions
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        <Button
          variant="contained"
          color="primary" // Changed to primary (error is usually for destructive actions)
          size="large"
          startIcon={<AddIcon />}
          onClick={onRequestLeave}
          sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
        >
          Request Leave
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          size="large"
          startIcon={viewHistory ? <PendingActionsIcon /> : <HistoryIcon />}
          onClick={toggleHistory}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          {viewHistory ? "View Pending Requests" : "View Leave History"}
        </Button>
      </Stack>
    </Paper>
  );
}
