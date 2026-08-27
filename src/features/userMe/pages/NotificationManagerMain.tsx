import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import TopActionsSection from "../notification-manager/components/TopActionsSection";
import NotificationDialog from "../notification-manager/components/NotificationDialog";
import NotificationManagementTable from "../notification-manager/components/NotificationManagementTable";
import CommonContainer from "../../../components/common/CommonContainer";
import type { ApiNotificationSetting } from "../notification-manager/api/notificationApiSlice";

const NotificationManagerMain: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<ApiNotificationSetting | null>(null);

  const handleAdd = () => {
    setEditingRule(null);
    setOpenDialog(true);
  };

  const handleEdit = (rule: ApiNotificationSetting) => {
    setEditingRule(rule);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(null);
  };

  return (
    <CommonContainer>
<<<<<<< Updated upstream
      <TopActionsSection onAddNewNotification={() => setOpenDialog(true)} />
      <NotificationManagementTable />
=======
      <TopActionsSection onAddNewNotification={handleAdd} />
      <NotificationManagementTable onEdit={handleEdit} />
>>>>>>> Stashed changes
      <NotificationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        mode={editingRule ? "edit" : "create"}
        initialRule={editingRule}
      />
    </CommonContainer>
  );
};

export default NotificationManagerMain;
