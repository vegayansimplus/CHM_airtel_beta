import {
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { tasks } from "../api/dashboard.mock";

const TaskTabsView = () => {
  const [value, setValue] = useState(0);
  const statuses = ["All", "Pending", "Completed"];

  const filtered =
    value === 0
      ? tasks
      : tasks.filter((t) => t.status === statuses[value]);

  return (
    <Box>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        {statuses.map((s) => (
          <Tab key={s} label={s} />
        ))}
      </Tabs>

      {filtered.map((task) => (
        <Typography key={task.id} sx={{ mt: 1 }}>
          {task.title}
        </Typography>
      ))}
    </Box>
  );
};

export default TaskTabsView;

// import {
//   Avatar,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   LinearProgress,
//   Chip,
//   Paper,
//   Stack,
// } from "@mui/material";
// import { alpha, useTheme } from "@mui/material/styles";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { tasks } from "../api/dashboard.mock";
// import type { Task } from "../types/dashboard.types";

// const TaskTable = () => {
//   const theme = useTheme();

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return theme.palette.warning.main;
//       case "Tomorrow":
//         return theme.palette.info.main;
//       case "Completed":
//         return theme.palette.success.main;
//       default:
//         return theme.palette.grey[500];
//     }
//   };

//   const getProgressValue = (status: string) => {
//     if (status === "Pending") return 40;
//     if (status === "Tomorrow") return 70;
//     if (status === "Completed") return 100;
//     return 0;
//   };

//   return (
//     <Paper  elevation={1} sx={{ borderRadius: 3 }}>
//       <TableContainer>
//         <Table size="small">
//           {/* Header */}
//           <TableHead>
//             <TableRow
//               sx={{
//                 backgroundColor: alpha(theme.palette.grey[500], 0.04),
//               }}
//             >
//               <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
//               <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
//               <TableCell sx={{ fontWeight: 600 }}>Schedule</TableCell>
//               <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//               <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
//               <TableCell align="right" sx={{ fontWeight: 600 }}>
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody >
//             {tasks.map((task: Task) => {
//               const statusColor = getStatusColor(task.status);

//               return (
//                 <TableRow
//                   key={task.id}
//                   sx={{
//                     transition: "all 0.2s ease",
//                     "&:hover": {
//                       backgroundColor: alpha(theme.palette.primary.main, 0.04),
//                     },
//                     p: 2,
//                   }}
//                 >
//                   {/* Task Title */}
//                   <TableCell sx={{p:1}}>
//                     <Stack spacing={1}>
//                       <Typography fontWeight={600}>{task.title}</Typography>
//                       {/* <Typography variant="caption" color="text.secondary">
//                         Task ID: {task.id}
//                       </Typography> */}
//                     </Stack>
//                   </TableCell>

//                   {/* Assignee */}
//                   <TableCell  sx={{p:0}}>
//                     <Stack direction="row" spacing={0.5} alignItems="center">
//                       <Avatar
//                         sx={{
//                           width: 30,
//                           height: 30,
//                           bgcolor: alpha(statusColor, 0.15),
//                           color: statusColor,
//                           fontSize: 14,
//                         }}
//                       >
//                         {task.assignee.charAt(0)}
//                       </Avatar>
//                       <Typography variant="body2">{task.assignee}</Typography>
//                     </Stack>
//                   </TableCell>

//                   {/* Schedule */}
//                   <TableCell  sx={{p:0}}>
//                     <Stack direction="row" spacing={0.5} alignItems="center">
//                       <AccessTimeIcon
//                         sx={{ fontSize: 16, color: "text.secondary" }}
//                       />
//                       <Typography variant="body2">{task.time}</Typography>
//                     </Stack>
//                   </TableCell>

//                   {/* Status */}
//                   <TableCell  sx={{p:0}}>
//                     <Chip
//                       label={task.status}
//                       size="small"
//                       sx={{
//                         fontWeight: 500,
//                         backgroundColor: alpha(statusColor, 0.08),
//                         color: statusColor,
//                       }}
//                     />
//                   </TableCell>

//                   {/* Progress */}
//                   <TableCell sx={{ width: 160 ,p:0}} >
//                     <LinearProgress
//                       variant="determinate"
//                       value={getProgressValue(task.status)}
//                       sx={{
//                         height: 5,
//                         borderRadius: 5,
//                         backgroundColor: alpha(statusColor, 0.08),
//                         "& .MuiLinearProgress-bar": {
//                           backgroundColor: statusColor,
//                         },
//                       }}
//                     />
//                   </TableCell>

//                   {/* Actions */}
//                   <TableCell align="right"  sx={{p:0}}>
//                     <IconButton
//                       size="small"
//                       sx={{
//                         color: theme.palette.text.secondary,
//                         "&:hover": {
//                           color: theme.palette.primary.main,
//                           backgroundColor: alpha(
//                             theme.palette.primary.main,
//                             0.08,
//                           ),
//                         },
//                       }}
//                     >
//                       <EditOutlinedIcon fontSize="small" />
//                     </IconButton>

//                     <IconButton
//                       size="small"
//                       sx={{
//                         color: statusColor,
//                         "&:hover": {
//                           backgroundColor: alpha(statusColor, 0.08),
//                         },
//                       }}
//                     >
//                       <CheckCircleOutlineIcon fontSize="small" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Paper>
//   );
// };

// export default TaskTable;

// import {
//   Box,
//   Avatar,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   LinearProgress,
//   Chip,
//   Paper,
// } from "@mui/material";
// import { alpha, useTheme } from "@mui/material/styles";
// import EditIcon from "@mui/icons-material/Edit";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { tasks } from "../api/dashboard.mock";
// import type { Task } from "../types/dashboard.types";

// const TaskTable = () => {
//   const theme = useTheme();

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return theme.palette.warning.main;
//       case "Tomorrow":
//         return theme.palette.info.main;
//       case "Completed":
//         return theme.palette.success.main;
//       default:
//         return theme.palette.grey[500];
//     }
//   };

//   const getProgressValue = (status: string) => {
//     if (status === "Pending") return 40;
//     if (status === "Tomorrow") return 70;
//     if (status === "Completed") return 100;
//     return 0;
//   };

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         borderRadius: 3,
//         border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
//         overflow: "hidden",
//       }}
//     >
//       <TableContainer sx={{ maxHeight: 400 }}>
//         <Table stickyHeader size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Task</TableCell>
//               <TableCell>Assignee</TableCell>
//               <TableCell>Schedule</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Progress</TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {tasks.map((task: Task) => {
//               const statusColor = getStatusColor(task.status);

//               return (
//                 <TableRow
//                   key={task.id}
//                   hover
//                   sx={{
//                     transition: "0.2s ease",
//                     "&:hover": {
//                       backgroundColor: alpha(
//                         theme.palette.primary.main,
//                         0.05
//                       ),
//                     },
//                   }}
//                 >
//                   {/* Task Title */}
//                   <TableCell>
//                     <Typography fontWeight={600}>
//                       {task.title}
//                     </Typography>
//                   </TableCell>

//                   {/* Assignee */}
//                   <TableCell>
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar
//                         sx={{
//                           width: 28,
//                           height: 28,
//                           bgcolor: alpha(statusColor, 0.2),
//                           color: statusColor,
//                           fontSize: 14,
//                         }}
//                       >
//                         {task.assignee.charAt(0)}
//                       </Avatar>

//                       <Typography variant="body2">
//                         {task.assignee}
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* Schedule */}
//                   <TableCell>
//                     <Box display="flex" alignItems="center" gap={0.5}>
//                       <AccessTimeIcon
//                         sx={{ fontSize: 16, color: "text.secondary" }}
//                       />
//                       <Typography variant="body2">
//                         {task.time}
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* Status */}
//                   <TableCell>
//                     <Chip
//                       label={task.status}
//                       size="small"
//                       sx={{
//                         fontWeight: 600,
//                         backgroundColor: alpha(statusColor, 0.12),
//                         color: statusColor,
//                       }}
//                     />
//                   </TableCell>

//                   {/* Progress */}
//                   <TableCell sx={{ width: 150 }}>
//                     <LinearProgress
//                       variant="determinate"
//                       value={getProgressValue(task.status)}
//                       sx={{
//                         height: 6,
//                         borderRadius: 5,
//                         backgroundColor: alpha(statusColor, 0.15),
//                         "& .MuiLinearProgress-bar": {
//                           backgroundColor: statusColor,
//                         },
//                       }}
//                     />
//                   </TableCell>

//                   {/* Actions */}
//                   <TableCell align="right">
//                     <IconButton size="small">
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                     <IconButton size="small">
//                       <CheckCircleOutlineIcon
//                         fontSize="small"
//                         sx={{ color: statusColor }}
//                       />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Paper>
//   );
// };

// export default TaskTable;
