import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { LockOutlined, WifiOutlined } from "@mui/icons-material";

// Reports the connection's real transport security instead of a static
// "SSL Secured" badge. This deployment is served over plain HTTP, so
// claiming SSL would be misleading — show an honest, environment-aware
// status instead, which also auto-upgrades itself if HTTPS is enabled later.
const ConnectionSecurityBadge: React.FC = () => {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";

  return (
    <Tooltip
      arrow
      title={
        isSecure
          ? "This session is encrypted with HTTPS/TLS."
          : "This connection is not encrypted (HTTP). Use only on the trusted internal/corporate network — avoid public or shared Wi-Fi."
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: isSecure ? "rgba(24,95,165,0.06)" : "rgba(234,179,8,0.08)",
          border: `1px solid ${isSecure ? "rgba(24,95,165,0.14)" : "rgba(234,179,8,0.25)"}`,
          borderRadius: "6px",
          px: 0.9,
          py: 0.4,
          cursor: "default",
        }}
      >
        {isSecure ? (
          <LockOutlined sx={{ fontSize: 10, color: "#185FA5" }} />
        ) : (
          <WifiOutlined sx={{ fontSize: 10, color: "#B45309" }} />
        )}
        <Typography
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: isSecure ? "#185FA5" : "#B45309",
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}
        >
          {isSecure ? "TLS Secured" : "Internal Network Only"}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ConnectionSecurityBadge;
