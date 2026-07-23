import { Box, Chip } from "@mui/material";
import type { CrqStage, ImpactCode } from "../../types/types";

export const STAGE_COLOR: Record<CrqStage, { bg: string; fg: string }> = {
  VALIDATE:             { bg: "#FFF8E1", fg: "#A06800" },
  IMPACT_ANALYSIS:      { bg: "#E3F2FD", fg: "#1565C0" },
  MOP_CREATION:         { bg: "#F3E5F5", fg: "#6A1B9A" },
  MOP_VALIDATION:       { bg: "#F3E5F5", fg: "#6A1B9A" },
  SCHEDULING_APPROVAL:  { bg: "#FFF4E5", fg: "#C44600" },
  EXECUTION:            { bg: "#E8F5E9", fg: "#2E7D32" },
  CLOSURE:              { bg: "#ECEFF1", fg: "#37474F" },
};

// Keyed uppercase — covers the live Service_Approval_Status values
// (PENDING/ON_HOLD/APPROVED/REJECTED/DELEGATED) as well as the lowercase
// values still used by the mock-only Journey/Implementation pages.
const STATUS_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  PENDING:   { bg: "#FFF4E5", fg: "#ED6C02", label: "Pending"   },
  ON_HOLD:   { bg: "#FFF4E5", fg: "#ED6C02", label: "On Hold"   },
  APPROVED:  { bg: "#E8F5E9", fg: "#2E7D32", label: "Approved"  },
  REJECTED:  { bg: "#FDECEA", fg: "#D32F2F", label: "Rejected"  },
  DELEGATED: { bg: "#E3F2FD", fg: "#1565C0", label: "Delegated" },
};

const UNKNOWN_COLOR = { bg: "#F4F5F7", fg: "rgba(0,0,0,0.55)" };

export function StageChip({ stage }: { stage: CrqStage }) {
  const c = STAGE_COLOR[stage] ?? UNKNOWN_COLOR;
  return (
    <Chip
      size="small"
      label={stage ?? "Unknown"}
      sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 500, height: 22, fontSize: 12 }}
    />
  );
}

export function StatusChip({ status }: { status: string }) {
  const c = STATUS_COLOR[status?.toUpperCase()] ?? { ...UNKNOWN_COLOR, label: status ?? "Unknown" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75,
        px: 1.25, py: 0.25, borderRadius: 1.5,
        bgcolor: c.bg, color: c.fg, fontWeight: 500, fontSize: 12,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: c.fg }} />
      {c.label}
    </Box>
  );
}

export function ImpactChip({ impact }: { impact: ImpactCode }) {
  const bg = impact === "SA" ? "#FDECEA" : "#E3F2FD";
  const fg = impact === "SA" ? "#C62828" : "#1565C0";
  return (
    <Chip size="small" label={impact} sx={{ bgcolor: bg, color: fg, fontWeight: 600, height: 20, fontSize: 11 }} />
  );
}

export function SlaBar({ sla }: { sla: number }) {
  const color = sla >= 80 ? "#D32F2F" : sla >= 50 ? "#ED6C02" : "#2E7D32";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 80, height: 6, bgcolor: "rgba(0,0,0,0.07)", borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ width: `${sla}%`, height: "100%", bgcolor: color, borderRadius: 1 }} />
      </Box>
      <Box component="span" sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500, color, fontSize: 12, minWidth: 32 }}>
        {sla}%
      </Box>
    </Box>
  );
}
