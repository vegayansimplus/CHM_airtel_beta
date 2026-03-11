import { Box } from "@mui/material";
import { useMemo } from "react";
import { ORG_FILTER_VISIBILITY } from "../config/orgFilterVisibility";
import { ORG_FILTER_DEPENDENCY } from "../config/orgFilterDependency";
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
  const visible = useMemo(() => ORG_FILTER_VISIBILITY[role] ?? [], [role]);

  return (
    <Box display="flex" gap={2} alignItems="center">
      {visible.map((key) => {
        const parentKey = ORG_FILTER_DEPENDENCY[key];

        const disabled =
          parentKey &&
          visible.includes(parentKey) &&
          !values[parentKey];

        return (
          <OrgFilterSelect
            key={key}
            label={LABELS[key]}
            value={values[key]}
            options={options[key]}
            disabled={disabled}
            onChange={(v) => onChange(key, v)}
          />
        );
      })}

      {children}
    </Box>
  );
};
export default OrgHierarchyFilters;
