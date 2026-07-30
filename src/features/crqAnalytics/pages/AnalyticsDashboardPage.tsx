import { useState } from "react";
import { Box, Skeleton } from "@mui/material";
import CommonContainer from "../../../components/common/CommonContainer";
import { useAnalyticsFilters } from "../hooks/useAnalyticsFilters";
import { useGetCrqAnalyticsDashboardQuery } from "../api/crqAnalyticsApi";
import { AnalyticsFilterBar } from "../components/AnalyticsFilterBar";
import { KpiCardsRow } from "../components/KpiCardsRow";
import { ChartCard } from "../components/ChartCard";
import { BarChartCard } from "../components/BarChartCard";
import { PieChartCard } from "../components/PieChartCard";
import { EngineerUtilizationTable } from "../components/EngineerUtilizationTable";
import { CrqListTable } from "../components/CrqListTable";
import { CrqDetailDrawer } from "../components/CrqDetailDrawer";
import { EmptyOrErrorState } from "../components/EmptyOrErrorState";
import { seriesColor } from "../utils/chartPalette";
import { useTheme } from "@mui/material/styles";

export default function AnalyticsDashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const filterState = useAnalyticsFilters();
  const { filters } = filterState;
  const [selectedCrq, setSelectedCrq] = useState<string | null>(null);

  const { data, isFetching, isError } = useGetCrqAnalyticsDashboardQuery(filters);

  return (
    <CommonContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AnalyticsFilterBar {...filterState} />

        {isFetching && !data && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(5, 1fr)" }, gap: "14px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Box>
        )}

        {isError && !isFetching && <EmptyOrErrorState kind="error" message="Couldn't load the dashboard. Try adjusting the filters." />}

        {data && (
          <>
            <KpiCardsRow kpi={data.kpi} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: 2 }}>
              <ChartCard title="Workflow Stage Breakdown">
                <BarChartCard
                  labels={data.workflowStages.map((s) => s.stage)}
                  series={[
                    { label: "Total", data: data.workflowStages.map((s) => s.totalCount), color: seriesColor("totalCount", isDark) },
                    { label: "Open", data: data.workflowStages.map((s) => s.openCount), color: seriesColor("openCount", isDark) },
                  ]}
                  isLoading={isFetching}
                />
              </ChartCard>

              <ChartCard title="Rejection Reasons">
                <PieChartCard
                  slices={data.rejectionReasons.map((r) => ({ label: r.reason, value: r.count }))}
                  isLoading={isFetching}
                />
              </ChartCard>
            </Box>

            <ChartCard title="Engineer Utilization" height="auto">
              <EngineerUtilizationTable rows={data.engineerUtilization} isLoading={isFetching} />
            </ChartCard>

            <ChartCard title="All CRQs" height="auto">
              <CrqListTable filters={filters} onRowClick={setSelectedCrq} />
            </ChartCard>
          </>
        )}

        <CrqDetailDrawer crqNo={selectedCrq} onClose={() => setSelectedCrq(null)} />
      </Box>
    </CommonContainer>
  );
}
