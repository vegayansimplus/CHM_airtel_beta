import {
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import StatsCards from "./StatsCards";
import TaskList from "./TaskList";
import TodayTasksWidget from "./tasks/TodayTasksWidget";

const TaskOverviewModule = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
    >
      {/* Stats Section */}
      <Box mb={1}>
        <TodayTasksWidget />
      </Box>

      {/* <Divider sx={{ mb: 3 }} /> */}

      {/* Task List Section */}
      {/* <TaskList /> */}
    </Paper>
  );
};

export default TaskOverviewModule;

// import {
//   Box,
//   Typography,
//   Divider,
//   Stack,
//   Paper,
// } from "@mui/material";
// import { alpha, useTheme } from "@mui/material/styles";
// import StatsCards from "./StatsCards";
// import TaskList from "./TaskList";

// const TaskOverviewModule = () => {
//   const theme = useTheme();

//   return (
//     <Paper
//       elevation={0}
//     >
//       {/* Stats Section */}
//       <Box mb={1}>
//         <StatsCards />
//       </Box>

//       {/* <Divider sx={{ mb: 3 }} /> */}

//       {/* Task List Section */}
//       <TaskList />
//     </Paper>
//   );
// };

// export default TaskOverviewModule;