import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTabColorTokens } from "../../../style/theme";
import { StatCard } from "../../dashboard/components/StatCard";
import type { StatCardConfig, ToneKey } from "../../dashboard/types/dashboard.types";
import type { CRQKpiSummaryDto } from "../types/crqAnalytics.types";
import { formatTrend } from "../utils/formatters";

const slaTone = (score: number): ToneKey => (score >= 90 ? "success" : score >= 75 ? "warning" : "danger");

export function KpiCardsRow({ kpi }: { kpi: CRQKpiSummaryDto }) {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  const cards: StatCardConfig[] = [
    {
      key: "total",
      label: "Total CRQ",
      display: kpi.totalCrq,
      sub: "In selected range",
      tone: "accent",
      icon: "event",
      delta: formatTrend(kpi.totalTrendPct) ?? undefined,
    },
    {
      key: "open",
      label: "Open CRQ",
      display: kpi.openCrq,
      sub: "Currently active",
      tone: "info",
      icon: "clock",
      delta: formatTrend(kpi.openTrendPct) ?? undefined,
    },
    {
      key: "closed",
      label: "Closed CRQ",
      display: kpi.closedCrq,
      sub: "Completed",
      tone: "success",
      icon: "trending",
      delta: formatTrend(kpi.closedTrendPct) ?? undefined,
    },
    {
      key: "rejected",
      label: "Rejected",
      display: kpi.rejected,
      sub: "Rejected / cancelled",
      tone: "danger",
      icon: "calendar",
      delta: formatTrend(kpi.rejectedTrendPct) ?? undefined,
    },
    {
      key: "sla",
      label: "SLA Score",
      display: `${kpi.slaScore.toFixed(1)}%`,
      sub: "Overall compliance",
      tone: slaTone(kpi.slaScore),
      icon: "trending",
      delta: formatTrend(kpi.slaTrendPct) ?? undefined,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" },
        gap: "14px",
      }}
    >
      {cards.map((c) => (
        <StatCard key={c.key} config={c} colors={colors} />
      ))}
    </Box>
  );
}
