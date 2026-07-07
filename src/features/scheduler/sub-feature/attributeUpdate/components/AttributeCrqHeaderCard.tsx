import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import type { Colors } from "../../../types/colorTypes";
import type {
  AttributeUpdateCrqContext,
  StageAttributeView,
} from "../types/attributeUpdate.types";
import { STAGE_BADGES } from "../constants/attributeUpdate.constants";

interface AttributeCrqHeaderCardProps {
  crq: AttributeUpdateCrqContext;
  stageView: StageAttributeView;
  colors: Colors;
}

const StageBadge: React.FC<{
  palette: { bg: string; fg: string };
  icon: React.ReactNode;
  label: string;
}> = ({ palette, icon, label }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      px: 1.5,
      py: "5px",
      borderRadius: "16px",
      fontSize: 12.5,
      fontWeight: 500,
      whiteSpace: "nowrap",
      bgcolor: palette.bg,
      color: palette.fg,
    }}
  >
    {icon}
    {label}
  </Box>
);

/**
 * Header card of the dialog body: CRQ identity + requester meta on the left,
 * the current CMS stage / Remedy status / Planning Tool phase badges on the
 * right.
 */
export const AttributeCrqHeaderCard: React.FC<AttributeCrqHeaderCardProps> = ({
  crq,
  stageView,
  colors,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
      gap: 1.5,
      alignItems: "start",
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: colors.radiusL,
      px: 2.25,
      py: 1.75,
      mb: 1.75,
    }}
  >
    <Box>
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: 15,
          fontWeight: 600,
          color: colors.textPrimary,
        }}
      >
        {crq.crqNo}
      </Typography>
      <Typography sx={{ fontSize: 13.5, color: colors.textSecondary, mt: 0.3 }}>
        Requester: {crq.requester} · Circle: {crq.circle} · Vendor: {crq.vendor}{" "}
        · Domain: {crq.domain}
      </Typography>
    </Box>

    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.75}
      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
      sx={{ maxWidth: { sm: 460 } }}
    >
      <StageBadge
        palette={STAGE_BADGES.cms}
        icon={<FlagOutlinedIcon sx={{ fontSize: 14 }} />}
        label={`CMS: ${stageView.stage.label}`}
      />
      <StageBadge
        palette={STAGE_BADGES.remedy}
        icon={<StorageRoundedIcon sx={{ fontSize: 14 }} />}
        label={`Remedy: ${stageView.activeRemedyStatus}`}
      />
      <StageBadge
        palette={STAGE_BADGES.planningTool}
        icon={<QueryStatsRoundedIcon sx={{ fontSize: 14 }} />}
        label={`Planning Tool: ${stageView.stage.planningToolPhase}`}
      />
    </Stack>
  </Box>
);

export default AttributeCrqHeaderCard;
