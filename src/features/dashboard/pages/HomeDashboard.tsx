import { Box, Grid } from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import OnLeaveTodayCard from "../components/OnLeaveTodayCard";
import TaskOverviewModule from "../components/TaskOverviewModule";
import UpcomingHolidaysCard from "../components/UpcomingHolidayCard";
import WeeklyRoster from "../components/WeeklyRoster";
import WorkLocationStatusCard from "../components/worklocation/WorkLocationStatusCard";

export const HomeDashboard = () => {
  return (
    // Reduced outer padding and set max height to prevent window scrolling
    <Box sx={{ p: 0, minHeight: "calc(100vh - 120px)", overflowX: "hidden" }}>
      {/* Reduced spacing from 3 to 1.5 to compact the view */}
      <Grid container spacing={1}>
        {/* --- TOP ROW --- */}
        <Grid
          // item xs={12} lg={4}
          size={{ xs: 12, lg: 4 }}
        >
          <TaskOverviewModule />
        </Grid>

        <Grid
          //  item xs={12} lg={4}
          size={{ xs: 12, lg: 4 }}
        >
          <WorkLocationStatusCard />
        </Grid>

        <Grid
          // item xs={12} lg={4}
          size={{ xs: 12, lg: 4 }}
        >
          <NotificationCard />
        </Grid>

        {/* --- MIDDLE ROW --- */}
        <Grid
          // item xs={12}
          size={{ xs: 12 }}
        >
          <WeeklyRoster />
        </Grid>

        {/* --- BOTTOM ROW --- */}
        <Grid
          //  item xs={12} md={6}
          size={{ xs: 12, md: 6 }}
        >
          <UpcomingHolidaysCard />
        </Grid>

        <Grid
          // item xs={12} md={6}
          size={{ xs: 12, md: 6 }}
        >
          <OnLeaveTodayCard />
        </Grid>
      </Grid>
    </Box>
  );
};
