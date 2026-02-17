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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { options, isLoading } = useOrgHierarchyFilters(filters);

  const handleFilterChange = (key: keyof OrgFilterValues, value?: number) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // Reset lower hierarchy when parent changes
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
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          
        }}
      >
        {/* LEFT SIDE */}
        <Stack direction="row" spacing={5} alignItems="center">
          <Stack direction="row" spacing={0.5} sx={{ pr: 2 }}>
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
        </Stack>

        {/* RIGHT SIDE */}
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
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                console.log("Export PDF");
              }}
            >
              Export PDF
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                console.log("Export Excel");
              }}
            >
              Export Excel
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
    </OrgHierarchyFilters>
  );
};

// import { useState } from "react";
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

// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   pdf,
// } from "@react-pdf/renderer";

// import { authStorage } from "../../../../app/store/auth.storage";
// import { useOrgHierarchyFilters } from "../../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import OrgHierarchyFilters from "../../../orgHierarchy/components/OrgHierarchyFilters";
// import type { OrgFilterValues } from "../../../orgHierarchy/types/orgHierarchy.types";

// interface Props {
//   filters: OrgFilterValues;
//   setFilters: React.Dispatch<React.SetStateAction<OrgFilterValues>>;
//   status: "ACTIVE" | "INACTIVE";
//   setStatus: React.Dispatch<React.SetStateAction<"ACTIVE" | "INACTIVE">>;
//   exportData: any[]; // current paginated data
// }

// export const TeamManagementFilter = ({
//   filters,
//   setFilters,
//   status,
//   setStatus,
//   exportData,
// }: Props) => {
//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   const { options, isLoading } = useOrgHierarchyFilters(filters);

//   /* ==========================================================
//      EXCEL EXPORT (exceljs)
//   ========================================================== */

//   const handleExportExcel = async () => {
//     if (!exportData.length) return;

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Employees");

//     const headers = Object.keys(exportData[0]);

//     worksheet.columns = headers.map((key) => ({
//       header: key.replace(/([A-Z])/g, " $1"),
//       key,
//       width: 20,
//     }));

//     exportData.forEach((row) => {
//       worksheet.addRow(row);
//     });

//     // Style header
//     worksheet.getRow(1).font = { bold: true };

//     const buffer = await workbook.xlsx.writeBuffer();

//     const blob = new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(blob, `Employees_${status}_Page.xlsx`);
//   };

//   /* ==========================================================
//      PDF EXPORT (react-pdf)
//   ========================================================== */

//   const styles = StyleSheet.create({
//     page: {
//       padding: 20,
//       fontSize: 8,
//     },
//     tableRow: {
//       flexDirection: "row",
//       borderBottom: 1,
//       borderColor: "#ddd",
//       paddingVertical: 4,
//     },
//     cell: {
//       flex: 1,
//       paddingRight: 4,
//     },
//     header: {
//       fontWeight: "bold",
//       backgroundColor: "#eee",
//     },
//   });

//   const MyPdfDocument = () => (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={{ marginBottom: 10 }}>Employees - {status}</Text>

//         {/* Header Row */}
//         <View style={[styles.tableRow, styles.header]}>
//           {Object.keys(exportData[0] || {}).map((key) => (
//             <Text key={key} style={styles.cell}>
//               {key.replace(/([A-Z])/g, " $1")}
//             </Text>
//           ))}
//         </View>

//         {/* Data Rows */}
//         {exportData.map((row, index) => (
//           <View key={index} style={styles.tableRow}>
//             {Object.values(row).map((value, i) => (
//               <Text key={i} style={styles.cell}>
//                 {String(value ?? "")}
//               </Text>
//             ))}
//           </View>
//         ))}
//       </Page>
//     </Document>
//   );

//   const handleExportPDF = async () => {
//     if (!exportData.length) return;

//     const blob = await pdf(<MyPdfDocument />).toBlob();
//     saveAs(blob, `Employees_${status}_Page.pdf`);
//   };

//   /* ==========================================================
//      FILTER LOGIC
//   ========================================================== */

//   const handleFilterChange = (key: keyof OrgFilterValues, value?: number) => {
//     setFilters((prev) => {
//       const next = { ...prev, [key]: value };

//       if (key === "vertical") {
//         delete next.teamFunction;
//         delete next.domain;
//         delete next.subDomain;
//       }
//       if (key === "teamFunction") {
//         delete next.domain;
//         delete next.subDomain;
//       }
//       if (key === "domain") {
//         delete next.subDomain;
//       }

//       return next;
//     });
//   };

//   if (isLoading) return null;

//   return (
//     <OrgHierarchyFilters
//       role={roleName}
//       values={filters}
//       options={options}
//       onChange={handleFilterChange}
//     >
//       <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//         <Stack direction="row" spacing={0.5}>
//           <Chip
//             icon={<CheckCircleIcon />}
//             label="Active"
//             color={status === "ACTIVE" ? "success" : "default"}
//             variant={status === "ACTIVE" ? "filled" : "outlined"}
//             onClick={() => setStatus("ACTIVE")}
//           />

//           <Chip
//             icon={<RadioButtonUncheckedIcon />}
//             label="Inactive"
//             color={status === "INACTIVE" ? "warning" : "default"}
//             variant={status === "INACTIVE" ? "filled" : "outlined"}
//             onClick={() => setStatus("INACTIVE")}
//           />
//         </Stack>

//         <Stack direction="row" spacing={1}>
//           <Tooltip title="Export">
//             <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
//               <DownloadIcon />
//             </IconButton>
//           </Tooltip>

//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={() => setAnchorEl(null)}
//           >
//             <MenuItem
//               onClick={() => {
//                 setAnchorEl(null);
//                 handleExportPDF();
//               }}
//             >
//               Export PDF
//             </MenuItem>

//             <MenuItem
//               onClick={() => {
//                 setAnchorEl(null);
//                 handleExportExcel();
//               }}
//             >
//               Export Excel
//             </MenuItem>
//           </Menu>
//         </Stack>
//       </Box>
//     </OrgHierarchyFilters>
//   );
// };