import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
import { ApproveCrqModal } from "../modals/ApproveCrqModal";
import { DelegateCrqModal } from "../modals/DelegateCrqModal";
import { RejectCrqModal } from "../modals/RejectCrqModal";
import { StageChip, StatusChip } from "./Chips";
import { errMsg } from "./errMsg";

export function CrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
  const open = !!crqId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetCrqByIdQuery(crqId ?? "", { skip: !crqId });
  const [modal, setModal] = useState<"approve" | "reject" | "delegate" | null>(null);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 480 } }}>
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {data && (
              <>
                <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{data.id}</Typography>
                <StatusChip status={data.status} />
              </>
            )}
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        {data && (
          <>
            <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 500, lineHeight: 1.3 }}>{data.activity}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
              Raised by <Box component="span" sx={{ color: "text.primary" }}>{data.raisedBy}</Box> · {data.raisedOn}
            </Typography>
          </>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {isError && <Alert severity="error">{errMsg(error)}</Alert>}
        {isLoading && <Stack spacing={1.5}>{[0,1,2,3].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>}

        {data && (
          <>
            {data.assignedToMe && (
              <Box sx={{ display: "flex", gap: 1.5, p: 1.5, bgcolor: "#FFF4E5", border: "1px solid #FFE0B2", borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>Action required.</Box>{" "}
                  This CRQ is awaiting your approval at the {data.stage} stage. SLA at {data.sla}%.
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => { onClose(); navigate(`/cabmanager/journey/${data.id}`); }}
              sx={{ mb: 2.5 }}
            >
              View full CRQ journey
            </Button>

            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", mb: 1, display: "block" }}>
              Overview
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
              {[
                ["Domain",     data.domain],
                ["Circle",     data.circle],
                ["Technology", data.technology],
                ["Impact",     data.impact],
                ["Stage",      <StageChip key="s" stage={data.stage} />],
                ["Scheduled",  data.scheduled],
                ["Window",     data.window],
                ["MOP",        data.mop],
                ["Hostname",   data.hostname],
              ].map(([k, v]) => (
                <Box key={String(k)}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{k}</Typography>
                  {typeof v === "string" ? <Typography variant="body2">{v}</Typography> : v}
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", display: "block", mb: 1 }}>
              Impacted Parties
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{(data.impactedParties ?? []).join(", ")}</Typography>

            {data.rejectReason && (
              <>
                <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", display: "block", mb: 1 }}>
                  Rejection Reason
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: "#FDECEA", border: "1px solid #F5C6C0", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: "#B71C1C", fontWeight: 500 }}>{data.rejectReason}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{data.rejectComment}</Typography>
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      {/* Footer actions */}
      {data?.assignedToMe && data.status === "pending" && (
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#FAFAFA" }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => setModal("reject")}>Reject</Button>
            <Button fullWidth variant="outlined" startIcon={<SwapHorizIcon />} onClick={() => setModal("delegate")}>Delegate</Button>
            <Button fullWidth variant="contained" color="success" startIcon={<CheckIcon />} onClick={() => setModal("approve")}>Approve</Button>
          </Stack>
        </Box>
      )}

      {data && (
        <>
          <ApproveCrqModal  open={modal === "approve"}  crqId={data.id} onClose={() => setModal(null)} />
          <RejectCrqModal   open={modal === "reject"}   crqId={data.id} onClose={() => setModal(null)} />
          <DelegateCrqModal open={modal === "delegate"} crqId={data.id} onClose={() => setModal(null)} />
        </>
      )}
    </Drawer>
  );
}
