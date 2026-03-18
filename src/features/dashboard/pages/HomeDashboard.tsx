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

// import { Box, Grid } from "@mui/material";
// import NotificationCard from "../components/NotificationCard";
// import OnLeaveTodayCard from "../components/OnLeaveTodayCard";
// import TaskOverviewModule from "../components/TaskOverviewModule";
// import UpcomingHolidaysCard from "../components/UpcomingHolidayCard";
// import WeeklyRoster from "../components/WeeklyRoster";
// import WorkLocationStatusCard from "../components/worklocation/WorkLocationStatusCard";

// export const HomeDashboard = () => {
//   return (
//     <Box sx={{ minHeight: "100vh" }}>
//       {/*
//         NOTE: Grid layout has been updated from the starter code
//         to accurately match the full-width span of the WeeklyRoster
//         shown in the reference screenshot.
//       */}
//       <Grid container spacing={1}>

//         {/* --- TOP ROW --- */}
//         <Grid size={{ xs: 12, md: 4, lg: 4 }}>
//           <TaskOverviewModule />
//         </Grid>

//         <Grid size={{ xs: 12, md: 4, lg: 4 }}>
//           <WorkLocationStatusCard />
//         </Grid>

//         <Grid size={{ xs: 12, md: 4, lg: 4 }}>
//           <NotificationCard />
//         </Grid>

//         {/* --- MIDDLE ROW (Full Width) --- */}
//         <Grid size={{ xs: 12 }}>
//           <WeeklyRoster />
//         </Grid>

//         {/* --- BOTTOM ROW --- */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <UpcomingHolidaysCard />
//         </Grid>

//         <Grid size={{ xs: 12, md: 6 }}>
//           <OnLeaveTodayCard />
//         </Grid>

//       </Grid>
//     </Box>
//   );
// };

// import { Box, Grid } from "@mui/material";
// import WeeklyRoster from "../components/WeeklyRoster";
// import OnLeaveTodayCard from "../components/OnLeaveTodayCard";
// import NotificationCard from "../components/NotificationCard";
// // import TaskOverviewModule from "../components/TaskOverviewModule";
// import WorkLocationStatusCard from "../components/worklocation/WorkLocationStatusCard";
// import TaskOverviewModule from "../components/TaskOverviewModule";
// // import TodayTasksWidget from "../components/tasks/TodayTasksWidget";

// export const HomeDashboard = () => {
//   return (
//     <Box sx={{ p: 0 }}>
//       <Grid container spacing={1}>
//         {/* LEFT SIDE */}
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Grid container spacing={1}>
//             <Grid size={7}>
//               <TaskOverviewModule />
//             </Grid>

//             <Grid size={5}>
//               <WorkLocationStatusCard />
//             </Grid>
//             {/* Leave Section Row */}
//             {/* <Grid size={12}>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <OnLeaveTodayCard />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>

//                   <OnLeaveTodayCard />
//                 </Grid>
//               </Grid>
//             </Grid> */}
//           </Grid>
//         </Grid>

//         {/* RIGHT SIDE */}
//         {/* <Grid size={{ xs: 12, md: 4 }}>
//           <Grid container spacing={1}>
//             <Grid size={12}>
//               <NotificationCard />
//             </Grid>
//             <Grid size={12}>
//               <WeeklyRoster />
//             </Grid>
//           </Grid>
//         </Grid> */}
//       </Grid>
//     </Box>
//   );
// };

// // import { Box, Grid } from "@mui/material";
// // import StatsCards from "../components/StatsCards";
// // import NotificationList from "../components/NotificationList";
// // import WeeklyRoster from "../components/WeeklyRoster";
// // import TaskList from "../components/TaskList";
// // // import { SpaceBar } from "@mui/icons-material";

// // export const HomeDashboard = () => {
// //   return (
// //     <Box>
// //       <Grid container spacing={0.5} mt={1}>
// //         <Grid size={{ xs: 12, md: 8 }}>
// //           <StatsCards />
// //           {/* <SpaceBar/> */}
// //           <Box sx={{ m: 1 }} />
// //           <TaskList />
// //           <Grid
// //             size={{ xs: 12, md: 12 }}
// //             sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
// //           >
// //             <Grid size={{ xs: 12, md: 4 }}>
// //               <h1>Leave Section</h1>
// //             </Grid>

// //             <Grid size={{ xs: 12, md: 4 }}>
// //               <h1>Leave Section</h1>
// //             </Grid>
// //           </Grid>
// //         </Grid>
// //         <Grid size={{ xs: 12, md: 4 }}>
// //           <NotificationList />
// //           <Box sx={{ m: 1 }} />
// //           <WeeklyRoster />
// //         </Grid>
// //         {/* <Grid size={{ xs: 12, md: 8 }}>

// //         </Grid> */}
// //       </Grid>
// //     </Box>
// //   );
// // };

// // import { Box } from "@mui/material";

// // export const HomeDashboard = () => {
// //   return (
// //     <Box sx={{ display: "flex", flexDirection: "column" }}>
// //       <Box>Top</Box>
// //       <Box>Middle</Box>
// //       <Box>Bottom</Box>
// //     </Box>
// //   );
// // };
