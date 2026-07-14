import React from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import type { ExecutionConfig, PhaseConfig } from "../../../types/activity.types";

interface Props {
  title: string;
  phase: PhaseConfig | ExecutionConfig | null | undefined;
  hasMargins: boolean;
}

const Stat: React.FC<{ label: string; value: string | number | null | undefined }> = ({
  label,
  value,
}) => (
  <Box>
    <Typography sx={{ fontSize: 10, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
      {value === null || value === undefined || value === "" ? "—" : value}
    </Typography>
  </Box>
);

export const PhaseSummaryTab: React.FC<Props> = ({ title, phase, hasMargins }) => {
  const theme = useTheme();
  const execution = phase as ExecutionConfig | null | undefined;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {title}
      </Typography>

      {!phase ? (
        <Typography variant="body2" color="text.disabled">
          This phase has not been configured for this activity.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat label="Shift" value={phase.shift} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat label="Min Level" value={phase.minimumLevelRequirement} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat label="Time (Min)" value={phase.time} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat label="Assigned Team" value={phase.assignTeam} />
          </Grid>
          {hasMargins && (
            <>
              <Grid size={{ xs: 6, md: 3 }}>
                <Stat label="Days Margin" value={execution?.daysMargin} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Stat label="Reservation Margin" value={execution?.reservationMargin} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Stat label="Rollback Time" value={execution?.rollbackTime} />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </Box>
  );
};
