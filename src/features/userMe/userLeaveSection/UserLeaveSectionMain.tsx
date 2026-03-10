import { Box, Typography, Paper, Grid } from "@mui/material";
import { useState } from "react";

import CommonContainer from "../../../components/common/CommonContainer";
import LeaveHistoryTable from "./components/LeaveHistoryTable";
import ApplyLeaveDrawer from "./components/ApplyLeaveDrawer";
import LeaveActionPanel from "./components/LeaveActionPanel";
import PendingLeaveList from "./components/PendingLeaveList";

export const UserLeaveSectionMain = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  return (
    <CommonContainer>
      <Box p={1}>
        {/* Dynamic Title (Uncomment if needed) */}
        {/* <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Leave Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {viewHistory
              ? "View your past leave requests and their current statuses."
              : "Track your upcoming and currently pending leave requests."}
          </Typography>
        </Box> */}

        {/* Responsive Grid Layout */}
        <Grid container spacing={2}>
          {/* Main Content Area */}
          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <Paper
              sx={{
                p: 3,
                minHeight: 400,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" mb={3} fontWeight={600}>
                {viewHistory ? "Leave History" : "Pending Requests"}
              </Typography>

              {viewHistory ? <LeaveHistoryTable /> : <PendingLeaveList />}
            </Paper>
          </Grid>

          {/* Action Panel Sidebar */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <LeaveActionPanel
              onRequestLeave={() => setOpenDrawer(true)}
              viewHistory={viewHistory}
              toggleHistory={() => setViewHistory(!viewHistory)}
            />
          </Grid>
        </Grid>

        {/* Apply Leave Drawer */}
        <ApplyLeaveDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
        />
      </Box>
    </CommonContainer>
  );
};