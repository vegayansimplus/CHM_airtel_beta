import React, { useState } from "react";
import { Box } from "@mui/material";
import NetworkFreezeTable from "../components/Networkfreezetable";
import { HolidayListTable } from "../components/Holidaylisttable";
import CommonContainer from "../../../../components/common/CommonContainer";
import { CommonContainerWithoutTab } from "../../../../components/common/ContainerWithoutTab";

const HolidayAndNetworkScheduleManagerMain: React.FC = () => {
  const [refreshHolidayList, setRefreshHolidayList] = useState(false);

  const handleRefreshHolidayList = () => {
    setRefreshHolidayList((prev) => !prev);
  };

  return (
    <CommonContainerWithoutTab>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 0.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3b4fd8 0%, #6c3dd6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </Box>
          <Box>
            <Box
              component="h1"
              sx={{
                fontSize: { xs: "18px", md: "22px" },
                fontWeight: 700,
                color: "#1a1f36",
                letterSpacing: "-0.4px",
                m: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Holiday & Network Schedule Manager
            </Box>
            <Box
              sx={{
                fontSize: "13px",
                color: "#6b7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Manage freeze windows and public holidays across all locations
            </Box>
          </Box>
        </Box>
      </Box>

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
        <HolidayListTable refresh={refreshHolidayList} />
      </Box>
    </CommonContainerWithoutTab>
  );
};

export default HolidayAndNetworkScheduleManagerMain;
