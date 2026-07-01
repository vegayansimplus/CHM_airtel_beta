import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState } from "react";
import {
  useBlockRingMutation,
  useGetImplementationQuery,
  useProceedRingMutation,
} from "../api/cabManagerApiSlice";
import { errMsg } from "../components/shared/errMsg";

export function ImplementationPage() {

  const { data, isLoading, isError, error, refetch } = useGetImplementationQuery();
  const [proceed] = useProceedRingMutation();
  const [block]   = useBlockRingMutation();
  const [nocCalled, setNocCalled] = useState(false);
  const [blockComment, setBlockComment] = useState<Record<string, string>>({});

  if (isError) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}>{errMsg(error)}</Alert>;
  if (isLoading || !data) return <Stack spacing={2}><Skeleton variant="rounded" height={120} /><Skeleton variant="rounded" height={400} /></Stack>;

  const { crq, noc, rings } = data;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>Field Execution — {crq.id}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {crq.activity}. Validate readiness with NOC-NS before starting execution.
        </Typography>
      </Box>

      {/* Two-col: CRQ details + NOC contact */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 2, mb: 2 }}>
        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Typography sx={{ fontWeight: 500, mb: 2 }}>CRQ Details</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {[
              ["Support Group",   "NOC-NS Optics West"],
              ["Type of CR",      "Normal · Planned"],
              ["Change Impact",   `${crq.impact} — Service Affecting`],
              ["Scheduled Start", `${crq.scheduled} · ${crq.window.split("–")[0].trim()}`],
              ["Scheduled End",   `${crq.scheduled} · ${crq.window.split("–")[1]?.trim() ?? "—"}`],
              ["Hostname",        crq.hostname],
            ].map(([k, v]) => (
              <Box key={k}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{k}</Typography>
                <Typography variant="body2">{v}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Typography sx={{ fontWeight: 500, mb: 2 }}>NOC-NS Contact</Typography>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: "#E3F2FD", color: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneInTalkIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Toll-Free</Typography>
                <Typography sx={{ fontFamily: "'Roboto Mono', monospace" }}>{noc.tollFree}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: "#F3E5F5", color: "#7B1FA2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmailOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Email</Typography>
                <Typography sx={{ color: "primary.main" }}>{noc.email}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Button fullWidth variant={nocCalled ? "outlined" : "contained"} startIcon={<PhoneInTalkIcon />} onClick={() => setNocCalled(true)}>
            {nocCalled ? "NOC-NS contacted" : "Call NOC-NS"}
          </Button>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", textAlign: "center", mt: 1 }}>
            Calling unlocks ring-level impact validation below.
          </Typography>
        </Paper>
      </Box>

      {/* Ring validation */}
      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", mb: 2 }} elevation={0}>
        <Typography sx={{ fontWeight: 500, mb: 2 }}>Impact Validation</Typography>
        {!nocCalled && (
          <Box sx={{ display: "flex", gap: 1.5, p: 1.5, bgcolor: "#FFF8E1", border: "1px solid #FFE7A0", borderRadius: 1.5, mb: 2 }}>
            <LockOutlinedIcon sx={{ color: "#A06800" }} />
            <Typography variant="body2" sx={{ color: "#7A5200" }}>
              Impact validation is locked until you contact NOC-NS. Tap "Call NOC-NS" above to begin.
            </Typography>
          </Box>
        )}
        <Stack spacing={1.5}>
          {rings.map((r) => (
            <Paper key={r.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", opacity: nocCalled ? 1 : 0.5, pointerEvents: nocCalled ? "auto" : "none" }} elevation={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500 }}>{r.ring}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>
                    {r.locA} → {r.locB} · {r.type} · {r.slotStart}–{r.slotEnd}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={r.decision === "proceed" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => void proceed({ crqId: crq.id, ringId: r.id })}
                  >
                    Proceed
                  </Button>
                  <Button
                    size="small"
                    variant={r.decision === "block" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => void block({ crqId: crq.id, ringId: r.id, comment: blockComment[r.id] })}
                  >
                    Do Not Proceed
                  </Button>
                </Stack>
              </Stack>
              {r.decision === "block" && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed", borderColor: "divider" }}>
                  <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>Work info required to record the blocker</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Comment (optional)"
                    value={blockComment[r.id] ?? ""}
                    onChange={(e) => setBlockComment((s) => ({ ...s, [r.id]: e.target.value }))}
                    sx={{ mt: 1 }}
                  />
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }} elevation={0}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {rings.every((r) => r.decision === "proceed")
            ? "All rings cleared. Ready to start execution."
            : "Validate every ring before starting execution."}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Save</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            disabled={!rings.every((r) => r.decision === "proceed")}
          >
            Start Execution
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
