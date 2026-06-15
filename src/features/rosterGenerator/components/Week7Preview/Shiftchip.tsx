import { memo } from "react";
import { Box, useTheme } from "@mui/material";
import type { ShiftCode } from "../../types/Futureweek.types";
import { MONO, SHIFT_COLORS } from "../../util/Shiftconstants";

interface ShiftChipProps {
  code: ShiftCode;
  size?: "sm" | "md";
  active?: boolean;
}

export const ShiftChip = memo(function ShiftChip({
  code,
  size = "md",
  active = false,
}: ShiftChipProps) {
  const isDark = useTheme().palette.mode === "dark";
  const tokens = SHIFT_COLORS[code];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: 36,
        height: 26,
        px: 0.75,
        borderRadius: "6px",
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        border: active ? "2px solid" : "1.5px solid",
        bgcolor: tokens.bgLight,
        color: tokens.fgLight,
        borderColor: active ? tokens.borderLight : `${tokens.borderLight}80`,
        boxShadow: active ? `0 0 0 2.5px ${tokens.borderLight}66` : "none",
        transition: "all 0.15s",
        "&:hover": {
          filter: "brightness(0.96)",
        },
      }}
    >
      {code}
    </Box>
  );
});



// import { memo } from "react";
// import { Box, useTheme } from "@mui/material";
// import type { ShiftCode } from "../../types/Futureweek.types";
// import { MONO, SHIFT_COLORS } from "../../util/Shiftconstants";

// interface ShiftChipProps {
//   code: ShiftCode;
//   size?: "sm" | "md";
// }

// export const ShiftChip = memo(function ShiftChip({
//   code,
//   size = "md",
// }: ShiftChipProps) {
//   const isDark = useTheme().palette.mode === "dark";
//   const tokens = SHIFT_COLORS[code];

//   const width = size === "sm" ? 34 : 40;
//   const height = size === "sm" ? 22 : 28;
//   const fs = size === "sm" ? 10 : 11;

//   return (
//    <Box
//   component="span"
//   sx={{
//     display: "inline-grid",
//     placeItems: "center",

//     minWidth: 36,
//     height: 26,

//     px: 0.75,

//     borderRadius: "6px",

//     fontFamily: MONO,
//     fontSize: 11,
//     fontWeight: 700,

//     border: "1.5px solid",

//     bgcolor: tokens.bgLight,
//     color: tokens.fgLight,
//     borderColor: tokens.borderLight,

//     transition: "all 0.15s",

//     "&:hover": {
//       filter: "brightness(0.96)",
//     },
//   }}
// >
//   {code}
// </Box>
//   );
// });
