import { Box, Typography, Card, Chip, Avatar, Stack } from "@mui/material";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { dummyDashboardData } from "../api/dashboard.dummy";

export default function WeeklyRoster() {
  const { employee, schedule } = dummyDashboardData.roster;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // p: 1.5,
          borderBottom: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* <CalendarMonthOutlinedIcon
          sx={{ color: "#475569", mr: 1, fontSize: 18 }}
        />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#0F172A" }}
        >
          Weekly Schedule
        </Typography> */}
      </Box>

      <Box  sx={{ display: "flex" }}>
        {/* Compact Employee Column */}
        <Box
          sx={{
            minWidth: 200,
            p: 1,
            borderRight: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor: "#F8FAFC",
            justifyContent: "center",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "#4F46E5",
                width: 36,
                height: 36,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {employee.initials}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "#0F172A", fontWeight: 700, lineHeight: 1.2 }}
              >
                {employee.name}
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
                {employee.role}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={employee.id}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: "white",
                border: "1px solid #E2E8F0",
              }}
            />
            <Chip
              label="Full Time"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: "white",
                border: "1px solid #E2E8F0",
              }}
            />
          </Stack>
        </Box>

        {/* Compact Days Columns */}
        {schedule.map((day, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              minWidth: 100,
              display: "flex",
              flexDirection: "column",
              borderRight:
                index < schedule.length - 1 ? "1px solid #E2E8F0" : "none",
            }}
          >
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderBottom: "1px solid #E2E8F0",
                bgcolor: "white",
              }}
            >
              <Typography
                sx={{
                  color: "#64748B",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {day.day}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#0F172A", fontWeight: 700, fontSize: "0.8rem" }}
              >
                {day.date}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: day.type === "off" ? "#F8FAFC" : "white",
              }}
            >
              {day.type === "off" ? (
                <Stack alignItems="center" spacing={0.5} sx={{ opacity: 0.6 }}>
                  <WeekendOutlinedIcon
                    sx={{ color: "#94A3B8", fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    Weekly Off
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    w: "100%",
                    bgcolor: "#EEF2FF",
                    py: 1,
                    px: 0.5,
                    borderRadius: 2,
                    border: "1px solid #E0E7FF",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#4F46E5",
                    }}
                  >
                    {day.shift}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 12, color: "#6366F1" }} />
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: "#4F46E5",
                        fontWeight: 500,
                      }}
                    >
                      {day.time}
                    </Typography>
                  </Stack>
                  <Chip
                    label={`${day.mins}m`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.6rem",
                      bgcolor: "transparent",
                      color: "#4F46E5",
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// // import {
// //   Box,
// //   Typography,
// //   Chip,
// //   useTheme,
// //   Stack,
// //   Grid,
// //   Paper,
// // } from "@mui/material";
// // import { alpha } from "@mui/material/styles";
// // import AccessTimeIcon from "@mui/icons-material/AccessTime";
// // import { weeklyRoster } from "../api/dashboard.mock";
// // import SectionCard from "./common/SectionCard";

// // const PremiumWeeklyRoster = () => {
// //   const theme = useTheme();

// //   const today = new Date()
// //     .toLocaleDateString("en-US", { weekday: "short" })
// //     .slice(0, 3);

// //   const getModeColor = (mode: string) => {
// //     switch (mode) {
// //       case "WFO":
// //         return theme.palette.success.main;
// //       case "WFH":
// //         return theme.palette.primary.main;
// //       case "Leave":
// //         return theme.palette.error.main;
// //       default:
// //         return theme.palette.grey[500];
// //     }
// //   };

// //   const wfoCount = weeklyRoster.filter(r => r.mode === "WFO").length;
// //   const wfhCount = weeklyRoster.filter(r => r.mode === "WFH").length;
// //   const leaveCount = weeklyRoster.filter(r => r.mode === "Leave").length;

// //   return (
// //     <SectionCard
// //       title="Weekly Roster"
// //       action={
// //         <Typography
// //           variant="caption"
// //           sx={{ cursor: "pointer", fontWeight: 600 }}
// //         >
// //           View Full →
// //         </Typography>
// //       }
// //     >
// //       {/* Summary */}
// //       <Stack direction="row" spacing={1} mb={2}>
// //         <Chip label={`WFO ${wfoCount}`} size="small" color="success" />
// //         <Chip label={`WFH ${wfhCount}`} size="small" color="primary" />
// //         <Chip label={`Leave ${leaveCount}`} size="small" color="error" />
// //       </Stack>

// //       {/* Week Grid */}
// //       <Grid container spacing={1}>
// //         {weeklyRoster.map((item) => {
// //           const isToday = item.day === today;
// //           const modeColor = getModeColor(item.mode);

// //           return (
// //             <Grid
// //             // item xs={6} sm={4} md={2.4}
// //             // size={12} md={6} lg={2.4}
// //             size={{ xs: 6, sm: 4, md: 2.4 }}
// //             key={item.day}

// //             >
// //               <Paper
// //                 elevation={0}
// //                 sx={{
// //                   p: 1.5,
// //                   borderRadius: 3,
// //                   textAlign: "center",
// //                   border: `1px solid ${alpha(modeColor, 0.3)}`,
// //                   background: isToday
// //                     ? alpha(modeColor, 0.1)
// //                     : alpha(theme.palette.background.paper, 1),
// //                   transition: "all 0.25s ease",
// //                   cursor: "pointer",
// //                   "&:hover": {
// //                     transform: "translateY(-6px)",
// //                     boxShadow: 3,
// //                   },
// //                 }}
// //               >
// //                 <Typography
// //                   fontWeight={isToday ? 700 : 600}
// //                   color={isToday ? modeColor : "text.primary"}
// //                 >
// //                   {item.day}
// //                 </Typography>

// //                 {isToday && (
// //                   <Chip
// //                     label="Today"
// //                     size="small"
// //                     sx={{
// //                       mt: 0.5,
// //                       fontSize: 10,
// //                       height: 18,
// //                       backgroundColor: alpha(modeColor, 0.15),
// //                       color: modeColor,
// //                     }}
// //                   />
// //                 )}

// //                 <Box mt={1}>
// //                   <Chip
// //                     label={item.mode}
// //                     size="small"
// //                     sx={{
// //                       fontWeight: 600,
// //                       backgroundColor: alpha(modeColor, 0.12),
// //                       color: modeColor,
// //                     }}
// //                   />
// //                 </Box>

// //                 <Stack
// //                   direction="row"
// //                   justifyContent="center"
// //                   alignItems="center"
// //                   spacing={0.5}
// //                   mt={1}
// //                 >
// //                   <AccessTimeIcon
// //                     sx={{ fontSize: 14, color: "text.secondary" }}
// //                   />
// //                   <Typography variant="caption">
// //                     {item.start} – {item.end}
// //                   </Typography>
// //                 </Stack>
// //               </Paper>
// //             </Grid>
// //           );
// //         })}
// //       </Grid>
// //     </SectionCard>
// //   );
// // };

// // export default PremiumWeeklyRoster;

// import {
//   Stack,
//   Box,
//   Typography,
//   Chip,
//   Divider,
//   useTheme,
// } from "@mui/material";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
// import { alpha } from "@mui/material/styles";
// import { weeklyRoster } from "../api/dashboard.mock";
// import SectionCard from "./common/SectionCard";

// const WeeklyRoster = () => {
//   const theme = useTheme();

//   const today = new Date()
//     .toLocaleDateString("en-US", { weekday: "short" })
//     .slice(0, 3);

//   const getModeColor = (mode: string) => {
//     switch (mode) {
//       case "WFO":
//         return theme.palette.success.main;
//       case "WFH":
//         return theme.palette.primary.main;
//       case "Leave":
//         return theme.palette.error.main;
//       default:
//         return theme.palette.grey[500];
//     }
//   };

//   return (
//     <SectionCard
//       title="Weekly Roster"
//       action={
//         <Typography
//           variant="caption"
//           sx={{
//             cursor: "pointer",
//             fontWeight: 600,
//             color: theme.palette.primary.main,
//           }}
//         >
//           View Full Roster →
//         </Typography>
//       }
//     >
//       <Stack spacing={1}>
//         {weeklyRoster.map((item, index) => {
//           const isToday = item.day === today;
//           const modeColor = getModeColor(item.mode);

//           return (
//             <Box key={item.day}>
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   p: 1,
//                   borderRadius: 3,
//                   transition: "all 0.25s ease",
//                   background: isToday
//                     ? alpha(theme.palette.primary.main, 0.08)
//                     : "transparent",
//                   "&:hover": {
//                     background: alpha(modeColor, 0.08),
//                     transform: "translateX(4px)",
//                   },
//                 }}
//               >
//                 {/* Left Side (Day + Indicator) */}
//                 <Box display="flex" alignItems="center" gap={1.5}>
//                   <FiberManualRecordIcon
//                     sx={{
//                       fontSize: 12,
//                       color: modeColor,
//                     }}
//                   />

//                   <Typography
//                     fontWeight={isToday ? 700 : 500}
//                     color={isToday ? "primary" : "text.primary"}
//                   >
//                     {item.day}
//                   </Typography>

//                   {isToday && (
//                     <Chip
//                       label="Today"
//                       size="small"
//                       color="primary"
//                       sx={{ height: 22 }}
//                     />
//                   )}
//                 </Box>

//                 {/* Middle (Mode Badge) */}
//                 <Chip
//                   label={item.mode}
//                   size="small"
//                   sx={{
//                     fontWeight: 600,
//                     backgroundColor: alpha(modeColor, 0.12),
//                     color: modeColor,
//                   }}
//                 />

//                 {/* Right (Time) */}
//                 <Box display="flex" alignItems="center" gap={0.5}>
//                   <AccessTimeIcon
//                     sx={{
//                       fontSize: 16,
//                       color: "text.secondary",
//                     }}
//                   />
//                   <Typography variant="caption" color="text.secondary">
//                     {item.start} – {item.end}
//                   </Typography>
//                 </Box>
//               </Box>

//               {index !== weeklyRoster.length - 1 && (
//                 <Divider sx={{ ml: 4 }} />
//               )}
//             </Box>
//           );
//         })}
//       </Stack>
//     </SectionCard>
//   );
// };

// export default WeeklyRoster;

// // import { Stack, Box, Typography } from "@mui/material";
// // // import SectionCard from "../../../components/common/SectionCard";
// // // import StatusChip from "../../../components/ui/StatusChip";
// // import { weeklyRoster } from "../api/dashboard.mock";
// // import SectionCard from "./common/SectionCard";
// // import StatusChip from "./ui/StatusChip";

// // const WeeklyRoster = () => {
// //   return (
// //     <SectionCard title="Weekly Roster">
// //       <Stack spacing={2}>
// //         {weeklyRoster.map((item) => (
// //           <Box
// //             key={item.day}
// //             display="flex"
// //             justifyContent="space-between"
// //             alignItems="center"
// //           >
// //             <Typography>{item.day}</Typography>
// //             <StatusChip label={item.mode} />
// //             <Typography variant="caption">
// //               {item.start} - {item.end}
// //             </Typography>
// //           </Box>
// //         ))}
// //       </Stack>
// //     </SectionCard>
// //   );
// // };

// // export default WeeklyRoster;
