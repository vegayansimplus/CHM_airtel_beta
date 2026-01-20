import {
  Box,
  alpha,
} from "@mui/material";
import { useState } from "react";
import FilterSelect from "./FilterSelect";
import type { FilterKey, TeamFiltersProps } from "./filters.types";
import {
  FILTER_OPTIONS,
  ROLE_FILTER_VISIBILITY,
} from "../../../app/config/filters.config";

const FILTER_LABELS: Record<FilterKey, string> = {
  domain: "Domain",
  subDomain: "Sub Domain",
  teamFunction: "Team Function",
  teamSubFunction: "Team Sub Function",
};

const TeamFilters = ({
  values,
  onChange,
  role,
  status,
  onStatusChange,
  children, 
}: TeamFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const visibleFilters = ROLE_FILTER_VISIBILITY[role] ?? [];

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 2,
        borderRadius: 3,
        background: `linear-gradient(180deg, ${alpha(
          theme.palette.background.paper,
          0.9
        )}, ${theme.palette.background.paper})`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
      })}
    >
      {/* LEFT */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          width: "50%",
        }}
      >
        {visibleFilters.map((key) => (
          <FilterSelect
            key={key}
            label={FILTER_LABELS[key]}
            value={values[key]}
            options={FILTER_OPTIONS[key]}
            onChange={(value) => onChange(key, value)}
          />
        ))}
      </Box>

      {/* RIGHT (optional) */}
      {children && <Box>{children}</Box>}
    </Box>
  );
};

export default TeamFilters;


// import {
//   Box,
//   Button,
//   Chip,
//   Menu,
//   MenuItem,
//   Stack,
//   Typography,
//   Tooltip,
//   IconButton,
//   Divider,
//   alpha,
// } from "@mui/material";
// import { Children, useState } from "react";
// import AddIcon from "@mui/icons-material/Add";
// import UploadIcon from "@mui/icons-material/Upload";
// import DownloadIcon from "@mui/icons-material/Download";
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// // import type { FilterKey, TeamFiltersProps } from "./filters.types";
// // import { FILTER_OPTIONS, ROLE_FILTER_VISIBILITY } from "./filters.config";
// import FilterSelect from "./FilterSelect";
// import type { FilterKey, TeamFiltersProps } from "./filters.types";
// import {
//   FILTER_OPTIONS,
//   ROLE_FILTER_VISIBILITY,
// } from "../../../app/config/filters.config";

// const FILTER_LABELS: Record<FilterKey, string> = {
//   domain: "Domain",
//   subDomain: "Sub Domain",
//   teamFunction: "Team Function",
//   teamSubFunction: "Team Sub Function",
// };

// const TeamFilters = ({
//   values,
//   onChange,
//   role,
//   status,
//   onStatusChange,
// }: TeamFiltersProps) => {
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const visibleFilters = ROLE_FILTER_VISIBILITY[role] ?? [];

//   return (
//     <Box
//       sx={(theme) => ({
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         gap: 2,
//         px: 3,
//         py: 2,
//         borderRadius: 3,
//         background: `linear-gradient(180deg, ${alpha(
//           theme.palette.background.paper,
//           0.9
//         )}, ${theme.palette.background.paper})`,
//         border: `1px solid ${theme.palette.divider}`,
//         boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
//       })}
//     >
//       {/* LEFT */}

//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           width: "50%",
//         }}
//       >
//         {visibleFilters.map((key) => (
//           <FilterSelect
//             key={key}
//             label={FILTER_LABELS[key]}
//             value={values[key]}
//             options={FILTER_OPTIONS[key]}
//             onChange={(value) => onChange(key, value)}
//           />
//         ))}
//       </Box>
//       {
//         <>{Children}</>
//       }
//     </Box>
//   );
// };

// export default TeamFilters;

// import {
//   Box,
//   Button,
//   Chip,
//   Menu,
//   MenuItem,
//   Stack,
//   Typography,
//   Tooltip,
//   IconButton,
//   Divider,
// } from "@mui/material";
// import { useState } from "react";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
// import AddIcon from "@mui/icons-material/Add";
// import UploadIcon from "@mui/icons-material/Upload";
// import DownloadIcon from "@mui/icons-material/Download";
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import type { FilterKey, TeamFiltersProps } from "./types";
// import {
//   FILTER_OPTIONS,
//   ROLE_FILTER_VISIBILITY,
// } from "../../../app/config/filters.config";
// import FilterSelect from "./FilterSelect";

// const FILTER_LABELS: Record<FilterKey, string> = {
//   domain: "Domain",
//   subDomain: "Sub Domain",
//   teamFunction: "Team Function",
//   teamSubFunction: "Team Sub Function",
// };
// const TeamFilter = ({ values, onChange, role }: TeamFiltersProps) => {
//   const [status, setStatus] = useState<"active" | "inactive">("active");
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   const visibleFilters = ROLE_FILTER_VISIBILITY[role] ?? [];

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         px: 2,
//         py: 1.5,
//         borderRadius: 3,
//         bgcolor: "rgba(255,255,255,0.75)",
//         backdropFilter: "blur(12px)",
//         border: "1px solid rgba(0,0,0,0.06)",
//         boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
//         width: "100%",
//       }}
//     >
//       {/* LEFT SECTION */}
//       <Stack direction="row" spacing={2} alignItems="center">
//         <Stack direction="row" spacing={1} alignItems="center">
//           <FilterAltOutlinedIcon fontSize="small" />
//           <Typography fontWeight={600}>Filters</Typography>
//         </Stack>

//        <Box sx={{ display: "flex", gap: 2 }}>
//          {visibleFilters.map((filterKey) => (
//           <FilterSelect
//             key={filterKey}
//             label={FILTER_LABELS[filterKey]}
//             value={values[filterKey]}
//             options={FILTER_OPTIONS[filterKey]}
//             onChange={(value) => onChange(filterKey, value)}
//           />
//         ))}
//        </Box>

//         {/* STATUS TOGGLE */}
//         <Stack
//           direction="row"
//           spacing={0.5}
//           sx={{
//             p: 0.5,
//             borderRadius: 2,
//             bgcolor: "rgba(0,0,0,0.04)",
//           }}
//         >
//           <Chip
//             icon={<CheckCircleIcon />}
//             label="Active"
//             clickable
//             color={status === "active" ? "success" : "default"}
//             variant={status === "active" ? "filled" : "outlined"}
//             onClick={() => setStatus("active")}
//             sx={{
//               fontWeight: 600,
//               transition: "all 0.2s ease",
//             }}
//           />
//           <Chip
//             icon={<RadioButtonUncheckedIcon />}
//             label="Inactive"
//             clickable
//             color={status === "inactive" ? "warning" : "default"}
//             variant={status === "inactive" ? "filled" : "outlined"}
//             onClick={() => setStatus("inactive")}
//             sx={{
//               fontWeight: 600,
//               transition: "all 0.2s ease",
//             }}
//           />
//         </Stack>
//       </Stack>

//       {/* RIGHT SECTION */}
//       <Stack direction="row" spacing={1} alignItems="center">
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => {}}
//           sx={{
//             borderRadius: 2,
//             px: 2,
//             fontWeight: 600,
//           }}
//         >
//           Add Member
//         </Button>

//         <Divider orientation="vertical" flexItem />

//         <Tooltip title="Import members">
//           <IconButton
//             onClick={() => {}}
//             sx={{
//               border: "1px solid",
//               borderColor: "divider",
//               borderRadius: 2,
//             }}
//           >
//             <UploadIcon />
//           </IconButton>
//         </Tooltip>

//         <Tooltip title="Export data">
//           <IconButton
//             onClick={(e) => setAnchorEl(e.currentTarget)}
//             sx={{
//               border: "1px solid",
//               borderColor: "divider",
//               borderRadius: 2,
//             }}
//           >
//             <DownloadIcon />
//           </IconButton>
//         </Tooltip>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={() => setAnchorEl(null)}
//           PaperProps={{
//             sx: {
//               borderRadius: 2,
//               mt: 1,
//               minWidth: 140,
//             },
//           }}
//         >
//           <MenuItem onClick={() => {}}>Export as CSV</MenuItem>
//           <MenuItem onClick={() => {}}>Export as Excel</MenuItem>
//         </Menu>
//       </Stack>
//     </Box>
//   );
// };

// export default TeamFilter;

// import { Box } from "@mui/material";
// import { FILTER_OPTIONS, ROLE_FILTER_VISIBILITY } from "../../../app/config/filters.config";
// import FilterSelect from "./FilterSelect";
// import type { FilterKey, TeamFiltersProps } from "./types";

// const FILTER_LABELS: Record<FilterKey, string> = {
//   domain: "Domain",
//   subDomain: "Sub Domain",
//   teamFunction: "Team Function",
//   teamSubFunction: "Team Sub Function",
// };

// const TeamFilters = ({ values, onChange, role }: TeamFiltersProps) => {
//   const visibleFilters = ROLE_FILTER_VISIBILITY[role] ?? [];

//   return (
//     <Box sx={{ display: "flex", gap: 2 }}>
//       {visibleFilters.map((filterKey) => (
//         <FilterSelect
//           key={filterKey}
//           label={FILTER_LABELS[filterKey]}
//           value={values[filterKey]}
//           options={FILTER_OPTIONS[filterKey]}
//           onChange={(value) => onChange(filterKey, value)}
//         />
//       ))}
//     </Box>
//   );
// };

// export default TeamFilters;
