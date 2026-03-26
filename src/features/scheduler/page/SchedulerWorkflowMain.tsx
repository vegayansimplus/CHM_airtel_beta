import { Box, Card, useTheme } from "@mui/material";
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

export const SchedulerWorkflowMain = () => {
  // Existing Hook Logic
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  // Initialize Stepper (Setting default to 1 -> "Plan & inventory")
  const { activeStep, goToStep } = useStepper(1, WORKFLOW_STEPS.length);
  const theme = useTheme();
  const tk = useTabColorTokens(theme);

  return (
    <Box sx={{ p: { xs: 1, md: 0 } }}>
      {/* Top Stepper Card */}
      <Card
        sx={{
          mb: 2,
          p: 1,
          overflow: "auto",
          backgroundColor: tk.surface,}}
      >
        <AppStepper
          steps={WORKFLOW_STEPS}
          activeStep={activeStep}
          onStepClick={goToStep}
        />
      </Card>

      <OrgHierarchyFilters
        role={roleName}
        values={values}
        options={options}
        onChange={handleChange}
      />

      {/* 
            You can render different components here conditionally 
            based on the current active step.
            Example:
            {activeStep === 1 && <PlanAndInventoryTable />}

          */}

      {activeStep === 0 && <>Hello</>}
    </Box>
  );
};
