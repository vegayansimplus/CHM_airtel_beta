import { Box, Typography } from "@mui/material";
import { STATUS_CONFIG, type UserStatus } from "../types/user";

export default function StatusBadge({ status }: { status: UserStatus }) {
  const { color, bg, dot } = STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.7,
        px: 1.1,
        py: 0.4,
        borderRadius: 999,
        bgcolor: bg,
        border: `1px solid ${color}30`,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: dot,
          ...(status === "Active" && {
            boxShadow: `0 0 0 rgba(34,197,94,0.6)`,
            animation: "statusPulse 2s infinite",
          }),
          "@keyframes statusPulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.5)" },
            "70%": { boxShadow: "0 0 0 5px rgba(34,197,94,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
          },
        }}
      />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
        {status}
      </Typography>
    </Box>
  );
}
