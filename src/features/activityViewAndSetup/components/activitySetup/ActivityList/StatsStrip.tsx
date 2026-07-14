import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ActivityViewRow } from "../../../types/activity.types";

export const StatsStrip: React.FC<{ rows: ActivityViewRow[] }> = ({ rows }) => {
  const theme = useTheme();

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      draft: rows.filter((r) => r.status === "Draft").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      highImpact: rows.filter((r) => ["High", "Critical"].includes(r.changeImpact)).length,
    }),
    [rows],
  );

  const items = [
    { label: "Total", value: stats.total, color: theme.palette.primary.main },
    { label: "Active", value: stats.active, color: "#10b981" },
    { label: "Draft", value: stats.draft, color: "#6b7280" },
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "High Impact", value: stats.highImpact, color: "#ef4444" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        mb: 1.5,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {items.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRight: i < items.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
            transition: "background-color 150ms",
            "&:hover": { backgroundColor: alpha(item.color, 0.04) },
          }}
        >
          <Box sx={{ width: 3, height: 28, borderRadius: 2, backgroundColor: item.color, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.1, color: item.color }}>
              {item.value}
            </Typography>
            <Typography
              sx={{ fontSize: 10, color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
