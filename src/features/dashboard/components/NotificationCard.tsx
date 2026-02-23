import {
  Box,
  Stack,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { useState } from "react";
import {
  notifications as initialData,
  type NotificationItemType,
} from "../../orgHierarchy/api/dashboard.mock";
import SmartScrollContainer from "../../../components/common/SmartScrollContainer";
// import {
//   notifications as initialData,
//   NotificationItemType,
// } from "../api/dashboard.mock";

const CompactNotificationCard = () => {
  const theme = useTheme();
  const [data, setData] = useState<NotificationItemType[]>(initialData);

  const unreadCount = data.filter((n) => !n.isRead).length;

  const markRead = (id: string) => {
    setData((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon fontSize="small" color="success" />;
      case "error":
        return <ErrorIcon fontSize="small" color="error" />;
      case "warning":
        return <WarningIcon fontSize="small" color="warning" />;
      default:
        return <InfoIcon fontSize="small" color="info" />;
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: 1,
        width: "100%",
        // maxWidth: 360,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon fontSize="small" />
          </Badge>
          <Typography fontWeight={600} fontSize={14}>
            Notifications
          </Typography>
        </Stack>

        <Tooltip title="Mark all as read">
          <IconButton
            size="small"
            onClick={() =>
              setData((prev) => prev.map((n) => ({ ...n, isRead: true })))
            }
          >
            <DoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* Compact List */}
      <SmartScrollContainer height={200}>
        {data.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.2,
              m:0.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: item.isRead
                ? "transparent"
                : alpha(theme.palette.primary.main, 0.06),
              transition: "0.2s ease",
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {getTypeIcon(item.type)}

            <Box flex={1} minWidth={0}>
              <Typography
                fontSize={13}
                fontWeight={item.isRead ? 500 : 600}
                noWrap
              >
                {item.message}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={11}
              >
                {item.time}
              </Typography>
            </Box>

            {!item.isRead && (
              <Tooltip title="Mark as read">
                <IconButton size="small" onClick={() => markRead(item.id)}>
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <IconButton size="small">
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </SmartScrollContainer>
    </Box>
  );
};

export default CompactNotificationCard;

// import {
//   Stack,
//   Typography,
//   Button,
//   Box,
// } from "@mui/material";
// import { useState } from "react";
// // import SectionCard from "../../../components/common/SectionCard";
// import NotificationItem from "./NotificationItem";
// // import {
// //   notifications
// // //   NotificationItemType,
// // } from "../api/dashboard.mock";
// import { notifications, type NotificationItemType } from "../../orgHierarchy/api/notification.mock";
// import SectionCard from "./common/SectionCard";

// const NotificationCard = () => {
//   const [data, setData] =
//     useState<NotificationItemType[]>(notifications);

//   const handleMarkRead = (id: string) => {
//     setData((prev) =>
//       prev.map((n) =>
//         n.id === id ? { ...n, isRead: true } : n
//       )
//     );
//   };

//   const handleMarkAll = () => {
//     setData((prev) =>
//       prev.map((n) => ({ ...n, isRead: true }))
//     );
//   };

//   const unreadCount = data.filter(
//     (n) => !n.isRead
//   ).length;

//   return (
//     <SectionCard
//       title="Notifications"
//       action={
//         unreadCount > 0 && (
//           <Button size="small" onClick={handleMarkAll}>
//             Mark All as Read
//           </Button>
//         )
//       }
//     >
//       {data.length === 0 ? (
//         <Typography textAlign="center" py={3}>
//           No Notifications
//         </Typography>
//       ) : (
//         <Stack spacing={2} maxHeight={400} sx={{ overflowY: "auto" }}>
//           {data.map((item) => (
//             <NotificationItem
//               key={item.id}
//               notification={item}
//               onRead={handleMarkRead}
//             />
//           ))}
//         </Stack>
//       )}
//     </SectionCard>
//   );
// };

// export default NotificationCard;
