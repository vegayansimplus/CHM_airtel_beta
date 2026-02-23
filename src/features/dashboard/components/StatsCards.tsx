import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { stats } from "../api/dashboard.mock";
import { alpha } from "@mui/material/styles";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  trend?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  progress,
  trend,
}: StatCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: `1px solid ${alpha(color, 0.2)}`,
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 12px 30px ${alpha(color, 0.25)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: color,
        }}
      />

      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value}
            </Typography>

            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "success.main", fontWeight: 600 }}
                >
                  {trend}
                </Typography>
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              height: 50,
              width: 50,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: alpha(color, 0.15),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: alpha(color, 0.1),
                "& .MuiLinearProgress-bar": {
                  backgroundColor: color,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatsCards = () => {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<AssignmentIcon />}
          color="#3f51b5"
          progress={80}
          trend="+12% this week"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<PendingActionsIcon />}
          color="#ff9800"
          progress={50}
          trend="+5% today"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Attendance Today"
          value={`${stats.attendance}%`}
          icon={<TrendingUpIcon />}
          color="#4caf50"
          progress={stats.attendance}
          trend="On Track"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={<NotificationsActiveIcon />}
          color="#f44336"
          progress={40}
          trend="Needs Attention"
        />
      </Grid>
    </Grid>
  );
};

export default StatsCards;

// import { Grid, Card, CardContent, Typography } from "@mui/material";
// import { stats } from "../api/dashboard.mock";

// const StatsCards = () => {
//   return (
//     <Grid container spacing={2}>
//       <Grid
//     //   item xs={12} md={3}
//       size={{ xs: 12, md: 3 }}
//       >
//         <Card>
//           <CardContent>
//             <Typography variant="h6">{stats.totalTasks}</Typography>
//             <Typography variant="body2">Total Tasks</Typography>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid
//     //   item xs={12} md={3}
//       size={{ xs: 12, md: 3 }}

//       >
//         <Card>
//           <CardContent>
//             <Typography variant="h6">{stats.pendingTasks}</Typography>
//             <Typography variant="body2">Pending Tasks</Typography>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid
//     //    item xs={12} md={3}
//       size={{ xs: 12, md: 3 }}

//        >
//         <Card>
//           <CardContent>
//             <Typography variant="h6">{stats.attendance}%</Typography>
//             <Typography variant="body2">Attendance Today</Typography>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid
//     //    item xs={12} md={3}
//       size={{ xs: 12, md: 3 }}

//       >
//         <Card>
//           <CardContent>
//             <Typography variant="h6">{stats.notifications}</Typography>
//             <Typography variant="body2">Notifications</Typography>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// };

// export default StatsCards;
