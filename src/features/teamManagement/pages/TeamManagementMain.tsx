import { Box } from "@mui/material";
import { TeamTopInfoCard } from "../components/topInfoCard/TopInfoCardMain";
export const TeamManagementMain = () => {
  return (
    <Box>
      <Box
        sx={{
          // display: "flex",
          justifyContent: "space-between",
          // p: "2px 0px 4px 0px",
        }}
      >
        <Box
        //  sx={{ bgcolor: "orange" }}
        
        >
          <TeamTopInfoCard levelCount={[]} />
        </Box>
        <Box sx={{ bgcolor: "white" }}>Filter Section</Box>

        <Box sx={{ bgcolor: "green" }}>
          Actual Team management Implementation{" "}
        </Box>
      </Box>
    </Box>
  );
};
