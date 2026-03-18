import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  useTheme,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  InputAdornment,
  TextField,
  Tabs,
  Tab,
  Avatar,
  Button,
  IconButton,
  LinearProgress,
  useMediaQuery,
  alpha,
  Divider,
} from "@mui/material";

// Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// API and Types
import { useGetUnreadNotificationsQuery, type NotificationItem, type NotificationPayload } from "../api/inboxApiSlice";

// ==========================================
// 1. COMMON CONTAINER (Your Wrapper)
// ==========================================
export const CommonContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        maxWidth: "100%",
        overflow: "hidden",
        height: {
          xs: "calc(100vh - 50px)",
          sm: "calc(100vh - 50px)",
          md: "calc(100vh - 40px)",
          lg: "calc(100vh - 60px)",
          xl: "calc(100vh - 100px)",
        },
        minHeight: "500px",
        p: { sm: "12px" },
        bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f7f9fa",
      }}
    >
      {children}
    </Box>
  );
};

// ==========================================
// 2. POLYMORPHIC TYPESCRIPT INTERFACES
// ==========================================
// Shared base properties every notification has
interface BaseItem {
  id: string;
  shortTitle: string;
  time: string;
  date: string;
  isUnread: boolean;
  priorityTag: string;
  status:
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Approved"
    | "Rejected"
    | "Read";
}

// 1. IT Task (CRQ)
export interface TaskItem extends BaseItem {
  type: "TASK";
  crqId: string;
  fullTitle: string;
  description: string;
  assignee: string;
  fullId: string;
  details: string;
}

// 2. HR / Rostering Leave Request
export interface LeaveItem extends BaseItem {
  type: "LEAVE";
  applicantName: string;
  leaveType: "Sick Leave" | "Annual Leave" | "Unpaid";
  startDate: string;
  endDate: string;
  reason: string;
}

// 3. Simple System Alert
export interface AlertItem extends BaseItem {
  type: "ALERT";
  systemName: string;
  message: string;
}

// This union type tells TS an item can be ANY of the above
export type InboxItem = TaskItem | LeaveItem | AlertItem;

// ==========================================
// 3. API DATA TRANSFORMATION
// ==========================================
const transformNotificationToInboxItem = (notification: NotificationItem, index: number): AlertItem => {
  const parsedPayload: NotificationPayload = JSON.parse(notification.payload);
  const createdDate = new Date(notification.createdAt);
  const time = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = createdDate.toLocaleDateString();

  return {
    id: `${notification.createdAt}-${index}`, // Unique ID
    type: "ALERT",
    shortTitle: parsedPayload.subject || "Notification",
    time,
    date,
    isUnread: notification.readFlag === "false",
    priorityTag: notification.isActionable === "true" ? "ACTION REQUIRED" : "INFO",
    status: notification.requestStatus === "PENDING" ? "Pending" : "Read",
    systemName: "CHM System",
    message: parsedPayload.body,
  };
};

// ==========================================
// 4. DYNAMIC RENDERERS (The Secret Sauce)
// ==========================================

// A. Renders the specific middle-pane list view text based on type
const getListText = (item: InboxItem) => {
  switch (item.type) {
    case "TASK":
      return {
        title: `${item.crqId} - ${item.shortTitle}`,
        sub: item.description,
        bottom: `Assignee: ${item.assignee}`,
      };
    case "LEAVE":
      return {
        title: `${item.applicantName} - ${item.leaveType}`,
        sub: `From: ${item.startDate} To: ${item.endDate}`,
        bottom: "Rostering Request",
      };
    case "ALERT":
      return {
        title: item.shortTitle,
        sub: item.message.substring(0, 40) + "...",
        bottom: `System: ${item.systemName}`,
      };
  }
};

// B. Renders the body text inside the detail pane
const DetailBodyRenderer = ({ item }: { item: InboxItem }) => {
  if (item.type === "TASK") {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Request Details
        </Typography>
        <Box sx={{ bgcolor: "background.default", borderRadius: 3, p: 3 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {item.details}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (item.type === "LEAVE") {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Leave Application
        </Typography>
        <Box
          sx={{
            bgcolor: "background.default",
            borderRadius: 3,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Applicant
            </Typography>
            <Typography fontWeight="500">{item.applicantName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dates
            </Typography>
            <Typography fontWeight="500">
              {item.startDate} to {item.endDate}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Reason
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.reason}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (item.type === "ALERT") {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          System Log
        </Typography>
        <Box sx={{ bgcolor: "background.default", borderRadius: 3, p: 3 }}>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontFamily: "monospace" }}
          >
            {item.message}
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

// C. Renders completely different footer buttons based on type
const ActionFooterRenderer = ({
  item,
  theme,
}: {
  item: InboxItem;
  theme: any;
}) => {
  if (item.type === "TASK") {
    return (
      <Button
        variant="contained"
        disableElevation
        startIcon={<CheckCircleOutlineIcon />}
        sx={{ flex: 1, py: 1.5 }}
      >
        Acknowledge Task
      </Button>
    );
  }

  if (item.type === "LEAVE") {
    return (
      <>
        <Button
          variant="contained"
          color="success"
          disableElevation
          startIcon={<CheckCircleOutlineIcon />}
          sx={{ flex: 1, py: 1.5 }}
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelOutlinedIcon />}
          sx={{ flex: 1, py: 1.5 }}
        >
          Reject
        </Button>
      </>
    );
  }

  if (item.type === "ALERT") {
    if (item.priorityTag === "ACTION REQUIRED") {
      return (
        <>
          <Button
            variant="contained"
            color="success"
            disableElevation
            startIcon={<CheckCircleOutlineIcon />}
            sx={{ flex: 1, py: 1.5 }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelOutlinedIcon />}
            sx={{ flex: 1, py: 1.5 }}
          >
            Reject
          </Button>
        </>
      );
    } else {
      return (
        <Button variant="outlined" sx={{ flex: 1, py: 1.5 }}>
          Mark as Read & Dismiss
        </Button>
      );
    }
  }
  return null;
};

// ==========================================
// 5. MAIN PARENT COMPONENT
// ==========================================
export default function TaskInbox() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch data from API
  const { data: notifications, isLoading } = useGetUnreadNotificationsQuery({ readFlag: 0 });

  // Transform API data to InboxItem[]
  const inboxData: InboxItem[] = useMemo(() => {
    if (!notifications) return [];
    return notifications.map(transformNotificationToInboxItem);
  }, [notifications]);

  // Which sidebar menu is active? Default to NOTIFICATIONS since we're using notifications API
  const [activeMenu, setActiveMenu] = useState<"TASKS" | "ROSTERING" | "NOTIFICATIONS">("NOTIFICATIONS");

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Filter data based on sidebar selection (only NOTIFICATIONS will have data)
  const filteredTasks = useMemo(() => {
    switch (activeMenu) {
      case "NOTIFICATIONS":
        return inboxData.filter((item) => item.type === "ALERT");
      default:
        return [];
    }
  }, [activeMenu, inboxData]);

  // Auto-select first item when changing tabs on desktop
  useEffect(() => {
    if (!isMobile && filteredTasks.length > 0) {
      setSelectedItemId(filteredTasks[0].id);
    } else {
      setSelectedItemId(null);
    }
  }, [activeMenu, isMobile, filteredTasks]);

  const activeItem = useMemo(
    () => filteredTasks.find((t) => t.id === selectedItemId) || null,
    [filteredTasks, selectedItemId],
  );

  return (
    <CommonContainer>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          bgcolor: "background.paper",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* --- LEFT SIDEBAR --- */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            width: 280,
            borderRight: `1px solid ${theme.palette.divider}`,
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", fontWeight: "bold" }}
            >
              ENTERPRISE MENU
              {/* {notifications.l} */}
            </Typography>
          </Box>
          <List sx={{ px: 2, flex: 1 }}>
            {[
              { id: "TASKS", text: "Pending Tasks", icon: <AccessTimeIcon /> },
              {
                id: "ROSTERING",
                text: "Rostering (Leave)",
                icon: <CalendarTodayIcon />,
              },
              {
                id: "NOTIFICATIONS",
                text: "System Alerts",
                icon: <NotificationsIcon />,
              },
            ].map((menu) => {
              const isActive = activeMenu === menu.id;
              return (
                <ListItem disablePadding key={menu.id} sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setActiveMenu(menu.id as any)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive ? "primary.main" : "text.secondary",
                      }}
                    >
                      {menu.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.text}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "primary.main" : "text.primary",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* --- MIDDLE LIST VIEW --- */}
        <Box
          sx={{
            display: { xs: selectedItemId ? "none" : "flex", md: "flex" },
            width: { xs: "100%", md: 380, lg: 420 },
            borderRight: `1px solid ${theme.palette.divider}`,
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              {activeMenu === "TASKS" && "Pending Tasks"}
              {activeMenu === "ROSTERING" && "Leave Requests"}
              {activeMenu === "NOTIFICATIONS" && "Alerts"}
            </Typography>
            <TextField
              fullWidth
              placeholder="Search..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{ flex: 1, overflowY: "auto", bgcolor: "background.default" }}
          >
            {isLoading && (
              <Box sx={{ p: 2 }}>
                <LinearProgress />
                <Typography sx={{ mt: 1, textAlign: "center" }}>Loading notifications...</Typography>
              </Box>
            )}
            {!isLoading && filteredTasks.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No items found.</Typography>
              </Box>
            )}
            {!isLoading && filteredTasks.map((item) => {
              const isSelected = item.id === selectedItemId;
              const listTexts = getListText(item);

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      isSelected && !isMobile
                        ? "background.paper"
                        : "transparent",
                    borderLeft:
                      isSelected && !isMobile
                        ? `4px solid ${theme.palette.primary.main}`
                        : "4px solid transparent",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color:
                          isSelected && !isMobile
                            ? "text.primary"
                            : "text.secondary",
                      }}
                    >
                      {listTexts.title}
                    </Typography>
                    {item.isUnread && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        isSelected && !isMobile
                          ? "primary.main"
                          : "text.secondary",
                      mb: 1.5,
                    }}
                  >
                    {listTexts.sub}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {listTexts.bottom}
                    </Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* --- RIGHT DETAIL VIEW --- */}
        <Box
          sx={{
            display: { xs: selectedItemId ? "flex" : "none", md: "flex" },
            flex: 1,
            flexDirection: "column",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {!activeItem ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                Select an item to view details
              </Typography>
            </Box>
          ) : (
            <>
              {/* Detail Header */}
              <Box
                sx={{
                  p: { xs: 2.5, md: 4 },
                  pb: { xs: 2, md: 3 },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedItemId(null)}
                      sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Chip
                      label={activeItem.priorityTag}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    />
                  </Box>
                  <IconButton size="small">
                    <MoreHorizIcon />
                  </IconButton>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {activeItem.type === "TASK"
                    ? activeItem.fullTitle
                    : activeItem.shortTitle}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <AccessTimeIcon sx={{ fontSize: 16 }} /> {activeItem.date},{" "}
                  {activeItem.time}
                </Typography>
              </Box>

              {/* Dynamic Body Component */}
              <Box sx={{ p: { xs: 2.5, md: 4 }, flex: 1, overflowY: "auto" }}>
                <DetailBodyRenderer item={activeItem} />
              </Box>

              {/* Dynamic Footer Actions */}
              <Box
                sx={{
                  p: 3,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <ActionFooterRenderer item={activeItem} theme={theme} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </CommonContainer>
  );
}
