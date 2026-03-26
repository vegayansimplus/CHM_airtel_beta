import { useState, useCallback } from "react";
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
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFilters";
import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";

import { AddMemberDialog } from "../dialog/AddMemberDialog";
import { UploadEmployeeDialog } from "../dialog/UploadEmployeeDialog";

interface Props {
  filters: OrgFilterValues;
  setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
  status: "ACTIVE" | "INACTIVE";
  setStatus: React.Dispatch<React.SetStateAction<"ACTIVE" | "INACTIVE">>;
}

export const TeamManagementFilter = ({
  filters,
  setFilters,
  status,
  setStatus,
}: Props) => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const actorUserId = loggedUser?.userId;

  const { options } = useOrgHierarchyFilters(filters);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  /* ================= FILTER CHANGE ================= */
  const handleFilterChange = useCallback(
    (key: keyof OrgFilterValues, value?: number) => {
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
    },
    [setFilters],
  );

  /* ================= EXPORT MENU ================= */
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <OrgHierarchyFilters
        role={roleName}
        values={filters}
        options={options}
        onChange={handleFilterChange}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* ================= LEFT SECTION ================= */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<CheckCircleIcon />}
              label="Active"
              color={status === "ACTIVE" ? "success" : "default"}
              variant={status === "ACTIVE" ? "filled" : "outlined"}
              onClick={() => setStatus("ACTIVE")}
              sx={{ fontWeight: 600 }}
            />

            <Chip
              icon={<RadioButtonUncheckedIcon />}
              label="Inactive"
              color={status === "INACTIVE" ? "warning" : "default"}
              variant={status === "INACTIVE" ? "filled" : "outlined"}
              onClick={() => setStatus("INACTIVE")}
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          {/* ================= RIGHT SECTION ================= */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => actorUserId && setOpenAddDialog(true)}
            >
              Add Member
            </Button>

            <Divider orientation="vertical" flexItem />

            <Button
              variant="outlined"
              onClick={() => setOpenUploadDialog(true)}
            >
              Upload Users
            </Button>

            <Tooltip title="Export">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  console.log("Export PDF");
                }}
              >
                Export PDF
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  console.log("Export Excel");
                }}
              >
                Export Excel
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      </OrgHierarchyFilters>

      {/* ================= DIALOGS ================= */}

      {actorUserId && (
        <AddMemberDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          actorUserId={actorUserId}
        />
      )}

      <UploadEmployeeDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
      />
    </>
  );
};
