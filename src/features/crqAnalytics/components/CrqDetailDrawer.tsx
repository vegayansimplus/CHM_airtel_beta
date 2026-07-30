import { Box, Drawer, IconButton, Skeleton, Typography, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useGetCrqDetailsQuery } from "../../crqJourney/api/crqJourneyExplorer.api";
import { CrqDetailsInfoCard } from "../../crqJourney/components/details/CrqDetailsInfoCard";
import { CrqStageTimeline } from "../../crqJourney/components/details/CrqStageTimeline";
import { EmptyOrErrorState } from "./EmptyOrErrorState";

interface Props {
  crqNo: string | null;
  onClose: () => void;
}

/** Reuses crqJourney's info-card + stage timeline as-is — the same audit-trail view
 * old CrqJourneyDetail.tsx showed, fed directly by crqNo instead of the sub-domain search bar. */
export function CrqDetailDrawer({ crqNo, onClose }: Props) {
  const theme = useTheme();
  const { data, isFetching, isError } = useGetCrqDetailsQuery(crqNo ?? "", { skip: !crqNo });

  return (
    <Drawer anchor="right" open={!!crqNo} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 560 }, p: 2.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: theme.palette.text.primary }}>CRQ Detail</Typography>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.info && <CrqDetailsInfoCard info={data.info} stages={data.stages} />}
          <CrqStageTimeline stages={data.stages} />
        </Box>
      )}
    </Drawer>
  );
}
