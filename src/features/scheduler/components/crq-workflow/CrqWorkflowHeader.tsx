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
    { label: "CRQ Status", value: c.crqStatus ?? "—" },
    { label: "Current Stage", value: currentStage.label },
    { label: "OLM ID", value: olmId },
  ];

  return (
    <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 2.75, py: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={2.5} flexWrap="wrap">
        <Box>
          <Typography
            sx={{
              fontSize: 9.5,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              color: colors.textDim,
              fontWeight: 800,
            }}
          >
            Change Request
          </Typography>
          <Typography sx={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: colors.textPrimary }}>
            {crq.crqNo}
          </Typography>
        </Box>
        <Box sx={{ width: "1px", height: 32, bgcolor: colors.border }} />
        {metaFields.map((m) => (
          <Box key={m.label}>
            <Typography
              sx={{
                fontSize: 9.5,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: colors.textDim,
                fontWeight: 800,
              }}
            >
              {m.label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, mt: 0.2 }}>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CrqWorkflowHeader;
