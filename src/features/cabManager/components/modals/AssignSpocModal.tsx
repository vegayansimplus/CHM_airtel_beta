import {
  Alert,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAssignSpocMutation } from "../../api/cabManagerApiSlice";
import { APPROVERS } from "../../data/cabManager.mock";
import { errMsg } from "../shared/errMsg";

export function AssignSpocModal({ open, crqId, onClose }: { open: boolean; crqId: string | null; onClose: () => void }) {
  const [spoc, setSpoc] = useState("");
  const [assign, { isLoading, isError, error }] = useAssignSpocMutation();

  const submit = async () => {
    if (!crqId || !spoc) return;
    try {
      await assign({ crqId, spoc }).unwrap();
      setSpoc("");
      onClose();
    } catch { /* error surfaced */ }
  };

  return (
    <Dialog open={open && !!crqId} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign SPOC</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Choose the SPOC who owns approval coordination for this CRQ.
        </Typography>
        <TextField
          select fullWidth required
          label="SPOC"
          value={spoc}
          onChange={(e) => setSpoc(e.target.value)}
        >
          <MenuItem value="">— Select SPOC —</MenuItem>
          {APPROVERS.map((a) => <MenuItem key={a.name} value={a.name}>{a.name} · {a.domain}</MenuItem>)}
        </TextField>
        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !spoc}>
          {isLoading ? "Assigning…" : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
