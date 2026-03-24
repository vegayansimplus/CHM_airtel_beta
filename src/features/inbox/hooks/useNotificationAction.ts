import { toast } from "react-toastify";
import {
  useAcknowledgeNotificationMutation,
  useEmployeeShiftSwapActionMutation,
  useManagerShiftSwapActionMutation,
} from "../api/inboxApiSlice";
import type { InboxItem } from "../components/TaskInbox";

const MANAGER_ROLES = [
  "TEAM_LEAD",
  "DOMAIN_HEAD",
  "FUNCTION_HEAD",
  "VERTICAL_HEAD",
  "SUPER_ADMIN",
  "SUB_DOMAIN_HEAD" 
];

export const useNotificationAction = () => {
  const [managerAction, { isLoading: isManagerLoading }] =
    useManagerShiftSwapActionMutation();
  const [employeeAction, { isLoading: isEmpLoading }] =
    useEmployeeShiftSwapActionMutation();
  const [acknowledge, { isLoading: isAckLoading }] =
    useAcknowledgeNotificationMutation();

  const isLoading = isManagerLoading || isEmpLoading || isAckLoading;

  const handleAction = async (
    item: InboxItem,
    actionType: "APPROVED" | "REJECTED" | "ACKNOWLEDGE",
    userRole: string, // Pass the logged-in user's role here
    reason?: string,
  ): Promise<any> => {
    const { notificationId, subModule } = item.originalData;

    try {
      // 1. Handle Generic Acknowledge
      if (actionType === "ACKNOWLEDGE") {
        const response = await acknowledge({ notificationId }).unwrap();
        return response;
      }

      // 2. Route based on Sub-Module
      switch (subModule) {
        case "SHIFT_SWAP":
          if (MANAGER_ROLES.includes(userRole)) {
            // Manager API
            const managerResponse = await managerAction({
              notificationId,
              status: actionType,
              reason,
            }).unwrap();
            return managerResponse;
          } else if (userRole === "TEAM_MEMBER") {
            // Employee API
            const empResponse = await employeeAction({
              notificationId,
              status: actionType,
              reason,
            }).unwrap();
            return empResponse;
          } else {
            // console.error("Unauthorized role for SHIFT_SWAP action");
            toast.error("You do not have permission to perform this action.");
            throw new Error("Unauthorized role");
          }

        case "LEAVE_REQUEST":
          // In the future, just add another case here for different sub-modules!
          // const leaveResponse = await leaveRequestAction({ notificationId, status: actionType }).unwrap();
          // return leaveResponse;
          throw new Error("Leave request processing not yet implemented");

        default:
          //   console.warn(`No API mapping found for submodule: ${subModule}`);
          toast.error("This type of notification cannot be processed.");
          throw new Error(`No API mapping found for submodule: ${subModule}`);
      }
    } catch (error) {
      //   console.error("Failed to process notification action:", error);
      toast.error("Failed to process your action. Please try again.");
      throw error; // Let UI handle the error alert
    }
  };

  return { handleAction, isLoading };
};
