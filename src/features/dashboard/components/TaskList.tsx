import { Box, Typography, Stack } from "@mui/material";
import { tasks } from "../api/dashboard.mock";
import StatusChip from "./ui/StatusChip";
import SectionCard from "./common/SectionCard";

const TaskList = () => {
  return (
    <SectionCard title="Today's Tasks">
      <Stack spacing={2}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography fontWeight={500}>{task.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {task.assignee} • {task.time}
              </Typography>
            </Box>
            <StatusChip label={task.status} />
          </Box>
        ))}
      </Stack>
    </SectionCard>
  );
};

export default TaskList;
