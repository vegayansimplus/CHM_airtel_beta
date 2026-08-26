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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetMyCrqByIdQuery } from "../../api/cabManagerApiSlice";
import { ConflictCrqModal } from "../modals/ConflictCrqModal";
import { SpocFeDetailsModal } from "../modals/SpocFeDetailsModal";
import { StageChip, StatusChip } from "./Chips";
import { errMsg } from "./errMsg";

export function MyCrqDetailDrawer({ crqId, onClose }: { crqId: string | null; onClose: () => void }) {
  const open = !!crqId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetMyCrqByIdQuery(crqId ?? "", { skip: !crqId });

  const [spocFeOpen, setSpocFeOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

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
              {/* Re-assignment was removed here: SPOC / Field Engineer are now
                  read-only, viewed through sp_get_SPOC_FE_details rather than
                  changed from this drawer. */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>SPOC &amp; Field Engineer</Typography>
                <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => setSpocFeOpen(true)}>
                  View
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Conflict check</Typography>
                <Button size="small" variant="outlined" color="warning" startIcon={<ReportProblemOutlinedIcon />} onClick={() => setConflictOpen(true)}>
                  Conflict
                </Button>
              </Stack>
            </Stack>
          </>
        )}
      </Box>

      <SpocFeDetailsModal
        open={spocFeOpen}
        crqNo={crqId}
        onClose={() => setSpocFeOpen(false)}
      />

      <ConflictCrqModal
        open={conflictOpen}
        crqNo={crqId}
        onClose={() => setConflictOpen(false)}
        onSuccess={() => setConflictOpen(false)}
      />
    </Drawer>
  );
}
