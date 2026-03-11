// import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  // Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import dayjs from "dayjs";

interface ShiftInfoDialogProps {
  open: boolean;
  onClose: () => void;
  data:
    | {
        shift: any;
        date: string;
        user: any;
      }
    | null;
}

export const ShiftInfoDialog = ({ open, onClose, data }: ShiftInfoDialogProps) => {
  if (!data) return null;

  const { shift, date, user } = data;

  const title = shift?.shiftDisplay || "Shift";
  const sub = shift?.timeRange || "";
  const mins = shift?.availableMins ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <InfoIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          Shift details
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Employee
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.fullName || user?.userId || "-"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {dayjs(date).format("dddd, MMM D, YYYY")}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Shift
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {title} {sub && `(${sub})`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Available minutes
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {mins} m
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>        
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
