import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { Colors } from "../../../types/colorTypes";
import {
  SYSTEM_SECTIONS,
  SYSTEM_SECTION_ORDER,
} from "../constants/attributeUpdate.constants";

interface AttributeApiChipsProps {
  colors: Colors;
}

/** "APIs on save" strip — the downstream update calls fired for this stage. */
export const AttributeApiChips: React.FC<AttributeApiChipsProps> = ({
  colors,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    flexWrap="wrap"
    gap={1.25}
    sx={{
      px: 2,
      py: 1.5,
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: colors.radiusL,
      mb: 1.75,
    }}
  >
    <Typography
      sx={{ fontSize: 13, fontWeight: 500, color: colors.textSecondary }}
    >
      APIs on save:
    </Typography>
    {SYSTEM_SECTION_ORDER.map((system) => {
      const meta = SYSTEM_SECTIONS[system];
      return (
        <Box
          key={system}
          component="span"
          sx={{
            px: 1.25,
            py: "4px",
            borderRadius: "6px",
            fontFamily: "monospace",
            fontSize: 12.5,
            fontWeight: 500,
            bgcolor: meta.chipBg,
            color: meta.chipFg,
          }}
        >
          {meta.apiChipLabel}
        </Box>
      );
    })}
  </Stack>
);

export default AttributeApiChips;
