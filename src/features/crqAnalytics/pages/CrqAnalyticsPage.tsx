import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CommonContainer from "../../../components/common/CommonContainer";
import { useAnalyticsFilters } from "../hooks/useAnalyticsFilters";
import {
  useGetCrqOpenDomainQuery,
  useGetCrqRaisedVsClosedQuery,
  useGetCrqRunRateQuery,
  useGetCrqGroupBreakdownQuery,
  useGetCrqAgingHeatmapQuery,
} from "../api/crqAnalyticsApi";
import type { AgingHeatmapMode, GroupBreakdownDimension } from "../types/crqAnalytics.types";
import { AnalyticsFilterBar } from "../components/AnalyticsFilterBar";
import { ChartCard } from "../components/ChartCard";
import { BarChartCard } from "../components/BarChartCard";
import { RunRateChart } from "../components/RunRateChart";
import { AgingHeatmapGrid } from "../components/AgingHeatmapGrid";
import { CrqListTable } from "../components/CrqListTable";
import { CrqDetailDrawer } from "../components/CrqDetailDrawer";
import { seriesColor, categoryColor } from "../utils/chartPalette";

const GROUP_BY_OPTIONS: { value: GroupBreakdownDimension; label: string }[] = [
  { value: "domain", label: "Domain" },
  { value: "region", label: "Region" },
  { value: "circle", label: "Circle" },
];

export default function CrqAnalyticsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const filterState = useAnalyticsFilters();
  const { filters } = filterState;
  const [selectedCrq, setSelectedCrq] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBreakdownDimension>("domain");
  const [heatmapMode, setHeatmapMode] = useState<AgingHeatmapMode>("RECEIVED");

  const openDomain = useGetCrqOpenDomainQuery(filters);
  const raisedVsClosed = useGetCrqRaisedVsClosedQuery(filters);
  const runRate = useGetCrqRunRateQuery(filters);
  const groupBreakdown = useGetCrqGroupBreakdownQuery({ ...filters, groupBy });
  const agingHeatmap = useGetCrqAgingHeatmapQuery({ ...filters, heatmapMode });

  return (
    <CommonContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AnalyticsFilterBar {...filterState} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <ChartCard title="Open CRQ by Domain">
            <BarChartCard
              labels={(openDomain.data ?? []).map((d) => d.domain)}
              series={[{ label: "Open", data: (openDomain.data ?? []).map((d) => d.openCount), color: seriesColor("openCount", isDark) }]}
              isLoading={openDomain.isFetching}
              isError={openDomain.isError}
            />
          </ChartCard>

          <ChartCard title="Raised vs Closed vs Rejected">
            <BarChartCard
              labels={(raisedVsClosed.data ?? []).map((d) => d.label)}
              series={[
                { label: "Raised", data: (raisedVsClosed.data ?? []).map((d) => d.raised), color: seriesColor("raised", isDark) },
                { label: "Closed", data: (raisedVsClosed.data ?? []).map((d) => d.closed), color: seriesColor("closed", isDark) },
                { label: "Rejected", data: (raisedVsClosed.data ?? []).map((d) => d.rejected), color: seriesColor("rejected", isDark) },
              ]}
              isLoading={raisedVsClosed.isFetching}
              isError={raisedVsClosed.isError}
            />
          </ChartCard>
        </Box>

        <ChartCard title="Run Rate: Raised → Scheduling → Closed">
          <RunRateChart rows={runRate.data ?? []} isLoading={runRate.isFetching} isError={runRate.isError} />
        </ChartCard>

        <ChartCard
          title="Breakdown"
          action={
            <ToggleButtonGroup size="small" exclusive value={groupBy} onChange={(_e, v) => v && setGroupBy(v)}>
              {GROUP_BY_OPTIONS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: "none", px: 1.5 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          }
        >
          <BarChartCard
            labels={(groupBreakdown.data ?? []).map((d) => d.group)}
            series={[
              { label: "Raised", data: (groupBreakdown.data ?? []).map((d) => d.raised), color: categoryColor(0, isDark) },
              { label: "Closed", data: (groupBreakdown.data ?? []).map((d) => d.closed), color: categoryColor(2, isDark) },
              { label: "Rejected", data: (groupBreakdown.data ?? []).map((d) => d.rejected), color: categoryColor(7, isDark) },
            ]}
            isLoading={groupBreakdown.isFetching}
            isError={groupBreakdown.isError}
          />
        </ChartCard>

        <ChartCard
          title="Aging Heatmap"
          height="auto"
          action={
            <ToggleButtonGroup size="small" exclusive value={heatmapMode} onChange={(_e, v) => v && setHeatmapMode(v)}>
              <ToggleButton value="RECEIVED" sx={{ textTransform: "none", px: 1.5 }}>
                Received
              </ToggleButton>
              <ToggleButton value="SCHEDULED" sx={{ textTransform: "none", px: 1.5 }}>
                Scheduled
              </ToggleButton>
            </ToggleButtonGroup>
          }
        >
          <AgingHeatmapGrid data={agingHeatmap.data} isLoading={agingHeatmap.isFetching} isError={agingHeatmap.isError} />
        </ChartCard>

        <ChartCard title="All CRQs" height="auto">
          <CrqListTable filters={filters} onRowClick={setSelectedCrq} />
        </ChartCard>

        <CrqDetailDrawer crqNo={selectedCrq} onClose={() => setSelectedCrq(null)} />
      </Box>
    </CommonContainer>
  );
}
