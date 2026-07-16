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
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetCrqByIdQuery } from "../../api/cabManagerApiSlice";
import { AssignSpocModal } from "../modals/AssignSpocModal";
import { AssignFeModal } from "../modals/AssignFeModal";
import { StageChip, StatusChip } from "./Chips";
import { errMsg } from "./errMsg";

export function MyCrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
  const open = !!crqId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetCrqByIdQuery(crqId ?? "", { skip: !crqId });
  const [assignSpocOpen, setAssignSpocOpen] = useState(false);
  const [assignFeOpen, setAssignFeOpen] = useState(false);

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
              Assignment
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>SPOC</Typography>
                  <Typography variant="body2">{data.spoc ?? "Unassigned"}</Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => setAssignSpocOpen(true)}>
                  Re-assign SPOC
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Field Engineer</Typography>
                  <Typography variant="body2">{data.fieldEngineer ?? "Unassigned"}</Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<EngineeringOutlinedIcon />} onClick={() => setAssignFeOpen(true)}>
                  Re-assign FE
                </Button>
              </Stack>
            </Stack>

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

      <AssignSpocModal open={assignSpocOpen} crqId={crqId} onClose={() => setAssignSpocOpen(false)} />
      <AssignFeModal open={assignFeOpen} crqId={crqId} onClose={() => setAssignFeOpen(false)} />
    </Drawer>
  );
}
