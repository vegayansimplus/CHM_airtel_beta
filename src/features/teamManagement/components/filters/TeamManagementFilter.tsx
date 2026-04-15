
import { useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  MenuItem,
  Paper,
  ClickAwayListener,
  MenuList,
  Grow,
  Popper,
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
  const actorUserId = loggedUser?.userId;
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { options } = useOrgHierarchyFilters(filters);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  // Split button state
  const [splitOpen, setSplitOpen] = useState(false);
  const splitAnchorRef = useRef<HTMLDivElement>(null);

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
    [setFilters]
  );

  return (
    <>
      <OrgHierarchyFilters
        role={roleName}
        values={filters}
        options={options}
        onChange={handleFilterChange}
      >
        {/* 
          BULLETPROOF RESPONSIVE WRAPPER 
          - Allows wrapping if space is tight (like on md screens with a sidebar)
        */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
          }}
        >
          {/* LEFT: Status chips */}
          <Box
            sx={{
              display: "flex",
              flex: "1 1 auto",
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

          {/* RIGHT: Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              flex: "1 1 auto",
              // Aligns to right on md/desktop, left on tablet, center on mobile
              justifyContent: { xs: "center", sm: "flex-start", md: "flex-end" },
              minWidth: { xs: "100%", sm: "max-content" },
            }}
          >
            {/* ── SPLIT BUTTON ── */}
            <ButtonGroup
              variant="contained"
              ref={splitAnchorRef}
              disableElevation
              sx={{
                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                minWidth: "max-content", // Prevents button from crushing
                borderRadius: "8px",
                "& .MuiButtonGroup-grouped": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <Button
                startIcon={<PersonAddAltIcon />}
                onClick={() => actorUserId && setOpenAddDialog(true)}
                sx={{
                  flexGrow: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px 0 0 8px",
                  px: 2,
                  whiteSpace: "nowrap", // Forces text to stay on one line
                }}
              >
                Add Member
              </Button>
              <Button
                size="small"
                onClick={() => setSplitOpen((prev) => !prev)}
                sx={{ borderRadius: "0 8px 8px 0", px: 0.5, minWidth: 32 }}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>

            {/* Export Panel Box */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                minWidth: "max-content",
                display: "flex",
              }}
            >
              <ExportPanel
                onExport={({ format, scope, columns }) => {
                  console.log("Exporting:", { format, scope, columns });
                }}
              />
            </Box>
          </Box>
        </Box>
      </OrgHierarchyFilters>

      {/* POPPER */}
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
              sx={{
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                mt: 0.5,
              }}
            >
              <ClickAwayListener onClickAway={() => setSplitOpen(false)}>
                <MenuList dense disablePadding>
                  <MenuItem
                    onClick={() => {
                      setSplitOpen(false);
                      actorUserId && setOpenAddDialog(true);
                    }}
                    sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
                  >
                    <PersonAddAltIcon
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                    Add single member
                  </MenuItem>
                  <Divider sx={{ my: 0 }} />
                  <MenuItem
                    onClick={() => {
                      setSplitOpen(false);
                      setOpenUploadDialog(true);
                    }}
                    sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
                  >
                    <UploadFileIcon
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
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

// import { useState, useCallback, useRef } from "react";
// import {
//   Box,
//   Button,
//   ButtonGroup,
//   // Chip,
//   Divider,
//   // IconButton,
//   // Menu,
//   MenuItem,
//   // Tooltip,
//   Paper,
//   ClickAwayListener,
//   MenuList,
//   Grow,
//   Popper,
//   Stack,
// } from "@mui/material";
// // import AddIcon from "@mui/icons-material/Add";
// // import DownloadIcon from "@mui/icons-material/Download";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// // import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// // import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
// import { authStorage } from "../../../../app/store/auth.storage";
// import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFiltersV2";
// import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";
// import { AddMemberDialog } from "../dialog/AddMemberDialog";
// import { UploadEmployeeDialog } from "../dialog/UploadEmployeeDialog";
// import { ExportPanel } from "./ExportPanel";
// import { RichStatusToggle } from "./RichStatusToggle";

// interface Props {
//   filters: OrgFilterValues;
//   setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
//   status: "ACTIVE" | "INACTIVE";
//   setStatus: React.Dispatch<React.SetStateAction<"ACTIVE" | "INACTIVE">>;
// }

// export const TeamManagementFilter = ({
//   filters,
//   setFilters,
//   status,
//   setStatus,
// }: Props) => {
//   const loggedUser = authStorage.getUser();
//   const actorUserId = loggedUser?.userId;
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
//   const { options } = useOrgHierarchyFilters(filters);

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [openUploadDialog, setOpenUploadDialog] = useState(false);

//   // Split button state
//   const [splitOpen, setSplitOpen] = useState(false);
//   const splitAnchorRef = useRef<HTMLDivElement>(null);

//   const handleFilterChange = useCallback(
//     (key: keyof OrgFilterValues, value?: number) => {
//       setFilters((prev) => {
//         const next = { ...prev, [key]: value };
//         if (key === "vertical") {
//           delete next.teamFunction;
//           delete next.domain;
//           delete next.subDomain;
//         }
//         if (key === "teamFunction") {
//           delete next.domain;
//           delete next.subDomain;
//         }
//         if (key === "domain") {
//           delete next.subDomain;
//         }
//         return next;
//       });
//     },
//     [setFilters],
//   );

//   return (
//     <>
//       <OrgHierarchyFilters
//         role={roleName}
//         values={filters}
//         options={options}
//         onChange={handleFilterChange}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             width: "100%",
//             flexWrap: "wrap",
//             gap: 2,
//           }}
//         >
//           {/* LEFT: Status chips */}
//           <Stack direction="row" spacing={2} alignItems="center">
//             <RichStatusToggle
//               status={status}
//               setStatus={setStatus}
//               activeCount={15}
//               inactiveCount={4}
//             />
//           </Stack>

//           {/* RIGHT: Split button + Export */}
//           <Stack direction="row" spacing={1} alignItems="center">
//             {/* ── SPLIT BUTTON ── */}
//             <ButtonGroup
//               variant="contained"
//               ref={splitAnchorRef}
//               disableElevation
//               sx={{
//                 borderRadius: "8px",
//                 "& .MuiButtonGroup-grouped": {
//                   borderColor: "rgba(255,255,255,0.3)",
//                 },
//               }}
//             >
//               <Button
//                 startIcon={<PersonAddAltIcon />}
//                 onClick={() => actorUserId && setOpenAddDialog(true)}
//                 sx={{
//                   textTransform: "none",
//                   fontWeight: 600,
//                   borderRadius: "8px 0 0 8px",
//                   px: 2,
//                 }}
//               >
//                 Add Member
//               </Button>
//               <Button
//                 size="small"
//                 onClick={() => setSplitOpen((prev) => !prev)}
//                 sx={{ borderRadius: "0 8px 8px 0", px: 0.5, minWidth: 32 }}
//               >
//                 <ArrowDropDownIcon />
//               </Button>
//             </ButtonGroup>

//             <Popper
//               open={splitOpen}
//               anchorEl={splitAnchorRef.current}
//               transition
//               disablePortal
//               placement="bottom-end"
//               style={{ zIndex: 1300 }}
//             >
//               {({ TransitionProps }) => (
//                 <Grow {...TransitionProps}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       borderRadius: "10px",
//                       border: "1px solid",
//                       borderColor: "divider",
//                       overflow: "hidden",
//                       mt: 0.5,
//                     }}
//                   >
//                     <ClickAwayListener onClickAway={() => setSplitOpen(false)}>
//                       <MenuList dense disablePadding>
//                         <MenuItem
//                           onClick={() => {
//                             setSplitOpen(false);
//                             actorUserId && setOpenAddDialog(true);
//                           }}
//                           sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
//                         >
//                           <PersonAddAltIcon
//                             sx={{ fontSize: 18, color: "primary.main" }}
//                           />
//                           Add single member
//                         </MenuItem>
//                         <Divider sx={{ my: 0 }} />
//                         <MenuItem
//                           onClick={() => {
//                             setSplitOpen(false);
//                             setOpenUploadDialog(true);
//                           }}
//                           sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: 14 }}
//                         >
//                           <UploadFileIcon
//                             sx={{ fontSize: 18, color: "success.main" }}
//                           />
//                           Upload via Excel
//                         </MenuItem>
//                       </MenuList>
//                     </ClickAwayListener>
//                   </Paper>
//                 </Grow>
//               )}
//             </Popper>

//             {/* Export */}

//             <ExportPanel
//               onExport={({ format, scope, columns }) => {
//                 console.log("Exporting:", { format, scope, columns });
//                 // call your export API here
//               }}
//             />
//           </Stack>
//         </Box>
//       </OrgHierarchyFilters>

//       {actorUserId && (
//         <AddMemberDialog
//           open={openAddDialog}
//           onClose={() => setOpenAddDialog(false)}
//           actorUserId={actorUserId}
//         />
//       )}
//       <UploadEmployeeDialog
//         open={openUploadDialog}
//         onClose={() => setOpenUploadDialog(false)}
//       />
//     </>
//   );
// };

// import { useState, useCallback } from "react";
// import Stack from "@mui/material/Stack";
// import {
//   Box,
//   Button,
//   Chip,
//   Divider,
//   IconButton,
//   Menu,
//   MenuItem,
//   Tooltip,
// } from "@mui/material";

// import AddIcon from "@mui/icons-material/Add";
// import DownloadIcon from "@mui/icons-material/Download";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// import { authStorage } from "../../../../app/store/auth.storage";
// import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFilters";
// import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";

// import { AddMemberDialog } from "../dialog/AddMemberDialog";
// import { UploadEmployeeDialog } from "../dialog/UploadEmployeeDialog";

// interface Props {
//   filters: OrgFilterValues;
//   setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
//   status: "ACTIVE" | "INACTIVE";
//   setStatus: React.Dispatch<React.SetStateAction<"ACTIVE" | "INACTIVE">>;
// }

// export const TeamManagementFilter = ({
//   filters,
//   setFilters,
//   status,
//   setStatus,
// }: Props) => {
//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
//   const actorUserId = loggedUser?.userId;

//   const { options } = useOrgHierarchyFilters(filters);

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [openUploadDialog, setOpenUploadDialog] = useState(false);

//   /* ================= FILTER CHANGE ================= */
//   const handleFilterChange = useCallback(
//     (key: keyof OrgFilterValues, value?: number) => {
//       setFilters((prev) => {
//         const next = { ...prev, [key]: value };

//         if (key === "vertical") {
//           delete next.teamFunction;
//           delete next.domain;
//           delete next.subDomain;
//         }

//         if (key === "teamFunction") {
//           delete next.domain;
//           delete next.subDomain;
//         }

//         if (key === "domain") {
//           delete next.subDomain;
//         }

//         return next;
//       });
//     },
//     [setFilters],
//   );

//   /* ================= EXPORT MENU ================= */
//   const handleMenuClose = () => setAnchorEl(null);

//   return (
//     <>
//       <OrgHierarchyFilters
//         role={roleName}
//         values={filters}
//         options={options}
//         onChange={handleFilterChange}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             width: "100%",
//             flexWrap: "wrap",
//             gap: 2,
//           }}
//         >
//           {/* ================= LEFT SECTION ================= */}
//           <Stack direction="row" spacing={2} alignItems="center">
//             <Chip
//               icon={<CheckCircleIcon />}
//               label="Active"
//               color={status === "ACTIVE" ? "success" : "default"}
//               variant={status === "ACTIVE" ? "filled" : "outlined"}
//               onClick={() => setStatus("ACTIVE")}
//               sx={{ fontWeight: 600 }}
//             />

//             <Chip
//               icon={<RadioButtonUncheckedIcon />}
//               label="Inactive"
//               color={status === "INACTIVE" ? "warning" : "default"}
//               variant={status === "INACTIVE" ? "filled" : "outlined"}
//               onClick={() => setStatus("INACTIVE")}
//               sx={{ fontWeight: 600 }}
//             />
//           </Stack>

//           {/* ================= RIGHT SECTION ================= */}
//           <Stack direction="row" spacing={1} alignItems="center">
//             <Button
//               variant="outlined"
//               startIcon={<AddIcon />}
//               onClick={() => actorUserId && setOpenAddDialog(true)}
//             >
//               Add Member
//             </Button>

//             <Divider orientation="vertical" flexItem />

//             <Button
//               variant="outlined"
//               onClick={() => setOpenUploadDialog(true)}
//             >
//               Upload Users
//             </Button>

//             <Tooltip title="Export">
//               <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
//                 <DownloadIcon />
//               </IconButton>
//             </Tooltip>

//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem
//                 onClick={() => {
//                   handleMenuClose();
//                   console.log("Export PDF");
//                 }}
//               >
//                 Export PDF
//               </MenuItem>

//               <MenuItem
//                 onClick={() => {
//                   handleMenuClose();
//                   console.log("Export Excel");
//                 }}
//               >
//                 Export Excel
//               </MenuItem>
//             </Menu>
//           </Stack>
//         </Box>
//       </OrgHierarchyFilters>

//       {/* ================= DIALOGS ================= */}

//       {actorUserId && (
//         <AddMemberDialog
//           open={openAddDialog}
//           onClose={() => setOpenAddDialog(false)}
//           actorUserId={actorUserId}
//         />
//       )}

//       <UploadEmployeeDialog
//         open={openUploadDialog}
//         onClose={() => setOpenUploadDialog(false)}
//       />
//     </>
//   );
// };
