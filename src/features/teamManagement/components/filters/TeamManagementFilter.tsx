import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFilters";
import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";

interface Props {
  filters: OrgFilterValues;
  setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
}
export const TeamManagementFilter = ({ filters, setFilters }: Props) => {
  const loggedUser = authStorage.getUser();
  const userId = loggedUser?.userId ?? 0;
  const roleName = loggedUser?.roleName ?? "TEAM_MEMBER";

  // const [filters, setFilters] = useState<OrgFilterValues>({});
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { options, isLoading } = useOrgHierarchyFilters(
    userId,
    roleName,
    filters,
  );

  const handleFilterChange = (key: keyof OrgFilterValues, value?: number) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "vertical") {
        delete next.teamFunction;
        delete next.domain;
        delete next.subDomain;
      }
      if (key === "teamFunction") {
        delete next.domain;
        delete next.subDomain;
      }
      if (key === "domain") {
        delete next.subDomain;
      }

      return next;
    });
  };

  useEffect(() => {
    console.log("Filters:", filters);
    console.log("Status:", status);
    console.log("Role:", roleName);
  }, [filters, status, roleName]);

  if (isLoading) return null;

  return (
    <OrgHierarchyFilters
      role={roleName}
      values={filters}
      options={options}
      onChange={handleFilterChange}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
      >
        <Stack direction="row" spacing={5} alignItems="center">
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Active"
              color={status === "active" ? "success" : "default"}
              variant={status === "active" ? "filled" : "outlined"}
              onClick={() => setStatus("active")}
            />
            <Chip
              icon={<RadioButtonUncheckedIcon />}
              label="Inactive"
              color={status === "inactive" ? "warning" : "default"}
              variant={status === "inactive" ? "filled" : "outlined"}
              onClick={() => setStatus("inactive")}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add Member
          </Button>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Import members">
            <IconButton>
              <UploadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem>Export CSV</MenuItem>
            <MenuItem>Export Excel</MenuItem>
          </Menu>
        </Stack>
      </Box>
    </OrgHierarchyFilters>
  );
};
