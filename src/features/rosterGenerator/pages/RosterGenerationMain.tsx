import { Box, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { authStorage } from "../../../app/store/auth.storage";
import OrgHierarchyFilters from "../../orgHierarchy/components/OrgHierarchyFiltersV2";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useTabColorTokens } from "../../../style/theme";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// import { Week7PreviewScreen } from "../components/RosterCycleScreens";
import GoldenGridScreen from "../components/Goldengridscreen";
// import NoDataFound from "../assets/NoDataFound.svg"; // adjust path as needed

import NoDataFound from "../../../assets/svg/NoDataFound.svg"; // adjust path as needed
import GridScreen from "../components/RosterCycleScreens";
import GridscreenMain from "../components/Week7Preview/GridscreenMain";

const TABS = [
  {
    id: "golden",
    label: "Golden set roster",
    icon: <LayersOutlinedIcon sx={{ fontSize: 15 }} />,
  },
  {
    id: "week7",
    label: "Week 7 preview",
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />,
  },
];

export const RosterGenerationMain = () => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { values, handleChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);
  const theme = useTheme();
  const tk = useTabColorTokens(theme);
  const isDark = tk.isDark;

  const [activeTab, setActiveTab] = useState(0);

  const hasSubDomain = Boolean(values.subDomain);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: tk.bg,
      }}
    >
      {/* ── Filters ── */}
      <Box sx={{ flexShrink: 0, px: 1.5, pt: 1, pb: 0.75 }}>
        <OrgHierarchyFilters
          role={roleName}
          values={values}
          options={options}
          onChange={handleChange}
        />
      </Box>

      {/* ── Tab bar + content card ── */}
      <Box
        sx={{
          flex: 1,
          mx: 1.5,
          mb: 1.5,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${tk.border}`,
          borderRadius: tk.radiusL,
          overflow: "hidden",
          bgcolor: tk.surface,
          minHeight: 0,
        }}
      >
        {/* Tab strip */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "stretch",
            borderBottom: `1px solid ${tk.border}`,
            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(13,27,42,0.015)",
            px: 1,
            pt: 0.5,
            gap: 0.5,
          }}
        >
          {TABS.map((tab, i) => {
            const isActive = activeTab === i;
            const accentColor = i === 0 ? tk.accent : tk.success;
            const accentDim = i === 0 ? tk.accentDim : tk.successDim;

            return (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(i)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.9,
                  cursor: "pointer",
                  borderRadius: "8px 8px 0 0",
                  borderBottom: isActive
                    ? `2px solid ${accentColor}`
                    : "2px solid transparent",
                  bgcolor: isActive ? tk.surface : "transparent",
                  transition: "all .15s",
                  "&:hover": {
                    bgcolor: isActive ? tk.surface : accentDim,
                  },
                  mb: isActive ? "-1px" : 0,
                  zIndex: isActive ? 1 : 0,
                  position: "relative",
                }}
              >
                {/* Dot indicator */}
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: isActive ? accentColor : tk.textDim,
                    transition: "background .15s",
                    flexShrink: 0,
                  }}
                />

                {/* Icon */}
                <Box
                  sx={{
                    color: isActive ? accentColor : tk.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    transition: "color .15s",
                  }}
                >
                  {tab.icon}
                </Box>

                {/* Label */}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? accentColor : tk.textSecondary,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    transition: "all .15s",
                    letterSpacing: isActive ? "0.01em" : 0,
                  }}
                >
                  {tab.label}
                </Typography>

                {/* Active underline pill */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      height: 2,
                      borderRadius: "2px 2px 0 0",
                      bgcolor: accentColor,
                      opacity: 0.35,
                    }}
                  />
                )}
              </Box>
            );
          })}

          {/* Right-side meta info */}
          <Box sx={{ flex: 1 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pr: 0.5,
              pb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                color: tk.textDim,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {activeTab === 0 ? "Roster cycle view" : "7-day schedule preview"}
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: activeTab === 0 ? tk.accent : tk.success,
                opacity: 0.6,
              }}
            />
          </Box>
        </Box>

        {/* ── Tab content ── */}
        <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          {/* No sub-domain selected → show placeholder */}
          {!hasSubDomain ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={NoDataFound}
                alt="No data"
                sx={{ width: 200, height: "auto", opacity: 0.9 }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  color: tk.textSecondary,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Select a Sub Domain to view roster data
              </Typography>
            </Box>
          ) : (
            <>
              {activeTab === 0 && (
                <GoldenGridScreen
                  teamId={values.teamFunction}
                  subTeamId={values.subDomain}
                />
              )}
              {activeTab === 1 && (
                <GridscreenMain
                  // teamId={values.teamFunction}
                  subDomainId={values.subDomain}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
