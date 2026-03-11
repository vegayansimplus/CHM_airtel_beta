import { useMemo } from "react";
import {
  TableCell,
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { isFutureDate } from "../utils/dateUtils";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermission } from "../../auth/hooks/usePermission";

interface RosterShiftCellProps {
  shift: any;
  shiftDate: string | Date;
  rowUserId: string | number;
  onEditClick: (shift: any) => void;
  /** callback when info icon is clicked */
  onInfoClick?: (shift: any, date: string | Date, rowUserId: string | number) => void;
  isSelectedForSwap?: boolean;
  isSwapMode?: boolean;
}

export const RosterShiftCell = ({
  shift,
  shiftDate,
  rowUserId,
  onEditClick,
  onInfoClick,
  isSelectedForSwap,
  isSwapMode,
}: RosterShiftCellProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { user, role } = useAuth();
  const { hasPermission } = usePermission();

  // --- Logic Helpers ---
  const isOff =
    !shift || shift.shiftDisplay === "WO" || shift.type === "Week Off";
  const isLeave =
    shift?.shiftDisplay?.toLowerCase() === "leave" || shift?.type === "Leave";
  const isRegularShift = !isOff && !isLeave;

  const shiftKey = shift?.shiftDisplay?.charAt(0) || "W";
  const shiftNameStr = (
    shift?.shiftName ||
    shift?.shiftDisplay ||
    ""
  ).toLowerCase();
  const mins = shift?.availableMins || 0;

  // Use useMemo for color map to prevent re-calculations on every render
  const shiftStyle = useMemo(() => {
    const map = getShiftColorMap(isDarkMode);
    return map.get(isLeave ? "Leave" : isOff ? "W" : shiftKey) ?? map.get("W")!;
  }, [isDarkMode, isLeave, isOff, shiftKey]);

  // Permissions logic
  const isFuture = isFutureDate(shiftDate);
  const canEdit = useMemo(() => {
    if (!isFuture) return false;
    if (role === "TEAM_MEMBER")
      return String(user?.userId) === String(rowUserId);
    return (
      hasPermission("Roster Management", "UPDATE") || role === "SUPER_ADMIN"
    );
  }, [isFuture, role, user, rowUserId, hasPermission]);

  const title = isOff
    ? "WO"
    : isLeave
      ? "Leave"
      : shift?.shiftDisplay || "Shift";
  const subtitle = isOff ? "" : shift?.timeRange || "8:00 AM - 10 PM";

  const renderStatusIcon = () => {
    if (!isRegularShift) return null; // Hide info icon for Leave/WO

    const iconSx = { fontSize: 14, color: shiftStyle.badgeBg };
    if (shiftNameStr.includes("night") || shiftKey === "N")
      return <DarkModeIcon sx={iconSx} />;
    if (
      shiftNameStr.includes("afternoon") ||
      shiftNameStr.includes("evening") ||
      shiftKey === "B"
    )
      return <WbTwilightIcon sx={iconSx} />;
    if (shiftNameStr.includes("morning") || shiftKey === "A")
      return <WbSunnyIcon sx={iconSx} />;
    return <CheckCircleIcon sx={iconSx} />;
  };

  const isClickable = canEdit || isSwapMode;

  return (
    <TableCell sx={{ p: 0.4, borderBottom: "none", height: "100%" }}>
      <Tooltip
        title={`${title} ${subtitle ? `(${subtitle})` : ""}`}
        arrow
        enterDelay={500}
      >
        <Box
          onClick={() => isClickable && onEditClick(shift)}
          sx={{
            bgcolor: isSelectedForSwap
              ? isDarkMode
                ? "#0A2F4A"
                : "#E0F2FE"
              : shiftStyle.cardBg,
            border: `1px solid ${isSelectedForSwap ? "#0284C7" : shiftStyle.cardBorder}`,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            gap: 1.5,
            width: "100%",
            height: 52, // Standardized height
            position: "relative",
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            cursor: isClickable ? "pointer" : "default",
            "&:hover": {
              boxShadow: isClickable ? "0px 4px 12px rgba(0,0,0,0.08)" : "none",
              borderColor: isClickable ? "#0284C7" : shiftStyle.cardBorder,
              "& .status-icon": { opacity: 0, transform: "translateY(-5px)" },
              "& .edit-btn": { opacity: 1, transform: "scale(1)" },
            },
          }}
        >
          {/* 1. LEFT SIDE: Badge and Count */}
          <Stack alignItems="center" sx={{ flexShrink: 0, minWidth: 26 }}>
            <Box
              sx={{
                bgcolor: shiftStyle.badgeBg,
                color: "#FFF",
                borderRadius: "6px",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.7rem",
                ...(isOff && { bgcolor: isDarkMode ? "#475569" : "#CBD5E1" }),
              }}
            >
              {isOff ? (
                <WaterDropIcon sx={{ fontSize: 14 }} />
              ) : isLeave ? (
                "I"
              ) : (
                shiftKey
              )}
            </Box>

            {/* Count: Hidden for WO/Leave as requested */}
            {isRegularShift && (
              <Typography
                fontSize="0.6rem"
                color="text.secondary"
                fontWeight={600}
                sx={{ mt: 0.2 }}
              >
                {mins} m
              </Typography>
            )}
          </Stack>

          {/* 2. CENTER: Text Info */}
          <Stack sx={{ flexGrow: 1, minWidth: 0, pr: 1.5 }}>
            <Typography
              fontSize="0.8rem"
              fontWeight={700}
              noWrap
              sx={{
                color: isLeave ? "#BE185D" : "text.primary",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              fontSize="0.65rem"
              color="text.secondary"
              fontWeight={500}
              noWrap
              sx={{ lineHeight: 1 }}
            >
              {/* {subtitle || (isOff ? "WO" : "")} */}
            </Typography>
          </Stack>

          {/* 3. RIGHT OVERLAYS: Status Icon & Edit Button */}
          <Box
            className="status-icon"
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              transition: "all 0.2s ease",
              display: "flex",
              opacity: isSelectedForSwap ? 0 : 0.9,
            }}
          >
            {renderStatusIcon()}
          </Box>

          {canEdit && !isSwapMode && (
            <IconButton
              className="edit-btn"
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                opacity: 0,
                transform: "scale(0.8)",
                transition: "all 0.2s ease",
                bgcolor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
                p: 0.3,
              }}
            >
              <EditIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </IconButton>
          )}

          {/* info icon - visible on all regular shifts */}
          {isRegularShift && onInfoClick && !isSelectedForSwap && (
            <IconButton
              className="info-btn"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(shift, shiftDate, rowUserId);
              }}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                opacity: 0.7,
                bgcolor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
                p: 0.3,
              }}
            >
              <InfoIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </IconButton>
          )}

          {isSelectedForSwap && (
            <CheckCircleIcon
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 16,
                color: "#0284C7",
              }}
            />
          )}
        </Box>
      </Tooltip>
    </TableCell>
  );
};

// Shift color mappings with enhanced contrast for production
export const getShiftColorMap = (isDarkMode: boolean) => {
  const lightMap = new Map([
    ["G", { badgeBg: "#0095fa", cardBg: "#F0F9FF", cardBorder: "#BAE6FD" }],
    ["N", { badgeBg: "#35359c", cardBg: "#EEF2FF", cardBorder: "#C7D2FE" }],
    ["A", { badgeBg: "#EAB308", cardBg: "#FEFCE8", cardBorder: "#FEF08A" }],
    ["B", { badgeBg: "#F59E0B", cardBg: "#FFFBEB", cardBorder: "#FEF3C7" }],
    ["Leave", { badgeBg: "#DB2777", cardBg: "#FDF2F8", cardBorder: "#FBCFE8" }],
    ["W", { badgeBg: "#64748B", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }],
  ]);

  const darkMap = new Map([
    ["G", { badgeBg: "#0ea5e9", cardBg: "#0c4a6e", cardBorder: "#075985" }],
    ["N", { badgeBg: "#6366f1", cardBg: "#1e1b4b", cardBorder: "#312e81" }],
    ["A", { badgeBg: "#eab308", cardBg: "#422006", cardBorder: "#713f12" }],
    ["Leave", { badgeBg: "#f472b6", cardBg: "#500724", cardBorder: "#831843" }],
    ["W", { badgeBg: "#94a3b8", cardBg: "#1e293b", cardBorder: "#334155" }],
  ]);

  return isDarkMode ? darkMap : lightMap;
};

// import {
//   TableCell,
//   Box,
//   Stack,
//   Typography,
//   IconButton,
//   Tooltip,
//   useTheme,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Morning
// import WbTwilightIcon from "@mui/icons-material/WbTwilight"; // Afternoon
// import DarkModeIcon from "@mui/icons-material/DarkMode"; // Night
// import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Custom Shifts
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
//   // --- Theme & Auth & Permissions ---
//   const theme = useTheme();
//   const isDarkMode = theme.palette.mode === "dark";
//   const shiftColorMap = getShiftColorMap(isDarkMode);

//   const { user, role } = useAuth();
//   const { hasPermission } = usePermission();

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

//   // const mins = shift?.availableMins || (isOff ? 0 : 540);
//   const mins = shift?.availableMins || 0;
//   // const hours = Math.floor(mins / 60);

//   // Formatted Output Text
//   const title = isOff
//     ? "WO"
//     : isLeave
//       ? "Leave"
//       : shift?.shiftDisplay || "Morning Shift";
//   const subtitle = isOff
//     ? ""
//     : isLeave
//       ? `${mins} m`
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

//   // Cell should be clickable if they have edit permission OR if Swap Mode is active
//   const isClickable = canEdit || isSwapMode;

//   return (
//     <TableCell sx={{ p: 0.5, borderBottom: "none", height: "100%" }}>
//       {/* Tooltip ensures users can always read full text even when screen is small and text truncates */}
//       <Tooltip
//         title={isOff ? "WO" : `${title} (${subtitle})`}
//         placement="top"
//         arrow
//         enterDelay={400}
//       >
//         <Box
//           sx={{
//             bgcolor: isSelectedForSwap
//               ? isDarkMode ? "#0A2F4A" : "#E0F2FE"
//               : shiftStyle.cardBg,
//             border: `1px solid ${isSelectedForSwap ? (isDarkMode ? "#0284C7" : "#0284C7") : shiftStyle.cardBorder}`,
//             boxShadow: isSelectedForSwap ? `0 0 0 1px ${isDarkMode ? "#0284C7" : "#0284C7"}` : "none",
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
//             cursor: isClickable ? "pointer" : "default",
//             "&:hover": {
//               boxShadow: isClickable
//                 ? isSelectedForSwap
//                   ? `0 0 0 1px ${isDarkMode ? "#0284C7" : "#0284C7"}, 0px 3px 10px rgba(0,0,0,0.1)`
//                   : "0px 3px 10px rgba(0,0,0,0.06)"
//                 : "none",
//               borderColor: isSwapMode
//                 ? "#0284C7" // Show swap blue on hover during swap mode
//                 : canEdit
//                   ? shiftStyle.badgeBg
//                   : shiftStyle.cardBorder,
//               // Smart Hover: Fade out status icon, show edit button (only if NOT in swap mode)
//               "& .status-icon": { opacity: 0, transform: "scale(0.8)" },
//               "& .edit-btn": {
//                 opacity: isSwapMode ? 0 : 1, // Hide edit button in swap mode
//                 visibility: isSwapMode ? "hidden" : "visible",
//                 transform: isSwapMode ? "scale(0.7)" : "scale(1)",
//               },
//             },
//           }}
//           onClick={(e) => {
//             if (isClickable) onEditClick(shift);
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
//                 color: isOff ? (isDarkMode ? "#64748B" : "#94A3B8") : "#FFF",
//                 borderRadius: 1,
//                 width: 22,
//                 height: 22,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: 700,
//                 fontSize: "0.7rem",
//                 ...(isOff && { bgcolor: isDarkMode ? "#334155" : "#E2E8F0" }), // Greyed out badge for Week Off
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
//               {mins} m
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
//               {/* Status Icon Overlay - Hidden if selected to keep UI clean */}
//               {!isSelectedForSwap && (
//                 <Box
//                   className="status-icon"
//                   sx={{
//                     position: "absolute",
//                     top: 6,
//                     right: 6,
//                     transition: "all 0.2s ease",
//                     display: "flex",
//                     opacity: 0.8, // Slightly soften the icon visually
//                   }}
//                 >
//                   {renderStatusIcon()}
//                 </Box>
//               )}

//               {/* Selection Checkmark Overlay for Swap Mode */}
//               {isSelectedForSwap && (
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     top: 4,
//                     right: 4,
//                     display: "flex",
//                     color: "#0284C7",
//                   }}
//                 >
//                   <CheckCircleIcon sx={{ fontSize: 16 }} />
//                 </Box>
//               )}

//               {/* Smart Hover Edit Button Overlay - Disabled in Swap Mode */}
//               {canEdit && !isSwapMode && (
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
//                     bgcolor: isDarkMode ? "rgba(30, 30, 30, 0.85)" : "rgba(255,255,255,0.85)",
//                     backdropFilter: "blur(2px)",
//                     boxShadow: "-2px 2px 4px rgba(0,0,0,0.05)",
//                     "&:hover": {
//                       bgcolor: isDarkMode ? "rgba(50, 50, 50, 1)" : "#FFF"
//                     },
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

// // Accurate color mappings - Theme aware
// // Shift color mappings (Existing + New) with dark mode support
// export const getShiftColorMap = (
//   isDarkMode: boolean
// ): Map<string, { badgeBg: string; cardBg: string; cardBorder: string }> => {
//   const lightMap = new Map<
//     string,
//     { badgeBg: string; cardBg: string; cardBorder: string }
//   >([
//     // 🟦 General Shift
//     ["G", { badgeBg: "#0095fa", cardBg: "#EFF6FF", cardBorder: "#BFDBFE" }],
//     // 🟪 Night Shift
//     ["N", { badgeBg: "#35359c", cardBg: "#EEF2FF", cardBorder: "#C7D2FE" }],
//     // 🟩 LG Shift
//     ["L", { badgeBg: "#2b5c35", cardBg: "#F0FDF4", cardBorder: "#BBF7D0" }],
//     // 🟨 A Shift
//     ["A", { badgeBg: "#f0f01a", cardBg: "#FEFCE8", cardBorder: "#FEF08A" }],
//     // 🟥 C Shift
//     ["C", { badgeBg: "#ff5940", cardBg: "#FFF7ED", cardBorder: "#FED7AA" }],
//     // 🟥 Holiday
//     ["H", { badgeBg: "#ff0000", cardBg: "#FEF2F2", cardBorder: "#FECACA" }],
//     // 🩷 Leave
//     ["Leave", { badgeBg: "#ff2e96", cardBg: "#FDF2F8", cardBorder: "#FBCFE8" }],
//     // ⬜ Week Off
//     ["W", { badgeBg: "#918f8e", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }],
//     // Existing shifts (kept)
//     ["B", { badgeBg: "#f49325", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // B Shift
//     ["Q", { badgeBg: "#7C3AED", cardBg: "#F5F3FF", cardBorder: "#EDE9FE" }], // Q Shift
//     ["T", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // T Shift
//     ["O", { badgeBg: "#0EA5E9", cardBg: "#F0F9FF", cardBorder: "#E0F2FE" }], // O Shift
//   ]);

//   // Dark mode map - darker backgrounds and adjusted borders
//   const darkMap = new Map<
//     string,
//     { badgeBg: string; cardBg: string; cardBorder: string }
//   >([
//     // 🟦 General Shift
//     ["G", { badgeBg: "#0095fa", cardBg: "#0F2D4D", cardBorder: "#0A4A7C" }],
//     // 🟪 Night Shift
//     ["N", { badgeBg: "#35359c", cardBg: "#1A1A2E", cardBorder: "#2D2D5F" }],
//     // 🟩 LG Shift
//     ["L", { badgeBg: "#2b5c35", cardBg: "#0F3D1F", cardBorder: "#1A6E3F" }],
//     // 🟨 A Shift
//     ["A", { badgeBg: "#f0f01a", cardBg: "#3D3D0F", cardBorder: "#666620" }],
//     // 🟥 C Shift
//     ["C", { badgeBg: "#ff5940", cardBg: "#3D1F0F", cardBorder: "#6B2F0F" }],
//     // 🟥 Holiday
//     ["H", { badgeBg: "#ff0000", cardBg: "#3D0F0F", cardBorder: "#6B1515" }],
//     // 🩷 Leave
//     ["Leave", { badgeBg: "#ff2e96", cardBg: "#3D0F2D", cardBorder: "#6B1F4A" }],
//     // ⬜ Week Off
//     ["W", { badgeBg: "#918f8e", cardBg: "#1A1F2E", cardBorder: "#2D3142" }],
//     // Existing shifts (kept)
//     ["B", { badgeBg: "#f49325", cardBg: "#1A2E2E", cardBorder: "#2D4D4D" }], // B Shift
//     ["Q", { badgeBg: "#7C3AED", cardBg: "#1A0F3D", cardBorder: "#3D1F6B" }], // Q Shift
//     ["T", { badgeBg: "#0D9488", cardBg: "#0F2E2E", cardBorder: "#1A4D4D" }], // T Shift
//     ["O", { badgeBg: "#0EA5E9", cardBg: "#0F1F3D", cardBorder: "#1A3D6B" }], // O Shift
//   ]);

//   return isDarkMode ? darkMap : lightMap;
// };

// // Kept for backward compatibility - will be deprecated
// export const shiftColorMap = new Map<
//   string,
//   { badgeBg: string; cardBg: string; cardBorder: string }
// >([
//   // 🟦 General Shift
//   ["G", { badgeBg: "#0095fa", cardBg: "#EFF6FF", cardBorder: "#BFDBFE" }],

//   // 🟪 Night Shift
//   ["N", { badgeBg: "#35359c", cardBg: "#EEF2FF", cardBorder: "#C7D2FE" }],

//   // 🟩 LG Shift
//   ["L", { badgeBg: "#2b5c35", cardBg: "#F0FDF4", cardBorder: "#BBF7D0" }],

//   // 🟨 A Shift
//   ["A", { badgeBg: "#f0f01a", cardBg: "#FEFCE8", cardBorder: "#FEF08A" }],

//   // 🟥 C Shift
//   ["C", { badgeBg: "#ff5940", cardBg: "#FFF7ED", cardBorder: "#FED7AA" }],

//   // 🟥 Holiday
//   ["H", { badgeBg: "#ff0000", cardBg: "#FEF2F2", cardBorder: "#FECACA" }],

//   // 🩷 Leave
//   ["Leave", { badgeBg: "#ff2e96", cardBg: "#FDF2F8", cardBorder: "#FBCFE8" }],

//   // ⬜ Week Off
//   ["W", { badgeBg: "#918f8e", cardBg: "#F8FAFC", cardBorder: "#E2E8F0" }],

//   // ---------------------------
//   // Existing shifts (kept)
//   // ---------------------------

//   ["B", { badgeBg: "#f49325", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // B Shift
//   ["Q", { badgeBg: "#7C3AED", cardBg: "#F5F3FF", cardBorder: "#EDE9FE" }], // Q Shift
//   ["T", { badgeBg: "#0D9488", cardBg: "#F0FDFA", cardBorder: "#CCFBF1" }], // T Shift
//   ["O", { badgeBg: "#0EA5E9", cardBg: "#F0F9FF", cardBorder: "#E0F2FE" }], // O Shift
// ]);
