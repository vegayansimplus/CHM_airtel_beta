import React, { useState } from "react";
import { Alert, Box, Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useCrqJourney } from "../hooks/useCrqJourney";
import { CrqSelector } from "../components/CrqSelector";
import { CrqInfoStrip } from "../components/CrqInfoStrip";
import { CrqFlowCanvas } from "../components/CrqFlowCanvas";
import { CrqFlowSkeleton } from "../components/CrqFlowSkeleton";
import { CrqEmptyState } from "../components/CrqEmptyState";
import {
  PendingApprovalsPanel,
  pendingApprovalsReserve,
} from "../components/PendingApprovalsPanel";

export const CrqJourneyPage: React.FC = () => {
  const {
    roleName,
    values,
    options,
    handleChange,
    crqOptions,
    isLoadingCrqs,
    selectedCrq,
    info,
    handleSelectCrq,
    showLegend,
    handleToggleLegend,
    isLoading,
    error,
    flow,
    progress,
    pendingApprovals,
    approverIndex,
    scope,
    details,
    isLoadingDetails,
    refetch,
    isRefreshing,
  } = useCrqJourney();

  // The approvals panel sits under the flow canvas, and the canvas fits itself
  // into the viewport height left below its own top edge — so the panel's open
  // state lives here, where it can also be turned into the height the canvas
  // has to leave free. Collapsing it hands that height back to the diagram.
  const [approvalsOpen, setApprovalsOpen] = useState(true);
  const approvalsReserve = pendingApprovalsReserve(pendingApprovals, approvalsOpen);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pb: 1 }}>
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
      {info && !isLoading && !error && (
        <>
          <CrqInfoStrip
            info={info}
            details={details}
            isLoadingDetails={isLoadingDetails}
            progress={progress}
            onRefresh={refetch}
            isRefreshing={isRefreshing}
          />

          {flow && (
            <CrqFlowCanvas
              flow={flow}
              showLegend={showLegend}
              onToggleLegend={handleToggleLegend}
              approverIndex={approverIndex}
              bottomReserve={approvalsReserve}
            />
          )}

          {/* Who still has to act — under the diagram of what's left to do. The
              canvas above reserves this panel's height so both fit in one view. */}
          <PendingApprovalsPanel
            summary={pendingApprovals}
            scope={scope}
            open={approvalsOpen}
            onToggle={() => setApprovalsOpen((v) => !v)}
          />
        </>
      )}
    </Box>
  );
};
