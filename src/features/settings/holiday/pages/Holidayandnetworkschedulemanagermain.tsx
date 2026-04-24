import React, { useState } from "react";
import { Box } from "@mui/material";
import NetworkFreezeTable from "../components/Networkfreezetable";
import { HolidayListTable } from "../components/Holidaylisttable";
import { CommonContainerWithoutTab } from "../../../../components/common/ContainerWithoutTab";

const HolidayAndNetworkScheduleManagerMain: React.FC = () => {
  const [refreshHolidayList, setRefreshHolidayList] = useState(false);

  const handleRefreshHolidayList = () => {
    setRefreshHolidayList((prev) => !prev);
  };

  return (
    <>
      {/* Page Header */}
 

      {/* Two-column layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <NetworkFreezeTable onRefresh={handleRefreshHolidayList} />
        <HolidayListTable  />
      </Box>
    </>
  );
};

export default HolidayAndNetworkScheduleManagerMain;
