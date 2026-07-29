import React from "react";
import { Box, Typography } from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import type { CrqJourneyFlow } from "../types/crqJourney.types";
import { formatStatusLabel, normalizeStepStatus, STEP_STATUS_CONFIG } from "../utils/crqJourney.utils";
import { StageCard } from "./StageCard";
import { ApprovalCard } from "./ApprovalCard";
import { RowCard } from "./RowCard";
import { ExecutionListCard } from "./ExecutionListCard";

interface CrqFlowCanvasProps {
  flow: CrqJourneyFlow;
  showLegend: boolean;
}

// ─── SVG Connector layer ──────────────────────────────────────────────────────
// Geometry mirrors the original hand-tuned canvas, adjusted for the shape
// sp_get_crq_journey_page actually returns: row 1 has exactly one card (no
// "Field Readiness" — that slot never had backing data), the scheduling
// column has exactly two (Activity Scheduling, Conflict Check — "CAB" and
// "Implementation Approval" never had backing data either), and the
// Approvals lane is the only truly variable-count region.
const ConnectorLayer: React.FC<{ hasApprovals: boolean }> = ({ hasApprovals }) => (
  <svg
    width="1120"
    height="460"
    viewBox="0 0 1120 460"
    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
  >
    <defs>
      <marker id="agG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#15A34A" />
      </marker>
      <marker id="agO" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#ED8B00" />
      </marker>
      <marker id="agB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#1976D2" />
      </marker>
      <filter id="agGlow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <style>{`
        @keyframes crqDash { to { stroke-dashoffset: -16; } }
      `}</style>
    </defs>

    {/* entry split into row 1 (1 card) / row 2 (2 cards) */}
    <path d="M14,100 V214" stroke="#15A34A" strokeWidth="1.8" fill="none" />
    <path d="M14,100 H34" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    <path d="M14,214 H34" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    {/* row 2 internal: Validate -> Impact Analysis */}
    <path d="M174,214 H192" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    {/* merge after parallel activities, feeding Approvals + MOP Creation */}
    <path d="M174,100 H346 V392" stroke="#15A34A" strokeWidth="1.8" fill="none" />
    <path d="M332,214 H346" stroke="#15A34A" strokeWidth="1.8" fill="none" />
    {hasApprovals && <path d="M346,158 H360" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />}
    <path d="M346,392 H352" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />

    {/* MOP Creation -> MOP Validation */}
    <path d="M486,392 H524" stroke="#15A34A" strokeWidth="2" fill="none" markerEnd="url(#agG)" />

    {/* MOP Validation -> merge node (orange dashed) */}
    <path d="M666,392 H700" stroke="#ED8B00" strokeWidth="1.9" fill="none" strokeDasharray="6 5" style={{ animation: "crqDash 1.1s linear infinite" }} />
    {/* Approvals box -> merge node */}
    {hasApprovals && (
      <path
        d="M670,278 V380 Q670,392 684,392 L700,392"
        stroke="#ED8B00" strokeWidth="1.9" fill="none"
        strokeDasharray="6 5"
        style={{ animation: "crqDash 1.1s linear infinite" }}
      />
    )}
    {/* merge node -> Activity Scheduling */}
    <path
      d="M700,392 V140 H726"
      stroke="#ED8B00" strokeWidth="1.9" fill="none"
      strokeDasharray="6 5"
      markerEnd="url(#agO)"
      style={{ animation: "crqDash 1.1s linear infinite" }}
    />
    <circle cx="700" cy="392" r="3.4" fill="#ED8B00" />
    <g filter="url(#agGlow)">
      <circle r="3.1" fill="#FFB454">
        <animateMotion dur="2.6s" repeatCount="indefinite" calcMode="linear" path="M666,392 H700 V140 H726" />
      </circle>
    </g>
    {hasApprovals && (
      <g filter="url(#agGlow)">
        <circle r="3.1" fill="#C99BF2">
          <animateMotion dur="2.6s" begin="0.9s" repeatCount="indefinite" calcMode="linear" path="M670,278 V380 Q670,392 684,392 L700,392 V140 H726" />
        </circle>
      </g>
    )}

    {/* scheduling column: Activity Scheduling -> Conflict Check */}
    <path d="M796,172 V186" stroke="#ED8B00" strokeWidth="1.7" fill="none" markerEnd="url(#agO)" />
    {/* Conflict Check -> Execution */}
    <path d="M870,222 H890 V200 H904" stroke="#ED8B00" strokeWidth="1.9" fill="none" strokeDasharray="6 5" markerEnd="url(#agO)" />
    {/* Implementation -> Closure, inside the Execution box */}
    <path d="M984,266 V282" stroke="#94A3B8" strokeWidth="1.7" fill="none" markerEnd="url(#agB)" />
  </svg>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  label: string; color: string; bgColor: string; icon: React.ElementType; count?: number; left: number; width: number;
}> = ({ label, color, bgColor, icon: Icon, count, left, width }) => (
  <Box sx={{ position: "absolute", top: 0, left, width, textAlign: "center", zIndex: 1 }}>
    <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", color, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
      {label}
      {count !== undefined && (
        <Box component="span" sx={{ minWidth: 17, height: 16, px: "4px", borderRadius: "8px", background: bgColor, color, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {count}
        </Box>
      )}
    </Typography>
    <Box sx={{ mt: "7px", mx: "auto", width: 24, height: 24, borderRadius: "7px", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color }}>
      <Icon sx={{ fontSize: 13 }} />
    </Box>
  </Box>
);

const LEGEND = [
  { color: "#16A34A", label: "Completed" },
  { color: "#1976D2", label: "In Progress" },
  { color: "#ED8B00", label: "Pending" },
  { color: "#64748B", label: "Not Started" },
];

export const CrqFlowCanvas: React.FC<CrqFlowCanvasProps> = ({ flow, showLegend }) => {
  const { assignment, approvals, conflictCheck, validate, impactAnalysis, mopCreate, mopValidate, scheduling, implementation, closure } = flow;
  const hasApprovals = approvals.length > 0;

  const schedulingStatus = scheduling ? normalizeStepStatus(scheduling.status) : "not_started";
  const schedulingCfg = STEP_STATUS_CONFIG[schedulingStatus];

  const hasConflict = conflictCheck?.status.trim().toUpperCase() === "YES";
  const conflictColor = hasConflict ? "#E53935" : "#16A34A";
  const conflictBg = hasConflict ? "#FDEBEA" : "#E9F7EF";

  const implStatus = implementation ? normalizeStepStatus(implementation.status) : "not_started";
  const implCfg = STEP_STATUS_CONFIG[implStatus];
  const closureStatus = closure ? normalizeStepStatus(closure.status) : "not_started";
  const closureCfg = STEP_STATUS_CONFIG[closureStatus];

  return (
    <Box sx={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "14px", boxShadow: "0 1px 3px rgba(16,40,70,0.05)", p: "10px 10px 10px" }}>
      {/* header row */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1F2937" }}>CRQ Process Flow</Typography>

        {showLegend && (
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2.75 }}>
            {LEGEND.map(({ color, label }) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
                <Box component="span" sx={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
                <Typography sx={{ fontSize: 12.5, color: "rgba(0,0,0,0.6)" }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* scrollable canvas */}
      <Box sx={{ overflowX: "auto", pt: 1 }}>
        <Box sx={{ position: "relative", width: 1120, height: 460, margin: "0 auto" }}>
          <ConnectorLayer hasApprovals={hasApprovals} />

          <SectionHeader label="PARALLEL ACTIVITIES" color="#15803D" bgColor="#E7F6EE" icon={LinkRoundedIcon} left={16} width={256} />
          {hasApprovals && (
            <SectionHeader label="APPROVALS TRIGGERED" color="#6D28D9" bgColor="#EDE6FB" icon={CheckCircleRoundedIcon} count={approvals.length} left={360} width={332} />
          )}
          <SectionHeader label="SCHEDULING & APPROVALS" color="#C2410C" bgColor="#FDF0E2" icon={CalendarMonthRoundedIcon} left={700} width={200} />

          {/* row 1 */}
          {assignment && (
            <Box sx={{ position: "absolute", left: 34, top: 62 }}>
              <StageCard stage={assignment} />
            </Box>
          )}

          {/* row 2 */}
          <Box sx={{ position: "absolute", left: 34, top: 176, display: "flex", gap: "18px" }}>
            {validate && <StageCard stage={validate} />}
            {impactAnalysis && <StageCard stage={impactAnalysis} />}
          </Box>

          {/* MOP Creation / Validation */}
          {mopCreate && (
            <Box sx={{ position: "absolute", left: 352, top: 352 }}>
              <StageCard stage={mopCreate} />
            </Box>
          )}
          {mopValidate && (
            <Box sx={{ position: "absolute", left: 524, top: 346 }}>
              <StageCard stage={mopValidate} />
            </Box>
          )}

          {/* Approvals dashed container + cards */}
          {hasApprovals && (
            <>
              <Box sx={{ position: "absolute", left: 360, top: 56, width: 332, height: 222, border: "1.6px dashed #B9A6F0", borderRadius: "14px", background: "rgba(124,58,237,0.022)" }} />
              <Box sx={{ position: "absolute", left: 360, top: 74, width: 332, minHeight: 158, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch", gap: "10px", px: 2, zIndex: 1 }}>
                {approvals.map((a, idx) => (
                  <ApprovalCard key={`${a.stage}-${idx}`} approval={a} />
                ))}
              </Box>
            </>
          )}

          {/* Scheduling column */}
          <Box sx={{ position: "absolute", left: 726, top: 114, display: "flex", flexDirection: "column", gap: "18px" }}>
            {scheduling && (
              <RowCard
                icon={CalendarMonthRoundedIcon}
                label={formatStatusLabel(scheduling.stage)}
                statusLabel={formatStatusLabel(scheduling.status)}
                color={schedulingCfg.color}
                bgColor={schedulingCfg.bgColor}
                borderColor={schedulingCfg.borderColor}
                pulse={schedulingStatus === "pending"}
              />
            )}
            {conflictCheck && (
              <RowCard
                icon={SecurityRoundedIcon}
                label="Conflict Check"
                statusLabel={hasConflict ? "Conflict Found" : "No Conflict"}
                color={conflictColor}
                bgColor={conflictBg}
                borderColor={hasConflict ? "#F6C7D2" : "#BCE6CC"}
                pulse={hasConflict}
              />
            )}
          </Box>

          {/* Execution box */}
          {(implementation || closure) && (
            <Box sx={{ position: "absolute", left: 902, top: 150, width: 178, border: "1.6px dashed #9EC2EF", borderRadius: "14px", background: "rgba(25,118,210,0.03)", p: "12px 14px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center", mb: 1.5 }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "1px", color: "#1565C0" }}>EXECUTION</Typography>
                <PlayArrowRoundedIcon sx={{ fontSize: 15, color: "#1976D2" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {implementation && (
                  <ExecutionListCard icon={BuildRoundedIcon} label="Implementation" statusLabel={formatStatusLabel(implementation.status)} color={implCfg.color} muted={implStatus === "not_started"} />
                )}
                {closure && (
                  <ExecutionListCard icon={CheckCircleOutlineRoundedIcon} label="Closure" statusLabel={formatStatusLabel(closure.status)} color={closureCfg.color} muted={closureStatus === "not_started"} />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
