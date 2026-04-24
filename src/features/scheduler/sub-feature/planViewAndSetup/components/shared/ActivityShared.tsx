import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

const IMPACT_COLOR: Record<string, { fg: string; bg: string }> = {
  Low: { fg: "#065f46", bg: "#d1fae5" },
  Medium: { fg: "#92400e", bg: "#fef3c7" },
  High: { fg: "#c2410c", bg: "#ffedd5" },
  Critical: { fg: "#991b1b", bg: "#fee2e2" },
};

const STATUS_COLOR: Record<string, { fg: string; bg: string; dot: string }> = {
  Active: { fg: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  Inactive: { fg: "#374151", bg: "#f3f4f6", dot: "#9ca3af" },
  Draft: { fg: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  Pending: { fg: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.03em",
};

export const ImpactChip: React.FC<{ impact: string }> = ({ impact }) => {
  const c = IMPACT_COLOR[impact] ?? { fg: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{ ...badgeStyle, color: c.fg, backgroundColor: c.bg }}>
      Impact: {impact || "—"}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const c = STATUS_COLOR[status] ?? {
    fg: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
  return (
    <span style={{ ...badgeStyle, color: c.fg, backgroundColor: c.bg, gap: 6 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: c.dot,
        }}
      />
      {status || "—"}
    </span>
  );
};

// Reusable Auto-Details strip (For Wireframes 4, 5, 6)
export const ReadonlyAutoFields: React.FC<{
  fields: Array<{ label: string; value: string | number }>;
}> = ({ fields }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.primary.main, 0.03),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      {fields.map((f, i) => (
        <Box key={i}>
          <Typography
            sx={{
              fontSize: 10,
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.5,
            }}
          >
            {f.label}
          </Typography>
          <Typography
            sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
          >
            {f.value || "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
