import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Zoom,
  alpha,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import { toast } from "react-toastify";
import { getAvatarColor, getInitials } from "../utils/userHelpers";
import { useUpdateUserStatusMutation } from "../../teamManagement/api/teamManagement.api";
import type { User } from "../types/user";

const ZoomTransition = forwardRef(function ZoomTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Zoom ref={ref} {...props} />;
});

export interface DeleteDialogProps {
  user: User | null;
  bulkUsers?: User[] | null;
  actorUserId: number;
  onClose: () => void;
  onDone: () => void;
}

// "Remove" is a soft status change (employee_status -> INACTIVE, with
// exit_type/exit_reason/date_of_leaving recorded on USER_MASTER) - there is
// no hard-delete path for a user record, matching sp_change_user_status.
export default function DeleteDialog({ user, bulkUsers, actorUserId, onClose, onDone }: DeleteDialogProps) {
  const isBulk = !user && !!bulkUsers?.length;
  const open = Boolean(user) || isBulk;

  const [dateOfLeaving, setDateOfLeaving] = useState("");
  const [exitType, setExitType] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();

  const resetAndClose = () => {
    setDateOfLeaving("");
    setExitType("");
    setExitReason("");
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!dateOfLeaving) next.dateOfLeaving = "Required";
    if (!exitType) next.exitType = "Required";
    if (!exitReason.trim()) next.exitReason = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    const targets = isBulk ? bulkUsers! : [user!];
    try {
      for (const target of targets) {
        // eslint-disable-next-line no-await-in-loop
        await updateStatus({
          actorUserId,
          userId: target.userId,
          employeeStatus: "INACTIVE",
          dateOfLeaving,
          exitType,
          exitReason,
          replacementEmpOlmid: null,
          replacementEmpName: null,
        }).unwrap();
      }
      toast.success(isBulk ? `Removed ${targets.length} users` : `${targets[0].name} removed`);
      onDone();
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user status.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      TransitionComponent={ZoomTransition}
      PaperProps={{ sx: { borderRadius: "18px", p: 1, maxWidth: 420 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberRounded color="error" />
        </Box>
        Remove {isBulk ? `${bulkUsers!.length} Users` : "User"}
      </DialogTitle>
      <DialogContent>
        {user && (
          <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
            <Avatar sx={{ bgcolor: getAvatarColor(user.id), width: 36, height: 36, fontSize: 13 }}>
              {getInitials(user.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{user.employeeId}</Typography>
            </Box>
          </Stack>
        )}
        <Typography color="text.secondary" sx={{ fontSize: 13.5, mb: 2 }}>
          {isBulk
            ? `This deactivates ${bulkUsers!.length} selected users' system access. This cannot be undone from here.`
            : "This deactivates the user's system access. This cannot be undone from here."}
        </Typography>

        <Stack gap={1.5}>
          <TextField
            type="date"
            label="Date of Leaving"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateOfLeaving}
            onChange={(e) => setDateOfLeaving(e.target.value)}
            error={!!errors.dateOfLeaving}
            helperText={errors.dateOfLeaving}
          />
          <TextField
            select
            label="Exit Type"
            size="small"
            fullWidth
            value={exitType}
            onChange={(e) => setExitType(e.target.value)}
            error={!!errors.exitType}
            helperText={errors.exitType}
          >
            <MenuItem value="RESIGNATION">Resignation</MenuItem>
            <MenuItem value="TERMINATION">Termination</MenuItem>
            <MenuItem value="RETIREMENT">Retirement</MenuItem>
          </TextField>
          <TextField
            label="Exit Reason"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={exitReason}
            onChange={(e) => setExitReason(e.target.value)}
            error={!!errors.exitReason}
            helperText={errors.exitReason}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={resetAndClose} variant="outlined" color="inherit" sx={{ borderRadius: "10px" }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
          sx={{ borderRadius: "10px", fontWeight: 700, minWidth: 100 }}
        >
          {isLoading ? <CircularProgress size={18} color="inherit" /> : "Remove"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
