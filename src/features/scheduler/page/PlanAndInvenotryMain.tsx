import { Box, Card, CardContent, useTheme } from "@mui/material";
import { authStorage } from "../../../app/store/auth.storage";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";

// Stepper Imports
import { AppStepper } from "../../../components/ui/AppStepper/AppStepper";
import { useStepper } from "../../../hooks/useStepper";

// Icons matching your screenshot UI
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import type { IStep } from "../../../components/ui/AppStepper/types";
import { useTabColorTokens } from "../../../style/theme";
import {PlanAndInventoryPage} from "../components/plan-and-inventory/PlanAndInventoryPage";

// Step Configuration Mapping
const WORKFLOW_STEPS: IStep[] = [
  {
    id: 1,
    label: "CRQ assignment",
    icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  },
  {
    id: 2,
    label: "Plan & inventory",
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    id: 3,
    label: "Impact analysis",
    icon: <MonitorHeartOutlinedIcon fontSize="small" />,
  },
  {
    id: 4,
    label: "MOP creation",
    icon: <NoteAddOutlinedIcon fontSize="small" />,
  },
  {
    id: 5,
    label: "MOP validation",
    icon: <FactCheckOutlinedIcon fontSize="small" />,
  },
  {
    id: 6,
    label: "Scheduling",
    icon: <EditCalendarOutlinedIcon fontSize="small" />,
  },
  { id: 7, label: "Network exec", icon: <WifiOutlinedIcon fontSize="small" /> },
  {
    id: 8,
    label: "Task closure",
    icon: <TaskAltOutlinedIcon fontSize="small" />,
  },
];

export const PlanAndInventoryMain = () => {
  // Existing Hook Logic
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);
  const theme = useTheme();
  const tk = useTabColorTokens(theme);
  // Initialize Stepper (Setting default to 1 -> "Plan & inventory")
  const { activeStep, goToStep } = useStepper(1, WORKFLOW_STEPS.length);

  return (
    <Box sx={{ p: { xs: 1, md: 0 } }}>
      {/* Top Stepper Card */}
      <OrgHierarchyFilters
        role={roleName}
        values={values}
        options={options}
        onChange={handleChange}
      />

      <Box
        sx={{
          // mb: 1.5,
          pt: 2,
          overflow: "auto",
          // border: `1px solid ${tk.accentDim}`,
          borderRadius: tk.radiusL,
          transition: "background .18s, transform .16s",
        }}
      >
        <AppStepper
          // sx={{}}
          steps={WORKFLOW_STEPS}
          activeStep={activeStep}
          onStepClick={goToStep}
        />
      </Box>

      
      {activeStep === 0 && <h1>CRQ Assignment</h1>}
      {activeStep === 1 && <PlanAndInventoryPage/>}
      {activeStep === 2 && <h1>Impact analysis</h1>}
      {activeStep === 3 && <h1>MOP creation</h1>}
      {activeStep === 4 && <h1>MOP validation</h1>}
      {activeStep === 5 && <h1>Scheduling</h1>}
      {activeStep === 6 && <h1>Network exec</h1>}
      {activeStep === 7 && <h1>Task closure</h1>}

    </Box>
  );
};

// import { authStorage } from "../../../app/store/auth.storage";
// import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
// import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
// import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";

// export const PlanAndInventoryMain = () => {
//   const loggedUser = authStorage.getUser();
//   const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
//   const { values, handleChange } = useOrgHierarchyState();
//   const { options } = useOrgHierarchyFilters(values);

//   return (
//     <div>
//       <OrgHierarchyFilters
//         role={roleName}
//         values={values}
//         options={options}
//         onChange={handleChange}
//       />
//     </div>
//   );
// };
