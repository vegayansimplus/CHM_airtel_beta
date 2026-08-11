import { Box, Chip, Divider, Drawer, IconButton, LinearProgress, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { useGetCrqDetailQuery } from "../api/crqAnalyticsApi";
import { EmptyOrErrorState } from "./EmptyOrErrorState";
import type { CRQEventFeedDto, CRQTimelineStepDto } from "../types/crqAnalytics.types";

interface Props {
  crqNo: string | null;
  onClose: () => void;
}

const timelineIcon = (status: CRQTimelineStepDto["status"]) => {
  if (status === "completed") return <CheckCircleRoundedIcon fontSize="small" color="success" />;
  if (status === "rejected") return <CancelRoundedIcon fontSize="small" color="error" />;
  return <RadioButtonUncheckedRoundedIcon fontSize="small" color={status === "active" ? "primary" : "disabled"} />;
};

const eventDotColor: Record<CRQEventFeedDto["color"], string> = {
  green: "#22c55e",
  red: "#ef4444",
  orange: "#f59e0b",
  blue: "#3b82f6",
};

export function CrqDetailDrawer({ crqNo, onClose }: Props) {
  const theme = useTheme();
  const { data, isFetching, isError } = useGetCrqDetailQuery(crqNo ?? "", { skip: !crqNo });

  return (
    <Drawer anchor="right" open={!!crqNo} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 560 }, p: 2.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: theme.palette.text.primary }}>{data?.crqNo ?? "CRQ Detail"}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {isFetching && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={320} />
        </Box>
      )}

      {isError && !isFetching && <EmptyOrErrorState kind="error" message="Couldn't load CRQ details." />}

      {data && !isFetching && !isError && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Header */}
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{data.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
              <Chip size="small" label={data.currentStage} color="primary" variant="outlined" />
              <Chip size="small" label={data.status} />
              {data.impactLabel && <Chip size="small" label={`${data.impactLabel} (${data.impactCount})`} />}
              {data.flagB2B && <Chip size="small" label="B2B" />}
              {data.flagSA && <Chip size="small" label="SA" />}
              {data.flagCoreNode && <Chip size="small" label="Core Node" />}
              {data.flagNSA && <Chip size="small" label="NSA" />}
            </Stack>
            {data.progressPct != null && (
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress variant="determinate" value={data.progressPct} sx={{ height: 6, borderRadius: 3 }} />
                <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>{data.progressPct}% complete</Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Details */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {[
              ["Requestor", data.requestor],
              ["Category", data.category],
              ["Circle", data.circle],
              ["Plan Type", data.planType],
              ["Domain", data.domain],
              ["Plan No.", data.planNo],
              ["Scheduled Date", data.scheduledDate],
              ["Impact", data.impact],
              ["Execution Window", data.executionWindow],
              ["Submit Date", data.submitDate],
              ["Last Updated", data.lastUpdated],
            ].map(([label, value]) => (
              <Box key={label}>
                <Typography sx={{ fontSize: 10, color: "text.secondary", textTransform: "uppercase" }}>{label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{value || "—"}</Typography>
              </Box>
            ))}
          </Box>

          {(data.fieldEngineerName || data.fieldEngineerMobile || data.fieldEngineerEmail) && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 0.5 }}>Field Engineer</Typography>
                <Typography sx={{ fontSize: 12.5 }}>{data.fieldEngineerName || "—"}</Typography>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                  {[data.fieldEngineerMobile, data.fieldEngineerEmail].filter(Boolean).join(" · ")}
                </Typography>
              </Box>
            </>
          )}

          {data.impactedSystems.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 0.75 }}>Impacted Systems</Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                  {data.impactedSystems.map((sys) => (
                    <Chip key={sys} size="small" label={sys} variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {data.timeline.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 1 }}>Timeline</Typography>
                <Stack spacing={1}>
                  {data.timeline.map((step) => (
                    <Box key={step.stepNo} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {timelineIcon(step.status)}
                      <Typography sx={{ fontSize: 12, fontWeight: step.status === "active" ? 700 : 400 }}>{step.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {data.approvalTrail.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 1 }}>Approval Trail</Typography>
                <Stack spacing={1}>
                  {data.approvalTrail.map((a, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                          {a.role} — {a.name}
                        </Typography>
                        {a.remark && <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{a.remark}</Typography>}
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip size="small" label={a.status} />
                        <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>{a.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {data.eventFeed.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 1 }}>Event Feed</Typography>
                <Stack spacing={1}>
                  {data.eventFeed.map((e, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: eventDotColor[e.color], mt: 0.5, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: 12 }}>{e.message}</Typography>
                        <Typography sx={{ fontSize: 10, color: "text.secondary" }}>{e.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
}
