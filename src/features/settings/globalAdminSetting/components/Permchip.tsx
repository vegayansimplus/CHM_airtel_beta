import React from "react";
import { Box, Tooltip, alpha } from "@mui/material";
import { CheckOutlined } from "@mui/icons-material";
import type { useTabColorTokens } from "../../../../style/theme";
// import type { useTabColorTokens } from "../../../style/theme";

interface PermChipProps {
  label: string;
  granted: boolean;
  loading: boolean;
  onClick: () => void;
  c: ReturnType<typeof useTabColorTokens>;
}

const PermChip: React.FC<PermChipProps> = ({ label, granted, loading, onClick, c }) => (
  <Tooltip title={granted ? "Click to disable" : "Click to enable"} placement="top">
    <Box
      component="button"
      onClick={onClick}
      disabled={loading}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: 30,
        px: "10px",
        borderRadius: "7px",
        border: `1px solid ${granted ? alpha(c.accent, 0.5) : c.border}`,
        bgcolor: granted ? alpha(c.accent, 0.1) : c.surface,
        color: granted ? c.accent : c.textSecondary,
        fontSize: "0.8rem",
        fontWeight: granted ? 600 : 400,
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.55 : 1,
        transition: "all 0.12s",
        fontFamily: "inherit",
        letterSpacing: "-0.005em",
        "&:hover:not(:disabled)": {
          border: `1px solid ${alpha(c.accent, 0.6)}`,
          bgcolor: alpha(c.accent, granted ? 0.18 : 0.07),
          color: c.accent,
        },
      }}
    >
      <Box
        sx={{
          width: 15,
          height: 15,
          borderRadius: "4px",
          border: `1.5px solid ${granted ? c.accent : alpha(c.textSecondary, 0.4)}`,
          bgcolor: granted ? c.accent : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.1s",
        }}
      >
        {loading ? (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              border: `1.5px solid ${c.accent}`,
              borderTopColor: "transparent",
              animation: "spin 0.6s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
        ) : (
          granted && <CheckOutlined sx={{ fontSize: 10, color: "#fff" }} />
        )}
      </Box>
      {label}
    </Box>
  </Tooltip>
);

export default PermChip;