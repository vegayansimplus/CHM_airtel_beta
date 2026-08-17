import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import type { CrqDetailsInfo, CrqJourneySearchRow } from "../types/crqJourney.types";
import { formatDateTime, formatStatusLabel, statusChipColor } from "../utils/crqJourney.utils";

interface CrqInfoStripProps {
  info: CrqJourneySearchRow;
  /** Result set 1 of get_crq_details — enriches the strip once it lands; the strip renders without it. */
  details?: CrqDetailsInfo | null;
  isLoadingDetails?: boolean;
  progress?: { completed: number; total: number; pct: number } | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const MetaItem: React.FC<{
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  loading?: boolean;
}> = ({ icon: Icon, label, children, loading }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", gap: 1, minWidth: 0, alignItems: "flex-start" }}>
      <Box
        sx={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(13,27,42,0.04)",
        }}
      >
        <Icon sx={{ fontSize: 14, color: "text.secondary" }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 10,
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: 1.4,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={86} height={16} />
        ) : (
          <Box sx={{ fontSize: 12.5, fontWeight: 500, color: "text.primary", lineHeight: 1.35, minWidth: 0 }}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const Truncated: React.FC<{ value: string }> = ({ value }) => (
  <Tooltip title={value} arrow enterDelay={500}>
    <Box
      component="span"
      sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
      {value}
    </Box>
  </Tooltip>
);

export const CrqInfoStrip: React.FC<CrqInfoStripProps> = ({
  info,
  details,
  isLoadingDetails = false,
  progress,
  onRefresh,
  isRefreshing = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const chip = statusChipColor(info.currentStatus, isDark);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard?.writeText(info.crqNo).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => undefined
    );
  };

  const remark = details?.remark?.trim();

  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.35)" : "0 1px 3px rgba(16,40,70,0.05)",
        overflow: "hidden",
      }}
    >
      {/* ── identity row ── */}
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 0.85,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 1.5 },
          flexWrap: "wrap",
          background: chip.bg,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Roboto Mono, monospace",
            fontSize: { xs: 13, md: 14.5 },
            fontWeight: 700,
            color: theme.palette.primary.main,
            wordBreak: "break-all",
          }}
        >
          {info.crqNo}
        </Typography>

        <Tooltip title={copied ? "Copied" : "Copy CRQ number"} arrow>
          <IconButton size="small" onClick={handleCopy} sx={{ color: "text.secondary", p: "3px" }}>
            {copied ? (
              <CheckRoundedIcon sx={{ fontSize: 15, color: theme.palette.success.main }} />
            ) : (
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: 24,
            fontSize: 11.5,
            fontWeight: 700,
            color: chip.color,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(chip.color, 0.25)}`,
            borderRadius: "999px",
            px: "10px",
            whiteSpace: "nowrap",
          }}
        >
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: chip.dot,
              flexShrink: 0,
              animation: "crqStatusPulse 1.8s ease-in-out infinite",
              "@keyframes crqStatusPulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
            }}
          />
          {formatStatusLabel(info.currentStatus)}
        </Box>

        {remark && (
          <Tooltip title={remark} arrow>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                maxWidth: 260,
                minWidth: 0,
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
              <Typography
                sx={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {remark}
              </Typography>
            </Box>
          </Tooltip>
        )}

        <Box
          sx={{
            ml: { xs: 0, sm: "auto" },
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flexWrap: "wrap",
          }}
        >
          {progress && progress.total > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
                {progress.completed}/{progress.total} stages
              </Typography>
              <Box
                sx={{
                  width: { xs: 70, md: 96 },
                  height: 6,
                  borderRadius: "999px",
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(13,27,42,0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: "999px",
                    width: `${progress.pct}%`,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                    transition: "width 0.6s ease-out",
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                {progress.pct}%
              </Typography>
            </Box>
          )}

          {onRefresh && (
            <Tooltip title="Refresh journey" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  sx={{ color: "text.secondary" }}
                >
                  {isRefreshing ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <RefreshRoundedIcon sx={{ fontSize: 17 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── meta grid ── */}
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: 1.25, md: 1.5 },
        }}
      >
        <MetaItem icon={TimelineRoundedIcon} label="Current Stage">
          <Truncated value={info.currentStage || "—"} />
        </MetaItem>

        <MetaItem icon={AccessTimeRoundedIcon} label="Entered Stage At">
          <Truncated value={formatDateTime(info.enteredCurrentStageAt)} />
        </MetaItem>

        <MetaItem icon={BusinessCenterRoundedIcon} label="Team Function" loading={isLoadingDetails && !details}>
          <Truncated value={details?.teamFunction ?? "—"} />
        </MetaItem>

        <MetaItem icon={AccountTreeRoundedIcon} label="Sub-Function" loading={isLoadingDetails && !details}>
          <Truncated value={details?.teamSubFunction ?? "—"} />
        </MetaItem>

        <MetaItem icon={CalendarMonthRoundedIcon} label="Created On" loading={isLoadingDetails && !details}>
          <Truncated value={formatDateTime(details?.createdDate)} />
        </MetaItem>
      </Box>
    </Box>
  );
};
