import React from "react";
import { Box, Tooltip } from "@mui/material";
import type { MandatoryLevel } from "../types/attributeUpdate.types";
import { MANDATORY_BADGE } from "../constants/attributeUpdate.constants";

interface MandatoryBadgeProps {
  level: MandatoryLevel;
  /** Raw mandatory label, shown as tooltip for conditional fields. */
  rawLabel: string;
}

/** "Mandatory" / "Optional" / "Conditional" pill next to an attribute's type. */
export const MandatoryBadge: React.FC<MandatoryBadgeProps> = ({
  level,
  rawLabel,
}) => {
  const palette = MANDATORY_BADGE[level];
  const badge = (
    <Box
      component="span"
      sx={{
        px: 1,
        py: "3px",
        borderRadius: "5px",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
        bgcolor: palette.bg,
        color: palette.fg,
      }}
    >
      {palette.label}
    </Box>
  );

  return level === "conditional" ? (
    <Tooltip title={rawLabel} arrow>
      {badge}
    </Tooltip>
  ) : (
    badge
  );
};

export default MandatoryBadge;
