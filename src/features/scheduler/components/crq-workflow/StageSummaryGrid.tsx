import React, { useState } from "react";
import { Box, Fade, Typography } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import type { Colors } from "../../types/colorTypes";
import type { StageSummaryField } from "../../constants/workflowStages";

interface StageSummaryGridProps {
  fields: StageSummaryField[];
  colors: Colors;
}

const SummaryCard: React.FC<{ field: StageSummaryField; colors: Colors }> = ({ field, colors }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API unavailable (insecure context, permissions) - no-op.
    }
  };

  return (
    <Box
      onClick={handleCopy}
      role="button"
      title="Click to copy"
      sx={{
        position: "relative",
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${copied ? colors.success : colors.accentBorder}`,
        borderRadius: colors.radius,
        p: "9px 12px",
        bgcolor: colors.surface,
        cursor: "pointer",
        transition: "border-color .15s ease, box-shadow .15s ease, transform .15s ease",
        "&:hover": {
          borderColor: colors.accent,
          boxShadow: `0 4px 12px ${colors.accentBorder}`,
          transform: "translateY(-1px)",
        },
        "&:hover .copy-affordance": { opacity: 1 },
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: colors.textDim,
          fontWeight: 700,
        }}
      >
        {field.label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 700,
          color: colors.textPrimary,
          mt: 0.3,
          pr: 2,
          wordBreak: "break-word",
        }}
      >
        {field.value}
      </Typography>

      <Box
        className="copy-affordance"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          opacity: 0,
          transition: "opacity .15s ease",
          color: colors.textDim,
          display: "flex",
        }}
      >
        <Fade in={copied}>
          <CheckRoundedIcon sx={{ fontSize: 14, color: colors.success, position: "absolute" }} />
        </Fade>
        <Fade in={!copied}>
          <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
        </Fade>
      </Box>
    </Box>
  );
};

/**
 * Generic label/value card grid - reused by every stage's detail body so no
 * stage needs its own bespoke summary layout. Cards are click-to-copy for
 * quick reuse of a value (crq id, node ip, ...) elsewhere.
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
          lg: "repeat(4, 1fr)",
          xl: "repeat(5, 1fr)",
        },
        gap: 1,
      }}
    >
      {fields.map((f) => (
        <SummaryCard key={f.label} field={f} colors={colors} />
      ))}
    </Box>
  );
};

export default StageSummaryGrid;
