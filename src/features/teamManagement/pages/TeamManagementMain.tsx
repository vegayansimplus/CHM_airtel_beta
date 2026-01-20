import { Box } from "@mui/material";
import { TeamTopInfoCard } from "../components/topInfoCard/TopInfoCardMain";
import { TeamManagementFilter } from "../components/filters/TeamManagementFilter";
import TeamFilterBar from "../../../components/common/filters/TeamFilterBar";
import TeamSkillSetTable from "../components/teamDetailsTable/TeamSkillSetTable";
import { TEAM_SKILLSET_DATA } from "../data/teamSkillset.mock";
// import { TeamManagementFilterMain } from "../components/filters/TeamManagementFilter";
// import { TeamManagementFilterMain } from "../components/filters/teamManagementFilterMain";
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
        <Box sx={{ bgcolor: "white", mt: 0.5 }}>
          <TeamManagementFilter />
          {/* <TeamFilterBar /> */}
          {/* <TeamFilterBar
            role={"admin"}
            functionOptions={"Engineering, QA".split(", ")}
            subFunctionOptions={"React Team, API Team".split(", ")}
            selectedFunction={"Engineering"}
            selectedSubFunction={"React Team"}
            onFunctionChange={e=> console.log("Function changed", e)}
            onSubFunctionChange={e=> console.log("Sub Function changed", e)}
            onAdd={() => console.log("Add Member")}
            onImport={() => console.log("Import")}
            onExport={(type) => console.log("Export", type)}
          /> */}
        </Box>

        <Box sx={{ bgcolor: "white", mt: 2, borderRadius: 2 }}>
          <TeamSkillSetTable data={TEAM_SKILLSET_DATA} userRole="Team Lead" />
        </Box>
      </Box>
    </Box>
  );
};
