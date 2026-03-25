import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";

import CommonContainer from "../../../components/common/CommonContainer";
import { useGetLeaveHistoryQuery } from "../userLeaveSection/api/leave.api";
import ApplyLeaveDrawer from "../userLeaveSection/components/ApplyLeaveDrawer";
import LeaveActionPanel from "../userLeaveSection/components/LeaveActionPanel";
import { LeaveTabs } from "../userLeaveSection/components/LeaveTabs";
import UniversalLeaveTable from "../userLeaveSection/components/UniversalLeaveTable";
import { useFilteredLeaves } from "../userLeaveSection/hooks/useFilteredLeaves";
import { useLeaveStats } from "../userLeaveSection/hooks/useLeaveStats";
import type { LeaveTabValue } from "../userLeaveSection/types/leave.types";
// import ApplyLeaveDrawer from "./components/ApplyLeaveDrawer";
// import LeaveActionPanel from "./components/LeaveActionPanel";
// import { LeaveTabs } from "./components/LeaveTabs";
// import { UniversalLeaveTable } from "./components/UniversalLeaveTable";
// import { useGetLeaveHistoryQuery } from "./api/leave.api";
// import { useLeaveStats } from "./hooks/useLeaveStats";
// import { useFilteredLeaves } from "./hooks/useFilteredLeaves";
// import type { LeaveTabValue } from "./types/leave.types";

export const UserLeaveSectionMain = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<LeaveTabValue>("ALL");

  // Single API call — all filtering is done client-side
  const { data: allLeaves = [], isLoading } = useGetLeaveHistoryQuery();

  const stats = useLeaveStats(allLeaves);
  const displayedLeaves = useFilteredLeaves(allLeaves, currentTab);

  return (
    <CommonContainer>
      <Box p={{ xs: 1, sm: 2 }}>
        <Grid container spacing={3}>

          {/* ── Main Content ─────────────────────────────────────── */}
          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden", minHeight: 500 }}
            >
              {/* Header */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  px: 3,
                  pt: 2.5,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  My Leave Requests
                </Typography>
                <LeaveTabs value={currentTab} onChange={setCurrentTab} />
              </Box>

              {/* Table */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <UniversalLeaveTable data={displayedLeaves} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <LeaveActionPanel
              onRequestLeave={() => setDrawerOpen(true)}
              {...stats}
            />
          </Grid>

        </Grid>

        <ApplyLeaveDrawer
          open={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </Box>
    </CommonContainer>
  );
};

// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Tabs,
//   Tab,
//   CircularProgress,
// } from "@mui/material";
// import { useState, useMemo } from "react";

// import CommonContainer from "../../../components/common/CommonContainer";
// import ApplyLeaveDrawer from "./components/ApplyLeaveDrawer";
// import LeaveActionPanel from "./components/LeaveActionPanel";
// import { useGetLeaveHistoryQuery } from "./api/leave.api";
// import UniversalLeaveTable from "./components/UniversalLeaveTable";

// // import { useGetLeaveHistoryQuery } from "../api/leave.api";

// export const UserLeaveSectionMain = () => {
//   const [openDrawer, setOpenDrawer] = useState(false);
//   const [currentTab, setCurrentTab] = useState("ALL");

//   // 1. WE CALL YOUR SINGLE API ONLY ONCE HERE
//   const { data: allLeaves = [], isLoading } = useGetLeaveHistoryQuery();

//   // 2. WE FILTER THE DATA IN THE BROWSER BASED ON THE SELECTED TAB
//   const displayedLeaves = useMemo(() => {
//     if (currentTab === "ALL") return allLeaves;
//     // Filter by Pending, Approved, or Rejected
//     return allLeaves.filter(
//       (leave) => leave.leaveStatus?.toUpperCase() === currentTab,
//     );
//   }, [allLeaves, currentTab]);

//   return (
//     <CommonContainer>
//       <Box p={1}>
//         <Grid container spacing={3}>
//           {/* Main Content Area */}
//           <Grid size={{ xs: 12, md: 8, lg: 9 }}>
//             <Paper
//               sx={{
//                 p: 0,
//                 minHeight: 500,
//                 borderRadius: 2,
//                 boxShadow: 1,
//                 overflow: "hidden",
//               }}
//             >
//               {/* Header & Tabs */}
//               <Box
//                 sx={{
//                   borderBottom: 1,
//                   borderColor: "divider",
//                   px: 3,
//                   pt: 2,
//                   bgcolor: "grey.50",
//                 }}
//               >
//                 <Typography variant="h6" fontWeight={600} gutterBottom>
//                   My Leave Requests
//                 </Typography>
//                 <Tabs
//                   value={currentTab}
//                   onChange={(_, newValue) => setCurrentTab(newValue)}
//                   indicatorColor="primary"
//                   textColor="primary"
//                   variant="scrollable"
//                   scrollButtons="auto"
//                 >
//                   <Tab label="All" value="ALL" />
//                   <Tab label="Pending" value="PENDING" />
//                   <Tab label="Approved" value="APPROVED" />
//                   <Tab label="Rejected" value="REJECTED" />
//                 </Tabs>
//               </Box>

//               {/* Data Table Area */}
//               <Box sx={{ p: 3 }}>
//                 {isLoading ? (
//                   <Box display="flex" justifyContent="center" py={10}>
//                     <CircularProgress />
//                   </Box>
//                 ) : (
//                   // WE PASS THE FILTERED DATA TO ONE SINGLE TABLE
//                   <UniversalLeaveTable data={displayedLeaves} />
//                 )}
//               </Box>
//             </Paper>
//           </Grid>

//           {/* Action Panel Sidebar */}
//           <Grid size={{ xs: 12, md: 4, lg: 3 }}>
//             <LeaveActionPanel
//               onRequestLeave={() => setOpenDrawer(true)}
//               // Calculate stats instantly without extra API calls!
//               pendingCount={
//                 allLeaves.filter(
//                   (l) => l.leaveStatus?.toUpperCase() === "PENDING",
//                 ).length
//               }
//               approvedCount={
//                 allLeaves.filter(
//                   (l) => l.leaveStatus?.toUpperCase() === "APPROVED",
//                 ).length
//               }
//               rejectedCount={
//                 allLeaves.filter(
//                   (l) => l.leaveStatus?.toUpperCase() === "REJECTED",
//                 ).length
//               }
//             />
//           </Grid>
//         </Grid>

//         {/* Apply Leave Drawer */}
//         <ApplyLeaveDrawer
//           open={openDrawer}
//           onClose={() => setOpenDrawer(false)}
//         />
//       </Box>
//     </CommonContainer>
//   );
// };

// import { Box, Typography, Paper, Grid } from "@mui/material";
// import { useState } from "react";

// import CommonContainer from "../../../components/common/CommonContainer";
// import LeaveHistoryTable from "./components/LeaveHistoryTable";
// import ApplyLeaveDrawer from "./components/ApplyLeaveDrawer";
// import LeaveActionPanel from "./components/LeaveActionPanel";
// import PendingLeaveList from "./components/PendingLeaveList";

// export const UserLeaveSectionMain = () => {
//   const [openDrawer, setOpenDrawer] = useState(false);
//   const [viewHistory, setViewHistory] = useState(false);

//   return (
//     <CommonContainer>
//       <Box p={1}>
//         {/* Dynamic Title (Uncomment if needed) */}
//         {/* <Box mb={4}>
//           <Typography variant="h4" fontWeight={700} gutterBottom>
//             Leave Management
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             {viewHistory
//               ? "View your past leave requests and their current statuses."
//               : "Track your upcoming and currently pending leave requests."}
//           </Typography>
//         </Box> */}

//         {/* Responsive Grid Layout */}
//         <Grid container spacing={2}>
//           {/* Main Content Area */}
//           <Grid size={{ xs: 12, md: 8, lg: 9 }}>
//             <Paper
//               sx={{
//                 p: 3,
//                 minHeight: 400,
//                 borderRadius: 2,
//                 boxShadow: 1,
//               }}
//             >
//               <Typography variant="h6" mb={3} fontWeight={600}>
//                 {viewHistory ? "Leave History" : "Pending Requests"}
//               </Typography>

//               {viewHistory ? <LeaveHistoryTable /> : <PendingLeaveList />}
//             </Paper>
//           </Grid>

//           {/* Action Panel Sidebar */}
//           <Grid size={{ xs: 12, md: 4, lg: 3 }}>
//             <LeaveActionPanel
//               onRequestLeave={() => setOpenDrawer(true)}
//               viewHistory={viewHistory}
//               toggleHistory={() => setViewHistory(!viewHistory)}
//             />
//           </Grid>
//         </Grid>

//         {/* Apply Leave Drawer */}
//         <ApplyLeaveDrawer
//           open={openDrawer}
//           onClose={() => setOpenDrawer(false)}
//         />
//       </Box>
//     </CommonContainer>
//   );
// };
