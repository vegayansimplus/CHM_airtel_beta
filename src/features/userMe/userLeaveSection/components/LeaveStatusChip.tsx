import { Chip } from "@mui/material";
import { getStatusChipColor } from "../utils/leave.utils";
import type { LeaveStatus } from "../types/leave.types";

interface LeaveStatusChipProps {
  status: LeaveStatus;
}

/**
 * Reusable status chip — colour logic lives in utils, not scattered inline.
 */
export const LeaveStatusChip = ({ status }: LeaveStatusChipProps) => (
  <Chip
    label={status}
    color={getStatusChipColor(status)}
    size="small"
    sx={{ fontWeight: 600, minWidth: 84, textTransform: "capitalize" }}
  />
);