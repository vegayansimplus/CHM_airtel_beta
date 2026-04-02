import { Box, useTheme } from "@mui/material";
import { authStorage } from "../../../app/store/auth.storage";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState"; 
import { AppStepper } from "../../../components/ui/AppStepper/AppStepper";
import { useStepper } from "../../../hooks/useStepper";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import type { IStep } from "../../../components/ui/AppStepper/types";
import { useTabColorTokens } from "../../../style/theme";
import { WeeklyDayScheduleMain } from "./WeeklyDayScheduleMain";

const WORKFLOW_STEPS: IStep[] = [
  {
    id: 1,
    label: "Weekly schedule",
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    id: 2,
    label: "Sat& Sun schedule",
    icon: <MonitorHeartOutlinedIcon fontSize="small" />,
  },
  {
    id:3,
    label:"Member Preferences",
    icon: <NoteAddOutlinedIcon fontSize="small" />
  }
];

export const RosterGenerationMain = () => {
  // Existing Hook Logic
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);
  const theme = useTheme();
  const tk = useTabColorTokens(theme);
  // Initialize Stepper (Setting default to 1 -> "Plan & inventory")
  const { activeStep, goToStep } = useStepper(0, WORKFLOW_STEPS.length);

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

      
      {/* {activeStep === 0 && <h1>CRQ Assignment</h1>} */}
      {activeStep === 0 && <WeeklyDayScheduleMain/>}
      {activeStep === 1 && <h1>Saturday & Sunday Schedule</h1>}
      {activeStep === 2 && <h1>Member Preferences</h1>}
  

    </Box>
  );
};
