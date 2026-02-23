import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import DoneIcon from "@mui/icons-material/Done";
import type { NotificationItemType } from "../../orgHierarchy/api/notification.mock";
// import { NotificationItemType } from "../api/dashboard.mock";

interface Props {
  notification: NotificationItemType;
  onRead: (id: string) => void;
}

const NotificationItem = ({ notification, onRead }: Props) => {
  const theme = useTheme();

  const getTypeData = () => {
    switch (notification.type) {
      case "success":
        return {
          color: theme.palette.success.main,
          icon: <CheckCircleIcon />,
        };
      case "error":
        return {
          color: theme.palette.error.main,
          icon: <ErrorIcon />,
        };
      case "warning":
        return {
          color: theme.palette.warning.main,
          icon: <WarningIcon />,
        };
      default:
        return {
          color: theme.palette.info.main,
          icon: <InfoIcon />,
        };
    }
  };

  const { color, icon } = getTypeData();

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.2)}`,
        background: notification.isRead
          ? "background.paper"
          : alpha(color, 0.07),
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: alpha(color, 0.15),
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box flex={1}>
          <Typography
            fontWeight={notification.isRead ? 500 : 700}
          >
            {notification.message}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {notification.time}
          </Typography>

          <Stack direction="row" spacing={1} mt={1}>
            {!notification.isRead && (
              <Button
                size="small"
                startIcon={<DoneIcon />}
                onClick={() => onRead(notification.id)}
              >
                Mark as Read
              </Button>
            )}

            <Button size="small" variant="outlined">
              Take Action
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default NotificationItem;
