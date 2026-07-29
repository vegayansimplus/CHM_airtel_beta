import React from "react";
import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import type { OrgFilterKey, OrgFilterOption, OrgFilterValues } from "../../orgHierarchy/types/orgHierarchy.types";
import type { CrqJourneySearchRow } from "../types/crqJourney.types";
import { formatStatusLabel, statusChipColor } from "../utils/crqJourney.utils";

interface CrqSelectorProps {
  role: string;
  values: OrgFilterValues;
  options: Record<OrgFilterKey, OrgFilterOption[]>;
  onFilterChange: (key: OrgFilterKey, value?: number) => void;
  crqOptions: CrqJourneySearchRow[];
  isLoadingCrqs: boolean;
  value: CrqJourneySearchRow | null;
  onChange: (crq: CrqJourneySearchRow | null) => void;
}

export const CrqSelector: React.FC<CrqSelectorProps> = ({
  role,
  values,
  options,
  onFilterChange,
  crqOptions,
  isLoadingCrqs,
  value,
  onChange,
}) => {
  const scopeSelected = values.subDomain != null;

  return (
    <Box sx={{ background: "#fff", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      <OrgHierarchyFilters role={role} values={values} options={options} onChange={onFilterChange} />

      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
        Select CRQ
      </Typography>

      <Autocomplete<CrqJourneySearchRow>
        size="small"
        sx={{ minWidth: 360 }}
        options={crqOptions}
        value={value}
        loading={isLoadingCrqs}
        disabled={!scopeSelected}
        disableClearable={false}
        getOptionLabel={(crq) => crq.crqNo}
        isOptionEqualToValue={(a, b) => a.crqNo === b.crqNo}
        onChange={(_e, crq) => onChange(crq)}
        filterOptions={(opts, state) => {
          const q = state.inputValue.trim().toLowerCase();
          if (!q) return opts;
          return opts.filter((crq) => crq.crqNo.toLowerCase().includes(q));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Choose a Change Request"
            placeholder={scopeSelected ? "Search by CRQ ID…" : "Select a Sub Domain first"}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Roboto Mono, monospace",
                fontSize: 13,
              },
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoadingCrqs && <CircularProgress color="inherit" size={14} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, crq) => {
          const chip = statusChipColor(crq.currentStatus);
          return (
            <Box component="li" {...props} key={crq.crqNo} sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Roboto Mono, monospace",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#1565C0",
                  flexGrow: 1,
                }}
              >
                {crq.crqNo}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{crq.currentStage}</Typography>
              <Box
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: chip.color,
                  background: chip.bg,
                  borderRadius: "6px",
                  px: "6px",
                  py: "1px",
                }}
              >
                {formatStatusLabel(crq.currentStatus)}
              </Box>
            </Box>
          );
        }}
        noOptionsText={scopeSelected ? "No CRQs found for this Sub Domain" : "Select a Sub Domain first"}
      />
    </Box>
  );
};
