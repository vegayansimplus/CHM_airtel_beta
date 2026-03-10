import {
  TableCell,
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

// Proper Icons Based on Shift Types
import EditIcon from "@mui/icons-material/Edit";
import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Morning
import WbTwilightIcon from "@mui/icons-material/WbTwilight"; // Afternoon
import DarkModeIcon from "@mui/icons-material/DarkMode"; // Night
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Custom Shifts
import WaterDropIcon from "@mui/icons-material/WaterDrop"; // Week Off Badge
import { isFutureDate } from "../utils/dateUtils";

import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";

interface RosterShiftCellProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
}

export const RosterShiftCell = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  isSelectedForSwap,
  isSwapMode,
}: RosterShiftCellProps) => {
  // --- Auth & Permissions ---
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  const count = shift?.assignActCount || 0;
  const isFuture = isFutureDate(shiftDate);
  const isOwnRoster = String(user?.userId) === String(rowUserId);
  const isTeamMember = role === "TEAM_MEMBER";
  const hasUpdatePermission =
    hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";

  let canEdit = false;
  if (isFuture) {
    if (isTeamMember) {
      canEdit = isOwnRoster;
    } else {
      canEdit = hasUpdatePermission;
    }
  }

  // --- Identify Shift Type ---
  const isOff =
    !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave =
    shift?.shiftDisplay === "Leave" ||
    shift?.type === "Leave" ||
    shift?.shiftDisplay?.toLowerCase() === "leave";

  // Extract data (fallback to defaults if undefined)
  const shiftKey = shift?.shiftDisplay?.charAt(0) || "W";
  const shiftNameStr = (
    shift?.shiftName ||
    shift?.shiftDisplay ||
    ""
  ).toLowerCase();

  const mins = shift?.availableMins || (isOff ? 0 : 540);
  const hours = Math.floor(mins / 60);

  // Formatted Output Text
  const title = isOff
    ? "WO"
    : isLeave
      ? "Leave"
      : shift?.shiftDisplay || "Morning Shift";
  const subtitle = isOff
    ? ""
    : isLeave
      ? `${hours} hrs`
      : shift?.timeRange || "8:00 AM - 10 PM";

  // Map Colors
  const shiftStyle =
    shiftColorMap.get(isLeave ? "Leave" : isOff ? "W" : shiftKey) ??
    shiftColorMap.get("W")!;

  // --- Robust Icon Selection Logic ---
  const renderStatusIcon = () => {
    if (isOff) return null; // No status icon for Week Off

    if (
      shiftNameStr.includes("night") ||
      shiftKey === "N" ||
      shiftKey === "Q"
    ) {
      return <DarkModeIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
    }
    if (
      shiftNameStr.includes("afternoon") ||
      shiftNameStr.includes("evening")
    ) {
      return (
        <WbTwilightIcon sx={{ fontSize: 14, color: shiftStyle.badgeBg }} />
      );
    }
    if (shiftNameStr.includes("morning") || shiftKey === "A") {
      return <WbSunnyIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
    }
    // Default for Custom Shifts
    return <CheckCircleIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
  };

  // Cell should be clickable if they have edit permission OR if Swap Mode is active
  const isClickable = canEdit || isSwapMode;

  return (
    <TableCell sx={{ p: 0.5, borderBottom: "none", height: "100%" }}>
      {/* Tooltip ensures users can always read full text even when screen is small and text truncates */}
      <Tooltip
        title={isOff ? "WO" : `${title} (${subtitle})`}
        placement="top"
        arrow
        enterDelay={400}
      >
        <Box
          sx={{
            bgcolor: isSelectedForSwap ? "#E0F2FE" : shiftStyle.cardBg,
            // Use box-shadow to simulate a 2px border without causing layout shifts when selected
            border: `1px solid ${isSelectedForSwap ? "#0284C7" : shiftStyle.cardBorder}`,
            boxShadow: isSelectedForSwap ? "0 0 0 1px #0284C7" : "none",
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            p: "6px 8px", // Compact padding
            gap: 1,
            width: "100%", // Take up available cell space
            minWidth: 0, // CRITICAL: allows flex children to shrink below content size (enables ellipsis)
            height: 48, // Fixed height for grid consistency
            position: "relative",
            overflow: "hidden", // Hide anything that spills out
            transition: "all 0.2s ease",
            cursor: isClickable ? "pointer" : "default",
            "&:hover": {
              boxShadow: isClickable
                ? isSelectedForSwap
                  ? "0 0 0 1px #0284C7, 0px 3px 10px rgba(0,0,0,0.1)"
                  : "0px 3px 10px rgba(0,0,0,0.06)"
                : "none",
              borderColor: isSwapMode
                ? "#0284C7" // Show swap blue on hover during swap mode
                : canEdit
                  ? shiftStyle.badgeBg
                  : shiftStyle.cardBorder,
              // Smart Hover: Fade out status icon, show edit button (only if NOT in swap mode)
              "& .status-icon": { opacity: 0, transform: "scale(0.8)" },
              "& .edit-btn": {
                opacity: isSwapMode ? 0 : 1, // Hide edit button in swap mode
                visibility: isSwapMode ? "hidden" : "visible",
                transform: isSwapMode ? "scale(0.7)" : "scale(1)",
              },
            },
          }}
          onClick={(e) => {
            if (isClickable) onEditClick(shift);
          }}
        >
          {/* --- 1. Left Badge Area (Fixed Width) --- */}
          <Stack
            alignItems="center"
            spacing={0}
            sx={{ flexShrink: 0, minWidth: 24 }}
          >
            <Box
              sx={{
                bgcolor: shiftStyle.badgeBg,
                color: isOff ? "#94A3B8" : "#FFF",
                borderRadius: 1,
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.7rem",
                ...(isOff && { bgcolor: "#E2E8F0" }), // Greyed out badge for Week Off
              }}
            >
              {isOff ? (
                <WaterDropIcon sx={{ fontSize: 13 }} />
              ) : isLeave ? (
                "I"
              ) : (
                shiftKey
              )}
            </Box>
            <Typography
              fontSize="0.55rem"
              color="text.secondary"
              fontWeight={600}
              sx={{ mt: 0.2 }}
            >
              {hours} m
            </Typography>
          </Stack>

          {/* --- 2. Center Text Area (Fluid & Truncating) --- */}
          <Stack
            sx={{ flexGrow: 1, minWidth: 0, pr: 2 }}
            justifyContent="center"
          >
            <Typography
              fontSize="0.75rem"
              fontWeight={700}
              color={isLeave ? "#DC2626" : "text.primary"}
              sx={{
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis", // Truncates with "..."
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                fontSize="0.6rem"
                color={isLeave ? "#EF4444" : "text.secondary"}
                fontWeight={500}
                sx={{
                  mt: 0.25,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Stack>

          {/* --- 3. Absolute Positioned Right Icons (Saves Layout Space) --- */}
          {
            <>
              {/* Status Icon Overlay - Hidden if selected to keep UI clean */}
              {!isSelectedForSwap && (
                <Box
                  className="status-icon"
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    transition: "all 0.2s ease",
                    display: "flex",
                    opacity: 0.8, // Slightly soften the icon visually
                  }}
                >
                  {renderStatusIcon()}
                </Box>
              )}

              {/* Selection Checkmark Overlay for Swap Mode */}
              {isSelectedForSwap && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    display: "flex",
                    color: "#0284C7",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                </Box>
              )}

              {/* Smart Hover Edit Button Overlay - Disabled in Swap Mode */}
              {canEdit && !isSwapMode && (
                <IconButton
                  className="edit-btn"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(shift);
                  }}
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    opacity: 0,
                    visibility: "hidden",
                    transform: "scale(0.7)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    bgcolor: "rgba(255,255,255,0.85)", // Glassmorphism effect over text
                    backdropFilter: "blur(2px)",
                    boxShadow: "-2px 2px 4px rgba(0,0,0,0.05)",
                    "&:hover": { bgcolor: "#FFF" },
                    p: 0.4,
                  }}
                >
                  <EditIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />
                </IconButton>
              )}
            </>
          }
        </Box>
      </Tooltip>
    </TableCell>
  );
};

// Accurate color mappings
export const shiftColorMap = new Map<
  string,
  { badgeBg: string; cardBg: string; cardBorder: string }
>([
  ["A", { badgeBg: "#2563EB", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }], // Blue
  ["B", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // Teal
  ["N", { badgeBg: "#4F46E5", cardBg: "#EEF2FF", cardBorder: "#E0E7FF" }], // Indigo
  ["Q", { badgeBg: "#7C3AED", cardBg: "#F5F3FF", cardBorder: "#EDE9FE" }], // Purple
  ["Leave", { badgeBg: "#DC2626", cardBg: "#FEF2F2", cardBorder: "#FEE2E2" }], // Red
  ["W", { badgeBg: "#94A3B8", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }], // Grey
  ["T", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // Teal Custom
  ["O", { badgeBg: "#0EA5E9", cardBg: "#F0F9FF", cardBorder: "#E0F2FE" }], // Light Blue Custom
]);

// import {
//   TableCell,
//   Box,
//   Stack,
//   Typography,
//   IconButton,
//   Tooltip,
// } from "@mui/material";

// // Proper Icons Based on Shift Types
// import EditIcon from "@mui/icons-material/Edit";
// import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Morning
// import WbTwilightIcon from "@mui/icons-material/WbTwilight"; // Afternoon
// import DarkModeIcon from "@mui/icons-material/DarkMode"; // Night
// import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Custom Shifts (BM, TM)
// import WaterDropIcon from "@mui/icons-material/WaterDrop"; // Week Off Badge
// import { isFutureDate } from "../utils/dateUtils";

// import { useAuth } from "../../auth/hooks/useAuth";
// import { usePermission } from "../../auth/hooks/usePermission";

// interface RosterShiftCellProps {
//   shift: any;
//   shiftDate: string | Date;
//   rowUserId: string | number;
//   onEditClick: (shift: any) => void;
//   isSelectedForSwap?: boolean;
//   isSwapMode?: boolean;
// }

// export const RosterShiftCell = ({
//   shift,
//   shiftDate,
//   rowUserId,
//   onEditClick,
//   isSelectedForSwap,
//   isSwapMode,
// }: RosterShiftCellProps) => {
//   // --- Auth & Permissions (Placeholder) ---
//   const { user, role } = useAuth();
//   const { hasPermission } = usePermission();

//   // const isOff = !shift || shift.shiftDisplay === "WO" || !shift.shiftDisplay;
//   // const shiftKey = shift?.shiftDisplay ?? "";

//   // const shiftStyle = shiftColorMap.get(shiftKey.charAt(0)) ?? {
//   //   background: "#F8FAFC",
//   //   color: "#475569",
//   //   border: "#E2E8F0",
//   // };

//   // const mins = shift?.availableMins || (isOff ? 0 : 540);
//   const count = shift?.assignActCount || 0;
//   const isFuture = isFutureDate(shiftDate);
//   const isOwnRoster = String(user?.userId) === String(rowUserId);
//   const isTeamMember = role === "TEAM_MEMBER";
//   const hasUpdatePermission =
//     hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";
//   let canEdit = false;
//   if (isFuture) {
//     if (isTeamMember) {
//       canEdit = isOwnRoster;
//     } else {
//       canEdit = hasUpdatePermission;
//     }
//   }
//   // --- Identify Shift Type ---
//   const isOff =
//     !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
//   const isLeave =
//     shift?.shiftDisplay === "Leave" ||
//     shift?.type === "Leave" ||
//     shift?.shiftDisplay?.toLowerCase() === "leave";

//   // Extract data (fallback to defaults if undefined)
//   const shiftKey = shift?.shiftDisplay?.charAt(0) || "W";
//   const shiftNameStr = (
//     shift?.shiftName ||
//     shift?.shiftDisplay ||
//     ""
//   ).toLowerCase();

//   const mins = shift?.availableMins || (isOff ? 0 : 540);
//   const hours = Math.floor(mins / 60);

//   // Formatted Output Text
//   const title = isOff
//     ? "Week Off"
//     : isLeave
//       ? "Leave"
//       : shift?.shiftDisplay || "Morning Shift";
//   const subtitle = isOff
//     ? ""
//     : isLeave
//       ? `${hours} hrs`
//       : shift?.timeRange || "8:00 AM - 10 PM";

//   // Map Colors
//   const shiftStyle =
//     shiftColorMap.get(isLeave ? "Leave" : isOff ? "W" : shiftKey) ??
//     shiftColorMap.get("W")!;

//   // --- Robust Icon Selection Logic ---
//   const renderStatusIcon = () => {
//     if (isOff) return null; // No status icon for Week Off

//     if (
//       shiftNameStr.includes("night") ||
//       shiftKey === "N" ||
//       shiftKey === "Q"
//     ) {
//       return <DarkModeIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
//     }
//     if (
//       shiftNameStr.includes("afternoon") ||
//       shiftNameStr.includes("evening")
//     ) {
//       return (
//         <WbTwilightIcon sx={{ fontSize: 14, color: shiftStyle.badgeBg }} />
//       );
//     }
//     if (shiftNameStr.includes("morning") || shiftKey === "A") {
//       return <WbSunnyIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
//     }
//     // Default for Custom Shifts
//     return <CheckCircleIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />;
//   };

//   return (
//     <TableCell sx={{ p: 0.5, borderBottom: "none", height: "100%" }}>
//       {/* Tooltip ensures users can always read full text even when screen is small and text truncates */}
//       <Tooltip
//         title={isOff ? "Week Off" : `${title} (${subtitle})`}
//         placement="top"
//         arrow
//         enterDelay={400}
//       >
//         <Box
//           sx={{
//             bgcolor: shiftStyle.cardBg,
//             border: `1px solid ${shiftStyle.cardBorder}`,
//             borderRadius: 1.5,
//             display: "flex",
//             alignItems: "center",
//             p: "6px 8px", // Compact padding
//             gap: 1,
//             width: "100%", // Take up available cell space
//             minWidth: 0, // CRITICAL: allows flex children to shrink below content size (enables ellipsis)
//             height: 48, // Fixed height for grid consistency
//             position: "relative",
//             overflow: "hidden", // Hide anything that spills out
//             transition: "all 0.2s ease",
//             cursor: canEdit ? "pointer" : "default",
//             "&:hover": {
//               boxShadow: canEdit ? "0px 3px 10px rgba(0,0,0,0.06)" : "none",
//               borderColor: canEdit ? shiftStyle.badgeBg : shiftStyle.cardBorder,
//               // Smart Hover: Fade out status icon, show edit button
//               "& .status-icon": { opacity: 0, transform: "scale(0.8)" },
//               "& .edit-btn": {
//                 opacity: 1,
//                 visibility: "visible",
//                 transform: "scale(1)",
//               },
//             },
//           }}
//           onClick={(e) => {
//             if (canEdit) onEditClick(shift);
//           }}
//         >
//           {/* --- 1. Left Badge Area (Fixed Width) --- */}
//           <Stack
//             alignItems="center"
//             spacing={0}
//             sx={{ flexShrink: 0, minWidth: 24 }}
//           >
//             <Box
//               sx={{
//                 bgcolor: shiftStyle.badgeBg,
//                 color: isOff ? "#94A3B8" : "#FFF",
//                 borderRadius: 1,
//                 width: 22,
//                 height: 22,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 700,
//                 fontSize: "0.7rem",
//                 ...(isOff && { bgcolor: "#E2E8F0" }), // Greyed out badge for Week Off
//               }}
//             >
//               {isOff ? (
//                 <WaterDropIcon sx={{ fontSize: 13 }} />
//               ) : isLeave ? (
//                 "I"
//               ) : (
//                 shiftKey
//               )}
//             </Box>
//             <Typography
//               fontSize="0.55rem"
//               color="text.secondary"
//               fontWeight={600}
//               sx={{ mt: 0.2 }}
//             >
//               {hours} m
//             </Typography>
//           </Stack>

//           {/* --- 2. Center Text Area (Fluid & Truncating) --- */}
//           <Stack
//             sx={{ flexGrow: 1, minWidth: 0, pr: 2 }}
//             justifyContent="center"
//           >
//             <Typography
//               fontSize="0.75rem"
//               fontWeight={700}
//               color={isLeave ? "#DC2626" : "text.primary"}
//               sx={{
//                 lineHeight: 1.2,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis", // Truncates with "..."
//               }}
//             >
//               {title}
//             </Typography>
//             {subtitle && (
//               <Typography
//                 fontSize="0.6rem"
//                 color={isLeave ? "#EF4444" : "text.secondary"}
//                 fontWeight={500}
//                 sx={{
//                   mt: 0.25,
//                   lineHeight: 1,
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 {subtitle}
//               </Typography>
//             )}
//           </Stack>

//           {/* --- 3. Absolute Positioned Right Icons (Saves Layout Space) --- */}
//           {
//             <>
//               {/* Status Icon Overlay */}
//               <Box
//                 className="status-icon"
//                 sx={{
//                   position: "absolute",
//                   top: 6,
//                   right: 6,
//                   transition: "all 0.2s ease",
//                   display: "flex",
//                   opacity: 0.8, // Slightly soften the icon visually
//                 }}
//               >
//                 {renderStatusIcon()}
//               </Box>

//               {/* Smart Hover Edit Button Overlay */}
//               {canEdit && (
//                 <IconButton
//                   className="edit-btn"
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onEditClick(shift);
//                   }}
//                   sx={{
//                     position: "absolute",
//                     top: 2,
//                     right: 2,
//                     opacity: 0,
//                     visibility: "hidden",
//                     transform: "scale(0.7)",
//                     transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//                     bgcolor: "rgba(255,255,255,0.85)", // Glassmorphism effect over text
//                     backdropFilter: "blur(2px)",
//                     boxShadow: "-2px 2px 4px rgba(0,0,0,0.05)",
//                     "&:hover": { bgcolor: "#FFF" },
//                     p: 0.4,
//                   }}
//                 >
//                   <EditIcon sx={{ fontSize: 13, color: shiftStyle.badgeBg }} />
//                 </IconButton>
//               )}
//             </>
//           }
//         </Box>
//       </Tooltip>
//     </TableCell>
//   );
// };

// // Accurate color mappings
// export const shiftColorMap = new Map<
//   string,
//   { badgeBg: string; cardBg: string; cardBorder: string }
// >([
//   ["A", { badgeBg: "#2563EB", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }], // Blue
//   ["B", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // Teal
//   ["N", { badgeBg: "#4F46E5", cardBg: "#EEF2FF", cardBorder: "#E0E7FF" }], // Indigo
//   ["Q", { badgeBg: "#7C3AED", cardBg: "#F5F3FF", cardBorder: "#EDE9FE" }], // Purple
//   ["Leave", { badgeBg: "#DC2626", cardBg: "#FEF2F2", cardBorder: "#FEE2E2" }], // Red
//   ["W", { badgeBg: "#94A3B8", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }], // Grey
//   ["T", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // Teal Custom
//   ["O", { badgeBg: "#0EA5E9", cardBg: "#F0F9FF", cardBorder: "#E0F2FE" }], // Light Blue Custom
// ]);

// // import {
// //   TableCell,
// //   Box,
// //   Stack,
// //   Typography,
// //   Tooltip,
// //   IconButton,
// // } from "@mui/material";
// // import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// // import EditIcon from "@mui/icons-material/Edit";
// // import { shiftColorMap } from "../constant/shiftColors";
// // import { useAuth } from "../../auth/hooks/useAuth";
// // import { usePermission } from "../../auth/hooks/usePermission";
// // import { isFutureDate } from "../utils/dateUtils";

// // interface RosterShiftCellProps {
// //   shift: any;
// //   shiftDate: string | Date; // The date of this specific cell's column
// //   rowUserId: string | number; // The userId of the employee row
// //   onEditClick: (shift: any) => void;
// // }

// // export const RosterShiftCell = ({
// //   shift,
// //   shiftDate,
// //   rowUserId,
// //   onEditClick,
// // }: RosterShiftCellProps) => {
// //   // 1. Get user and permission data
// //   const { user, role } = useAuth();
// //   const { hasPermission } = usePermission();

// //   const isOff = !shift || shift.shiftDisplay === "WO" || !shift.shiftDisplay;
// //   const shiftKey = shift?.shiftDisplay ?? "";

// //   const shiftStyle = shiftColorMap.get(shiftKey.charAt(0)) ?? {
// //     background: "#F8FAFC",
// //     color: "#475569",
// //     border: "#E2E8F0",
// //   };

// //   const mins = shift?.availableMins || (isOff ? 0 : 540);
// //   const count = shift?.assignActCount || 0;
// //   const isFuture = isFutureDate(shiftDate);
// //   const isOwnRoster = String(user?.userId) === String(rowUserId);
// //   const isTeamMember = role === "TEAM_MEMBER";
// //   const hasUpdatePermission =
// //     hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN";
// //   let canEdit = false;
// //   if (isFuture) {
// //     if (isTeamMember) {
// //       canEdit = isOwnRoster;
// //     } else {
// //       canEdit = hasUpdatePermission;
// //     }
// //   }

// //   if (isOff) {
// //     return (
// //       <TableCell sx={{ p: 0.25 }}>
// //         <Box
// //           sx={{
// //             height: "100%",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             bgcolor: "#FAFAFA",
// //             borderRadius: 1,
// //             position: "relative",
// //           }}
// //         >
// //           <Typography fontSize="0.65rem" color="text.disabled">
// //             WO
// //           </Typography>

// //           {canEdit && (
// //             <IconButton
// //               size="small"
// //               onClick={() => onEditClick(shift)}
// //               sx={{ position: "absolute", top: 0, right: 0, p: 0.2 }}
// //             >
// //               <EditIcon sx={{ fontSize: 11, color: "text.secondary" }} />
// //             </IconButton>
// //           )}
// //         </Box>
// //       </TableCell>
// //     );
// //   }

// //   return (
// //     <TableCell sx={{ p: 0.25 }}>
// //       <Box
// //         sx={{
// //           bgcolor: shiftStyle.background,
// //           borderLeft: `3px solid ${shiftStyle.border}`,
// //           color: shiftStyle.color,
// //           borderRadius: 1,
// //           height: "100%",
// //           px: 1,
// //           py: 0.25,
// //           mx:2,
// //           display: "flex",
// //           flexDirection: "column",
// //           justifyContent: "space-between",
// //         }}
// //       >
// //         <Stack
// //           direction="row"
// //           justifyContent="space-between"
// //           alignItems="center"
// //         >
// //           <Tooltip title="Shift Info">
// //             <InfoOutlinedIcon sx={{ fontSize: 13 }} />
// //           </Tooltip>

// //           <Typography fontSize="0.6rem" fontWeight={800}>
// //             {shift.shiftDisplay}
// //           </Typography>

// //           {canEdit ? (
// //             <Tooltip title="Edit Shift">
// //               <IconButton
// //                 size="small"
// //                 sx={{ p: 0 }}
// //                 onClick={() => onEditClick(shift)}
// //               >
// //                 <EditIcon sx={{ fontSize: 13, color: shiftStyle.color }} />
// //               </IconButton>
// //             </Tooltip>
// //           ) : (
// //             <Box sx={{ width: 13 }} />
// //           )}
// //         </Stack>

// //         <Stack direction="row" justifyContent="space-between">
// //           <Box
// //             sx={{
// //               bgcolor: "rgba(255,255,255,0.6)",
// //               px: 0.5,
// //               fontSize: "0.55rem",
// //               borderRadius: "3px",
// //             }}
// //           >
// //             {mins}m
// //           </Box>

// //           <Typography fontSize="0.65rem" fontWeight={700}>
// //             {count}
// //           </Typography>
// //         </Stack>
// //       </Box>
// //     </TableCell>
// //   );
// // };

// import { TableCell, Box, Stack, Typography, Tooltip } from "@mui/material";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// import EditIcon from "@mui/icons-material/Edit";
// import { shiftColorMap } from "../constant/shiftColors";
// // import { shiftColorMap } from "../constants/shiftColors";

// export const RosterShiftCell = ({ shift }: any) => {
//   const isOff =
//     !shift || shift.shiftDisplay === "WO" || !shift.shiftDisplay;

//   const shiftKey = shift?.shiftDisplay ?? "";

//   const shiftStyle = shiftColorMap.get(shiftKey.charAt(0)) ?? {
//     background: "#F8FAFC",
//     color: "#475569",
//     border: "#E2E8F0",
//   };

//   const mins = shift?.availableMins || (isOff ? 0 : 540);
//   const count = shift?.assignActCount || 0;

//   if (isOff) {
//     return (
//       <TableCell sx={{ p: 0.25 }}>
//         <Box
//           sx={{
//             height: "100%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             bgcolor: "#FAFAFA",
//             borderRadius: 1,
//           }}
//         >
//           <Typography fontSize="0.65rem" color="text.disabled">
//             WO
//           </Typography>
//         </Box>
//       </TableCell>
//     );
//   }

//   return (
//     <TableCell sx={{ p: 0.25 }}>
//       <Box
//         sx={{
//           bgcolor: shiftStyle.background,
//           borderLeft: `3px solid ${shiftStyle.border}`,
//           color: shiftStyle.color,
//           borderRadius: 1,
//           height: "100%",
//           px: 0.5,
//           py: 0.25,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//       >
//         <Stack direction="row" justifyContent="space-between">
//           <Tooltip title="Shift Info">
//             <InfoOutlinedIcon sx={{ fontSize: 13 }} />
//           </Tooltip>

//           <Typography fontSize="0.6rem" fontWeight={700}>
//             {shift.shiftDisplay}
//           </Typography>

//           <Tooltip title="Edit">
//             <EditIcon sx={{ fontSize: 13 }} />
//           </Tooltip>
//         </Stack>

//         <Stack direction="row" justifyContent="space-between">
//           <Box
//             sx={{
//               bgcolor: "rgba(255,255,255,0.6)",
//               px: 0.5,
//               fontSize: "0.55rem",
//               borderRadius: "3px",
//             }}
//           >
//             {mins}m
//           </Box>

//           <Typography fontSize="0.65rem" fontWeight={700}>
//             {count}
//           </Typography>
//         </Stack>
//       </Box>
//     </TableCell>
//   );
// };
