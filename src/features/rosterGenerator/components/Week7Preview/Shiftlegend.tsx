
import { Box, Stack, Tooltip } from "@mui/material";
import { SHIFT_COLORS, SHIFT_DISPLAY_ORDER } from "../../util/Shiftconstants";
import { ShiftChip } from "./Shiftchip";

export function ShiftLegend() {
  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
      {SHIFT_DISPLAY_ORDER.map((code) => (
        <Tooltip
          key={code}
          title={SHIFT_COLORS[code].label}
          arrow
          disableInteractive
          placement="top"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ShiftChip code={code} size="sm" />
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}