import { useEffect, useState } from "react";
import type { FilterValues } from "../../../../components/common/filters/filters.types";
import TeamFilters from "../../../../components/common/filters/TeamFilters";
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
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { authStorage } from "../../../../app/store/auth.storage";

export const TeamManagementFilter = () => {
  // const user = JSON.parse(localStorage.getItem("user") || "{}");
  // const role = user?.role ?? "user";
  const getUserRole = authStorage.getUser();
  // const user = getUserRole.roles[0]; //TEAM_LEAD , TEAM_MEMBER, DOMAIN_HEAD, SUPER_ADMIN
  const user =  "admin";


  const [filters, setFilters] = useState<FilterValues>({});
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    console.log("Filters:", filters, "Status:", status);

    console.log("user.role:", user );
    
  }, [filters, status]);

  return (
    <>
      <TeamFilters
        role={user}
        values={filters}
        status={status}
        onStatusChange={setStatus}
        onChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={5} alignItems="center">
            {/* <Stack direction="row" spacing={1} alignItems="center">
                <FilterAltOutlinedIcon color="primary" />
                <Typography fontWeight={700}>Filters</Typography>
              </Stack> */}

            {/* STATUS */}
            <Stack direction="row" spacing={0.5} sx={{pr:2}}>
              <Chip
                icon={<CheckCircleIcon />}
                label="Active"
                color={status === "active" ? "success" : "default"}
                variant={status === "active" ? "filled" : "outlined"}
                // onClick={() => onStatusChange("active")}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<RadioButtonUncheckedIcon />}
                label="Inactive"
                color={status === "inactive" ? "warning" : "default"}
                variant={status === "inactive" ? "filled" : "outlined"}
                // onClick={() => onStatusChange("inactive")}
                sx={{ fontWeight: 600  }}
              />
            </Stack>
          </Stack>

          {/* RIGHT */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                px: 2.5,
              }}
            >
              Add Member
            </Button>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Import members">
              <IconButton sx={{ border: "1px solid", borderColor: "divider" }}>
                <UploadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export">
              <IconButton
                // onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
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
      </TeamFilters>
    </>
  );
};

// import { useEffect, useState } from "react";
// import type { FilterValues } from "../../../../components/common/filters/filters.types";
// import TeamFilters from "../../../../components/common/filters/TeamFilters";
// import Stack from "@mui/material/Stack";
// import { Button, Chip, Divider, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import UploadIcon from "@mui/icons-material/Upload";
// import DownloadIcon from "@mui/icons-material/Download";
// // import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// export const TeamManagementFilter = () => {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const role = user?.role ?? "admin";

//   const [filters, setFilters] = useState<FilterValues>({});
//   const [status, setStatus] = useState<"active" | "inactive">("active");
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   useEffect(() => {
//     console.log("Filters:", filters, "Status:", status);
//   }, [filters, status]);

//   return (
//     <>
//       <TeamFilters
//         role={role}
//         values={filters}
//         status={status}
//         onStatusChange={setStatus}
//         onChange={(key, value) =>
//           setFilters((prev) => ({ ...prev, [key]: value }))
//         }
//       />

//       <Stack direction="row" spacing={5} alignItems="center">
//         {/* <Stack direction="row" spacing={1} alignItems="center">
//                 <FilterAltOutlinedIcon color="primary" />
//                 <Typography fontWeight={700}>Filters</Typography>
//               </Stack> */}

//         {/* STATUS */}
//         <Stack direction="row" spacing={0.5}>
//           <Chip
//             icon={<CheckCircleIcon />}
//             label="Active"
//             color={status === "active" ? "success" : "default"}
//             variant={status === "active" ? "filled" : "outlined"}
//             // onClick={() => onStatusChange("active")}
//             sx={{ fontWeight: 600 }}
//           />
//           <Chip
//             icon={<RadioButtonUncheckedIcon />}
//             label="Inactive"
//             color={status === "inactive" ? "warning" : "default"}
//             variant={status === "inactive" ? "filled" : "outlined"}
//             // onClick={() => onStatusChange("inactive")}
//             sx={{ fontWeight: 600 }}
//           />
//         </Stack>
//       </Stack>

//       {/* RIGHT */}
//       <Stack direction="row" spacing={1} alignItems="center">
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           sx={{
//             borderRadius: 2,
//             fontWeight: 700,
//             px: 2.5,
//           }}
//         >
//           Add Member
//         </Button>

//         <Divider orientation="vertical" flexItem />

//         <Tooltip title="Import members">
//           <IconButton sx={{ border: "1px solid", borderColor: "divider" }}>
//             <UploadIcon />
//           </IconButton>
//         </Tooltip>

//         <Tooltip title="Export">
//           <IconButton
//             // onClick={(e) => setAnchorEl(e.currentTarget)}
//             sx={{ border: "1px solid", borderColor: "divider" }}
//           >
//             <DownloadIcon />
//           </IconButton>
//         </Tooltip>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={() => setAnchorEl(null)}
//         >
//           <MenuItem>Export CSV</MenuItem>
//           <MenuItem>Export Excel</MenuItem>
//         </Menu>
//       </Stack>
//     </>
//   );
// };
