import React from "react";
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { CRQ_LIST } from "../data/crqJourney.mock";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";

type CrqOption = (typeof CRQ_LIST)[number];

interface CrqSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
}

export const CrqSelector: React.FC<CrqSelectorProps> = ({ value, onChange }) => {
   const loggedUser = authStorage.getUser();
    const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
    const { values, handleChange } = useOrgHierarchyState();
    const { options } = useOrgHierarchyFilters(values);

  const selected = CRQ_LIST.find((c) => c.id === value) ?? null;

  return (
    <Box
      sx={{
        background: "#fff",
        // borderBottom: "1px solid rgba(0,0,0,0.07)",
        // px: 3.5,
        // py: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
       <Box>
        
        <OrgHierarchyFilters
          role={roleName}
          values={values}
          options={options}
          onChange={handleChange}
        />
        
      </Box>

      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}
      >
        Select CRQ
      </Typography>

      <Autocomplete<CrqOption>
        size="small"
        sx={{ minWidth: 340 }}
        options={CRQ_LIST}
        value={selected}
        disableClearable
        getOptionLabel={(crq) => crq.id}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_e, crq) => { if (crq) onChange(crq.id); }}
        filterOptions={(opts, state) => {
          const q = state.inputValue.trim().toLowerCase();
          if (!q) return opts;
          return opts.filter((crq) => crq.id.toLowerCase().includes(q));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Choose a Change Request"
            placeholder="Search by CRQ ID…"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Roboto Mono, monospace",
                fontSize: 13,
              },
            }}
          />
        )}
        renderOption={(props, crq) => (
          <Box
            component="li"
            {...props}
            key={crq.id}
            sx={{ width: "100%" }}
          >
            <Typography
              sx={{
                fontFamily: "Roboto Mono, monospace",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#1565C0",
              }}
            >
              {crq.id}
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
};
