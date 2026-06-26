import React from "react";
import { Box, Typography } from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import type { CrqFlowData } from "../types/crqJourney.types";
import { ParallelActivityCard } from "./ParallelActivityCard";
import { MopStepCard } from "./MopStepCard";
import { ApprovalTriggerCard } from "./ApprovalTriggerCard";
import { SchedulingStepRow } from "./SchedulingStepRow";
import { ExecutionBox } from "./ExecutionBox";

interface CrqFlowCanvasProps {
  flowData: CrqFlowData;
  showLegend: boolean;
}

// ─── SVG Connector layer (exact replica of original) ─────────────────────────
const ConnectorLayer: React.FC = () => (
  <svg
    width="1120"
    height="470"
    viewBox="0 0 1120 470"
    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
  >
    <defs>
      <marker id="agG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#15A34A" />
      </marker>
      <marker id="agB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#1976D2" />
      </marker>
      <marker id="agO" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6.5,3 L0,6 Z" fill="#ED8B00" />
      </marker>
      <filter id="agGlow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* shimmer keyframes */}
      <style>{`
        @keyframes crqDash { to { stroke-dashoffset: -16; } }
        @keyframes crqPulseAnim { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </defs>

    {/* entry split into two parallel rows */}
    <path d="M14,100 V214" stroke="#15A34A" strokeWidth="1.8" fill="none" />
    <path d="M14,100 H34"  stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    <path d="M14,214 H34"  stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    {/* horizontal links within parallel grid */}
    <path d="M174,100 H192" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    <path d="M174,214 H192" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    {/* merge after parallel, feed Approvals + MOP Creation */}
    <path d="M332,102 H346 V392 M332,214 H346" stroke="#15A34A" strokeWidth="1.8" fill="none" />
    <path d="M346,158 H360" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    <path d="M346,392 H352" stroke="#15A34A" strokeWidth="1.8" fill="none" markerEnd="url(#agG)" />
    {/* MOP Creation → MOP Validation */}
    <path d="M486,392 H524" stroke="#15A34A" strokeWidth="2" fill="none" markerEnd="url(#agG)" />
    {/* MOP Validation → merge node (orange dashed) */}
    <path
      d="M666,392 H700"
      stroke="#ED8B00" strokeWidth="1.9" fill="none"
      strokeDasharray="6 5"
      style={{ animation: "crqDash 1.1s linear infinite" }}
    />
    {/* Approvals box → merge node */}
    <path
      d="M670,278 V380 Q670,392 684,392 L700,392"
      stroke="#ED8B00" strokeWidth="1.9" fill="none"
      strokeDasharray="6 5"
      style={{ animation: "crqDash 1.1s linear infinite" }}
    />
    {/* merge node → Activity Scheduling */}
    <path
      d="M700,392 V140 H726"
      stroke="#ED8B00" strokeWidth="1.9" fill="none"
      strokeDasharray="6 5"
      markerEnd="url(#agO)"
      style={{ animation: "crqDash 1.1s linear infinite" }}
    />
    <circle cx="700" cy="392" r="3.4" fill="#ED8B00" />
    {/* animated flow pulses */}
    <g filter="url(#agGlow)">
      <circle r="3.1" fill="#FFB454">
        <animateMotion dur="2.6s" repeatCount="indefinite" calcMode="linear"
          path="M666,392 H700 V140 H726" />
      </circle>
    </g>
    <g filter="url(#agGlow)">
      <circle r="3.1" fill="#C99BF2">
        <animateMotion dur="2.6s" begin="0.9s" repeatCount="indefinite" calcMode="linear"
          path="M670,278 V380 Q670,392 684,392 L700,392 V140 H726" />
      </circle>
    </g>
    {/* scheduling vertical chain */}
    <path d="M796,172 V186" stroke="#ED8B00" strokeWidth="1.7" fill="none" markerEnd="url(#agO)" />
    <path d="M796,250 V264" stroke="#ED8B00" strokeWidth="1.7" fill="none" markerEnd="url(#agO)" />
    <path d="M796,330 V344" stroke="#ED8B00" strokeWidth="1.7" fill="none" markerEnd="url(#agO)" />
    {/* implementation approval → activity implementation */}
    <path
      d="M870,388 H890 V348 H904"
      stroke="#ED8B00" strokeWidth="1.9" fill="none"
      strokeDasharray="6 5"
      markerEnd="url(#agO)"
    />
    {/* activity implementation → crq closure */}
    <path d="M984,386 V404" stroke="#94A3B8" strokeWidth="1.7" fill="none" markerEnd="url(#agB)" />
  </svg>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  count?: number;
  left: number;
  width: number;
}> = ({ label, color, bgColor, icon: Icon, count, left, width }) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left,
      width,
      textAlign: "center",
      zIndex: 1,
    }}
  >
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.8px",
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
      }}
    >
      {label}
      {count !== undefined && (
        <Box
          component="span"
          sx={{
            minWidth: 17,
            height: 16,
            px: "4px",
            borderRadius: "8px",
            background: bgColor,
            color,
            fontSize: 10,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {count}
        </Box>
      )}
    </Typography>
    <Box
      sx={{
        mt: "7px",
        mx: "auto",
        width: 24,
        height: 24,
        borderRadius: "7px",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      <Icon sx={{ fontSize: 13 }} />
    </Box>
  </Box>
);

// ─── Main Canvas ─────────────────────────────────────────────────────────────
export const CrqFlowCanvas: React.FC<CrqFlowCanvasProps> = ({
  flowData,
  showLegend,
}) => {
  const { parallelActivities, mopSteps, approvalTriggers, schedulingSteps, executionSteps } = flowData;

  return (
    <Box
      sx={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(16,40,70,0.05)",
        p: "10px 10px 10px",
      }}
    >
      {/* header row */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1F2937" }}>
          CRQ Process Flow
        </Typography>

        {showLegend && (
          <Box
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              gap: 2.75,
            }}
          >
            {[
              { color: "#16A34A", label: "Completed" },
              { color: "#1976D2", label: "In Progress" },
              { color: "#ED8B00", label: "Pending" },
              { color: "#64748B", label: "Not Started" },
            ].map(({ color, label }) => (
              <Box
                key={label}
                sx={{ display: "flex", alignItems: "center", gap: 0.875 }}
              >
                <Box
                  component="span"
                  sx={{ width: 9, height: 9, borderRadius: "50%", background: color }}
                />
                <Typography sx={{ fontSize: 12.5, color: "rgba(0,0,0,0.6)" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* scrollable canvas */}
      <Box sx={{ overflowX: "auto", pt: 1 }}>
        <Box
          sx={{
            position: "relative",
            width: 1120,
            height: 470,
            margin: "0 auto",
          }}
        >
          <ConnectorLayer />

          {/* ── Section headers ── */}
          <SectionHeader
            label="PARALLEL ACTIVITIES"
            color="#15803D"
            bgColor="#E7F6EE"
            icon={LinkRoundedIcon}
            left={16}
            width={256}
          />
          <SectionHeader
            label="APPROVALS TRIGGERED"
            color="#6D28D9"
            bgColor="#EDE6FB"
            icon={CheckCircleRoundedIcon}
            count={approvalTriggers.length}
            left={360}
            width={332}
          />
          <SectionHeader
            label="SCHEDULING & APPROVALS"
            color="#C2410C"
            bgColor="#FDF0E2"
            icon={CalendarMonthRoundedIcon}
            left={700}
            width={200}
          />

          {/* ── Parallel activities row 1 ── */}
          <Box sx={{ position: "absolute", left: 34, top: 62, display: "flex", gap: "18px" }}>
            {parallelActivities.row1.map((step) => (
              <ParallelActivityCard key={step.id} step={step} />
            ))}
          </Box>

          {/* ── Parallel activities row 2 ── */}
          <Box sx={{ position: "absolute", left: 34, top: 176, display: "flex", gap: "18px" }}>
            {parallelActivities.row2.map((step) => (
              <ParallelActivityCard key={step.id} step={step} />
            ))}
          </Box>

          {/* ── MOP Creation ── */}
          <Box sx={{ position: "absolute", left: 352, top: 352 }}>
            <MopStepCard step={mopSteps[0]} />
          </Box>

          {/* ── MOP Validation ── */}
          <Box sx={{ position: "absolute", left: 524, top: 346 }}>
            <MopStepCard step={mopSteps[1]} />
          </Box>

          {/* ── Approvals dashed container ── */}
          <Box
            sx={{
              position: "absolute",
              left: 360,
              top: 56,
              width: 332,
              height: 222,
              border: "1.6px dashed #B9A6F0",
              borderRadius: "14px",
              background: "rgba(124,58,237,0.022)",
            }}
          />

          {/* ── Approval trigger cards ── */}
          <Box
            sx={{
              position: "absolute",
              left: 360,
              top: 74,
              width: 332,
              height: 158,
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              gap: "10px",
              px: 2,
              zIndex: 1,
            }}
          >
            {approvalTriggers.map((trigger) => (
              <ApprovalTriggerCard key={trigger.id} trigger={trigger} />
            ))}
          </Box>

          {/* ── Scheduling steps ── */}
          <Box
            sx={{
              position: "absolute",
              left: 726,
              top: 114,
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {schedulingSteps.map((step) => (
              <SchedulingStepRow key={step.id} step={step} />
            ))}
          </Box>

          {/* ── Execution box ── */}
          <Box sx={{ position: "absolute", left: 902, top: 268 }}>
            <ExecutionBox steps={executionSteps} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
