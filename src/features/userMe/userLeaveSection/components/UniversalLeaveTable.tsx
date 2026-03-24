import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { LeaveStatusChip } from "./LeaveStatusChip";
import { LeaveTableEmptyState } from "./LeaveTableEmptyState";
import { formatDateRange } from "../utils/leave.utils";
import type { LeaveHistoryResponse } from "../types/leave.types";

interface UniversalLeaveTableProps {
  data: LeaveHistoryResponse[];
}

const COLUMNS = [
  { key: "leaveType", label: "Leave Type", width: "25%" },
  { key: "dates", label: "Dates", width: "30%" },
  { key: "duration", label: "Duration", width: "20%" },
  { key: "status", label: "Status", width: "25%" },
] as const;

export const UniversalLeaveTable = ({ data }: UniversalLeaveTableProps) => {
  if (!data?.length) return <LeaveTableEmptyState />;

  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table sx={{ minWidth: 50, tableLayout: "fixed" }}>
        {/* ── Head ──────────────────────────────────────────────── */}
        <TableHead sx={{ position: "sticky", top: 0, zIndex: 1 }}>
          <TableRow
            sx={{
              bgcolor: "grey.50",
              "& .MuiTableCell-root": {
                borderBottom: "2px solid",
                borderColor: "divider",
                py: 1.25,
              },
            }}
          >
            {COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                width={col.width}
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ── Body ──────────────────────────────────────────────── */}
        <TableBody>
          {data.map((leave, index) => (
            <TableRow
              key={leave.leaveId}
              hover
              sx={{
                bgcolor: index % 2 === 0 ? "transparent" : "grey.50/40",
                transition: "background-color 0.15s ease",
                "&:hover": { bgcolor: "primary.50" },
                "&:last-child td": { borderBottom: 0 },
                "& .MuiTableCell-root": { py: 1.75 },
              }}
            >
              {/* Leave Type */}
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: getTypeColor(leave.leaveType),
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {leave.leaveType.toLowerCase()}
                  </Typography>
                </Box>
              </TableCell>

              {/* Dates */}
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {formatDateRange(leave.leaveStartDate, leave.leaveEndDate)}
                </Typography>
              </TableCell>

              {/* Duration */}
              <TableCell>
                <Typography variant="body2" fontWeight={500} lineHeight={1.3}>
                  {leave.ageDays} {leave.ageDays === 1 ? "Day" : "Days"}
                </Typography>
                <Chip
                  label={leave.leaveDuration}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 0.5,
                    height: 18,
                    fontSize: "0.65rem",
                    borderRadius: 1,
                    color: "text.secondary",
                    borderColor: "divider",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </TableCell>

              {/* Status */}
              <TableCell>
                <LeaveStatusChip status={leave.leaveStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Maps leave type to a subtle color dot for quick scanning.
 * Extend as more leave types are added.
 */
const TYPE_COLOR_MAP: Record<string, string> = {
  "sick leave": "#EF4444",
  "casual leave": "#3B82F6",
  "earned leave": "#10B981",
  "maternity leave": "#EC4899",
  "paternity leave": "#8B5CF6",
};

const getTypeColor = (leaveType: string): string =>
  TYPE_COLOR_MAP[leaveType.toLowerCase()] ?? "#9CA3AF";

export default UniversalLeaveTable;

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { LeaveStatusChip } from "./LeaveStatusChip";
// import { LeaveTableEmptyState } from "./LeaveTableEmptyState";
// import { formatDateRange } from "../utils/leave.utils";
// import type { LeaveHistoryResponse } from "../types/leave.types";

// interface UniversalLeaveTableProps {
//   data: LeaveHistoryResponse[];
// }

// const COLUMN_HEADERS = ["Leave Type", "Dates", "Duration", "Status"] as const;

// export const UniversalLeaveTable = ({ data }: UniversalLeaveTableProps) => {
//   if (!data?.length) return <LeaveTableEmptyState />;

//   return (
//     <TableContainer>
//       <Table sx={{ minWidth: 500 }}>
//         <TableHead>
//           <TableRow sx={{ backgroundColor: "background.default" }}>
//             {COLUMN_HEADERS.map((col) => (
//               <TableCell key={col} sx={{ fontWeight: 600 }}>
//                 {col}
//               </TableCell>
//             ))}
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {data.map((leave) => (
//             <TableRow key={leave.leaveId} hover>
//               <TableCell sx={{ textTransform: "capitalize", fontWeight: 500 }}>
//                 {leave.leaveType.toLowerCase()}
//               </TableCell>

//               <TableCell>
//                 {formatDateRange(leave.leaveStartDate, leave.leaveEndDate)}
//               </TableCell>

//               <TableCell>
//                 <Typography variant="body2">{leave.ageDays} Day(s)</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {leave.leaveDuration}
//                 </Typography>
//               </TableCell>

//               <TableCell>
//                 <LeaveStatusChip status={leave.leaveStatus} />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default UniversalLeaveTable;

// import { Table, TableBody, TableCell, TableHead, TableRow, Chip, TableContainer, Typography, Box } from "@mui/material";
// import InboxIcon from "@mui/icons-material/Inbox";
// import type { LeaveHistoryResponse } from "../types/leave.types";

// interface Props {
//   data: LeaveHistoryResponse[];
// }

// const getStatusColor = (status: string) => {
//   switch (status?.toUpperCase()) {
//     case "APPROVED": return "success";
//     case "REJECTED": return "error";
//     case "PENDING": return "warning";
//     default: return "default";
//   }
// };

// const formatDate = (dateString: string) =>
//   new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// export default function UniversalLeaveTable({ data }: Props) {
//   // If the filtered list is empty, show a nice empty state
//   if (!data?.length) {
//     return (
//       <Box textAlign="center" py={8}>
//         <InboxIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
//         <Typography variant="h6" color="text.secondary">No leave records found</Typography>
//       </Box>
//     );
//   }

//   return (
//     <TableContainer>
//       <Table sx={{ minWidth: 500 }}>
//         <TableHead>
//           <TableRow sx={{ backgroundColor: "background.default" }}>
//             <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
//             <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
//             <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
//             <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {data.map((leave) => (
//             <TableRow key={leave.leaveId} hover>
//               <TableCell sx={{ textTransform: "capitalize", fontWeight: 500 }}>
//                 {leave.leaveType.toLowerCase()}
//               </TableCell>

//               <TableCell>
//                 {formatDate(leave.leaveStartDate)}
//                 {leave.leaveStartDate !== leave.leaveEndDate && ` - ${formatDate(leave.leaveEndDate)}`}
//               </TableCell>

//               <TableCell>
//                 <Typography variant="body2">{leave.ageDays} Day(s)</Typography>
//                 <Typography variant="caption" color="text.secondary">{leave.leaveDuration}</Typography>
//               </TableCell>

//               <TableCell>
//                 <Chip
//                   label={leave.leaveStatus}
//                   color={getStatusColor(leave.leaveStatus) as any}
//                   size="small"
//                   sx={{ fontWeight: 600, minWidth: 80 }}
//                 />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }
