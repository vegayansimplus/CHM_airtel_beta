import { Box, Typography } from "@mui/material";
import { ROLE_CONFIG, type Role } from "../types/user";

export default function RoleBadge({
  role,
  size = "medium",
}: {
  role: Role;
  size?: "small" | "medium";
}) {
  const { label, gradient, icon: Icon } = ROLE_CONFIG[role];
  const compact = size === "small";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: compact ? 1 : 1.25,
        py: compact ? 0.3 : 0.45,
        borderRadius: 999,
        background: gradient,
        boxShadow: `0 2px 8px ${ROLE_CONFIG[role].color}40`,
      }}
    >
      <Icon sx={{ fontSize: compact ? 12 : 14, color: "#fff" }} />
      <Typography
        sx={{
          fontSize: compact ? 10.5 : 11.5,
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
