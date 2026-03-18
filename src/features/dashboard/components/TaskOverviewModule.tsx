import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { dummyDashboardData } from "../api/dashboard.dummy";
import { AppScrollView } from "../../../components/ui/AppScrollView";

export default function TaskOverviewModule() {
  const { tasks, taskList } = dummyDashboardData;

  // Stat Boxes Data
  const statBoxes = [
    {
      label: "Total Tasks",
      count: tasks.total,
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Completed",
      count: tasks.completed,
      icon: <TaskAltIcon sx={{ fontSize: 16 }} />,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Pending",
      count: tasks.pending,
      icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
  ];

  // Helper to color-code priority chips
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return { bg: "#FEF2F2", color: "#EF4444" }; // Red
      case "High":
        return { bg: "#FFF7ED", color: "#F97316" }; // Orange
      default:
        return { bg: "#F1F5F9", color: "#64748B" }; // Gray
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
        border: "1px solid #E2E8F0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // p: 1,
          p: "0.5rem 1rem",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              p: 0.5,
              borderRadius: 1.5,
              display: "flex",
              border: "1px solid #E2E8F0",
            }}
          >
            <AssignmentOutlinedIcon sx={{ color: "#475569", fontSize: 18 }} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#0F172A" }}
          >
            Today's Tasks
          </Typography>
        </Stack>
        <Button
          size="small"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: "10px !important" }} />}
          sx={{
            color: "#3B82F6",
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            minWidth: 0,
          }}
        >
          View All
        </Button>
      </Box>

      {/* Mini Stats Row */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          gap: 1,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        {statBoxes.map((box, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              bgcolor: box.bg,
              p: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              border: `1px solid ${box.color}20`,
            }}
          >
            <Box
              sx={{
                color: box.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {box.icon}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1 }}
              >
                {box.count}
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#64748B",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
              }}
            >
              {box.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Scrollable Task List */}
      <AppScrollView
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          maxHeight: 90,
        }}
        // sx={{
        //   flex: 1,
        //   display: "flex",
        //   flexDirection: "column",
        //   overflowY: "auto",
        //   maxHeight: 100,
        // }}
      >
        {taskList.map((task, index) => {
          const isCompleted = task.status === "completed";
          const priorityStyle = getPriorityStyle(task.priority);

          return (
            <Box
              key={task.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 0.5,
                gap: 0.5,
                borderBottom:
                  index !== taskList.length - 1 ? "1px solid #F1F5F9" : "none",
                transition: "bgcolor 0.2s",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              {/* Checkbox Icon */}
              <IconButton
                size="small"
                sx={{ p: 0.5, color: isCompleted ? "#10B981" : "#CBD5E1" }}
              >
                {isCompleted ? (
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>

              {/* Task Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    color: isCompleted ? "#94A3B8" : "#0F172A",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    mb: 0.2,
                    textDecoration: isCompleted ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    sx={{
                      color: "#64748B",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                    }}
                  >
                    {task.project}
                  </Typography>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      bgcolor: "#CBD5E1",
                    }}
                  />
                  <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
                    {task.time}
                  </Typography>
                </Stack>
              </Box>

              {/* Priority Chip */}
              {!isCompleted && (
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    bgcolor: priorityStyle.bg,
                    color: priorityStyle.color,
                    fontWeight: 600,
                    borderRadius: 1.5,
                  }}
                />
              )}
            </Box>
          );
        })}
      </AppScrollView>
    </Card>
  );
}

// import { Box, Typography, Card, Button, Stack } from "@mui/material";
// import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
// import TaskAltIcon from "@mui/icons-material/TaskAlt";
// import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import { dummyDashboardData } from "../api/dashboard.dummy";

// export default function TaskOverviewModule() {
//   const { tasks } = dummyDashboardData;

//   const statBoxes = [
//     {
//       label: "Total Tasks",
//       count: tasks.total,
//       icon: <AssignmentOutlinedIcon fontSize="small" />,
//       color: "#3B82F6",
//       bg: "#EFF6FF",
//     },
//     {
//       label: "Completed",
//       count: tasks.completed,
//       icon: <TaskAltIcon fontSize="small" />,
//       color: "#10B981",
//       bg: "#ECFDF5",
//     },
//     {
//       label: "Pending",
//       count: tasks.pending,
//       icon: <HourglassEmptyIcon fontSize="small" />,
//       color: "#F59E0B",
//       bg: "#FFFBEB",
//     },
//   ];

//   return (
//     <Card
//       sx={{
//         borderRadius: 3,
//         boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
//         border: "1px solid #E2E8F0",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           p: 1.5,
//           borderBottom: "1px solid #F1F5F9",
//         }}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Box
//             sx={{
//               bgcolor: "#F8FAFC",
//               p: 0.5,
//               borderRadius: 1.5,
//               display: "flex",
//               border: "1px solid #E2E8F0",
//             }}
//           >
//             <AssignmentOutlinedIcon sx={{ color: "#475569", fontSize: 18 }} />
//           </Box>
//           <Typography
//             variant="subtitle2"
//             sx={{ fontWeight: 600, color: "#0F172A" }}
//           >
//             Today's Tasks
//           </Typography>
//         </Stack>
//         <Button
//           size="small"
//           endIcon={<ArrowForwardIosIcon sx={{ fontSize: "10px !important" }} />}
//           sx={{
//             color: "#64748B",
//             textTransform: "none",
//             fontSize: "0.75rem",
//             fontWeight: 600,
//           }}
//         >
//           View All
//         </Button>
//       </Box>

//       <Box sx={{ p: 1.5, display: "flex", gap: 1.5 }}>
//         {statBoxes.map((box, i) => (
//           <Box
//             key={i}
//             sx={{
//               flex: 1,
//               bgcolor: box.bg,
//               p: 1.5,
//               borderRadius: 2,
//               display: "flex",
//               flexDirection: "column",
//               gap: 0.5,
//               border: `1px solid ${box.color}20`,
//             }}
//           >
//             <Box
//               sx={{
//                 color: box.color,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//               }}
//             >
//               {box.icon}
//               <Typography
//                 variant="subtitle1"
//                 sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1 }}
//               >
//                 {box.count}
//               </Typography>
//             </Box>
//             <Typography
//               sx={{
//                 color: "#64748B",
//                 fontWeight: 500,
//                 fontSize: "0.65rem",
//                 textTransform: "uppercase",
//                 letterSpacing: 0.5,
//               }}
//             >
//               {box.label}
//             </Typography>
//           </Box>
//         ))}
//       </Box>

//       <Box
//         sx={{
//           flex: 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           pb: 1.5,
//         }}
//       >
//         <Typography
//           variant="caption"
//           sx={{ color: "#94A3B8", fontWeight: 500 }}
//         >
//           All caught up for today!
//         </Typography>
//       </Box>
//     </Card>
//   );
// }

// import {
//   Box,
//   // Typography,
//   // Divider,
//   // Stack,
//   Paper,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// // import StatsCards from "./StatsCards";
// // import TaskList from "./TaskList";
// import TodayTasksWidget from "./tasks/TodayTasksWidget";

// const TaskOverviewModule = () => {
//   const theme = useTheme();

//   return (
//     <>
//       {/* Stats Section */}
//       <Box mb={1}>
//         <TodayTasksWidget />
//       </Box>

//       {/* <Divider sx={{ mb: 3 }} /> */}

//       {/* Task List Section */}
//       {/* <TaskList /> */}
//     </>
//   );
// };

// export default TaskOverviewModule;

// // import {
// //   Box,
// //   Typography,
// //   Divider,
// //   Stack,
// //   Paper,
// // } from "@mui/material";
// // import { alpha, useTheme } from "@mui/material/styles";
// // import StatsCards from "./StatsCards";
// // import TaskList from "./TaskList";

// // const TaskOverviewModule = () => {
// //   const theme = useTheme();

// //   return (
// //     <Paper
// //       elevation={0}
// //     >
// //       {/* Stats Section */}
// //       <Box mb={1}>
// //         <StatsCards />
// //       </Box>

// //       {/* <Divider sx={{ mb: 3 }} /> */}

// //       {/* Task List Section */}
// //       <TaskList />
// //     </Paper>
// //   );
// // };

// // export default TaskOverviewModule;
