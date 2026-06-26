import React from "react";
import { Box, Typography } from "@mui/material";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CableRoundedIcon from "@mui/icons-material/CableRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import type { ApprovalTrigger } from "../types/crqJourney.types";
import { APPROVAL_STATUS_CONFIG } from "../utils/crqJourney.utils";

const ICON_MAP: Record<string, React.ElementType> = {
  mobility:  WifiRoundedIcon,
  b2b:       BusinessRoundedIcon,
  telemedia: TvRoundedIcon,
  user:      PersonRoundedIcon,
  optical:   CableRoundedIcon,
  packet:    SpeedRoundedIcon,
  security:  SecurityRoundedIcon,
  others:    MoreHorizRoundedIcon,
};

const BADGE_ICON: Record<string, React.ElementType> = {
  approved: CheckRoundedIcon,
  rejected: CloseRoundedIcon,
  pending:  AccessTimeRoundedIcon,
};

interface ApprovalTriggerCardProps {
  trigger: ApprovalTrigger;
}

export const ApprovalTriggerCard: React.FC<ApprovalTriggerCardProps> = ({
  trigger,
}) => {
  const cfg = APPROVAL_STATUS_CONFIG[trigger.status];
  const Icon = ICON_MAP[trigger.icon] ?? SecurityRoundedIcon;
  const BadgeIcon = BADGE_ICON[trigger.status];
  const showPulse = trigger.status !== "approved";

  return (
    <Box
      sx={{
        flex: "1 1 0",
        minWidth: 0,
        maxWidth: 86,
        background: "#fff",
        border: `1.2px solid ${cfg.borderColor}`,
        borderRadius: "11px",
        py: 1.5,
        px: 0.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 2px 7px rgba(16,40,70,0.07)",
        position: "relative",
      }}
    >
      {/* icon block */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          background: cfg.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: cfg.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </Box>

      {/* name */}
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "#1F2937",
          mt: 1.25,
          textAlign: "center",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          px: 0.5,
        }}
      >
        {trigger.name}
      </Typography>

      {/* status label */}
      <Typography
        sx={{
          fontSize: 10.5,
          color: cfg.color,
          fontWeight: 600,
          mt: 1.75,
        }}
      >
        {cfg.label}
      </Typography>

      {/* badge */}
      <Box sx={{ position: "relative", mt: 1, width: 22, height: 22 }}>
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
          sx={{
            position: "relative",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: cfg.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BadgeIcon sx={{ fontSize: 13, color: "#fff" }} />
        </Box>
      </Box>
    </Box>
  );
};
