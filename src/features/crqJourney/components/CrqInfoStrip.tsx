import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Collapse,
  Tooltip,
  IconButton,
  Snackbar,
  useTheme,
} from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import type { CrqInfo } from "../types/crqJourney.types";
import { CRQ_STATUS_CONFIG, PRIORITY_CONFIG } from "../utils/crqJourney.utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrqInfoStripProps {
  info: CrqInfo;
  onMoreInfo?: (info: CrqInfo) => void;
}

// ─── Sub-component: compact meta item ────────────────────────────────────────

const MetaItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 10,
        color: "text.disabled",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

// ─── Sub-component: expanded detail row ──────────────────────────────────────

const DetailItem = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
    <Typography sx={{ fontSize: 10, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.4px" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: valueColor ?? "text.primary" }}>
      {value}
    </Typography>
  </Box>
);

// ─── Priority icon helper ─────────────────────────────────────────────────────

const PriorityIcon = ({ priority }: { priority: CrqInfo["priority"] }) => {
  if (priority === "high") return <ArrowUpwardRoundedIcon sx={{ fontSize: 13 }} />;
  if (priority === "low") return <ArrowDownwardRoundedIcon sx={{ fontSize: 13 }} />;
  return <RemoveRoundedIcon sx={{ fontSize: 13 }} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CrqInfoStrip: React.FC<CrqInfoStripProps> = ({ info, onMoreInfo }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusCfg = CRQ_STATUS_CONFIG[info.status];
  const priorityCfg = PRIORITY_CONFIG[info.priority];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(info.id).then(() => {
      setCopied(true);
    });
  }, [info.id]);

  const handleCloseCopied = () => setCopied(false);

  const dividerSx = { mx: 0.25, my: 0.25, alignSelf: "stretch" };

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* ── Primary strip ── */}
      <Box
        sx={{
          px: 2,
          py: "10px",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "nowrap",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {/* CRQ ID + copy */}
        <MetaItem label="CRQ ID">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "Roboto Mono, monospace",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#1565C0",
                whiteSpace: "nowrap",
              }}
            >
              {info.id}
            </Typography>
            <Tooltip title="Copy ID" placement="top" arrow>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ p: "2px", color: "text.disabled", "&:hover": { color: "#1565C0" } }}
                aria-label="Copy CRQ ID"
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* Title */}
        <MetaItem label="Title">
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", color: "text.primary" }}>
            {info.title}
          </Typography>
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* Requester */}
        <MetaItem label="Requester">
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", color: "text.primary" }}>
            {info.requester}
          </Typography>
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* Priority */}
        <MetaItem label="Priority">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              color: priorityCfg.color,
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <PriorityIcon priority={info.priority} />
            {priorityCfg.label}
          </Box>
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* Status */}
        <MetaItem label="Status">
          <Chip
            size="small"
            label={statusCfg.label}
            icon={
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: statusCfg.dotColor,
                  ml: "7px !important",
                  flexShrink: 0,
                  animation:
                    info.status === "in_progress"
                      ? "crqPulse 1.6s ease-in-out infinite"
                      : "none",
                  "@keyframes crqPulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.35 },
                  },
                }}
              />
            }
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              background: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.color}28`,
              "& .MuiChip-icon": { color: "inherit" },
              "& .MuiChip-label": { px: "7px" },
            }}
          />
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* SLA */}
        <MetaItem label="SLA">
          <Box sx={{ display: "flex", alignItems: "center", gap: "3px", color: "#B45309", whiteSpace: "nowrap" }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#B45309" }}>
              {info.slaRemaining}
            </Typography>
          </Box>
        </MetaItem>

        <Divider orientation="vertical" flexItem sx={dividerSx} />

        {/* Created */}
        <MetaItem label="Created">
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", color: "text.primary" }}>
            {info.createdOn}
          </Typography>
        </MetaItem>

        {/* ── Actions ── */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: "13px !important" }} />}
            onClick={() => onMoreInfo?.(info)}
            sx={{
              textTransform: "none",
              fontSize: 11.5,
              fontWeight: 500,
              height: 28,
              px: 1.25,
              borderRadius: 1.5,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { borderColor: "#1976D2", color: "#1976D2", background: "#EEF5FD" },
            }}
          >
            Details
          </Button>

          <Tooltip title={expanded ? "Collapse" : "More info"} placement="top" arrow>
            <IconButton
              size="small"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse details" : "Expand details"}
              sx={{
                width: 28,
                height: 28,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                color: expanded ? "#1976D2" : "text.secondary",
                background: expanded ? "#EEF5FD" : "transparent",
                "&:hover": { borderColor: "#1976D2", color: "#1976D2", background: "#EEF5FD" },
                transition: "all 0.15s",
              }}
            >
              {expanded ? (
                <KeyboardArrowUpRoundedIcon sx={{ fontSize: 17 }} />
              ) : (
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 17 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Expanded detail panel ── */}
      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === "light" ? "#F8FAFC" : theme.palette.background.default,
            display: "flex",
            gap: 3.5,
            flexWrap: "wrap",
          }}
        >
          <DetailItem label="Category" value="Network Infrastructure" />
          <DetailItem label="Impact" value="High — Service affecting" valueColor="#B91C1C" />
          <DetailItem label="Change window" value="13 May 2026, 02:00 – 06:00 AM" />
          <DetailItem label="Approvals" value="3 of 4 approved" valueColor="#15803D" />
          <DetailItem label="MOP status" value="Validation in progress" valueColor="#1565C0" />
          <DetailItem label="Assigned SPOC" value="R. Mehta" />
        </Box>
      </Collapse>

      {/* ── Copy toast ── */}
      <Snackbar
        open={copied}
        autoHideDuration={1600}
        onClose={handleCloseCopied}
        message="CRQ ID copied"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: { fontSize: 12.5, minWidth: "unset", py: 0.5 },
        }}
      />
    </Box>
  );
};

// import React from "react";
// import {
//   Box,
//   Typography,
//   Chip,
//   Button,
//   Divider,
//   useTheme,
// } from "@mui/material";
// import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
// import type { CrqInfo } from "../types/crqJourney.types";
// import { CRQ_STATUS_CONFIG, PRIORITY_CONFIG } from "../utils/crqJourney.utils";

// interface CrqInfoStripProps {
//   info: CrqInfo;
// }

// export const CrqInfoStrip: React.FC<CrqInfoStripProps> = ({ info }) => {
//   const theme = useTheme();
//   const statusCfg = CRQ_STATUS_CONFIG[info.status];
//   const priorityCfg = PRIORITY_CONFIG[info.priority];

//   const MetaItem = ({
//     label,
//     children,
//   }: {
//     label: string;
//     children: React.ReactNode;
//   }) => (
//     <Box>
//       <Typography
//         variant="caption"
//         sx={{ color: "text.secondary", display: "block", mb: 0.5, fontSize: 11 }}
//       >
//         {label}
//       </Typography>
//       {children}
//     </Box>
//   );

//   return (
//     <Box
//       sx={{
//         background: "#fff",
//         borderBottom: `1px solid ${theme.palette.divider}`,
//         px: 3.5,
//         py: 1.75,
//         display: "flex",
//         alignItems: "center",
//         gap: 4.5,
//         flexWrap: "wrap",
//       }}
//     >
//       <MetaItem label="CRQ ID">
//         <Typography
//           variant="body2"
//           sx={{ fontWeight: 700, fontFamily: "Roboto Mono, monospace", color: "text.primary", fontSize: 13.5 }}
//         >
//           {info.id}
//         </Typography>
//       </MetaItem>

//       <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

//       <MetaItem label="Requester">
//         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//           {info.requester}
//         </Typography>
//       </MetaItem>

//       <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

//       <MetaItem label="Priority">
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: priorityCfg.color }}>
//           <ArrowUpwardRoundedIcon sx={{ fontSize: 15, strokeWidth: 2 }} />
//           <Typography variant="body2" sx={{ fontWeight: 700, color: priorityCfg.color }}>
//             {priorityCfg.label}
//           </Typography>
//         </Box>
//       </MetaItem>

//       <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

//       <MetaItem label="Created On">
//         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//           {info.createdOn}
//         </Typography>
//       </MetaItem>

//       <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

//       <MetaItem label="Status">
//         <Chip
//           size="small"
//           label={statusCfg.label}
//           icon={
//             <Box
//               component="span"
//               sx={{
//                 width: 7,
//                 height: 7,
//                 borderRadius: "50%",
//                 background: statusCfg.dotColor,
//                 ml: "8px !important",
//                 animation:
//                   info.status === "in_progress"
//                     ? "crqPulse 1.6s ease-in-out infinite"
//                     : "none",
//                 "@keyframes crqPulse": {
//                   "0%, 100%": { opacity: 1 },
//                   "50%": { opacity: 0.4 },
//                 },
//               }}
//             />
//           }
//           sx={{
//             background: statusCfg.bg,
//             color: statusCfg.color,
//             fontWeight: 700,
//             fontSize: 12,
//             height: 26,
//             "& .MuiChip-icon": { color: "inherit" },
//           }}
//         />
//       </MetaItem>

//       <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

//       <MetaItem label="SLA">
//         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//           {info.slaRemaining}
//         </Typography>
//       </MetaItem>

//       <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
//         <Button
//           variant="outlined"
//           size="small"
//           sx={{ textTransform: "none", borderRadius: 2, fontSize: 12.5, fontWeight: 500 }}
//         >
//           More Info
//         </Button>
//       </Box>
//     </Box>
//   );
// };
