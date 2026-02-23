import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { Task } from "../types/dashboard.types";
import StatusChip from "./ui/StatusChip";
// import StatusChip from "./StatusChip";

interface Props {
  task: Task;
}

const TaskItem = ({ task }: Props) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (task.status) {
      case "Pending":
        return theme.palette.warning.main;
      case "Tomorrow":
        return theme.palette.info.main;
      case "Completed":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const statusColor = getStatusColor();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${alpha(statusColor, 0.25)}`,
        background: alpha(statusColor, 0.05),
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: alpha(statusColor, 0.2),
            color: statusColor,
            fontWeight: 600,
          }}
        >
          {task.assignee.charAt(0)}
        </Avatar>

        {/* Task Info */}
        <Box flex={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={600}>
              {task.title}
            </Typography>

            <StatusChip label={task.status} />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mt={0.5}
          >
            <AccessTimeIcon
              sx={{ fontSize: 16, color: "text.secondary" }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {task.time}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              • {task.assignee}
            </Typography>
          </Stack>

          {/* Optional Progress */}
          {task.status !== "Completed" && (
            <LinearProgress
              variant="determinate"
              value={task.status === "Pending" ? 40 : 70}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 5,
                backgroundColor: alpha(statusColor, 0.15),
                "& .MuiLinearProgress-bar": {
                  backgroundColor: statusColor,
                },
              }}
            />
          )}
        </Box>

        {/* Action Buttons */}
        <Stack spacing={1}>
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton size="small">
            <CheckCircleOutlineIcon
              fontSize="small"
              sx={{ color: statusColor }}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TaskItem;
