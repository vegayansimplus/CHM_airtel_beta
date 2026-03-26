/**
 * PageHeader.tsx
 * Top section of PlanAndInventoryPage:
 * gradient accent bar · title · subtitle.
 */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { Colors } from "../../types/colorTypes";

// ─────────────────────────────────────────────────────────────────────────────
interface PageHeaderProps {
  colors: Colors;
}

// ─────────────────────────────────────────────────────────────────────────────
export const PageHeader: React.FC<PageHeaderProps> = ({ colors }) => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    {/* Gradient accent bar */}
    <Box
      sx={{
        width: 4,
        height: 26,
        borderRadius: 99,
        flexShrink: 0,
        background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.info} 100%)`,
      }}
    />

    <Box>
      <Typography
        sx={{
          fontSize: { xs: 18, sm: 22 },
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: -0.6,
          lineHeight: 1.2,
        }}
      >
        Plan &amp; Inventory
      </Typography>
      <Typography sx={{ fontSize: 12, color: colors.textDim, mt: 0.3 }}>
        Change Request Tracking &amp; Execution
      </Typography>
    </Box>
  </Stack>
);