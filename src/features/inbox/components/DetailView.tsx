import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { type InboxItem } from "./TaskInbox";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { formatModuleName } from "../utils/formatModuleName";
import { AppScrollView } from "../../../components/ui/AppScrollView";
import { useNotificationAction } from "../hooks/useNotificationAction";
import { authStorage } from "../../../app/store/auth.storage";
import { toast } from "react-toastify";

export const DetailView = ({
  activeItem,
  onBack,
}: {
  activeItem: InboxItem | undefined;
  onBack: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { handleAction, isLoading } = useNotificationAction();
  const currentUserRole = roleName;

  if (!activeItem) {
    return (
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap={1.5}
        bgcolor="background.default"
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "text.disabled" }} />
        <Typography fontSize="0.875rem" color="text.disabled" fontWeight={500}>
          Select an item to view details
        </Typography>
      </Stack>
    );
  }

  const processResponse = (res: any, action?: string) => {
    console.log("API Response:", res);
    let data = typeof res === "string" ? JSON.parse(res) : res;
    if (data && typeof data === "object" && !data.status) {
      data = data.data || data;
    }
    if (data?.status === "Success" || data?.status === "SUCCESS") {
      const successMessage = data?.message?.trim()
        ? data.message
        : getDefaultSuccessMessage(action);
      toast.success(successMessage, { autoClose: 3000 });
      onBack();
    } else {
      const errorMessage =
        data?.message || "Operation failed. Please try again.";
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const getDefaultSuccessMessage = (action?: string): string => {
    switch (action) {
      case "APPROVED":
        return "Request approved successfully";
      case "REJECTED":
        return "Request rejected successfully";
      case "ACKNOWLEDGE":
        return "Request acknowledged successfully";
      default:
        return "Operation completed successfully";
    }
  };

  const onApprove = async () => {
    if (!activeItem) return;
    try {
      const res = await handleAction(activeItem, "APPROVED", currentUserRole);
      processResponse(res, "APPROVED");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to approve request",
      );
    }
  };

  const onReject = async () => {
    if (!activeItem) return;
    const reason = window.prompt(
      "Please enter a reason for rejection (required):",
    );
    if (reason === null) return;
    if (reason.trim() === "") {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      const res = await handleAction(
        activeItem,
        "REJECTED",
        currentUserRole,
        reason,
      );
      processResponse(res, "REJECTED");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to reject request",
      );
    }
  };

  const onAcknowledge = async () => {
    if (!activeItem) return;
    try {
      const res = await handleAction(
        activeItem,
        "ACKNOWLEDGE",
        currentUserRole,
      );
      processResponse(res, "ACKNOWLEDGE");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to acknowledge",
      );
    }
  };

  return (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      {/* Detail Header */}
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Stack direction="row" alignItems="center" gap={0.75}>
            <IconButton
              onClick={onBack}
              size="small"
              sx={{ display: { md: "none" }, mr: 0.25 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Chip
              label={formatModuleName(activeItem.displayModule)}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                color: "primary.main",
                bgcolor: alpha(
                  theme.palette.primary.main,
                  isDark ? 0.18 : 0.08,
                ),
                "& .MuiChip-label": { px: 1 },
              }}
            />
            {activeItem.isActionable && (
              <Chip
                label="Action Required"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 22,
                  color: isDark ? "warning.light" : "warning.dark",
                  bgcolor: alpha(
                    theme.palette.warning.main,
                    isDark ? 0.18 : 0.08,
                  ),
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            )}
          </Stack>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            lineHeight: 1.35,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {activeItem.shortTitle}
        </Typography>

        <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
          Received{" "}
          <Box
            component="span"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {activeItem.date}
          </Box>{" "}
          at{" "}
          <Box
            component="span"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {activeItem.time}
          </Box>
        </Typography>
      </Box>

      {/* Message body */}
      <AppScrollView
        sx={{
          flex: 1,
          overflow: "auto",
          p: { xs: 1.5, md: 2.5 },
          bgcolor: isDark ? "#111" : "#f5f6f8",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: "10px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "text.primary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.75,
            }}
          >
            {activeItem.message}
          </Typography>
        </Paper>
      </AppScrollView>

      {/* Action Footer */}
      {/* Action Footer */}
      <Box
        sx={{
          px: 2,
          py: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "#161616" : "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Left hint text */}
        <Typography
          fontSize="0.75rem"
          color="text.disabled"
          sx={{ flexShrink: 0 }}
        >
          {activeItem.isActionable
            ? "Review and take action"
            : "No action required"}
        </Typography>

        {/* Right-aligned compact buttons */}
        {activeItem.isActionable ? (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={isLoading}
              onClick={onReject}
              sx={{
                py: 0.6,
                px: 1.5,
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "none",
                borderRadius: "7px",
                minWidth: 0,
              }}
            >
              Reject
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={12} color="inherit" />
                ) : null
              }
              onClick={onApprove}
              sx={{
                py: 0.6,
                px: 1.5,
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "none",
                borderRadius: "7px",
                boxShadow: "none",
                minWidth: 0,
                "&:hover": { boxShadow: "none" },
              }}
            >
              {isLoading ? "Approving…" : "Approve"}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            disableElevation
            disabled={isLoading}
            onClick={onAcknowledge}
            sx={{
              py: 0.6,
              px: 1.75,
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "none",
              borderRadius: "7px",
              minWidth: 0,
            }}
          >
            {isLoading ? "Acknowledging…" : "Acknowledge"}
          </Button>
        )}
      </Box>
    </Stack>
  );
};

// import {
//   alpha,
//   Button,
//   Chip,
//   CircularProgress,
//   IconButton,
//   Paper,
//   Stack,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import { type InboxItem } from "./TaskInbox";

// // import AccessTimeIcon from "@mui/icons-material/AccessTime";
// // import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// // import NotificationsIcon from "@mui/icons-material/Notifications";
// // import SearchIcon from "@mui/icons-material/Search";
// import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// // import MenuIcon from "@mui/icons-material/Menu";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// // import AssignmentIcon from "@mui/icons-material/Assignment";
// // import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
// // import AllInboxIcon from "@mui/icons-material/AllInbox";
// import { formatModuleName } from "../utils/formatModuleName";
// import { AppScrollView } from "../../../components/ui/AppScrollView";
// import { useNotificationAction } from "../hooks/useNotificationAction";
// import { authStorage } from "../../../app/store/auth.storage";
// import { toast } from "react-toastify";

// // import { authStorage } from "../../../../app/store/auth.storage";
// export const DetailView = ({
//   activeItem,
//   onBack,
// }: {
//   activeItem: InboxItem | undefined;
//   onBack: () => void;
// }) => {
//   const theme = useTheme();

//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

//   const { handleAction, isLoading } = useNotificationAction();

//   const currentUserRole = roleName;
//   if (!activeItem) {
//     return (
//       <Stack
//         flex={1}
//         alignItems="center"
//         justifyContent="center"
//         bgcolor="background.default"
//       >
//         <CheckCircleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
//         <Typography color="text.secondary" variant="body1" fontWeight={500}>
//           Select an item to view details
//         </Typography>
//       </Stack>
//     );
//   }

//   const processResponse = (res: any, action?: string) => {
//     // Debug: Log the response to check structure
//     console.log("API Response:", res);

//     // Safety check for stringified JSON
//     let data = typeof res === "string" ? JSON.parse(res) : res;

//     // Handle RTK Query wrapped response
//     if (data && typeof data === "object" && !data.status) {
//       // RTK Query might wrap the actual response
//       console.log("Unwrapping data structure:", data);
//       data = data.data || data;
//     }

//     if (data?.status === "Success" || data?.status === "SUCCESS") {
//       // Use API message if available, otherwise show action-specific message
//       const successMessage = data?.message?.trim()
//         ? data.message
//         : getDefaultSuccessMessage(action);
//       console.log("Success message:", successMessage);
//       toast.success(successMessage, { autoClose: 3000 });
//       onBack(); // Deselect item and go back to list
//     } else {
//       const errorMessage = data?.message || "Operation failed. Please try again.";
//       console.log("Error message:", errorMessage);
//       toast.error(errorMessage, { autoClose: 3000 });
//     }
//   };

//   const getDefaultSuccessMessage = (action?: string): string => {
//     switch (action) {
//       case "APPROVED":
//         return "Request approved successfully";
//       case "REJECTED":
//         return "Request rejected successfully";
//       case "ACKNOWLEDGE":
//         return "Request acknowledged successfully";
//       default:
//         return "Operation completed successfully";
//     }
//   };

//   const onApprove = async () => {
//     if (!activeItem) return;
//     try {
//       const res = await handleAction(activeItem, "APPROVED", currentUserRole);
//       processResponse(res, "APPROVED");
//     } catch (err: any) {
//       // RTK Query usually nests backend error responses inside err.data
//       toast.error(
//         err?.data?.message || err?.message || "Failed to approve request",
//       );
//     }
//   };
//   const onReject = async () => {
//     if (!activeItem) return;

//     // NOTE: For a better UI later, replace window.prompt with a MUI Dialog component.
//     const reason = window.prompt(
//       "Please enter a reason for rejection (required):",
//     );

//     if (reason === null) return; // User cancelled the prompt
//     if (reason.trim() === "") {
//       toast.error("Rejection reason is required."); // <-- VALIDATION TOAST
//       return;
//     }

//     try {
//       const res = await handleAction(
//         activeItem,
//         "REJECTED",
//         currentUserRole,
//         reason,
//       );
//       processResponse(res, "REJECTED");
//     } catch (err: any) {
//       toast.error(
//         err?.data?.message || err?.message || "Failed to reject request",
//       );
//     }
//   };

//   const onAcknowledge = async () => {
//     if (!activeItem) return;
//     try {
//       const res = await handleAction(
//         activeItem,
//         "ACKNOWLEDGE",
//         currentUserRole,
//       );
//       processResponse(res, "ACKNOWLEDGE");
//     } catch (err: any) {
//       toast.error(
//         err?.data?.message || err?.message || "Failed to acknowledge",
//       );
//     }
//   };
//   if (!activeItem) {
//     return (
//       <Stack
//         flex={1}
//         alignItems="center"
//         justifyContent="center"
//         bgcolor="background.default"
//       >
//         <CheckCircleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
//         <Typography color="text.secondary" variant="body1" fontWeight={500}>
//           Select an item to view details
//         </Typography>
//       </Stack>
//     );
//   }

//   return (
//     <>
//       <Stack
//         p={{ xs: 2, md: 1 }}
//         borderBottom={1}
//         borderColor="divider"
//         bgcolor="background.paper"
//       >
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={2}
//         >
//           <Stack direction="row" alignItems="center" gap={1}>
//             <IconButton
//               onClick={onBack}
//               sx={{ display: { md: "none" } }}
//               edge="start"
//             >
//               <ArrowBackIcon />
//             </IconButton>
//             <Chip
//               label={formatModuleName(activeItem.displayModule)}
//               size="small"
//               sx={{
//                 fontWeight: 600,
//                 color: "primary.main",
//                 bgcolor: alpha(theme.palette.primary.main, 0.1),
//               }}
//             />
//           </Stack>
//           <IconButton size="small">
//             <MoreHorizIcon />
//           </IconButton>
//         </Stack>

//         <Typography
//           variant="h5"
//           sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
//         >
//           {activeItem.shortTitle}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Received on <strong>{activeItem.date}</strong> at{" "}
//           <strong>{activeItem.time}</strong>
//         </Typography>
//       </Stack>

//       <AppScrollView
//         p={{ xs: 2, md: 4 }}
//         flex={1}
//         overflow="auto"
//         bgcolor="background.default"
//       >
//         <Paper
//           elevation={0}
//           sx={{
//             p: 3,
//             borderRadius: 2,
//             border: `1px solid ${theme.palette.divider}`,
//             bgcolor: "background.paper",
//             boxShadow: theme.shadows[1],
//           }}
//         >
//           <Typography
//             variant="body1"
//             sx={{
//               color: "text.primary",
//               whiteSpace: "pre-wrap",
//               lineHeight: 1,
//             }}
//           >
//             {activeItem.message}
//           </Typography>
//         </Paper>
//       </AppScrollView>

//       {/* Action Footer */}
//       <Stack
//         direction="row"
//         spacing={2}
//         p={3}
//         borderTop={1}
//         borderColor="divider"
//         bgcolor={theme.palette.mode === "dark" ? "background.paper" : "#fafafa"}
//       >
//         {activeItem.isActionable ? (
//           <>
//             <Button
//               variant="contained"
//               color="success"
//               fullWidth
//               disabled={isLoading}
//               startIcon={
//                 isLoading ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : null
//               }
//               sx={{
//                 py: 1.2,
//                 fontWeight: 600,
//                 textTransform: "none",
//                 borderRadius: 2,
//               }}
//               onClick={onApprove}
//             >
//               Approve
//             </Button>
//             <Button
//               variant="outlined"
//               color="error"
//               fullWidth
//               disabled={isLoading}
//               sx={{
//                 py: 1.2,
//                 fontWeight: 600,
//                 textTransform: "none",
//                 borderRadius: 2,
//               }}
//               onClick={onReject}
//             >
//               Reject
//             </Button>
//           </>
//         ) : (
//           <Button
//             variant="contained"
//             fullWidth
//             disableElevation
//             disabled={isLoading}
//             sx={{
//               py: 1.2,
//               fontWeight: 600,
//               textTransform: "none",
//               borderRadius: 2,
//             }}
//             onClick={onAcknowledge}
//           >
//             {isLoading ? "Acknowledging..." : "Acknowledge"}
//           </Button>
//         )}
//       </Stack>
//     </>
//   );
// };
