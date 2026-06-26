import React from "react";
import { Box, CircularProgress, Alert, Typography, IconButton, Tooltip } from "@mui/material";
// import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import { useCrqJourney } from "../hooks/useCrqJourney";
import { CrqSelector } from "../components/CrqSelector";
import { CrqInfoStrip } from "../components/CrqInfoStrip";
import { CrqFlowCanvas } from "../components/CrqFlowCanvas";
import { CrqEmptyState } from "../components/CrqEmptyState";

export const CrqJourneyPage: React.FC = () => {
  const {
    selectedCrqId,
    showLegend,
    isLoading,
    error,
    data,
    handleSelectCrq,
    handleToggleLegend,
  } = useCrqJourney();

  return (
    <Box>
      {/* ── CRQ Selector ── */}
      <CrqSelector value={selectedCrqId} onChange={handleSelectCrq} />
  
      {/* ── Journey section ── */}
      <Box sx={{  py: 0.1, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* CRQ Info strip */}
        {data && !isLoading && (
          <Box
            sx={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <CrqInfoStrip info={data.crqInfo} />
          </Box>
        )}

        {/* Loading */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: "14px",
              gap: 2,
            }}
          >
            <CircularProgress size={28} sx={{ color: "#1976D2" }} />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Loading CRQ journey…
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && !isLoading && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty state */}
        {!selectedCrqId && !isLoading && <CrqEmptyState />}

        {/* Flow Canvas */}
        {data && !isLoading && !error && (
          <Box>
            {/* canvas toolbar */}
           

            <CrqFlowCanvas flowData={data.flowData} showLegend={showLegend} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
