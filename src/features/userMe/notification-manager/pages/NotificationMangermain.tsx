import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import TopActionsSection from "../components/TopActionsSection";
import NotificationDialog from "../components/NotificationDialog";
import NotificationManagementTable from "../components/NotificationManagementTable";
// import TopActionsSection from "./TopActionsSection";
// import NotificationManagementTable from "./NotificationManagementTable";
// import NotificationDialog from "./NotificationDialog";

const NotificationManagerMain: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100vh",
        // Uses theme.palette.background.default → #0B1220 (dark) / #F8FAFC (light)
        background: theme.palette.background.default,
      }}
    >
      <TopActionsSection onAddNewNotification={() => setOpenDialog(true)} />
      <NotificationManagementTable />
      <NotificationDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </div>
  );
};

export default NotificationManagerMain;