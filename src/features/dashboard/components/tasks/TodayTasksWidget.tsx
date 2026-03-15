// Give me improvement in this UI with more attractive and modern design. Use MUI components and styles to enhance the visual appeal and user experience. Make sure to maintain a clean and organized layout while adding some modern design elements.

import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { StatMini } from "./StatMini";
import SectionCard from "../common/SectionCard";

interface TaskItem {
  id: string;
  changeRequest: string;
  desc: string;
  status: string;
  planType: string;
}

const tasks: TaskItem[] = [
  {
    id: "1",
    changeRequest: "CRQ000005491598",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "SFP Addition",
  },
  {
    id: "2",
    changeRequest: "CRQ000005555555",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "SFP Addition",
  },
  {
    id: "3",
    changeRequest: "CRQ000004354841",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "Ring Addition",
  },
   {
    id: "4",
    changeRequest: "CRQ000004354841",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "Ring Addition",
  },
  {
    id: "5",
    changeRequest: "CRQ000004354841",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "Ring Addition",  
  },
  {
    id: "6",  
    changeRequest: "CRQ000004354841",
    desc: "Extend the 1+ ...",
    status: "Not Started",
    planType: "Ring Addition",
  }
];

const TodayTasksWidget = () => {
  const theme = useTheme();

  const total = 14;
  const completed = 0;
  const pending = 14;

  return (
    <SectionCard
      title="Today's Tasks"
      action={
        <Typography
          variant="caption"
          sx={{
            cursor: "pointer",
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          View All →
        </Typography>
      }
    >
    

      {/* Stats Row */}
      <Stack direction="row" spacing={1} mb={1}>
        <StatMini
          label="Total Tasks"
          value={total}
          icon={<AssignmentIcon fontSize="small" />}
          color={theme.palette.primary.main}
        />

        <StatMini
          label="Completed"
          value={completed}
          icon={<CheckCircleIcon fontSize="small" />}
          color={theme.palette.success.main}
        />

        <StatMini
          label="Pending"
          value={pending}
          icon={<PendingActionsIcon fontSize="small" />}
          color={theme.palette.warning.main}
        />
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* Table */}
      <TableContainer sx={{ flex: 1 ,  maxHeight: "80px", overflow: "auto", bgcolor: "transparent"}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                Change Request
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Task Desc
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Plan Type
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody >
            {tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell sx={{p:0}}>
                  {task.changeRequest}
                </TableCell>

                <TableCell sx={{p:0}}>
                  {task.desc}
                </TableCell>

                <TableCell sx={{p:0}}>
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(
                        theme.palette.warning.main,
                        0.15
                      ),
                      color: theme.palette.warning.main,
                    }}
                  />
                </TableCell >

                <TableCell sx={{p:0}}>
                  {task.planType}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
};

export default TodayTasksWidget;