import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import type { ExecutionStep } from "../types/crqJourney.types";
import { STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";

const ICON_MAP: Record<string, React.ElementType> = {
  tools: BuildRoundedIcon,
  check: CheckCircleOutlineRoundedIcon,
};

interface ExecutionBoxProps {
  steps: ExecutionStep[];
}

export const ExecutionBox: React.FC<ExecutionBoxProps> = ({ steps }) => {
  return (
    <Box
      sx={{
        width: 178,
        border: "1.6px dashed #9EC2EF",
        borderRadius: "14px",
        background: "rgba(25,118,210,0.03)",
        p: "12px 14px",
      }}
    >
      {/* header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          justifyContent: "center",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "1px",
            color: "#1565C0",
          }}
        >
          EXECUTION
        </Typography>
        <PlayArrowRoundedIcon sx={{ fontSize: 15, color: "#1976D2" }} />
      </Box>

      {/* step cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {steps.map((step) => {
          const cfg = STEP_STATUS_CONFIG[step.status];
          const Icon = ICON_MAP[step.iconType] ?? BuildRoundedIcon;

          return (
            <Paper
              key={step.id}
              elevation={0}
              sx={{
                border: "1.5px solid #DBE6F2",
                borderRadius: "10px",
                p: "10px 11px",
                position: "relative",
                background: "#fff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Icon sx={{ fontSize: 16, color: "#64748B", flexShrink: 0, mt: "1px" }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#334155",
                    lineHeight: 1.25,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: cfg.color,
                  mt: 0.75,
                  pl: "24px",
                  fontWeight: step.status === "not_started" ? 400 : 500,
                }}
              >
                {cfg.label}
              </Typography>

              {/* status dot */}
              <Box
                sx={{
                  position: "absolute",
                  right: 9,
                  bottom: 9,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: step.status === "not_started" ? "#CBD5E1" : cfg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
