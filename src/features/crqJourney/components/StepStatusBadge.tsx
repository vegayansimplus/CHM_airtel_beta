import React from "react";
import { Box, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { StepStatus } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";

interface StepStatusBadgeProps {
  status: StepStatus;
  showDot?: boolean;
}

export const StepStatusBadge: React.FC<StepStatusBadgeProps> = ({
  status,
  showDot = true,
}) => {
  const cfg = STEP_STATUS_CONFIG[status];
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const showPulse = isInProgress || status === "pending";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        mt: 1,
        pl: "28px",
      }}
    >
      {showDot && (
        <Box
          sx={{
            position: "relative",
            width: 7,
            height: 7,
            flexShrink: 0,
          }}
        >
          {showPulse && (
            <Box
              component="span"
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: cfg.color,
                animation: "crqRipple 1.8s ease-out infinite",
                "@keyframes crqRipple": {
                  "0%": { transform: "scale(1)", opacity: 0.5 },
                  "70%, 100%": { transform: "scale(2.8)", opacity: 0 },
                },
              }}
            />
          )}
          <Box
            component="span"
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: cfg.color,
            }}
          />
        </Box>
      )}
      <Typography
        sx={{ fontSize: 11.5, fontWeight: 600, color: cfg.color }}
      >
        {cfg.label}
      </Typography>
    </Box>
  );
};

// ─── Circular status icon (check / spinner / dot) ─────────────────────────────
interface StatusIconProps {
  status: StepStatus;
  size?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 20,
}) => {
  const cfg = STEP_STATUS_CONFIG[status];

  if (status === "completed") {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: cfg.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: size * 0.65, color: "#fff", strokeWidth: 3 }} />
      </Box>
    );
  }

  if (status === "in_progress") {
    return (
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: cfg.color,
            opacity: 0.18,
            animation: "crqRippleL 1.6s ease-out infinite",
            "@keyframes crqRippleL": {
              "0%": { transform: "scale(1)", opacity: 0.5 },
              "70%, 100%": { transform: "scale(2)", opacity: 0 },
            },
          }}
        />
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: cfg.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* spinning arc */}
          <Box
            component="svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            sx={{
              width: size * 0.65,
              height: size * 0.65,
              animation: "crqSpin 1.1s linear infinite",
              "@keyframes crqSpin": { to: { transform: "rotate(360deg)" } },
            }}
          >
            <path d="M21 12a9 9 0 1 1-6.2-8.5" />
          </Box>
        </Box>
      </Box>
    );
  }

  // not_started or pending
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: status === "pending" ? cfg.color : "#CBD5E1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: status === "not_started" ? 0.7 : 1,
      }}
    >
      <Box
        component="span"
        sx={{ width: size * 0.3, height: size * 0.3, borderRadius: "50%", background: "#fff" }}
      />
    </Box>
  );
};
