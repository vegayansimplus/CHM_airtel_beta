import { toast } from "react-toastify";
import {
  useAcknowledgeNotificationMutation,
  useEmployeeShiftSwapActionMutation,
  useManagerShiftSwapActionMutation,
  useRosterLeaveActionMutation,
  useShiftChangeNotificationActionMutation,
  useCabCrqNotificationActionMutation,
} from "../api/inboxApiSlice";
import type { InboxItem } from "../components/TaskInbox";
import { getRoleTier, getSubModuleActionMeta } from "../config/notificationActionConfig";

export interface NotificationActionExtra {
  // Free-text remark (SHIFT_SWAP/SHIFT_CHANGE/LEAVE reject reason, or the
  // additional comment that accompanies a CAB reject reason).
  reason?: string;
  // Structured reason label for CAB_APPROVER rejects, picked from
  // useGetCabRejectReasonsQuery.
  reasonText?: string;
}

export const useNotificationAction = () => {
  const [managerAction, { isLoading: isManagerLoading }] = useManagerShiftSwapActionMutation();
  const [employeeAction, { isLoading: isEmpLoading }] = useEmployeeShiftSwapActionMutation();
  const [acknowledge, { isLoading: isAckLoading }] = useAcknowledgeNotificationMutation();
  const [leaveAction, { isLoading: isLeaveLoading }] = useRosterLeaveActionMutation();
  const [shiftChangeAction, { isLoading: isShiftChangeLoading }] = useShiftChangeNotificationActionMutation();
  const [cabCrqAction, { isLoading: isCabLoading }] = useCabCrqNotificationActionMutation();

  const isLoading =
    isManagerLoading ||
    isEmpLoading ||
    isAckLoading ||
    isLeaveLoading ||
    isShiftChangeLoading ||
    isCabLoading;

  const handleAction = async (
    item: InboxItem,
    actionType: "APPROVED" | "REJECTED" | "ACKNOWLEDGE",
    userRole: string,
    extra?: NotificationActionExtra,
  ): Promise<any> => {
    const { notificationId, subModule } = item.originalData;

    try {
      if (actionType === "ACKNOWLEDGE") {
        return await acknowledge({ notificationId }).unwrap();
      }

      const meta = getSubModuleActionMeta(subModule);
      if (!meta) {
        toast.error("This type of notification cannot be processed.");
        throw new Error(`No API mapping found for submodule: ${subModule}`);
      }

      switch (meta.subModule) {
        case "SHIFT_SWAP": {
          const tier = getRoleTier(userRole);
          if (tier === "MANAGER") {
            return await managerAction({
              notificationId,
              status: actionType,
              reason: extra?.reason,
            }).unwrap();
          }
          if (userRole === "TEAM_MEMBER") {
            return await employeeAction({
              notificationId,
              status: actionType,
              reason: extra?.reason,
            }).unwrap();
          }
          toast.error("You do not have permission to perform this action.");
          throw new Error("Unauthorized role");
        }

        case "SHIFT_CHANGE":
          return await shiftChangeAction({
            notificationId,
            status: actionType,
            rejectReason: extra?.reason,
          }).unwrap();

        case "LEAVE":
          return await leaveAction({
            notificationId,
            status: actionType,
            rejectReason: extra?.reason,
          }).unwrap();

        case "CAB_APPROVER":
          return await cabCrqAction({
            notificationId,
            status: actionType,
            reason: extra?.reasonText,
            comment: extra?.reason,
          }).unwrap();

        default:
          toast.error("This type of notification cannot be processed.");
          throw new Error(`No API mapping found for submodule: ${subModule}`);
      }
    } catch (error) {
      toast.error("Failed to process your action. Please try again.");
      throw error;
    }
  };

  return { handleAction, isLoading };
};
