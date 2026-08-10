import React from "react";
import { Box, CircularProgress, Alert, Typography, useTheme } from "@mui/material";
import { useCrqJourney } from "../hooks/useCrqJourney";
import { CrqSelector } from "../components/CrqSelector";
import { CrqInfoStrip } from "../components/CrqInfoStrip";
import { CrqFlowCanvas } from "../components/CrqFlowCanvas";
import { CrqEmptyState } from "../components/CrqEmptyState";

export const CrqJourneyPage: React.FC = () => {
  const theme = useTheme();
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
    isLoading,
    error,
    flow,
  } = useCrqJourney();

  return (
    <Box>
      {/* ── Org scope + CRQ Selector ── */}
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

      {/* ── Journey section ── */}
      <Box sx={{ py: 0.1, display: "flex", flexDirection: "column", gap: 2 }}>
        {selectedCrq && !isLoading && (
          <Box
            sx={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <CrqInfoStrip info={selectedCrq} />
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "14px",
              gap: 2,
            }}
          >
            <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Loading CRQ journey…</Typography>
          </Box>
        )}

        {error && !isLoading && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!selectedCrq && !isLoading && <CrqEmptyState />}

        {flow && !isLoading && !error && (
          <Box>
            <CrqFlowCanvas flow={flow} showLegend={showLegend} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
