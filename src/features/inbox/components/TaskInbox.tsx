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
  IconButton,
  LinearProgress,
  useMediaQuery,
  alpha,
  Stack,
  Button,
  Paper,
  Divider,
} from "@mui/material";

// Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// ------------------------------------------
// 1. MOCK API HOOK & TYPES (Replace with your actual import)
// ------------------------------------------
import {
  useGetUnreadNotificationsQuery,
  type NotificationItem,
  type NotificationPayload,
} from "../api/inboxApiSlice";

// ------------------------------------------
// 2. TYPES & INTERFACES
// ------------------------------------------
interface BaseItem {
  id: string;
  shortTitle: string;
  time: string;
  date: string;
  isUnread: boolean;
  priorityTag: string;
  status: "Pending" | "In Progress" | "Completed" | "Read";
}

export interface AlertItem extends BaseItem {
  type: "ALERT";
  systemName: string;
  message: string;
  isActionable: boolean;
}

export type InboxItem = AlertItem; // Expand to TaskItem | LeaveItem as needed

// ------------------------------------------
// 3. MAIN COMPONENT (State Management & Layout)
// ------------------------------------------
export default function TaskInbox() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeMenu, setActiveMenu] = useState<
    "TASKS" | "ROSTERING" | "NOTIFICATIONS"
  >("NOTIFICATIONS");
  const [filterTab, setFilterTab] = useState(0); // 0: All, 1: Unread, 2: Urgent
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // -- Data Fetching --
  const { data: notifications, isLoading } = useGetUnreadNotificationsQuery({
    readFlag: false,
  });

  // -- Data Transformation --
  const inboxData: InboxItem[] = useMemo(() => {
    if (!notifications) return [];
    return notifications.map((notification: any, index: number) => {
      const parsedPayload = JSON.parse(notification.payload || "{}");
      const createdDate = new Date(notification.createdAt);

      return {
        id: `${notification.createdAt}-${index}`,
        type: "ALERT",
        // Note: subject is usually at the root of the API response
        shortTitle:
          notification.subject ||
          parsedPayload.subject ||
          "System Notification",
        time: createdDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: createdDate.toLocaleDateString(),
        isUnread: notification.readFlag === "false",
        isActionable: notification.isActionable === "true",
        priorityTag:
          notification.isActionable === "true"
            ? "High Priority"
            : "Standard Log",
        status: notification.requestStatus === "PENDING" ? "Pending" : "Read",
        systemName: "CHM System",
        message: parsedPayload.body || "No message provided.",
      } as AlertItem;
    });
  }, [notifications]);

  // -- Filtering Logic --
  const filteredData = useMemo(() => {
    let list = inboxData;

    // Search filter
    if (searchQuery) {
      list = list.filter(
        (i) =>
          i.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Tabs filter
    return list.filter((item) => {
      if (filterTab === 1) return item.isUnread;
      if (filterTab === 2)
        return item.isActionable || item.priorityTag.includes("High");
      return true; // "All"
    });
  }, [inboxData, filterTab, searchQuery]);

  // -- Auto Select First Item --
  useEffect(() => {
    if (!isMobile && filteredData.length > 0 && !selectedItemId) {
      setSelectedItemId(filteredData[0].id);
    }
  }, [filteredData, isMobile, selectedItemId]);

  const activeItem = useMemo(
    () => filteredData.find((t) => t.id === selectedItemId),
    [filteredData, selectedItemId],
  );

  return (
    <Box
      sx={{
        height: { xs: "calc(100vh - 50px)", xl: "calc(100vh - 100px)" },
        minHeight: "500px",
        p: { xs: 0, sm: 2 },
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "#f4f6f8",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          borderRadius: { xs: 0, sm: 2 },
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* LEFT PANEL */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: 260,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SidebarMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </Box>

        {/* MIDDLE PANEL */}
        <Box
          sx={{
            display: { xs: selectedItemId ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            width: { xs: "100%", md: 400 },
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "#fcfdfe",
          }}
        >
          <NotificationList
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredData={filteredData}
            isLoading={isLoading}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
          />
        </Box>

        {/* RIGHT PANEL */}
        <Box
          sx={{
            display: { xs: selectedItemId ? "flex" : "none", md: "flex" },
            flex: 1,
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
          <DetailView
            activeItem={activeItem}
            onBack={() => setSelectedItemId(null)}
          />
        </Box>
      </Paper>
    </Box>
  );
}

// ------------------------------------------
// 4. SUBCOMPONENTS
// ------------------------------------------

// --- Sidebar Menu ---
const SidebarMenu = ({ activeMenu, setActiveMenu }: any) => {
  const theme = useTheme();
  const menus = [
    {
      id: "TASKS",
      text: "Pending Tasks",
      icon: <AccessTimeIcon fontSize="small" />,
    },
    {
      id: "ROSTERING",
      text: "Rostering",
      icon: <CalendarTodayIcon fontSize="small" />,
    },
    {
      id: "NOTIFICATIONS",
      text: "System Alerts",
      icon: <NotificationsIcon fontSize="small" />,
    },
  ];

  return (
    <Stack sx={{ py: 3, height: "100%" }}>
      <Typography
        variant="overline"
        sx={{
          px: 3,
          mb: 1,
          fontWeight: 700,
          color: "text.secondary",
          letterSpacing: 1,
        }}
      >
        Notification Manager
      </Typography>
      <List sx={{ px: 2 }}>
        {menus.map((menu) => {
          const isActive = activeMenu === menu.id;
          return (
            <ListItemButton
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                color: isActive ? "primary.main" : "text.primary",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {menu.icon}
              </ListItemIcon>
              <ListItemText
                primary={menu.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Stack>
  );
};

// --- Middle List Panel ---
const NotificationList = ({
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  filteredData,
  isLoading,
  selectedItemId,
  setSelectedItemId,
}: any) => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}>
        <Tabs
          value={filterTab}
          onChange={(_, v) => setFilterTab(v)}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              textTransform: "none",
              minWidth: "auto",
              px: 2,
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Urgent" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
      </Box>

      <Stack
        sx={{
          flex: 1,
          overflowY: "auto",
          // Modern minimal scrollbar
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#a8a8a8" },
        }}
      >
        {isLoading && <LinearProgress sx={{ height: 2 }} />}

        {filteredData.length === 0 && !isLoading && (
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 4, fontSize: 14 }}
          >
            No notifications found.
          </Typography>
        )}

        {filteredData.map((item: AlertItem) => {
          const isSelected = item.id === selectedItemId;
          // Cleaned text for list preview (stripping newlines)
          const previewText =
            item.message.replace(/\n/g, " ").substring(0, 50) + "...";

          return (
            <Box
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              sx={{
                p: 2,
                cursor: "pointer",
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: isSelected
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
                borderLeft: `4px solid ${isSelected ? theme.palette.primary.main : "transparent"}`,
                transition: "background-color 0.2s ease",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={0.5}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isSelected ? 700 : 600,
                    color: "text.primary",
                  }}
                >
                  {item.shortTitle}
                </Typography>
                {item.isUnread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      mt: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  mb: 1,
                  fontSize: "0.8rem",
                }}
              >
                {item.time} - {previewText}
              </Typography>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  System: {item.systemName}
                </Typography>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    borderRadius: 1,
                    bgcolor:
                      item.status === "Pending"
                        ? alpha(theme.palette.info.main, 0.1)
                        : alpha(theme.palette.success.main, 0.1),
                    color:
                      item.status === "Pending" ? "info.main" : "success.main",
                  }}
                />
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </>
  );
};

// --- Right Detail View Panel ---
const DetailView = ({
  activeItem,
  onBack,
}: {
  activeItem: AlertItem | undefined;
  onBack: () => void;
}) => {
  const theme = useTheme();

  if (!activeItem) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center">
        <Typography color="text.secondary" variant="body1">
          Select a notification to view details
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Stack p={{ xs: 2, md: 4 }} borderBottom={1} borderColor="divider">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton
              onClick={onBack}
              sx={{ display: { md: "none" } }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Chip
              label={activeItem.priorityTag}
              size="small"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            />
          </Stack>
          <IconButton size="small">
            <MoreHorizIcon />
          </IconButton>
        </Stack>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
        >
          {activeItem.shortTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeItem.date} at {activeItem.time}
        </Typography>
      </Stack>

      {/* Message Content Area */}
      <Stack p={{ xs: 2, md: 4 }} flex={1} overflow="auto">
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 1.5, color: "text.primary" }}
        >
          System Message
        </Typography>
        <Box
          sx={{
            p: 3,
            bgcolor:
              theme.palette.mode === "dark" ? alpha("#fff", 0.05) : "#f8f9fa",
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* whiteSpace: "pre-wrap" ensures \n displays accurately as line breaks */}
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {activeItem.message}
          </Typography>
        </Box>
      </Stack>

      {/* Action Footer */}
      <Stack
        direction="row"
        spacing={2}
        p={3}
        borderTop={1}
        borderColor="divider"
        bgcolor={theme.palette.mode === "dark" ? "background.paper" : "#fafafa"}
      >
        {activeItem.isActionable ? (
          <>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ py: 1.2, fontWeight: 600, textTransform: "none" }}
            >
              Approve Swap
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ py: 1.2, fontWeight: 600, textTransform: "none" }}
            >
              Reject
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              fullWidth
              disableElevation
              sx={{ py: 1.2, fontWeight: 600, textTransform: "none" }}
            >
              Acknowledge
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.2, fontWeight: 600, textTransform: "none" }}
            >
              Dismiss
            </Button>
          </>
        )}
      </Stack>
    </>
  );
};
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Box,
//   useTheme,
//   Typography,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Chip,
//   InputAdornment,
//   TextField,
//   Tabs,
//   Tab,
//   IconButton,
//   LinearProgress,
//   useMediaQuery,
//   alpha,
// } from "@mui/material";

// // Icons
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import SearchIcon from "@mui/icons-material/Search";
// import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import Button from "@mui/material/Button";

// // API and Types (Using your existing definitions)
// import {
//   useGetUnreadNotificationsQuery,
//   type NotificationItem,
//   type NotificationPayload,
// } from "../api/inboxApiSlice";

// // ==========================================
// // 1. TYPES & INTERFACES
// // ==========================================
// interface BaseItem {
//   id: string;
//   shortTitle: string;
//   time: string;
//   date: string;
//   isUnread: boolean;
//   priorityTag: string;
//   status:
//     | "Pending"
//     | "In Progress"
//     | "Completed"
//     | "Approved"
//     | "Rejected"
//     | "Read";
// }

// export interface TaskItem extends BaseItem {
//   type: "TASK";
//   crqId: string;
//   fullTitle: string;
//   description: string;
//   assignee: string;
//   details: string;
// }

// export interface LeaveItem extends BaseItem {
//   type: "LEAVE";
//   applicantName: string;
//   leaveType: "Sick Leave" | "Annual Leave" | "Unpaid";
//   startDate: string;
//   endDate: string;
//   reason: string;
// }

// export interface AlertItem extends BaseItem {
//   type: "ALERT";
//   systemName: string;
//   message: string;
// }

// export type InboxItem = TaskItem | LeaveItem | AlertItem;

// // ==========================================
// // 2. HELPER COMPONENTS & RENDERERS
// // ==========================================

// export const CommonContainer = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const theme = useTheme();
//   return (
//     <Box
//       sx={{
//         maxWidth: "100%",
//         height: { xs: "calc(100vh - 50px)", xl: "calc(100vh - 100px)" },
//         minHeight: "500px",
//         p: { sm: "12px" },
//         bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f0f2f5",
//       }}
//     >
//       {children}
//     </Box>
//   );
// };

// const getListText = (item: InboxItem) => {
//   switch (item.type) {
//     case "TASK":
//       return {
//         title: `${item.crqId} - ${item.shortTitle}`,
//         sub: item.description,
//         bottom: `Assignee: ${item.assignee}`,
//       };
//     case "LEAVE":
//       return {
//         title: `${item.applicantName} - ${item.leaveType}`,
//         sub: `From: ${item.startDate} To: ${item.endDate}`,
//         bottom: "Rostering Request",
//       };
//     case "ALERT":
//       return {
//         title: item.shortTitle,
//         sub: item.message.substring(0, 40) + "...",
//         bottom: `System: ${item.systemName}`,
//       };
//   }
// };

// // ==========================================
// // 3. MAIN COMPONENT
// // ==========================================
// export default function TaskInbox() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   // --- STATE ---
//   const [activeMenu, setActiveMenu] = useState<
//     "TASKS" | "ROSTERING" | "NOTIFICATIONS"
//   >("NOTIFICATIONS");
//   const [filterTab, setFilterTab] = useState(0); // 0: All, 1: Unread, 2: Urgent
//   const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   // --- DATA FETCHING & TRANSFORMATION ---
//   const { data: notifications, isLoading } = useGetUnreadNotificationsQuery({
//     readFlag: false,
//   });

//   const inboxData: InboxItem[] = useMemo(() => {
//     if (!notifications) return [];
//     return notifications.map(
//       (notification: NotificationItem, index: number) => {
//         const parsedPayload: NotificationPayload = JSON.parse(
//           notification.payload,
//         );
//         const createdDate = new Date(notification.createdAt);
//         return {
//           id: `${notification.createdAt}-${index}`,
//           type: "ALERT",
//           shortTitle: parsedPayload.subject || "Notification",
//           time: createdDate.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           date: createdDate.toLocaleDateString(),
//           isUnread: notification.readFlag === "false",
//           priorityTag:
//             notification.isActionable === "true" ? "High Priority" : "Normal",
//           status: notification.requestStatus === "PENDING" ? "Pending" : "Read",
//           systemName: "CHM System",
//           message: parsedPayload.body,
//         } as AlertItem;
//       },
//     );
//   }, [notifications]);

//   // --- FILTERING LOGIC ---
//   const filteredTasks = useMemo(() => {
//     let list = inboxData;

//     // 1. Sidebar Category
//     if (activeMenu === "NOTIFICATIONS")
//       list = list.filter((i) => i.type === "ALERT");
//     if (activeMenu === "TASKS") list = list.filter((i) => i.type === "TASK");
//     if (activeMenu === "ROSTERING")
//       list = list.filter((i) => i.type === "LEAVE");

//     // 2. Search
//     if (searchQuery) {
//       list = list.filter((i) =>
//         i.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//     }

//     // 3. Top Categorization Tabs
//     return list.filter((item) => {
//       if (filterTab === 1) return item.isUnread;
//       if (filterTab === 2)
//         return (
//           item.priorityTag.includes("High") ||
//           item.priorityTag === "ACTION REQUIRED"
//         );
//       return true; // "All"
//     });
//   }, [activeMenu, inboxData, filterTab, searchQuery]);

//   // Auto-select logic
//   useEffect(() => {
//     if (!isMobile && filteredTasks.length > 0 && !selectedItemId) {
//       setSelectedItemId(filteredTasks[0].id);
//     }
//   }, [filteredTasks, isMobile]);

//   const activeItem = useMemo(
//     () => filteredTasks.find((t) => t.id === selectedItemId),
//     [filteredTasks, selectedItemId],
//   );

//   return (
//     <CommonContainer>
//       <Box
//         sx={{
//           display: "flex",
//           height: "100%",
//           width: "100%",
//           bgcolor: "background.paper",
//           overflow: "hidden",
//           border: `1px solid ${theme.palette.divider}`,
//           borderRadius: 1,
//         }}
//       >
//         {/* --- LEFT SIDEBAR (Enterprise Menu) --- */}
//         <Box
//           sx={{
//             display: { xs: "none", lg: "flex" },
//             width: 260,
//             borderRight: `1px solid ${theme.palette.divider}`,
//             flexDirection: "column",
//           }}
//         >
//           <Box sx={{ p: 2 }}>
//             <Typography
//               variant="overline"
//               sx={{ fontWeight: "bold", color: "text.secondary" }}
//             >
//               Notification Manager
//             </Typography>
//           </Box>
//           <List sx={{ px: 2 }}>
//             {[
//               { id: "TASKS", text: "Pending Tasks", icon: <AccessTimeIcon /> },
//               {
//                 id: "ROSTERING",
//                 text: "Rostering",
//                 icon: <CalendarTodayIcon />,
//               },
//               {
//                 id: "NOTIFICATIONS",
//                 text: "System Alerts",
//                 icon: <NotificationsIcon />,
//               },
//             ].map((menu) => (
//               <ListItemButton
//                 key={menu.id}
//                 onClick={() => setActiveMenu(menu.id as any)}
//                 sx={{
//                   borderRadius: 2,
//                   mb: 0.5,
//                   bgcolor:
//                     activeMenu === menu.id
//                       ? alpha(theme.palette.primary.main, 0.1)
//                       : "transparent",
//                 }}
//               >
//                 <ListItemIcon
//                   sx={{
//                     minWidth: 40,
//                     color: activeMenu === menu.id ? "primary.main" : "inherit",
//                   }}
//                 >
//                   {menu.icon}
//                 </ListItemIcon>
//                 <ListItemText
//                   primary={menu.text}
//                   primaryTypographyProps={{
//                     fontSize: 14,
//                     fontWeight: activeMenu === menu.id ? 600 : 500,
//                   }}
//                 />
//               </ListItemButton>
//             ))}
//           </List>
//         </Box>

//         {/* --- MIDDLE LIST VIEW (The core of your request) --- */}
//         <Box
//           sx={{
//             display: { xs: selectedItemId ? "none" : "flex", md: "flex" },
//             width: { xs: "100%", md: 400 },
//             borderRight: `1px solid ${theme.palette.divider}`,
//             flexDirection: "column",
//           }}
//         >
//           {/* 1. Categorization Tabs */}
//           <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
//             <Tabs
//               value={filterTab}
//               onChange={(_, v) => setFilterTab(v)}
//               sx={{
//                 "& .MuiTab-root": {
//                   textTransform: "none",
//                   minWidth: 80,
//                   fontWeight: 600,
//                   color: "#5f6368",
//                 },
//                 "& .MuiTabs-indicator": {
//                   height: 3,
//                   borderRadius: "3px 3px 0 0",
//                 },
//               }}
//             >
//               <Tab label="All" />
//               <Tab label="Unread" />
//               <Tab label="Urgent" />
//             </Tabs>
//           </Box>

//           {/* 2. Search Section */}
//           <Box sx={{ p: 2 }}>
//             <TextField
//               fullWidth
//               size="small"
//               placeholder="Search tasks..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon fontSize="small" />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Box>

//           {/* 3. List Content with Custom Scrollbar */}
//           <Box
//             sx={{
//               flex: 1,
//               overflowY: "auto",
//               bgcolor: "#fcfdfe",
//               // --- CUSTOM SCROLLBAR CSS ---
//               "&::-webkit-scrollbar": { width: "12px" },
//               "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
//               "&::-webkit-scrollbar-thumb": {
//                 background: "#9e9e9e",
//                 borderRadius: "0px",
//                 border: "3px solid #f1f1f1", // Creates padding effect seen in image
//               },
//             }}
//           >
//             {isLoading && <LinearProgress />}
//             {filteredTasks.map((item) => {
//               const isSelected = item.id === selectedItemId;
//               const texts = getListText(item);

//               // Status Styling
//               const getStatusColor = (s: string) => {
//                 if (s === "Pending") return { bg: "#e8f0fe", text: "#1976d2" };
//                 if (s === "Completed")
//                   return { bg: "#e6f4ea", text: "#1e8e3e" };
//                 return { bg: "#f1f3f4", text: "#5f6368" };
//               };
//               const colors = getStatusColor(item.status);

//               return (
//                 <Box
//                   key={item.id}
//                   onClick={() => setSelectedItemId(item.id)}
//                   sx={{
//                     p: 2,
//                     cursor: "pointer",
//                     borderBottom: `1px solid ${theme.palette.divider}`,
//                     bgcolor: isSelected ? "#fff" : "transparent",
//                     borderLeft: isSelected
//                       ? `5px solid ${theme.palette.primary.main}`
//                       : "5px solid transparent",
//                     transition: "0.2s",
//                     "&:hover": { bgcolor: "#fff" },
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       mb: 0.5,
//                     }}
//                   >
//                     <Typography
//                       variant="subtitle2"
//                       sx={{ fontWeight: 700, color: "#202124" }}
//                     >
//                       {texts.title}
//                     </Typography>
//                     {item.isUnread && (
//                       <Box
//                         sx={{
//                           width: 10,
//                           height: 10,
//                           borderRadius: "50%",
//                           bgcolor: "primary.main",
//                           mt: 0.5,
//                         }}
//                       />
//                     )}
//                   </Box>

//                   <Typography
//                     variant="body2"
//                     sx={{ color: "primary.main", fontWeight: 500, mb: 1 }}
//                   >
//                     {item.time} - {texts.sub}
//                   </Typography>

//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <Typography
//                       variant="caption"
//                       sx={{ color: "text.secondary" }}
//                     >
//                       {texts.bottom}
//                     </Typography>
//                     <Chip
//                       label={item.status}
//                       size="small"
//                       sx={{
//                         height: 24,
//                         fontSize: 11,
//                         fontWeight: 700,
//                         borderRadius: 1.5,
//                         bgcolor: colors.bg,
//                         color: colors.text,
//                       }}
//                     />
//                   </Box>
//                 </Box>
//               );
//             })}
//           </Box>
//         </Box>

//         {/* --- RIGHT DETAIL VIEW --- */}
//         <Box
//           sx={{
//             display: { xs: selectedItemId ? "flex" : "none", md: "flex" },
//             flex: 1,
//             flexDirection: "column",
//             bgcolor: "#fff",
//           }}
//         >
//           {!activeItem ? (
//             <Box
//               sx={{
//                 flex: 1,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Typography color="text.secondary">
//                 Select an item to view details
//               </Typography>
//             </Box>
//           ) : (
//             <>
//               <Box sx={{ p: 4, borderBottom: 1, borderColor: "divider" }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 2,
//                   }}
//                 >
//                   <Box sx={{ display: "flex", alignItems: "center" }}>
//                     <IconButton
//                       onClick={() => setSelectedItemId(null)}
//                       sx={{ display: { md: "none" }, mr: 1 }}
//                     >
//                       <ArrowBackIcon />
//                     </IconButton>
//                     <Chip
//                       label={activeItem.priorityTag}
//                       color="primary"
//                       variant="outlined"
//                       size="small"
//                       sx={{ fontWeight: "bold" }}
//                     />
//                   </Box>
//                   <IconButton>
//                     <MoreHorizIcon />
//                   </IconButton>
//                 </Box>
//                 <Typography variant="h5" sx={{ fontWeight: 800 }}>
//                   {activeItem.shortTitle}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ mt: 1 }}
//                 >
//                   {activeItem.date} at {activeItem.time}
//                 </Typography>
//               </Box>

//               <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
//                 <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
//                   System Message
//                 </Typography>
//                 <Box
//                   sx={{
//                     p: 3,
//                     bgcolor: "#f8f9fa",
//                     borderRadius: 2,
//                     border: "1px solid #eee",
//                   }}
//                 >
//                   <Typography variant="body1">
//                     {(activeItem as AlertItem).message}
//                   </Typography>
//                 </Box>
//               </Box>

//               <Box
//                 sx={{
//                   p: 3,
//                   borderTop: 1,
//                   borderColor: "divider",
//                   display: "flex",
//                   gap: 2,
//                 }}
//               >
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   sx={{ py: 1.5, fontWeight: "bold" }}
//                 >
//                   Acknowledge
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   fullWidth
//                   sx={{ py: 1.5, fontWeight: "bold" }}
//                 >
//                   Dismiss
//                 </Button>
//               </Box>
//             </>
//           )}
//         </Box>
//       </Box>
//     </CommonContainer>
//   );
// }

// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   Box,
// //   useTheme,
// //   Typography,
// //   List,
// //   ListItem,
// //   ListItemButton,
// //   ListItemIcon,
// //   ListItemText,
// //   Chip,
// //   InputAdornment,
// //   TextField,
// //   Tabs,
// //   Tab,
// //   Avatar,
// //   Button,
// //   IconButton,
// //   LinearProgress,
// //   useMediaQuery,
// //   alpha,
// //   Divider,
// // } from "@mui/material";

// // // Icons
// // import AccessTimeIcon from "@mui/icons-material/AccessTime";
// // import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// // import NotificationsIcon from "@mui/icons-material/Notifications";
// // import HistoryIcon from "@mui/icons-material/History";
// // import SearchIcon from "@mui/icons-material/Search";
// // import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// // import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// // import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// // import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// // import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
// // import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// // // API and Types
// // import { useGetUnreadNotificationsQuery, type NotificationItem, type NotificationPayload } from "../api/inboxApiSlice";

// // // ==========================================
// // // 1. COMMON CONTAINER (Your Wrapper)
// // // ==========================================
// // export const CommonContainer = ({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) => {
// //   const theme = useTheme();
// //   return (
// //     <Box
// //       sx={{
// //         maxWidth: "100%",
// //         overflow: "hidden",
// //         height: {
// //           xs: "calc(100vh - 50px)",
// //           sm: "calc(100vh - 50px)",
// //           md: "calc(100vh - 40px)",
// //           lg: "calc(100vh - 60px)",
// //           xl: "calc(100vh - 100px)",
// //         },
// //         minHeight: "500px",
// //         p: { sm: "12px" },
// //         bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f7f9fa",
// //       }}
// //     >
// //       {children}
// //     </Box>
// //   );
// // };

// // // ==========================================
// // // 2. POLYMORPHIC TYPESCRIPT INTERFACES
// // // ==========================================
// // // Shared base properties every notification has
// // interface BaseItem {
// //   id: string;
// //   shortTitle: string;
// //   time: string;
// //   date: string;
// //   isUnread: boolean;
// //   priorityTag: string;
// //   status:
// //     | "Pending"
// //     | "In Progress"
// //     | "Completed"
// //     | "Approved"
// //     | "Rejected"
// //     | "Read";
// // }

// // // 1. IT Task (CRQ)
// // export interface TaskItem extends BaseItem {
// //   type: "TASK";
// //   crqId: string;
// //   fullTitle: string;
// //   description: string;
// //   assignee: string;
// //   fullId: string;
// //   details: string;
// // }

// // // 2. HR / Rostering Leave Request
// // export interface LeaveItem extends BaseItem {
// //   type: "LEAVE";
// //   applicantName: string;
// //   leaveType: "Sick Leave" | "Annual Leave" | "Unpaid";
// //   startDate: string;
// //   endDate: string;
// //   reason: string;
// // }

// // // 3. Simple System Alert
// // export interface AlertItem extends BaseItem {
// //   type: "ALERT";
// //   systemName: string;
// //   message: string;
// // }

// // // This union type tells TS an item can be ANY of the above
// // export type InboxItem = TaskItem | LeaveItem | AlertItem;

// // // ==========================================
// // // 3. API DATA TRANSFORMATION
// // // ==========================================
// // const transformNotificationToInboxItem = (notification: NotificationItem, index: number): AlertItem => {
// //   const parsedPayload: NotificationPayload = JSON.parse(notification.payload);
// //   const createdDate = new Date(notification.createdAt);
// //   const time = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// //   const date = createdDate.toLocaleDateString();

// //   return {
// //     id: `${notification.createdAt}-${index}`, // Unique ID
// //     type: "ALERT",
// //     shortTitle: parsedPayload.subject || "Notification",
// //     time,
// //     date,
// //     isUnread: notification.readFlag === "false",
// //     priorityTag: notification.isActionable === "true" ? "ACTION REQUIRED" : "INFO",
// //     status: notification.requestStatus === "PENDING" ? "Pending" : "Read",
// //     systemName: "CHM System",
// //     message: parsedPayload.body,
// //   };
// // };

// // // ==========================================
// // // 4. DYNAMIC RENDERERS (The Secret Sauce)
// // // ==========================================

// // // A. Renders the specific middle-pane list view text based on type
// // const getListText = (item: InboxItem) => {
// //   switch (item.type) {
// //     case "TASK":
// //       return {
// //         title: `${item.crqId} - ${item.shortTitle}`,
// //         sub: item.description,
// //         bottom: `Assignee: ${item.assignee}`,
// //       };
// //     case "LEAVE":
// //       return {
// //         title: `${item.applicantName} - ${item.leaveType}`,
// //         sub: `From: ${item.startDate} To: ${item.endDate}`,
// //         bottom: "Rostering Request",
// //       };
// //     case "ALERT":
// //       return {
// //         title: item.shortTitle,
// //         sub: item.message.substring(0, 40) + "...",
// //         bottom: `System: ${item.systemName}`,
// //       };
// //   }
// // };

// // // B. Renders the body text inside the detail pane
// // const DetailBodyRenderer = ({ item }: { item: InboxItem }) => {
// //   if (item.type === "TASK") {
// //     return (
// //       <Box>
// //         <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
// //           Request Details
// //         </Typography>
// //         <Box sx={{ bgcolor: "background.default", borderRadius: 3, p: 3 }}>
// //           <Typography variant="body2" sx={{ color: "text.secondary" }}>
// //             {item.details}
// //           </Typography>
// //         </Box>
// //       </Box>
// //     );
// //   }

// //   if (item.type === "LEAVE") {
// //     return (
// //       <Box>
// //         <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
// //           Leave Application
// //         </Typography>
// //         <Box
// //           sx={{
// //             bgcolor: "background.default",
// //             borderRadius: 3,
// //             p: 3,
// //             display: "flex",
// //             flexDirection: "column",
// //             gap: 2,
// //           }}
// //         >
// //           <Box>
// //             <Typography variant="caption" color="text.secondary">
// //               Applicant
// //             </Typography>
// //             <Typography fontWeight="500">{item.applicantName}</Typography>
// //           </Box>
// //           <Box>
// //             <Typography variant="caption" color="text.secondary">
// //               Dates
// //             </Typography>
// //             <Typography fontWeight="500">
// //               {item.startDate} to {item.endDate}
// //             </Typography>
// //           </Box>
// //           <Box>
// //             <Typography variant="caption" color="text.secondary">
// //               Reason
// //             </Typography>
// //             <Typography variant="body2" color="text.secondary">
// //               {item.reason}
// //             </Typography>
// //           </Box>
// //         </Box>
// //       </Box>
// //     );
// //   }

// //   if (item.type === "ALERT") {
// //     return (
// //       <Box>
// //         <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
// //           System Log
// //         </Typography>
// //         <Box sx={{ bgcolor: "background.default", borderRadius: 3, p: 3 }}>
// //           <Typography
// //             variant="body2"
// //             sx={{ color: "text.secondary", fontFamily: "monospace" }}
// //           >
// //             {item.message}
// //           </Typography>
// //         </Box>
// //       </Box>
// //     );
// //   }
// //   return null;
// // };

// // // C. Renders completely different footer buttons based on type
// // const ActionFooterRenderer = ({
// //   item,
// //   theme,
// // }: {
// //   item: InboxItem;
// //   theme: any;
// // }) => {
// //   if (item.type === "TASK") {
// //     return (
// //       <Button
// //         variant="contained"
// //         disableElevation
// //         startIcon={<CheckCircleOutlineIcon />}
// //         sx={{ flex: 1, py: 1.5 }}
// //       >
// //         Acknowledge Task
// //       </Button>
// //     );
// //   }

// //   if (item.type === "LEAVE") {
// //     return (
// //       <>
// //         <Button
// //           variant="contained"
// //           color="success"
// //           disableElevation
// //           startIcon={<CheckCircleOutlineIcon />}
// //           sx={{ flex: 1, py: 1.5 }}
// //         >
// //           Approve
// //         </Button>
// //         <Button
// //           variant="outlined"
// //           color="error"
// //           startIcon={<CancelOutlinedIcon />}
// //           sx={{ flex: 1, py: 1.5 }}
// //         >
// //           Reject
// //         </Button>
// //       </>
// //     );
// //   }

// //   if (item.type === "ALERT") {
// //     if (item.priorityTag === "ACTION REQUIRED") {
// //       return (
// //         <>
// //           <Button
// //             variant="contained"
// //             color="success"
// //             disableElevation
// //             startIcon={<CheckCircleOutlineIcon />}
// //             sx={{ flex: 1, py: 1.5 }}
// //           >
// //             Approve
// //           </Button>
// //           <Button
// //             variant="outlined"
// //             color="error"
// //             startIcon={<CancelOutlinedIcon />}
// //             sx={{ flex: 1, py: 1.5 }}
// //           >
// //             Reject
// //           </Button>
// //         </>
// //       );
// //     } else {
// //       return (
// //         <Button variant="outlined" sx={{ flex: 1, py: 1.5 }}>
// //           Mark as Read & Dismiss
// //         </Button>
// //       );
// //     }
// //   }
// //   return null;
// // };

// // // ==========================================
// // // 5. MAIN PARENT COMPONENT
// // // ==========================================
// // export default function TaskInbox() {
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

// //   // Fetch data from API
// //   const { data: notifications, isLoading } = useGetUnreadNotificationsQuery({ readFlag: false });

// //   // Transform API data to InboxItem[]
// //   const inboxData: InboxItem[] = useMemo(() => {
// //     if (!notifications) return [];
// //     return notifications.map(transformNotificationToInboxItem);
// //   }, [notifications]);

// //   // Which sidebar menu is active? Default to NOTIFICATIONS since we're using notifications API
// //   const [activeMenu, setActiveMenu] = useState<"TASKS" | "ROSTERING" | "NOTIFICATIONS">("NOTIFICATIONS");

// //   const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

// //   // Filter data based on sidebar selection (only NOTIFICATIONS will have data)
// //   const filteredTasks = useMemo(() => {
// //     switch (activeMenu) {
// //       case "NOTIFICATIONS":
// //         return inboxData.filter((item) => item.type === "ALERT");
// //       default:
// //         return [];
// //     }
// //   }, [activeMenu, inboxData]);

// //   // Auto-select first item when changing tabs on desktop
// //   useEffect(() => {
// //     if (!isMobile && filteredTasks.length > 0) {
// //       setSelectedItemId(filteredTasks[0].id);
// //     } else {
// //       setSelectedItemId(null);
// //     }
// //   }, [activeMenu, isMobile, filteredTasks]);

// //   const activeItem = useMemo(
// //     () => filteredTasks.find((t) => t.id === selectedItemId) || null,
// //     [filteredTasks, selectedItemId],
// //   );

// //   return (
// //     <CommonContainer>
// //       <Box
// //         sx={{
// //           display: "flex",
// //           height: "100%",
// //           width: "100%",
// //           bgcolor: "background.paper",
// //           overflow: "hidden",
// //           border: `1px solid ${theme.palette.divider}`,
// //         }}
// //       >
// //         {/* --- LEFT SIDEBAR --- */}
// //         <Box
// //           sx={{
// //             display: { xs: "none", lg: "flex" },
// //             width: 280,
// //             borderRight: `1px solid ${theme.palette.divider}`,
// //             flexDirection: "column",
// //             flexShrink: 0,
// //           }}
// //         >
// //           <Box sx={{ p: 2, pb: 1 }}>
// //             <Typography
// //               variant="overline"
// //               sx={{ color: "text.secondary", fontWeight: "bold" }}
// //             >
// //               ENTERPRISE MENU
// //               {/* {notifications.l} */}
// //             </Typography>
// //           </Box>
// //           <List sx={{ px: 2, flex: 1 }}>
// //             {[
// //               { id: "TASKS", text: "Pending Tasks", icon: <AccessTimeIcon /> },
// //               {
// //                 id: "ROSTERING",
// //                 text: "Rostering (Leave)",
// //                 icon: <CalendarTodayIcon />,
// //               },
// //               {
// //                 id: "NOTIFICATIONS",
// //                 text: "System Alerts",
// //                 icon: <NotificationsIcon />,
// //               },
// //             ].map((menu) => {
// //               const isActive = activeMenu === menu.id;
// //               return (
// //                 <ListItem disablePadding key={menu.id} sx={{ mb: 0.5 }}>
// //                   <ListItemButton
// //                     onClick={() => setActiveMenu(menu.id as any)}
// //                     sx={{
// //                       borderRadius: 2,
// //                       bgcolor: isActive
// //                         ? alpha(theme.palette.primary.main, 0.08)
// //                         : "transparent",
// //                       "&:hover": {
// //                         bgcolor: alpha(theme.palette.primary.main, 0.12),
// //                       },
// //                     }}
// //                   >
// //                     <ListItemIcon
// //                       sx={{
// //                         minWidth: 40,
// //                         color: isActive ? "primary.main" : "text.secondary",
// //                       }}
// //                     >
// //                       {menu.icon}
// //                     </ListItemIcon>
// //                     <ListItemText
// //                       primary={menu.text}
// //                       primaryTypographyProps={{
// //                         fontSize: 14,
// //                         fontWeight: isActive ? 600 : 500,
// //                         color: isActive ? "primary.main" : "text.primary",
// //                       }}
// //                     />
// //                   </ListItemButton>
// //                 </ListItem>
// //               );
// //             })}
// //           </List>
// //         </Box>

// //         {/* --- MIDDLE LIST VIEW --- */}
// //         <Box
// //           sx={{
// //             display: { xs: selectedItemId ? "none" : "flex", md: "flex" },
// //             width: { xs: "100%", md: 380, lg: 420 },
// //             borderRight: `1px solid ${theme.palette.divider}`,
// //             flexDirection: "column",
// //             flexShrink: 0,
// //           }}
// //         >
// //           <Box
// //             sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
// //           >
// //             <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
// //               {activeMenu === "TASKS" && "Pending Tasks"}
// //               {activeMenu === "ROSTERING" && "Leave Requests"}
// //               {activeMenu === "NOTIFICATIONS" && "Alerts"}
// //             </Typography>
// //             <TextField
// //               fullWidth
// //               placeholder="Search..."
// //               variant="outlined"
// //               size="small"
// //               InputProps={{
// //                 startAdornment: (
// //                   <InputAdornment position="start">
// //                     <SearchIcon fontSize="small" />
// //                   </InputAdornment>
// //                 ),
// //               }}
// //             />
// //           </Box>

// //           <Box
// //             sx={{ flex: 1, overflowY: "auto", bgcolor: "background.default" }}
// //           >
// //             {isLoading && (
// //               <Box sx={{ p: 2 }}>
// //                 <LinearProgress />
// //                 <Typography sx={{ mt: 1, textAlign: "center" }}>Loading notifications...</Typography>
// //               </Box>
// //             )}
// //             {!isLoading && filteredTasks.length === 0 && (
// //               <Box sx={{ p: 4, textAlign: "center" }}>
// //                 <Typography color="text.secondary">No items found.</Typography>
// //               </Box>
// //             )}
// //             {!isLoading && filteredTasks.map((item) => {
// //               const isSelected = item.id === selectedItemId;
// //               const listTexts = getListText(item);

// //               return (
// //                 <Box
// //                   key={item.id}
// //                   onClick={() => setSelectedItemId(item.id)}
// //                   sx={{
// //                     p: 2.5,
// //                     cursor: "pointer",
// //                     borderBottom: `1px solid ${theme.palette.divider}`,
// //                     bgcolor:
// //                       isSelected && !isMobile
// //                         ? "background.paper"
// //                         : "transparent",
// //                     borderLeft:
// //                       isSelected && !isMobile
// //                         ? `4px solid ${theme.palette.primary.main}`
// //                         : "4px solid transparent",
// //                     "&:hover": { bgcolor: "background.paper" },
// //                   }}
// //                 >
// //                   <Box
// //                     sx={{
// //                       display: "flex",
// //                       justifyContent: "space-between",
// //                       mb: 0.5,
// //                     }}
// //                   >
// //                     <Typography
// //                       variant="subtitle2"
// //                       sx={{
// //                         fontWeight: 600,
// //                         color:
// //                           isSelected && !isMobile
// //                             ? "text.primary"
// //                             : "text.secondary",
// //                       }}
// //                     >
// //                       {listTexts.title}
// //                     </Typography>
// //                     {item.isUnread && (
// //                       <Box
// //                         sx={{
// //                           width: 8,
// //                           height: 8,
// //                           borderRadius: "50%",
// //                           bgcolor: "primary.main",
// //                           mt: 0.5,
// //                         }}
// //                       />
// //                     )}
// //                   </Box>
// //                   <Typography
// //                     variant="body2"
// //                     sx={{
// //                       color:
// //                         isSelected && !isMobile
// //                           ? "primary.main"
// //                           : "text.secondary",
// //                       mb: 1.5,
// //                     }}
// //                   >
// //                     {listTexts.sub}
// //                   </Typography>
// //                   <Box
// //                     sx={{ display: "flex", justifyContent: "space-between" }}
// //                   >
// //                     <Typography
// //                       variant="caption"
// //                       sx={{ color: "text.secondary" }}
// //                     >
// //                       {listTexts.bottom}
// //                     </Typography>
// //                     <Chip
// //                       label={item.status}
// //                       size="small"
// //                       sx={{ height: 20, fontSize: 11 }}
// //                     />
// //                   </Box>
// //                 </Box>
// //               );
// //             })}
// //           </Box>
// //         </Box>

// //         {/* --- RIGHT DETAIL VIEW --- */}
// //         <Box
// //           sx={{
// //             display: { xs: selectedItemId ? "flex" : "none", md: "flex" },
// //             flex: 1,
// //             flexDirection: "column",
// //             bgcolor: "background.paper",
// //             overflow: "hidden",
// //           }}
// //         >
// //           {!activeItem ? (
// //             <Box
// //               sx={{
// //                 flex: 1,
// //                 display: "flex",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //               }}
// //             >
// //               <Typography color="text.secondary">
// //                 Select an item to view details
// //               </Typography>
// //             </Box>
// //           ) : (
// //             <>
// //               {/* Detail Header */}
// //               <Box
// //                 sx={{
// //                   p: { xs: 2.5, md: 4 },
// //                   pb: { xs: 2, md: 3 },
// //                   borderBottom: `1px solid ${theme.palette.divider}`,
// //                   flexShrink: 0,
// //                 }}
// //               >
// //                 <Box
// //                   sx={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     mb: 2,
// //                   }}
// //                 >
// //                   <Box sx={{ display: "flex", alignItems: "center" }}>
// //                     <IconButton
// //                       size="small"
// //                       onClick={() => setSelectedItemId(null)}
// //                       sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
// //                     >
// //                       <ArrowBackIcon />
// //                     </IconButton>
// //                     <Chip
// //                       label={activeItem.priorityTag}
// //                       size="small"
// //                       sx={{
// //                         bgcolor: alpha(theme.palette.primary.main, 0.1),
// //                         color: "primary.main",
// //                         fontWeight: 600,
// //                         fontSize: 12,
// //                       }}
// //                     />
// //                   </Box>
// //                   <IconButton size="small">
// //                     <MoreHorizIcon />
// //                   </IconButton>
// //                 </Box>
// //                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
// //                   {activeItem.type === "TASK"
// //                     ? activeItem.fullTitle
// //                     : activeItem.shortTitle}
// //                 </Typography>
// //                 <Typography
// //                   variant="body2"
// //                   color="text.secondary"
// //                   sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
// //                 >
// //                   <AccessTimeIcon sx={{ fontSize: 16 }} /> {activeItem.date},{" "}
// //                   {activeItem.time}
// //                 </Typography>
// //               </Box>

// //               {/* Dynamic Body Component */}
// //               <Box sx={{ p: { xs: 2.5, md: 4 }, flex: 1, overflowY: "auto" }}>
// //                 <DetailBodyRenderer item={activeItem} />
// //               </Box>

// //               {/* Dynamic Footer Actions */}
// //               <Box
// //                 sx={{
// //                   p: 3,
// //                   borderTop: `1px solid ${theme.palette.divider}`,
// //                   display: "flex",
// //                   gap: 2,
// //                   flexShrink: 0,
// //                 }}
// //               >
// //                 <ActionFooterRenderer item={activeItem} theme={theme} />
// //               </Box>
// //             </>
// //           )}
// //         </Box>
// //       </Box>
// //     </CommonContainer>
// //   );
// // }
