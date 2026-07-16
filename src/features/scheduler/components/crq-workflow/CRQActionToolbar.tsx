import React from "react";
import { Stack } from "@mui/material";
import CustomActionButton from "../../../../components/common/CustomActionButton";
import type { Colors } from "../../types/colorTypes";

export interface CRQAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface CRQActionToolbarProps {
  actions: CRQAction[];
  colors: Colors;
}

/**
 * Sticky, icon-driven action bar for the CRQ cockpit (CrqDetailedView) -
 * holds record-level actions that apply regardless of which stage tab is
 * selected (Attribute Update, Show Prev CRQ Status, ...). Adding a future
 * action is a one-line addition to the `actions` array passed in - no
 * changes needed here.
 */
export const CRQActionToolbar: React.FC<CRQActionToolbarProps> = ({ actions, colors }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="flex-end"
    flexWrap="wrap"
    spacing={1}
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 2,
      px: 1.5,
      py: 1,
      mb: 1.5,
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: colors.radiusL,
    }}
  >
    {actions.map((action) => (
      <CustomActionButton
        key={action.key}
        label={action.label}
        disabled={action.disabled}
        onClick={action.onClick}
        startIcon={action.icon}
        colors={colors}
      />
    ))}
  </Stack>
);

export default CRQActionToolbar;
