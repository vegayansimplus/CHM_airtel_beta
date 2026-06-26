import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { CRQ_LIST } from "../data/crqJourney.mock";
import { CRQ_STATUS_CONFIG, PRIORITY_CONFIG } from "../utils/crqJourney.utils";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";

interface CrqSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
}

export const CrqSelector: React.FC<CrqSelectorProps> = ({ value, onChange }) => {
   const loggedUser = authStorage.getUser();
    const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
    const { values, handleChange } = useOrgHierarchyState();
    const { options } = useOrgHierarchyFilters(values);
  
  const handleCRQChange = (e: SelectChangeEvent<string>) => {
    onChange(e.target.value);
  };

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

      <FormControl size="small" sx={{ minWidth: 340 }}>
        <InputLabel id="crq-select-label">Choose a Change Request</InputLabel>
        <Select<string>
          labelId="crq-select-label"
          value={value ?? ""}
          label="Choose a Change Request"
          onChange={handleCRQChange}
          sx={{
            borderRadius: 2,
            fontFamily: "Roboto Mono, monospace",
            fontSize: 13,
          }}
        >
          {CRQ_LIST.map((crq) => {
            const statusCfg = CRQ_STATUS_CONFIG[crq.status];
            const priorityCfg = PRIORITY_CONFIG[crq.priority];
            return (
              <MenuItem key={crq.id} value={crq.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    width: "100%",
                  }}
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
                  <Typography
                    sx={{ fontSize: 13, color: "text.primary", flex: 1 }}
                  >
                    {crq.title}
                  </Typography>
                  <Chip
                    label={priorityCfg.label}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      background: priorityCfg.color + "18",
                      color: priorityCfg.color,
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={statusCfg.label}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
};
