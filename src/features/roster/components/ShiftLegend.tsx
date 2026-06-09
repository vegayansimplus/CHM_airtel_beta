// ShiftLegend.tsx
import { Box, Typography, Stack } from "@mui/material";
import { SHIFT_COLOR_MAP } from "./RosterShiftCell";

const SHIFT_TIMES: Record<string, string> = {
  G: "9:30 AM – 6:30 PM", LG: "11:00 AM – 8:00 PM",
  B: "2:00 PM – 10:00 PM", N: "10:00 PM – 7:00 AM",
  A: "2:00 PM – 10:00 PM", L: "—", H: "—", C: "—", NJ: "9:00 AM – 5:00 PM", W: "—",
};

export const ShiftLegend = ({ visibleCodes }: { visibleCodes?: string[] }) => {
  const codes = visibleCodes ?? Object.keys(SHIFT_COLOR_MAP);
  return (
    <Box sx={{
      borderTop: "1px solid", borderColor: "divider",
      bgcolor: "action.hover", px: 2, py: 1.2,
    }}>
      {/* <Typography fontSize="0.6rem" fontWeight={600} color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: ".07em", mb: 1 }}>
        Shift legend
      </Typography> */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {codes.map(k => {
          const s = SHIFT_COLOR_MAP[k]; if (!s) return null;
          const time = SHIFT_TIMES[k];
          const isWo = k === "W";
          return (
            <Stack key={k} direction="row" alignItems="center" gap="5px"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid", borderColor: "divider",
                borderRadius: "6px", px: "9px", py: "5px",
                cursor: "default",
                transition: "box-shadow .12s, transform .12s",
                "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,.07)", transform: "translateY(-1px)" },
              }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: "2px",
                bgcolor: s.badgeBg,
                ...(isWo && { border: "1px dashed #B0B8C8", bgcolor: "transparent" }),
              }} />
              <Typography fontSize="0.62rem" fontWeight={700} sx={{ color: s.badgeBg }}>
                {k}
              </Typography>
              <Box sx={{ width: "1px", height: 12, bgcolor: "divider" }} />
              <Typography fontSize="0.6rem" fontWeight={500} color="text.secondary" noWrap>
                {k === "G" ? "General" : k === "LG" ? "LG Shift" : k === "B" ? "B Shift"
                  : k === "N" ? "Night" : k === "A" ? "Afternoon" : k === "L" ? "Leave"
                  : k === "H" ? "Holiday" : k === "C" ? "Comp Off"
                  : k === "NJ" ? "New Joinee" : "Week Off"}
              </Typography>
              {!isWo && time && time !== "—" && (
                <>
                  <Box sx={{ width: "1px", height: 12, bgcolor: "divider" }} />
                  {/* <Typography fontSize="0.55rem" color="text.disabled" noWrap>{time}</Typography> */}
                </>
              )}
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};