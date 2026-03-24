import { Paper, Stack, Button, Typography, Divider, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

interface Props {
  onRequestLeave: () => void;
  // We added these to show useful stats to the user
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
}

export default function LeaveActionPanel({
  onRequestLeave,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
}: Props) {
  return (
    <Stack spacing={3}>
      {/* ACTION CARD */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={onRequestLeave}
          sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
        >
          Request Leave
        </Button>
      </Paper>

      {/* STATS CARD (Great UX addition) */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Leave Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {/* Pending Stat */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              color="warning.main"
            >
              <PendingActionsIcon fontSize="small" />
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                Pending Approvals
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {pendingCount}
            </Typography>
          </Box>

          {/* Approved Stat */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              color="success.main"
            >
              <CheckCircleOutlineIcon fontSize="small" />
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                Approved Leaves
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {approvedCount}
            </Typography>
          </Box>

          {/* Rejected Stat */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1} color="error.main">
              <CancelOutlinedIcon fontSize="small" />
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                Rejected Leaves
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {rejectedCount}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

// import { Paper, Stack, Button, Typography, Divider } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import HistoryIcon from "@mui/icons-material/History";
// import PendingActionsIcon from "@mui/icons-material/PendingActions";

// interface Props {
//   onRequestLeave: () => void;
//   viewHistory: boolean;
//   toggleHistory: () => void;
// }

// export default function LeaveActionPanel({
//   onRequestLeave,
//   viewHistory,
//   toggleHistory,
// }: Props) {
//   return (
//     <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
//       <Typography variant="h6" fontWeight={600} mb={2}>
//         Quick Actions
//       </Typography>
//       <Divider sx={{ mb: 3 }} />

//       <Stack spacing={2}>
//         <Button
//           variant="contained"
//           color="primary" // Changed to primary (error is usually for destructive actions)
//           size="large"
//           startIcon={<AddIcon />}
//           onClick={onRequestLeave}
//           sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
//         >
//           Request Leave
//         </Button>

//         <Button
//           variant="outlined"
//           color="inherit"
//           size="large"
//           startIcon={viewHistory ? <PendingActionsIcon /> : <HistoryIcon />}
//           onClick={toggleHistory}
//           sx={{ py: 1.5, borderRadius: 2 }}
//         >
//           {viewHistory ? "View Pending Requests" : "View Leave History"}
//         </Button>
//       </Stack>
//     </Paper>
//   );
// }
