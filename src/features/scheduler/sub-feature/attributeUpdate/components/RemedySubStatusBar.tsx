import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import type { Colors } from "../../../types/colorTypes";
import { SUB_STATUS_BAR } from "../constants/attributeUpdate.constants";

interface RemedySubStatusBarProps {
  statuses: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  colors: Colors;
}

/**
 * Remedy sub-status selector, rendered only for stages spanning multiple
 * Remedy statuses (Network Execution). Selecting a status updates the
 * header badge and the auto-set remedy_status field.
 */
export const RemedySubStatusBar: React.FC<RemedySubStatusBarProps> = ({
  statuses,
  activeIndex,
  onSelect,
  colors,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    flexWrap="wrap"
    gap={1}
    sx={{
      px: 2,
      py: 1.5,
      mb: 1.75,
      bgcolor: SUB_STATUS_BAR.bg,
      border: `1px solid ${SUB_STATUS_BAR.border}`,
      borderRadius: colors.radiusL,
    }}
  >
    <Typography
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        fontSize: 13,
        fontWeight: 600,
        color: SUB_STATUS_BAR.fg,
      }}
    >
      <StorageRoundedIcon sx={{ fontSize: 14 }} />
      Remedy sub-status:
    </Typography>
    {statuses.map((status, index) => {
      const isActive = index === activeIndex;
      return (
        <Box
          key={status}
          component="button"
          type="button"
          onClick={() => onSelect(index)}
          sx={{
            px: 1.75,
            py: "5px",
            borderRadius: "16px",
            fontSize: 12.5,
            fontFamily: "inherit",
            fontWeight: isActive ? 600 : 400,
            cursor: "pointer",
            bgcolor: isActive ? colors.accent : "#FFFFFF",
            color: isActive ? "#fff" : colors.textSecondary,
            border: `1px solid ${isActive ? colors.accent : colors.border}`,
            transition: "all 0.15s ease",
            "&:hover": !isActive
              ? { borderColor: colors.accent, color: SUB_STATUS_BAR.fg }
              : undefined,
          }}
        >
          {status}
        </Box>
      );
    })}
  </Stack>
);

export default RemedySubStatusBar;
