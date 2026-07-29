import React from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useCrqDetails } from "../hooks/useCrqDetails";
import { CrqDetailsSearchBar } from "../components/details/CrqDetailsSearchBar";
import { CrqDetailsInfoCard } from "../components/details/CrqDetailsInfoCard";
import { CrqStageTimeline } from "../components/details/CrqStageTimeline";
import { CrqEmptyState } from "../components/CrqEmptyState";

export const CrqDetailsPage: React.FC = () => {
  const {
    roleName,
    values,
    options,
    handleChange,
    crqOptions,
    isLoadingCrqs,
    selectedCrq,
    handleSelectCrq,
    details,
    isLoading,
    error,
  } = useCrqDetails();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <CrqDetailsSearchBar
        role={roleName}
        values={values}
        options={options}
        onFilterChange={handleChange}
        crqOptions={crqOptions}
        isLoadingCrqs={isLoadingCrqs}
        value={selectedCrq}
        onChange={handleSelectCrq}
      />

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
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Loading CRQ details…</Typography>
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!selectedCrq && !isLoading && (
        <CrqEmptyState
          title="No CRQ Looked Up"
          subtitle="Pick a Sub Domain and search for a CRQ number above to view its full details and workflow timeline."
        />
      )}

      {details && !isLoading && !error && (
        <>
          {details.info && <CrqDetailsInfoCard info={details.info} />}
          <CrqStageTimeline stages={details.stages} />
        </>
      )}
    </Box>
  );
};
