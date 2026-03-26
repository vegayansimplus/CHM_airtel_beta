import React from "react";
import { Button } from "@mui/material";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import type { Colors } from "../../types/colorTypes";
// import type { Colors } from "./colorTypes";

interface CrqActionButtonProps {
  isFailed: boolean;
  isRunning: boolean;
  colors: Colors;
  onClick: () => void;
}

export const CrqActionButton: React.FC<CrqActionButtonProps> = ({
  isFailed,
  isRunning,
  colors,
  onClick,
}) => {
  const label = isFailed ? "Disabled" : isRunning ? "Pause" : "Start";

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={isFailed}
      startIcon={
        isRunning ? (
          <StopRoundedIcon sx={{ fontSize: "14px !important" }} />
        ) : (
          <PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />
        )
      }
      onClick={onClick}
      sx={{
        // Base styles
        flexShrink: 0,
        height: 30,
        minWidth: 90,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        borderRadius: "8px",
        px: 1.5,
        transition: "all 0.15s ease",

        // Conditional styles
        ...(isFailed && {
          bgcolor: colors.trackOff,
          color: colors.textDim,
          borderColor: colors.trackOffBorder,
          "&.Mui-disabled": {
            bgcolor: colors.trackOff,
            color: colors.textDim,
            borderColor: colors.trackOffBorder,
          },
        }),
        ...(!isFailed && isRunning && {
          bgcolor: colors.dangerDim,
          color: colors.danger,
          borderColor: colors.dangerBorder,
          "&:hover": {
            bgcolor: colors.danger,
            color: "#fff",
            borderColor: colors.danger,
          },
        }),
        ...(!isFailed && !isRunning && {
          bgcolor: colors.successDim,
          color: colors.success,
          borderColor: colors.successBorder,
          "&:hover": {
            bgcolor: colors.success,
            color: "#fff",
            borderColor: colors.success,
          },
        }),
      }}
    >
      {label}
    </Button>
  );
};