import {
  Alert,
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { useApproveCrqMutation } from "../../api/cabManagerApiSlice";
import { errMsg } from "../shared/errMsg";

export function ApproveCrqModal({ open, crqId, onClose }: { open: boolean; crqId: string | null; onClose: () => void }) {
  const [comment, setComment] = useState("");
  const [approve, { isLoading, isError, error }] = useApproveCrqMutation();

  const submit = async () => {
    if (!crqId) return;
    try {
      await approve({ crqId, comment }).unwrap();
      setComment("");
      onClose();
    } catch { /* error surfaced from mutation state */ }
  };

  return (
    <Dialog open={open && !!crqId} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#E8F5E9", color: "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircleOutlineIcon />
          </Box>
          Approve CRQ
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          You're approving <Box component="span" sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{crqId}</Box>.
          This action will advance the CRQ to the next stage.
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Before approving, verify the date of execution and the attached impact analysis.
        </Alert>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Comments (optional)"
          placeholder="Add a note for the audit trail…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={submit} disabled={isLoading} startIcon={<CheckCircleOutlineIcon />}>
          {isLoading ? "Approving…" : "Confirm Approval"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
