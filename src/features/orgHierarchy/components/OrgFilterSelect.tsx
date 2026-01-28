import { MenuItem, TextField } from "@mui/material";
import type { OrgFilterOption } from "../types/orgHierarchy.types";

interface Props {
  label: string;
  value?: number;
  options: OrgFilterOption[];
  onChange: (value?: number) => void;
}

const OrgFilterSelect = ({
  label,
  value,
  options,
  onChange,
}: Props) => {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      sx={{ minWidth: 220 }}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default OrgFilterSelect;
