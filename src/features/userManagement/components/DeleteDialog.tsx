import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Zoom,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import { getAvatarColor, getInitials } from "../utils/userHelpers";
import type { User } from "../types/user";

const ZoomTransition = forwardRef(function ZoomTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Zoom ref={ref} {...props} />;
});

export interface DeleteDialogProps {
  user: User | null;
  count?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({ user, count, onClose, onConfirm }: DeleteDialogProps) {
  const isBulk = !user && (count ?? 0) > 0;

  return (
    <Dialog
      open={Boolean(user) || isBulk}
      onClose={onClose}
      TransitionComponent={ZoomTransition}
      PaperProps={{ sx: { borderRadius: "18px", p: 1, maxWidth: 400 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberRounded sx={{ color: "#DC2626" }} />
        </Box>
        Remove {isBulk ? `${count} Users` : "User"}
      </DialogTitle>
      <DialogContent>
        {user && (
          <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
            <Avatar sx={{ bgcolor: getAvatarColor(user.id), width: 36, height: 36, fontSize: 13 }}>
              {getInitials(user.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {user.employeeId}
              </Typography>
            </Box>
          </Stack>
        )}
        <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
          {isBulk
            ? `Are you sure you want to remove ${count} selected users? This action cannot be undone.`
            : "Are you sure you want to remove this user? This action cannot be undone."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: "10px" }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: "10px", fontWeight: 700 }}>
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}
