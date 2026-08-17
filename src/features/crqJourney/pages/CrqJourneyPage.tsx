import React from "react";
import { Alert, Box, Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useCrqJourney } from "../hooks/useCrqJourney";
import { CrqSelector } from "../components/CrqSelector";
import { CrqInfoStrip } from "../components/CrqInfoStrip";
import { CrqFlowCanvas } from "../components/CrqFlowCanvas";
import { CrqFlowSkeleton } from "../components/CrqFlowSkeleton";
import { CrqEmptyState } from "../components/CrqEmptyState";

export const CrqJourneyPage: React.FC = () => {
  const {
    roleName,
    values,
    options,
    handleChange,
    crqOptions,
    isLoadingCrqs,
    selectedCrq,
    handleSelectCrq,
    showLegend,
    handleToggleLegend,
    isLoading,
    error,
    flow,
    progress,
    details,
    isLoadingDetails,
    refetch,
    isRefreshing,
  } = useCrqJourney();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 2 }}>
      {/* ── Org scope + CRQ selector ── */}
      <CrqSelector
        role={roleName}
        values={values}
        options={options}
        onFilterChange={handleChange}
        crqOptions={crqOptions}
        isLoadingCrqs={isLoadingCrqs}
        value={selectedCrq}
        onChange={handleSelectCrq}
      />

      {/* ── Loading ── */}
      {isLoading && <CrqFlowSkeleton />}

      {/* ── Error ── */}
      {error && !isLoading && (
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={refetch}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── Empty ── */}
      {!selectedCrq && !isLoading && (
        <CrqEmptyState
          subtitle={
            values.subDomain == null
              ? "Pick a Sub Domain to browse its Change Requests, or type a CRQ number directly."
              : "Choose a Change Request above to view its journey flow."
          }
        />
      )}

      {/* ── Journey ── */}
      {selectedCrq && !isLoading && !error && (
        <>
          <CrqInfoStrip
            info={selectedCrq}
            details={details}
            isLoadingDetails={isLoadingDetails}
            progress={progress}
            onRefresh={refetch}
            isRefreshing={isRefreshing}
          />

          {flow && (
            <CrqFlowCanvas flow={flow} showLegend={showLegend} onToggleLegend={handleToggleLegend} />
          )}
        </>
      )}
    </Box>
  );
};
