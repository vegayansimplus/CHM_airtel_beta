import {
  Alert,
  Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAssignFeMutation } from "../../api/cabManagerApiSlice";
import { errMsg } from "../shared/errMsg";

const FIELD_ENGINEERS = ["Arjun Rao", "Sunil Kale", "Meera Krishnan", "Pankaj Joshi"];

export function AssignFeModal({ open, crqId, onClose }: { open: boolean; crqId: string | null; onClose: () => void }) {
  const [fe, setFe] = useState("");
  const [assign, { isLoading, isError, error }] = useAssignFeMutation();

  const submit = async () => {
    if (!crqId || !fe) return;
    try {
      await assign({ crqId, fieldEngineer: fe }).unwrap();
      setFe("");
      onClose();
    } catch { /* error surfaced */ }
  };

  return (
    <Dialog open={open && !!crqId} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign Field Engineer</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Pick the field engineer who'll execute this CRQ on-site.
        </Typography>
        <TextField
          select fullWidth required
          label="Field Engineer"
          value={fe}
          onChange={(e) => setFe(e.target.value)}
        >
          <MenuItem value="">— Select FE —</MenuItem>
          {FIELD_ENGINEERS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </TextField>
        {isError && <Alert severity="error" sx={{ mt: 2 }}>{errMsg(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isLoading || !fe}>
          {isLoading ? "Assigning…" : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
