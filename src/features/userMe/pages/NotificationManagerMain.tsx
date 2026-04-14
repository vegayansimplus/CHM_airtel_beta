import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import TopActionsSection from "../notification-manager/components/TopActionsSection";
import NotificationDialog from "../notification-manager/components/NotificationDialog";
import NotificationManagementTable from "../notification-manager/components/NotificationManagementTable";

/**
 * NotificationManagerMain — entry point (unchanged wiring).
 * All redesign happens inside the child components.
 */
const NotificationManagerMain: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div
      style={{
        padding: "28px 32px",
        background: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <TopActionsSection onAddNewNotification={() => setOpenDialog(true)} />
      <NotificationManagementTable />
      <NotificationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </div>
  );
};

export default NotificationManagerMain;

// import React, { useState } from "react";
// import { useTheme } from "@mui/material/styles";
// import TopActionsSection from "../notification-manager/components/TopActionsSection";
// import NotificationDialog from "../notification-manager/components/NotificationDialog";
// import NotificationManagementTable from "../notification-manager/components/NotificationManagementTable";

// const NotificationManagerMain: React.FC = () => {
//   const theme = useTheme();
//   const [openDialog, setOpenDialog] = useState(false);

//   return (
//     <div
//       style={{
//         padding: "28px 32px",
//         background: theme.palette.background.default,
//       }}
//     >
//       <TopActionsSection onAddNewNotification={() => setOpenDialog(true)} />
//       <NotificationManagementTable />
//       <NotificationDialog open={openDialog} onClose={() => setOpenDialog(false)} />
//     </div>
//   );
// };

// export default NotificationManagerMain;