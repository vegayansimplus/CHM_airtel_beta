import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import type { Colors } from "../../types/colorTypes";
import type { Crq } from "../../types/crqWorkflow.types";
import { WORKFLOW_STAGES } from "../../constants/workflowStages";

interface CrqWorkflowHeaderProps {
  crq: Crq;
  currentStageIndex: number;
  colors: Colors;
}

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd-MMM-yyyy HH:mm");
};

/** Palette for a value rendered as a chip, keyed off simple keyword heuristics. */
const statusPalette = (value: string, colors: Colors) => {
  const v = value.toLowerCase();
  if (v.includes("done") || v.includes("complete") || v.includes("closed"))
    return { bg: colors.successDim, fg: colors.success };
  if (v.includes("progress") || v.includes("active"))
    return { bg: colors.infoDim, fg: colors.info };
  if (v.includes("fail") || v.includes("cancel") || v.includes("reject"))
    return { bg: colors.dangerDim, fg: colors.danger };
  return { bg: colors.accentDim, fg: colors.accent };
};

const MetaChip: React.FC<{ label: string; colors: Colors }> = ({ label, colors }) => {
  const p = statusPalette(label, colors);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: "3px",
        borderRadius: "6px",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
        bgcolor: p.bg,
        color: p.fg,
      }}
    >
      {label}
    </Box>
  );
};

/** CRQ summary header: crqNo + Plan Start/End, CRQ Status, Current Stage, OLM ID. */
export const CrqWorkflowHeader: React.FC<CrqWorkflowHeaderProps> = ({
  crq,
  currentStageIndex,
  colors,
}) => {
  const c = crq as any;
  const currentStage = WORKFLOW_STAGES[currentStageIndex];
  const olmId = c.olmidReview ?? c.olmidImpactAnalysis ?? "—";

  const metaFields = [
    { label: "Plan Start", value: formatDate(c.activityPlanStartDate) },
    { label: "Plan End", value: formatDate(c.activityPlanEndDate) },
    { label: "CRQ Status", value: c.crqStatus ?? "—", chip: true },
    { label: "Current Stage", value: currentStage.label, chip: true },
    { label: "OLM ID", value: olmId },
  ];

  return (
    <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 2.25, py: 1.1 }}>
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.75 }}>
        <Box>
          <Typography
            sx={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              color: colors.textDim,
              fontWeight: 800,
            }}
          >
            Change Request
          </Typography>
          <Typography sx={{ fontFamily: "monospace", fontSize: 15.5, fontWeight: 700, color: colors.textPrimary }}>
            {crq.crqNo}
          </Typography>
        </Box>
        <Box sx={{ width: "1px", height: 26, bgcolor: colors.border }} />
        {metaFields.map((m) => (
          <Box key={m.label}>
            <Typography
              sx={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: colors.textDim,
                fontWeight: 800,
              }}
            >
              {m.label}
            </Typography>
            {m.chip ? (
              <Box sx={{ mt: 0.25 }}>
                <MetaChip label={m.value} colors={colors} />
              </Box>
            ) : (
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, mt: 0.15 }}>
                {m.value}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CrqWorkflowHeader;
