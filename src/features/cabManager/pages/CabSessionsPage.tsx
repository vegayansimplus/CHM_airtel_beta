import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import { useEffect, useState } from "react";
import {
  useGetCabSessionDetailQuery,
  useGetCabSessionsQuery,
} from "../api/cabManagerApiSlice";
import { StageChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";

const STATUS_COLOR = {
  live:      { bg: "#E8F5E9", fg: "#2E7D32", label: "Live"      },
  scheduled: { bg: "#E3F2FD", fg: "#1565C0", label: "Scheduled" },
  completed: { bg: "#F4F5F7", fg: "rgba(0,0,0,0.55)", label: "Completed" },
};

export function CabSessionsPage() {
  const sessions = useGetCabSessionsQuery();
  const [activeId, setActiveId] = useState<string | null>(null);
  const detail = useGetCabSessionDetailQuery(activeId ?? "", { skip: !activeId });

  // Auto-select first session
  useEffect(() => {
    if (!activeId && sessions.data && sessions.data.length > 0) {
      setActiveId(sessions.data[0].id);
    }
  }, [activeId, sessions.data]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>My CAB Sessions</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Join live CAB calls, review CRQs under discussion, and coordinate with the CAB Engineer.
          CAB is for discussion only — no approvals are given here.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", gap: 2, minHeight: 0 }}>
        {/* Left: sessions list */}
        <Stack spacing={1.5} sx={{ overflowY: "auto", pr: 0.5 }}>
          {sessions.isLoading ? (
            <>
              {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={160} />)}
            </>
          ) : sessions.isError ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void sessions.refetch()}>Retry</Button>}>{errMsg(sessions.error)}</Alert>
          ) : (
            sessions.data?.map((s) => {
              const sc = STATUS_COLOR[s.status];
              const isActive = s.id === activeId;
              return (
                <Paper
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  sx={{
                    p: 2, cursor: "pointer", border: "1px solid",
                    borderColor: isActive ? "primary.main" : "divider",
                    bgcolor: isActive ? "#F4F8FD" : "background.paper",
                    flexShrink: 0,
                  }}
                  elevation={0}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500, fontSize: 13 }}>{s.id}</Typography>
                    <Chip size="small" label={sc.label} sx={{ bgcolor: sc.bg, color: sc.fg, fontWeight: 500 }} />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip size="small" label={s.type} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{s.crqIds?.length ?? 0} CRQs</Typography>
                  </Stack>
                  <Typography variant="body2">{s.date} · {s.time}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Hosted by {s.host}</Typography>
                  <Button
                    fullWidth
                    size="small"
                    variant={s.status === "live" ? "contained" : "outlined"}
                    startIcon={<VideoCameraFrontOutlinedIcon />}
                    sx={{ mt: 1.5 }}
                  >
                    {s.status === "live" ? "Join now" : s.status === "scheduled" ? "View agenda" : "Review minutes"}
                  </Button>
                </Paper>
              );
            })
          )}
        </Stack>

        {/* Right: detail */}
        <Paper sx={{ border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }} elevation={0}>
          {!activeId || detail.isLoading || !detail.data ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={400} /></Box>
          ) : (
            <>
              <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{detail.data.session.id}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {detail.data.session.type} CAB · {detail.data.agenda.length} CRQs
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {detail.data.session.date} · Hosted by {detail.data.session.host}
                  </Typography>
                </Box>
                {detail.data.session.status === "live" && (
                  <Chip size="small" label="Session live" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 500 }} />
                )}
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, minHeight: 0 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", mb: 1.5, display: "block" }}>
                  CRQs under discussion
                </Typography>
                <Stack spacing={1.5}>
                  {detail.data.agenda.map((a) => (
                    <Paper key={a.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500, fontSize: 12.5 }}>{a.id}</Typography>
                        <StageChip stage={a.stage} />
                      </Stack>
                      <Typography variant="body2">{a.activity}</Typography>
                      <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{a.domain}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{a.impact}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{a.hostname}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
