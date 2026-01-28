import { Box } from "@mui/material";
import { ORG_FILTER_VISIBILITY } from "../config/orgFilterVisibility";
import type {
  OrgFilterKey,
  OrgFilterValues,
  OrgFilterOption,
} from "../types/orgHierarchy.types";
import OrgFilterSelect from "./OrgFilterSelect";

const LABELS: Record<OrgFilterKey, string> = {
  vertical: "Vertical",
  teamFunction: "Team Function",
  domain: "Domain",
  subDomain: "Sub Domain",
};

interface Props {
  role: string;
  values: OrgFilterValues;
  options: Record<OrgFilterKey, OrgFilterOption[]>;
  onChange: (key: OrgFilterKey, value?: number) => void;
  children?: React.ReactNode;
}

const OrgHierarchyFilters = ({
  role,
  values,
  options,
  onChange,
  children,
}: Props) => {
  const visible = ORG_FILTER_VISIBILITY[role] ?? [];

  return (
    <Box display="flex" gap={2} alignItems="center" sx={{ mt: 2 }}>
      {visible.map((key) => (
        <OrgFilterSelect
          key={key}
          label={LABELS[key]}
          value={values[key]}
          options={options[key]}
          onChange={(v) => onChange(key, v)}
        />
      ))}
      {children}
    </Box>
  );
};

export default OrgHierarchyFilters;


