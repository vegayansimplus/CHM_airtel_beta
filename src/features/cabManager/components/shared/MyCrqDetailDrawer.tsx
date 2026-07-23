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
import { useGetMyCrqByIdQuery } from "../../api/cabManagerApiSlice";
import { AssignSpocModal } from "../modals/AssignSpocModal";
import { AssignFeModal } from "../modals/AssignFeModal";
import { StageChip, StatusChip } from "./Chips";
import { errMsg } from "./errMsg";

export function MyCrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
  const open = !!crqId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetMyCrqByIdQuery(crqId ?? "", { skip: !crqId });

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
                <Typography sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main", fontWeight: 500 }}>{data.crqNo}</Typography>
                <StatusChip status={data.serviceApprovalStatus} />
              </>
            )}
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        {data && (
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 500, lineHeight: 1.3 }}>{data.domainName} · Circle {data.circleCode}</Typography>
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
              onClick={() => { onClose(); navigate(`/cabmanager/journey/${data.crqNo}`); }}
              sx={{ mb: 2.5 }}
            >
              View full CRQ journey
            </Button>

            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", mb: 1, display: "block" }}>
              Overview
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
              {[
                ["Domain",     data.domainName],
                ["Circle",     data.circleCode],
                ["Plan ID",    data.planId],
                ["Stage",      <StageChip key="s" stage={data.currentStage} />],
                ["Service",    data.serviceCode],
                ["Stage Status", data.stageStatus],
              ].map(([k, v]) => (
                <Box key={String(k)}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{k}</Typography>
                  {typeof v === "string" || v === null || v === undefined
                    ? <Typography variant="body2">{v || "—"}</Typography>
                    : v}
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase", display: "block", mb: 1 }}>
              Assignment
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>SPOC assignment</Typography>
                <Button size="small" variant="outlined" startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => setAssignSpocOpen(true)}>
                  Re-assign SPOC
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Field Engineer assignment</Typography>
                <Button size="small" variant="outlined" startIcon={<EngineeringOutlinedIcon />} onClick={() => setAssignFeOpen(true)}>
                  Re-assign FE
                </Button>
              </Stack>
            </Stack>
          </>
        )}
      </Box>

      <AssignSpocModal
        open={assignSpocOpen}
        crqId={crqId}
        onClose={() => setAssignSpocOpen(false)}
        onSuccess={() => {
          setAssignSpocOpen(false);
          onClose();
        }}
      />
      <AssignFeModal
        open={assignFeOpen}
        crqId={crqId}
        onClose={() => setAssignFeOpen(false)}
        onSuccess={() => {
          setAssignFeOpen(false);
          onClose();
        }}
      />
    </Drawer>
  );
}
