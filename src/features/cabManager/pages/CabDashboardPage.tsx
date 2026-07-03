import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router";
import { useGetDashboardQuery } from "../api/cabManagerApiSlice";
import { SlaBar, StageChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";

export function CabDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetDashboardQuery();

  if (isError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}
      >
        {errMsg(error)}
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={88} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}
        </Box>
        <Skeleton variant="rounded" height={280} />
      </Stack>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>{data.title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{data.subtitle}</Typography>
      </Box>

      {/* KPI tiles */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {data.kpis.map((k) => (
          <Paper key={k.label} sx={{ p: 2.25, border: "1px solid", borderColor: "divider" }} elevation={0}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{k.label}</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.5px", lineHeight: 1.1, mt: 0.5 }}>{k.value}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{k.foot}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Pipeline + SLA watch */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 500 }}>Change pipeline — by stage</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{data.totalCount} total</Typography>
          </Box>
          <Stack spacing={1.5}>
            {data.stageBars.map((b) => (
              <Box key={b.stage}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <StageChip stage={b.stage} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{b.count}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={b.pct}
                  sx={{ height: 8, borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)" }}
                />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 500 }}>CAB SLA watch</Typography>
          </Stack>
          {data.escalations.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
              No SLA breaches right now.
            </Typography>
          ) : (
            <Stack>
              {data.escalations.map((e) => (
                <Box
                  key={e.id}
                  onClick={() => navigate(`/cabmanager/journey/${e.id}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    py: 1.25, cursor: "pointer", borderBottom: "1px solid", borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{
                    width: 38, height: 38, borderRadius: 1.5,
                    bgcolor: "#FDECEA", color: "#D32F2F",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "'Roboto Mono', monospace" }}>{e.sla}</Typography>
                    <Typography sx={{ fontSize: 8, letterSpacing: 0.5 }}>SLA</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12.5, color: "primary.main", fontWeight: 500 }}>{e.id}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.activity}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Action queue */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography sx={{ fontWeight: 500 }}>{data.actionQueueTitle}</Typography>
          <Button size="small" onClick={() => navigate("/cabmanager/allcrqs")}>View all</Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFA" }}>
              <TableCell>CRQ ID</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>SLA</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.actionQueue.map((r) => (
              <TableRow
                key={r.id}
                hover
                onClick={() => navigate(`/cabmanager/journey/${r.id}`)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{r.id}</TableCell>
                <TableCell>
                  <Typography variant="body2">{r.activity}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{r.domain} · Circle {r.circle}</Typography>
                </TableCell>
                <TableCell><StageChip stage={r.stage} /></TableCell>
                <TableCell><SlaBar sla={r.sla} /></TableCell>
                <TableCell>{r.scheduled}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); navigate(`/cabmanager/journey/${r.id}`); }}>
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
