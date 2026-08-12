import React, { useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { format } from "date-fns";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import type { Colors } from "../../types/colorTypes";
import type { Crq } from "../../types/crqWorkflow.types";
import { WORKFLOW_STAGES } from "../../constants/workflowStages";

interface CrqWorkflowHeaderProps {
  crq: Crq;
  currentStageIndex: number;
  colors: Colors;
}

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : format(d, "dd-MMM-yyyy HH:mm");
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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

const StatusChip: React.FC<{ label: string; colors: Colors }> = ({ label, colors }) => {
  const p = statusPalette(label, colors);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: "3px",
        borderRadius: "6px",
        fontSize: 11.5,
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

/** One label/value field in the summary strip, with an optional leading icon. */
const Field: React.FC<{
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <Box>
    <Stack direction="row" alignItems="center" spacing={0.4}>
      {icon}
      <Typography
        sx={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 800,
          color: "inherit",
          opacity: 0.6,
        }}
      >
        {label}
      </Typography>
    </Stack>
    <Box sx={{ mt: 0.25 }}>{children}</Box>
  </Box>
);

/** Extra CRQ-provided fields (department/support group/category) shown under
 * their own real names - never relabeled as "Team/Sub Function" since no
 * field with that exact meaning exists on this data model. */
const EXTRA_FIELD_LABELS: Array<[key: string, label: string]> = [
  ["assignedDepartment", "Assigned Department"],
  ["supportGroupName", "Support Group"],
  ["assignedGroup", "Assigned Group"],
  ["categorizationTier_1", "Category"],
];

/** Compact CRQ summary strip: identity, live status/stage, assigned engineer,
 * raised/last-updated dates, and (when present) an assignment/department field. */
export const CrqWorkflowHeader: React.FC<CrqWorkflowHeaderProps> = ({
  crq,
  currentStageIndex,
  colors,
}) => {
  const c = crq as any;
  const [copied, setCopied] = useState(false);
  const currentStage = WORKFLOW_STAGES[currentStageIndex];

  const currentHistoryEntry = crq.history?.find((h) => h.current) ?? null;
  const anyAssignedEntry = crq.history?.find((h) => h.assignedTo || h.performedBy) ?? null;
  const engineer =
    c.olmidReview ??
    c.olmidImpactAnalysis ??
    currentHistoryEntry?.assignedTo ??
    currentHistoryEntry?.performedBy ??
    anyAssignedEntry?.assignedTo ??
    anyAssignedEntry?.performedBy ??
    null;

  const lastUpdatedDate = (() => {
    const dates: Date[] = [];
    (crq.history ?? []).forEach((h) => {
      const s = parseDate(h.startedAt);
      const e = parseDate(h.completedAt);
      if (s) dates.push(s);
      if (e) dates.push(e);
    });
    [
      "activityPlanStartDate",
      "activityPlanEndDate",
      "impactStartDate",
      "impactEndDate",
      "reviewStartDate",
      "reviewEndDate",
    ].forEach((k) => {
      const d = parseDate(c[k]);
      if (d) dates.push(d);
    });
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  })();

  const extraField = EXTRA_FIELD_LABELS.find(([key]) => typeof c[key] === "string" && c[key].trim());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(crq.crqNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API unavailable - no-op.
    }
  };

  return (
    <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 2, py: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.75}
        flexWrap="wrap"
        useFlexGap
        sx={{ rowGap: 0.75, color: colors.textPrimary }}
      >
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
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <Typography sx={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700 }}>
              {crq.crqNo}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy CRQ number"} arrow>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ p: "2px", color: colors.textDim, "&:hover": { color: colors.accent } }}
                aria-label="Copy CRQ number"
              >
                {copied ? (
                  <CheckRoundedIcon sx={{ fontSize: 13, color: colors.success }} />
                ) : (
                  <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ width: "1px", height: 26, bgcolor: colors.border }} />

        <Field label="CRQ Status">
          <StatusChip label={c.crqStatus ?? "—"} colors={colors} />
        </Field>

        <Field label="Current Stage">
          <StatusChip label={currentStage.label} colors={colors} />
        </Field>

        <Field label="Assigned Engineer" icon={<PersonOutlineRoundedIcon sx={{ fontSize: 12, color: colors.textDim }} />}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{engineer ?? "—"}</Typography>
        </Field>

        {extraField && (
          <Field label={extraField[1]} icon={<ApartmentRoundedIcon sx={{ fontSize: 12, color: colors.textDim }} />}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{c[extraField[0]]}</Typography>
          </Field>
        )}

        <Field label="Raised" icon={<CalendarTodayRoundedIcon sx={{ fontSize: 11, color: colors.textDim }} />}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
            {formatDate(crq.crqRaisedDate) ?? "—"}
          </Typography>
        </Field>

        <Field label="Last Updated" icon={<UpdateRoundedIcon sx={{ fontSize: 11, color: colors.textDim }} />}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
            {lastUpdatedDate ? format(lastUpdatedDate, "dd-MMM-yyyy HH:mm") : "—"}
          </Typography>
        </Field>

        <Field label="Execution Window">
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            {formatDate(c.activityPlanStartDate) ?? "—"} → {formatDate(c.activityPlanEndDate) ?? "—"}
          </Typography>
        </Field>
      </Stack>
    </Box>
  );
};

export default CrqWorkflowHeader;
