import { useState, useCallback, useRef } from "react";
import {
  Box, Button, ButtonGroup, Divider, MenuItem,
  Paper, ClickAwayListener, MenuList, Grow, Popper,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { authStorage } from "../../../../app/store/auth.storage";
import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";
import { AddMemberDialog } from "../dialog/AddMemberDialog";
import { UploadEmployeeDialog } from "../dialog/UploadEmployeeDialog";
import { ExportPanel } from "./ExportPanel";
import { RichStatusToggle } from "./RichStatusToggle";

/* ── Props ── */
interface Props {
  filters: OrgFilterValues;
  setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
  status: "ACTIVE" | "INACTIVE";
  setStatus: React.Dispatch<React.SetStateAction<"ACTIVE" | "INACTIVE">>;
  //  new props wired from TeamManagementMain
  filteredRows: Record<string, any>[];
  totalRowCount: number;
  currentPageSize: number;
}

export const TeamManagementFilter = ({
  filters,
  setFilters,
  status,
  setStatus,
  filteredRows,
  totalRowCount,
  currentPageSize,
}: Props) => {
  const loggedUser  = authStorage.getUser();
  const actorUserId = loggedUser?.userId;
  const roleName    = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { options } = useOrgHierarchyFilters(filters);

  const [openAddDialog,    setOpenAddDialog]    = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [splitOpen,        setSplitOpen]        = useState(false);
  const splitAnchorRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = useCallback(
    (key: keyof OrgFilterValues, value?: number) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "vertical")    { delete next.teamFunction; delete next.domain; delete next.subDomain; }
        if (key === "teamFunction"){ delete next.domain; delete next.subDomain; }
        if (key === "domain")      { delete next.subDomain; }
        return next;
      });
    },
    [setFilters],
  );

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
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: 2, width: "100%",
          }}
        >
          {/* LEFT: status toggle */}
          <Box
            sx={{
              display: "flex", flex: "1 1 auto",
              minWidth: { xs: "100%", sm: "max-content" },
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <RichStatusToggle
              status={status}
              setStatus={setStatus}
              activeCount={15}
              inactiveCount={4}
            />
          </Box>

          {/* RIGHT: action buttons */}
          <Box
            sx={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2,
              flex: "1 1 auto",
              justifyContent: { xs: "center", sm: "flex-start", md: "flex-end" },
              minWidth: { xs: "100%", sm: "max-content" },
            }}
          >
            {/* Split button */}
            <ButtonGroup
              variant="contained"
              ref={splitAnchorRef}
              disableElevation
              sx={{
                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                minWidth: "max-content",
                borderRadius: "8px",
                "& .MuiButtonGroup-grouped": { borderColor: "rgba(255,255,255,0.3)" },
              }}
            >
              <Button
                startIcon={<PersonAddAltIcon />}
                onClick={() => actorUserId && setOpenAddDialog(true)}
                sx={{
                  flexGrow: 1, textTransform: "none", fontWeight: 600,
                  borderRadius: "8px 0 0 8px", px: 2, whiteSpace: "nowrap",
                }}
              >
                Add Member
              </Button>
              <Button
                size="small"
                onClick={() => setSplitOpen((p) => !p)}
                sx={{ borderRadius: "0 8px 8px 0", px: 0.5, minWidth: 32 }}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>

            {/*  ExportPanel now receives live data props */}
            <Box sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" }, minWidth: "max-content", display: "flex" }}>
              <ExportPanel
                filteredRows={filteredRows}
                totalRowCount={totalRowCount}
                currentPageSize={currentPageSize}
              />
            </Box>
          </Box>
        </Box>
      </OrgHierarchyFilters>

      {/* Popper */}
      <Popper
        open={splitOpen}
        anchorEl={splitAnchorRef.current}
        transition
        disablePortal
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper
              elevation={3}
              sx={{ borderRadius: "10px", border: "1px solid", borderColor: "divider", overflow: "hidden", mt: 0.5 }}
            >
              <ClickAwayListener onClickAway={() => setSplitOpen(false)}>
                <MenuList dense disablePadding>
                  <MenuItem
                    onClick={() => { setSplitOpen(false); actorUserId && setOpenAddDialog(true); }}
                    sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
                  >
                    <PersonAddAltIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    Add single member
                  </MenuItem>
                  <Divider sx={{ my: 0 }} />
                  <MenuItem
                    onClick={() => { setSplitOpen(false); setOpenUploadDialog(true); }}
                    sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
                  >
                    <UploadFileIcon sx={{ fontSize: 18, color: "success.main" }} />
                    Upload via Excel
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

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
