import React, { useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import type { CrqJourneyScope, PendingApprovalView } from "../types/crqJourney.types";
import type { PendingApprovalsSummary } from "../utils/crqJourney.utils";
import { approverInitials, approverLabel } from "../utils/crqJourney.utils";

// ─────────────────────────────────────────────────────────────────────────────
//  "Who is holding this CRQ up" — result set 2 of sp_get_crq_journey_page.
//
//  The flow canvas already shows WHICH services are pending; a ~90px card has
//  no room to say WHO decides them. That answer is the one thing a CAB manager
//  looking at a stalled CRQ actually needs, so it gets its own panel rather
//  than only a tooltip: an OLM ID has to be readable and copyable.
//
//  Columns are exactly what the procedure gives (service code, approver OLM ID,
//  approver name) with the code resolved to its proper display name upstream —
//  no circle, domain or contact details, because the procedure does not return
//  them and it is not being changed.
//
//  Two renderings of the same rows, matching how CrqFlowCanvas / CrqFlowStacked
//  already split at `md`: a scannable table on desktop, stacked cards below it.
//
//  Sits BELOW the flow canvas. The canvas auto-fits into whatever viewport
//  height is left under its own top edge, so it has to be told to leave room —
//  hence `pendingApprovalsReserve` below and the panel's `open` state living in
//  the page rather than in here.
// ─────────────────────────────────────────────────────────────────────────────

interface PendingApprovalsPanelProps {
  summary: PendingApprovalsSummary;
  /** Result set 3 — shown as scope chips in the header; omitted when the proc returned none. */
  scope?: CrqJourneyScope | null;
  /** Controlled: the page owns this so it can reserve the matching canvas height. */
  open: boolean;
  onToggle: () => void;
}

// ─── Height budget, shared with the canvas above ─────────────────────────────
//
// The canvas needs to know how tall this panel will be BEFORE either is laid
// out, so these are the real numbers from the sx below rather than a measured
// height — a measured one would oscillate (see CrqFlowCanvas.bottomReserve).
// Keep them in step with the styles they describe; being a few px out only
// costs a few px of diagram, never correctness.
const HEADER_H = 40; // py 0.85 + a 24px icon + bottom border
const NOTE_H = 50; // the "nothing pending" / "no services" StatusNote
const TABLE_HEAD_H = 26; // sticky column-heading row + its border
const TABLE_ROW_H = 44; // py 0.85 + the two-line service / approver cell
/** Cap on the scrollable body, so a CRQ with many pending services can't crowd out the diagram. */
const BODY_MAX_MD = 224;
const BODY_MAX_XS = 320;
/** The page column's flex gap between the canvas and this panel. */
const STACK_GAP = 8;

/**
 * Vertical space the panel is about to occupy, for CrqFlowCanvas's
 * `bottomReserve`. Pure function of the data and the open flag — no DOM read,
 * so it cannot feed back into the scale it influences.
 */
export const pendingApprovalsReserve = (summary: PendingApprovalsSummary, open: boolean): number => {
  if (summary.verdict === "unknown") return 0; // panel renders nothing
  if (!open) return HEADER_H + STACK_GAP;
  if (summary.verdict !== "awaiting") return HEADER_H + NOTE_H + STACK_GAP;

  const body = Math.min(BODY_MAX_MD, TABLE_HEAD_H + summary.services.length * TABLE_ROW_H);
  return HEADER_H + body + STACK_GAP;
};

// ─── Copy-to-clipboard OLM ID ────────────────────────────────────────────────
const OlmIdChip: React.FC<{ olmId: string }> = ({ olmId }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard?.writeText(olmId).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => undefined
    );
  };

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, minWidth: 0, maxWidth: "100%" }}>
      <Box
        component="span"
        sx={{
          fontFamily: "Roboto Mono, monospace",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.2px",
          color: "text.secondary",
          background: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.09 : 0.05),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "5px",
          px: "5px",
          py: "1px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {olmId}
      </Box>
      <Tooltip title={copied ? "Copied" : "Copy OLM ID"} arrow>
        <IconButton size="small" onClick={handleCopy} sx={{ p: "2px", color: "text.disabled" }}>
          {copied ? (
            <CheckRoundedIcon sx={{ fontSize: 12, color: theme.palette.success.main }} />
          ) : (
            <ContentCopyRoundedIcon sx={{ fontSize: 11 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ─── Approver identity (avatar + name + OLM ID) ──────────────────────────────
const ApproverIdentity: React.FC<{ row: PendingApprovalView }> = ({ row }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const seedColor = row.configured ? theme.palette.primary.main : theme.palette.warning.main;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.3px",
          color: seedColor,
          background: alpha(seedColor, isDark ? 0.2 : 0.11),
          border: `1px solid ${alpha(seedColor, 0.3)}`,
        }}
      >
        {row.configured ? approverInitials(row) : <PersonOffRoundedIcon sx={{ fontSize: 14 }} />}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        {row.configured ? (
          <>
            <Tooltip title={approverLabel(row)} arrow enterDelay={500}>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {approverLabel(row)}
              </Typography>
            </Tooltip>
            {row.approverOlmId && <OlmIdChip olmId={row.approverOlmId} />}
          </>
        ) : (
          <>
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 600, color: theme.palette.warning.main, lineHeight: 1.25 }}
            >
              No approver configured
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled", lineHeight: 1.3 }}>
              {row.serviceCode} has no active approval-config entry
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

// ─── Service identity (proper name + raw code) ───────────────────────────────
const ServiceIdentity: React.FC<{ row: PendingApprovalView }> = ({ row }) => {
  const theme = useTheme();
  // The code chip is redundant when the name couldn't be resolved and the label
  // already *is* the code.
  const showCode = row.nameResolved;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Tooltip
        title={row.nameResolved ? row.serviceName : `Service code ${row.serviceCode} — no name on record`}
        arrow
        enterDelay={500}
      >
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.serviceName}
        </Typography>
      </Tooltip>
      {showCode && (
        <Box
          component="span"
          sx={{
            display: "inline-block",
            mt: "2px",
            fontFamily: "Roboto Mono, monospace",
            fontSize: 10,
            fontWeight: 600,
            color: theme.palette.primary.main,
            background: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.09),
            borderRadius: "5px",
            px: "5px",
            py: "1px",
          }}
        >
          {row.serviceCode}
        </Box>
      )}
    </Box>
  );
};

/** How many pending CRQ_CAB_SERVICE_TBL rows this one line stands for. */
const PendingCountBadge: React.FC<{ count: number }> = ({ count }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={count > 1 ? `${count} pending rows for this service` : "1 pending row"}
      arrow
      enterDelay={400}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 22,
          height: 20,
          px: "6px",
          borderRadius: "999px",
          fontSize: 11,
          fontWeight: 700,
          color: theme.palette.warning.main,
          background: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.2 : 0.11),
        }}
      >
        {count}
      </Box>
    </Tooltip>
  );
};

// ─── Resolved / empty states ─────────────────────────────────────────────────
const StatusNote: React.FC<{
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
}> = ({ icon: Icon, color, title, subtitle }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: { xs: 1.5, md: 2 }, py: 1.25 }}>
    <Box
      sx={{
        width: 30,
        height: 30,
        flexShrink: 0,
        borderRadius: "9px",
        background: alpha(color, 0.12),
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon sx={{ fontSize: 17 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.35 }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

// ─── Header scope chip ───────────────────────────────────────────────────────
const ScopeChip: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 21,
        px: "7px",
        borderRadius: "999px",
        border: `1px solid ${theme.palette.divider}`,
        color: "text.secondary",
        maxWidth: 180,
        minWidth: 0,
      }}
    >
      <Icon sx={{ fontSize: 12, flexShrink: 0 }} />
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const GRID_TEMPLATE = "minmax(130px, 1.4fr) 56px minmax(170px, 1.6fr)";
const COLUMN_HEADS = ["Pending Service", "Open", "Approver (OLM ID)"];

export const PendingApprovalsPanel: React.FC<PendingApprovalsPanelProps> = ({
  summary,
  scope,
  open,
  onToggle,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isCompact = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });

  const { verdict, services, totalPending, unconfigured } = summary;

  // An older database, or a call that returned only the journey rows: nothing
  // to show and no gap to report, so the panel stays out of the layout.
  if (verdict === "unknown") return null;

  const accent = verdict === "awaiting" ? theme.palette.warning.main : theme.palette.success.main;

  const headline =
    verdict === "awaiting"
      ? `${services.length} service${services.length === 1 ? "" : "s"} awaiting approval`
      : verdict === "all_decided"
        ? "All service approvals decided"
        : "No CAB services linked";

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
      {/* ── header: always one compact row, so a collapsed panel costs ~40px ── */}
      <Box
        onClick={onToggle}
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 0.85,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 1.25 },
          flexWrap: "wrap",
          cursor: "pointer",
          userSelect: "none",
          background: alpha(accent, isDark ? 0.1 : 0.05),
          borderBottom: open ? `1px solid ${theme.palette.divider}` : "none",
          transition: "background 0.2s ease",
          "&:hover": { background: alpha(accent, isDark ? 0.15 : 0.08) },
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: "8px",
            background: alpha(accent, isDark ? 0.22 : 0.13),
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HowToRegRoundedIcon sx={{ fontSize: 14 }} />
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 12.5, md: 13.5 },
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.3,
          }}
        >
          Pending Service Approvals
        </Typography>

        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            height: 21,
            px: "8px",
            borderRadius: "999px",
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(accent, 0.3)}`,
            whiteSpace: "nowrap",
          }}
        >
          {headline}
        </Box>

        {verdict === "awaiting" && totalPending > services.length && (
          <Typography sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap" }}>
            {totalPending} open rows
          </Typography>
        )}

        {unconfigured.length > 0 && (
          <Tooltip
            title={`No approver is configured for: ${unconfigured.map((r) => r.serviceName).join(", ")}`}
            arrow
          >
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: theme.palette.warning.main }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                {unconfigured.length} unassigned
              </Typography>
            </Box>
          </Tooltip>
        )}

        <Box
          sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", minWidth: 0 }}
        >
          {scope?.domainName && <ScopeChip icon={PublicRoundedIcon} label={scope.domainName} />}
          {scope?.subDomainName && <ScopeChip icon={LayersRoundedIcon} label={scope.subDomainName} />}
          <ExpandMoreRoundedIcon
            sx={{
              fontSize: 19,
              color: "text.secondary",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
        </Box>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {verdict === "all_decided" && (
          <StatusNote
            icon={CheckCircleRoundedIcon}
            color={theme.palette.success.main}
            title="Nothing is waiting on an approver"
            subtitle="Every CAB service linked to this CRQ has already been approved or rejected."
          />
        )}

        {verdict === "no_services" && (
          <StatusNote
            icon={InfoOutlinedIcon}
            color={theme.palette.info.main}
            title="No CAB services linked"
            subtitle="No service is linked to this CRQ, so no service approval is required."
          />
        )}

        {verdict === "awaiting" && (
          // Capped so a CRQ with many pending services scrolls inside the panel
          // instead of squeezing the auto-fitting flow canvas underneath it.
          <Box sx={{ maxHeight: { xs: BODY_MAX_XS, md: BODY_MAX_MD }, overflowY: "auto" }}>
            {isCompact ? (
              /* ── stacked cards: three columns would be ~90px each below md ── */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1.5 }}>
                {services.map((row) => (
                  <Box
                    key={`${row.serviceCode}-${row.approverOlmId ?? "none"}`}
                    sx={{
                      border: `1px solid ${
                        row.configured ? theme.palette.divider : alpha(theme.palette.warning.main, 0.4)
                      }`,
                      borderRadius: "10px",
                      p: 1.25,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ServiceIdentity row={row} />
                      </Box>
                      <PendingCountBadge count={row.pendingCount} />
                    </Box>

                    <Box sx={{ pt: 1, borderTop: `1px dashed ${theme.palette.divider}`, minWidth: 0 }}>
                      <ApproverIdentity row={row} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              /* ── desktop table ── */
              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: GRID_TEMPLATE,
                    gap: 1.5,
                    px: 2,
                    py: 0.75,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {COLUMN_HEADS.map((h) => (
                    <Typography
                      key={h}
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        color: "text.disabled",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </Typography>
                  ))}
                </Box>

                {services.map((row, idx) => (
                  <Box
                    key={`${row.serviceCode}-${row.approverOlmId ?? "none"}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: GRID_TEMPLATE,
                      gap: 1.5,
                      alignItems: "center",
                      px: 2,
                      py: 0.85,
                      borderBottom:
                        idx === services.length - 1 ? "none" : `1px solid ${theme.palette.divider}`,
                      // A missing approver is the one row a reader must not skim
                      // past, so it carries its own left edge.
                      borderLeft: row.configured
                        ? "3px solid transparent"
                        : `3px solid ${theme.palette.warning.main}`,
                      transition: "background 0.15s ease",
                      "&:hover": { background: alpha(theme.palette.text.primary, isDark ? 0.04 : 0.02) },
                    }}
                  >
                    <ServiceIdentity row={row} />
                    <PendingCountBadge count={row.pendingCount} />
                    <ApproverIdentity row={row} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};
