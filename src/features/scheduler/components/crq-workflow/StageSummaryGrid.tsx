import React from "react";
import { Box, Typography } from "@mui/material";
import type { Colors } from "../../types/colorTypes";
import type { StageSummaryField } from "../../constants/workflowStages";

interface StageSummaryGridProps {
  fields: StageSummaryField[];
  colors: Colors;
}

/**
 * Generic label/value card grid - reused by every stage's detail body so no
 * stage needs its own bespoke summary layout.
 */
export const StageSummaryGrid: React.FC<StageSummaryGridProps> = ({
  fields,
  colors,
}) => {
  if (!fields.length) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: `1px dashed ${colors.border}`,
          borderRadius: colors.radiusL,
        }}
      >
        <Typography sx={{ fontSize: 13, color: colors.textDim }}>
          No data available for this stage yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 1.5,
      }}
    >
      {fields.map((f) => (
        <Box
          key={f.label}
          sx={{
            border: `1px solid ${colors.border}`,
            borderRadius: colors.radiusL,
            p: "13px 16px",
            bgcolor: colors.surface,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: colors.textDim,
              fontWeight: 700,
            }}
          >
            {f.label}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: colors.textPrimary,
              mt: 0.5,
              wordBreak: "break-word",
            }}
          >
            {f.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StageSummaryGrid;
