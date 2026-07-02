import {
  Alert,
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { useState } from "react";
import { useRescheduleCrqMutation } from "../../api/cabManagerApiSlice";
import { errMsg } from "../shared/errMsg";

export function RescheduleCrqModal({ open, crqId, onClose }: { open: boolean; crqId: string | null; onClose: () => void }) {
  const [newDate, setNewDate] = useState("");
  const [newWindow, setNewWindow] = useState("");
  const [reason, setReason] = useState("");
  const [reschedule, { isLoading, isError, error }] = useRescheduleCrqMutation();

  const submit = async () => {
    if (!crqId || !newDate || !newWindow || !reason) return;
    try {
      await reschedule({ crqId, newDate, newWindow, reason }).unwrap();
      setNewDate(""); setNewWindow(""); setReason("");
      onClose();
    } catch { /* error surfaced */ }
  };

  return (
    <Dialog open={open && !!crqId} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#FFF4E5", color: "#ED6C02", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ReplayIcon />
          </Box>
          Reschedule CRQ
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Set a new execution date and maintenance window for{" "}
          <Box component="span" sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{crqId}</Box>.
        </Typography>

        <TextField
          fullWidth required
          type="date"
          label="New date"
          InputLabelProps={{ shrink: true }}
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth required
          label="Maintenance window"
          placeholder="e.g. 02:00 – 04:30 IST"
          value={newWindow}
          onChange={(e) => setNewWindow(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth required
          multiline minRows={2}
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !newDate || !newWindow || !reason}>
          {isLoading ? "Rescheduling…" : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
