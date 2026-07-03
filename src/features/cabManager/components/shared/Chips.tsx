import { Box, Chip } from "@mui/material";
import type { CrqStage, CrqStatus, ImpactCode } from "../../types/types";

const STAGE_COLOR: Record<CrqStage, { bg: string; fg: string }> = {
  Authorization:  { bg: "#E3F2FD", fg: "#1565C0" },
  Scheduling:     { bg: "#F3E5F5", fg: "#6A1B9A" },
  Validation:     { bg: "#FFF8E1", fg: "#A06800" },
  "CAB Review":   { bg: "#FFF4E5", fg: "#C44600" },
  Implementation: { bg: "#E8F5E9", fg: "#2E7D32" },
};

const STATUS_COLOR: Record<CrqStatus, { bg: string; fg: string; label: string }> = {
  pending:   { bg: "#FFF4E5", fg: "#ED6C02", label: "Pending"   },
  approved:  { bg: "#E8F5E9", fg: "#2E7D32", label: "Approved"  },
  rejected:  { bg: "#FDECEA", fg: "#D32F2F", label: "Rejected"  },
  delegated: { bg: "#E3F2FD", fg: "#1565C0", label: "Delegated" },
};

export function StageChip({ stage }: { stage: CrqStage }) {
  const c = STAGE_COLOR[stage];
  return (
    <Chip
      size="small"
      label={stage}
      sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 500, height: 22, fontSize: 12 }}
    />
  );
}

export function StatusChip({ status }: { status: CrqStatus }) {
  const c = STATUS_COLOR[status];
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
