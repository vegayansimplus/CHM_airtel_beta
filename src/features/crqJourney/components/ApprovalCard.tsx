import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import CableRoundedIcon from "@mui/icons-material/CableRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import type { ApprovalIconKey, CrqJourneyStageRow } from "../types/crqJourney.types";
import { getApprovalStatusConfig, formatStatusLabel, normalizeApprovalStatus, pickApprovalIcon } from "../utils/crqJourney.utils";

const ICON_MAP: Record<ApprovalIconKey, React.ElementType> = {
  mobility:  WifiRoundedIcon,
  b2b:       BusinessRoundedIcon,
  telemedia: TvRoundedIcon,
  optical:   CableRoundedIcon,
  packet:    SpeedRoundedIcon,
  security:  SecurityRoundedIcon,
  others:    MoreHorizRoundedIcon,
};

const BADGE_ICON = {
  approved: CheckRoundedIcon,
  rejected: CloseRoundedIcon,
  pending:  AccessTimeRoundedIcon,
} as const;

interface ApprovalCardProps {
  approval: CrqJourneyStageRow;
}

/** One service approval linked to the CRQ (CRQ_CAB_SERVICE_TBL) — count varies per CRQ. */
export const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const status = normalizeApprovalStatus(approval.status);
  const cfg = getApprovalStatusConfig(isDark)[status];
  const Icon = ICON_MAP[pickApprovalIcon(approval.stage)];
  const BadgeIcon = BADGE_ICON[status];
  const showPulse = status !== "approved";

  return (
    <Box
      sx={{
        width: 92,
        flexShrink: 0,
        background: theme.palette.background.paper,
        border: `1.2px solid ${cfg.borderColor}`,
        borderRadius: "11px",
        py: 1.5,
        px: 0.75,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: isDark ? "0 2px 7px rgba(0,0,0,0.35)" : "0 2px 7px rgba(16,40,70,0.07)",
        position: "relative",
      }}
    >
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

      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "text.primary",
          mt: 1.25,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {approval.stage}
      </Typography>

      <Typography sx={{ fontSize: 10.5, color: cfg.color, fontWeight: 600, mt: 1 }}>
        {formatStatusLabel(approval.status)}
      </Typography>

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
