import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState } from "react";
import { useGetMyCrqsQuery } from "../api/cabManagerApiSlice";
import { ApproveCrqModal } from "../components/modals/ApproveCrqModal";
import { AssignFeModal } from "../components/modals/AssignFeModal";
import { AssignSpocModal } from "../components/modals/AssignSpocModal";
import { DelegateCrqModal } from "../components/modals/DelegateCrqModal";
import { RejectCrqModal } from "../components/modals/RejectCrqModal";
import { RescheduleCrqModal } from "../components/modals/RescheduleCrqModal";
import { CrqDetailDrawer } from "../components/shared/CrqDetailDrawer";
import { StageChip } from "../components/shared/Chips";
import { errMsg } from "../components/shared/errMsg";
import { useCabRole } from "../hooks/useCabRole";

type ModalKind = "approve" | "reject" | "delegate" | "reschedule" | "assignSpoc" | "assignFe" | null;

export function MyCrqsPage() {
  const { role } = useCabRole();
  const { data, isLoading, isError, error, refetch } = useGetMyCrqsQuery(role);

  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  if (isError) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}>{errMsg(error)}</Alert>;
  }
  if (isLoading || !data) {
    return <Stack spacing={2}><Skeleton variant="rounded" height={88} /><Skeleton variant="rounded" height={400} /></Stack>;
  }

  const openAction = (id: string, kind: ModalKind) => { setActionTarget(id); setModal(kind); };
  const closeModal = () => { setModal(null); setActionTarget(null); };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: "-0.3px" }}>{data.title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{data.subtitle}</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3, maxWidth: 720 }}>
        {[
          { icon: <HourglassEmptyIcon />, label: "Awaiting your action", value: data.stats.awaitingMe, color: "#ED6C02", bg: "#FFF4E5" },
          { icon: <CheckCircleOutlineIcon />, label: "Approved this week",  value: data.stats.approvedThisWeek, color: "#2E7D32", bg: "#E8F5E9" },
          { icon: <CancelOutlinedIcon />, label: "Rejected this week",  value: data.stats.rejectedThisWeek, color: "#D32F2F", bg: "#FDECEA" },
        ].map((s) => (
          <Paper key={s.label} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider" }} elevation={0}>
            <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 400 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Table */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFA" }}>
              <TableCell>CRQ ID</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Scheduled</TableCell>
              {data.mode === "assign" && (<><TableCell>SPOC</TableCell><TableCell>Field Engineer</TableCell></>)}
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.length === 0 ? (
              <TableRow><TableCell colSpan={data.mode === "assign" ? 7 : 5} align="center" sx={{ py: 6, color: "text.secondary" }}>No CRQs assigned to you right now.</TableCell></TableRow>
            ) : (
              data.rows.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: "pointer" }} onClick={() => setSelected(r.id)}>
                  <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>
                    {r.id}
                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>{r.domain} · {r.circle}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.activity}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{r.hostname}</Typography>
                  </TableCell>
                  <TableCell><StageChip stage={r.stage} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.scheduled}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Roboto Mono', monospace" }}>{r.window}</Typography>
                  </TableCell>
                  {data.mode === "assign" && (
                    <>
                      <TableCell>{r.spoc ?? <Typography variant="caption" sx={{ color: "text.secondary" }}>Unassigned</Typography>}</TableCell>
                      <TableCell>{r.fieldEngineer ?? <Typography variant="caption" sx={{ color: "text.secondary" }}>Unassigned</Typography>}</TableCell>
                    </>
                  )}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {data.mode === "assign" ? (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" variant="outlined" startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => openAction(r.id, "assignSpoc")}>
                          {r.spoc ? "Re-assign SPOC" : "Assign SPOC"}
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<EngineeringOutlinedIcon />} onClick={() => openAction(r.id, "assignFe")}>
                          {r.fieldEngineer ? "Re-assign FE" : "Assign FE"}
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Reschedule"><IconButton size="small" onClick={() => openAction(r.id, "reschedule")}><ReplayIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delegate"><IconButton size="small" onClick={() => openAction(r.id, "delegate")}><SwapHorizIcon fontSize="small" /></IconButton></Tooltip>
                        <Button size="small" variant="outlined" color="error" onClick={() => openAction(r.id, "reject")}>Reject</Button>
                        <Button size="small" variant="contained" color="success" onClick={() => openAction(r.id, "approve")}>Approve</Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <CrqDetailDrawer crqId={selected} onClose={() => setSelected(null)} />
      <ApproveCrqModal     open={modal === "approve"}     crqId={actionTarget} onClose={closeModal} />
      <RejectCrqModal      open={modal === "reject"}      crqId={actionTarget} onClose={closeModal} />
      <DelegateCrqModal    open={modal === "delegate"}    crqId={actionTarget} onClose={closeModal} />
      <RescheduleCrqModal  open={modal === "reschedule"}  crqId={actionTarget} onClose={closeModal} />
      <AssignSpocModal     open={modal === "assignSpoc"}  crqId={actionTarget} onClose={closeModal} />
      <AssignFeModal       open={modal === "assignFe"}    crqId={actionTarget} onClose={closeModal} />
    </Box>
  );
}
