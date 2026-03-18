import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Button,
  Chip,
  IconButton,
  Fade,
  keyframes,
} from "@mui/material";
import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

// --- Custom Pulse Animation for the Live Dot ---
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
`;

export default function WorkLocationStatusCard() {
  const [locationStatus, setLocationStatus] = useState<"WFH" | "WFO" | null>(
    null,
  );

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
        border: "1px solid #E2E8F0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              bgcolor: "#0F172A",
              color: "white",
              p: 0.5,
              borderRadius: 1.5,
              display: "flex",
            }}
          >
            <MapsHomeWorkOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}
            >
              Location Status
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
              Daily WFH & WFO Log
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Body Area */}
      <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Table Headers */}
        <Stack
          direction="row"
          sx={{ bgcolor: "#F8FAFC", p: 1, borderRadius: 1.5, mb: 1.5 }}
        >
          <Typography
            sx={{
              flex: 1,
              fontWeight: 600,
              color: "#475569",
              fontSize: "0.7rem",
            }}
          >
            Date
          </Typography>
          <Typography
            sx={{
              flex: 1,
              textAlign: "center",
              fontWeight: 600,
              color: "#475569",
              fontSize: "0.7rem",
            }}
          >
            Shift
          </Typography>
          <Typography
            sx={{
              flex: 1,
              textAlign: "right",
              fontWeight: 600,
              color: "#475569",
              fontSize: "0.7rem",
            }}
          >
            Status
          </Typography>
        </Stack>

        {/* Dynamic Content Area */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* STATE 1: Unlogged / Actionable State */}
          {!locationStatus && (
            <Fade in={!locationStatus}>
              <Box
                sx={{
                  flex: 1,
                  border: "1px dashed #CBD5E1",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 1.5,
                  px: 2,
                  bgcolor: "#F8FAFC50",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#475569", fontWeight: 600 }}
                >
                  Where are you working today?
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HomeOutlinedIcon />}
                    onClick={() => setLocationStatus("WFH")}
                    sx={{
                      color: "#3B82F6",
                      borderColor: "#BFDBFE",
                      bgcolor: "#EFF6FF",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 0.5,
                      "&:hover": { bgcolor: "#DBEAFE", borderColor: "#93C5FD" },
                    }}
                  >
                    WFH
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BusinessOutlinedIcon />}
                    onClick={() => setLocationStatus("WFO")}
                    sx={{
                      color: "#8B5CF6",
                      borderColor: "#DDD6FE",
                      bgcolor: "#F5F3FF",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 0.5,
                      "&:hover": { bgcolor: "#EDE9FE", borderColor: "#C4B5FD" },
                    }}
                  >
                    WFO
                  </Button>
                </Stack>
              </Box>
            </Fade>
          )}

          {/* STATE 2: Logged State with Blinking Dot */}
          {locationStatus && (
            <Fade in={!!locationStatus}>
              <Box
                sx={{
                  flex: 1,
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  bgcolor: "#F8FAFC",
                }}
              >
                {/* Date & Live Status Col */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: "#0F172A",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    Today, {todayDate}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.8}
                    alignItems="center"
                    sx={{ mt: 0.4, ml: 0.2 }}
                  >
                    {/* 🟢 LIVE BLINKING DOT 🟢 */}
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#10B981", // Emerald Green
                        animation: `${pulseAnimation} 2s infinite`, // Applies the pulse
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#10B981",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Active Today
                    </Typography>
                  </Stack>
                </Box>

                {/* Shift Col */}
                <Typography
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    color: "#64748B",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  General
                </Typography>

                {/* Status Col */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Chip
                    icon={
                      locationStatus === "WFH" ? (
                        <HomeOutlinedIcon
                          sx={{ fontSize: "14px !important" }}
                        />
                      ) : (
                        <BusinessOutlinedIcon
                          sx={{ fontSize: "14px !important" }}
                        />
                      )
                    }
                    label={locationStatus}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      bgcolor: locationStatus === "WFH" ? "#EFF6FF" : "#F5F3FF",
                      color: locationStatus === "WFH" ? "#3B82F6" : "#8B5CF6",
                      border: `1px solid ${locationStatus === "WFH" ? "#BFDBFE" : "#DDD6FE"}`,
                    }}
                  />
                  {/* Edit/Reset Button */}
                  <IconButton
                    size="small"
                    onClick={() => setLocationStatus(null)}
                    sx={{
                      color: "#94A3B8",
                      p: 0.5,
                      "&:hover": { color: "#0F172A", bgcolor: "#E2E8F0" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// import { useState } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   Stack,
//   Button,
//   Chip,
//   IconButton,
//   Fade,
// } from "@mui/material";
// import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
// import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// export default function WorkLocationStatusCard() {
//   // Local state to handle the smart inline interaction
//   const [locationStatus, setLocationStatus] = useState<"WFH" | "WFO" | null>(
//     null,
//   );

//   // Get today's formatted date (e.g., "Oct 24")
//   const todayDate = new Date().toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//   });

//   return (
//     <Card
//       sx={{
//         borderRadius: 3,
//         boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
//         border: "1px solid #E2E8F0",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         bgcolor: "#FFFFFF",
//       }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           p: 1.5,
//           borderBottom: "1px solid #F1F5F9",
//         }}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Box
//             sx={{
//               bgcolor: "#0F172A",
//               color: "white",
//               p: 0.5,
//               borderRadius: 1.5,
//               display: "flex",
//             }}
//           >
//             <MapsHomeWorkOutlinedIcon sx={{ fontSize: 18 }} />
//           </Box>
//           <Box>
//             <Typography
//               variant="subtitle2"
//               sx={{ fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}
//             >
//               Location Status
//             </Typography>
//             <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
//               Daily WFH & WFO Log
//             </Typography>
//           </Box>
//         </Stack>
//       </Box>

//       {/* Body Area */}
//       <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>
//         {/* Table Headers */}
//         <Stack
//           direction="row"
//           sx={{ bgcolor: "#F8FAFC", p: 1, borderRadius: 1.5, mb: 1.5 }}
//         >
//           <Typography
//             sx={{
//               flex: 1,
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Date
//           </Typography>
//           <Typography
//             sx={{
//               flex: 1,
//               textAlign: "center",
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Shift
//           </Typography>
//           <Typography
//             sx={{
//               flex: 1,
//               textAlign: "right",
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Status
//           </Typography>
//         </Stack>

//         {/* Dynamic Content Area */}
//         <Box
//           sx={{
//             flex: 1,
//             position: "relative",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           {/* STATE 1: Empty / Actionable State */}
//           {!locationStatus && (
//             <Fade in={!locationStatus}>
//               <Box
//                 sx={{
//                   flex: 1,
//                   border: "1px dashed #CBD5E1",
//                   borderRadius: 2,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   py: 1.5,
//                   px: 2,
//                   bgcolor: "#F8FAFC50",
//                   gap: 1.5,
//                 }}
//               >
//                 <Typography
//                   variant="caption"
//                   sx={{ color: "#475569", fontWeight: 600 }}
//                 >
//                   Where are you working today?
//                 </Typography>

//                 {/* Smart Action Buttons */}
//                 <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     startIcon={<HomeOutlinedIcon />}
//                     onClick={() => setLocationStatus("WFH")}
//                     sx={{
//                       color: "#3B82F6",
//                       borderColor: "#BFDBFE",
//                       bgcolor: "#EFF6FF",
//                       textTransform: "none",
//                       fontWeight: 600,
//                       borderRadius: 2,
//                       py: 0.5,
//                       "&:hover": { bgcolor: "#DBEAFE", borderColor: "#93C5FD" },
//                     }}
//                   >
//                     WFH
//                   </Button>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     startIcon={<BusinessOutlinedIcon />}
//                     onClick={() => setLocationStatus("WFO")}
//                     sx={{
//                       color: "#8B5CF6",
//                       borderColor: "#DDD6FE",
//                       bgcolor: "#F5F3FF",
//                       textTransform: "none",
//                       fontWeight: 600,
//                       borderRadius: 2,
//                       py: 0.5,
//                       "&:hover": { bgcolor: "#EDE9FE", borderColor: "#C4B5FD" },
//                     }}
//                   >
//                     WFO
//                   </Button>
//                 </Stack>
//               </Box>
//             </Fade>
//           )}

//           {/* STATE 2: Logged State (Matches Header Alignment) */}
//           {locationStatus && (
//             <Fade in={!!locationStatus}>
//               <Box
//                 sx={{
//                   flex: 1,
//                   border: "1px solid #E2E8F0",
//                   borderRadius: 2,
//                   display: "flex",
//                   alignItems: "center",
//                   p: 1.5,
//                   bgcolor: "#F8FAFC",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 {/* Date Col */}
//                 <Box sx={{ flex: 1 }}>
//                   <Typography
//                     sx={{
//                       color: "#0F172A",
//                       fontSize: "0.75rem",
//                       fontWeight: 600,
//                     }}
//                   >
//                     Today, {todayDate}
//                   </Typography>
//                   <Stack
//                     direction="row"
//                     spacing={0.5}
//                     alignItems="center"
//                     sx={{ mt: 0.2 }}
//                   >
//                     <CheckCircleIcon sx={{ fontSize: 12, color: "#10B981" }} />
//                     <Typography
//                       sx={{
//                         color: "#10B981",
//                         fontSize: "0.6rem",
//                         fontWeight: 600,
//                       }}
//                     >
//                       Logged
//                     </Typography>
//                   </Stack>
//                 </Box>

//                 {/* Shift Col */}
//                 <Typography
//                   sx={{
//                     flex: 1,
//                     textAlign: "center",
//                     color: "#64748B",
//                     fontSize: "0.75rem",
//                     fontWeight: 500,
//                   }}
//                 >
//                   General
//                 </Typography>

//                 {/* Status Col */}
//                 <Box
//                   sx={{
//                     flex: 1,
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     alignItems: "center",
//                     gap: 0.5,
//                   }}
//                 >
//                   <Chip
//                     icon={
//                       locationStatus === "WFH" ? (
//                         <HomeOutlinedIcon
//                           sx={{ fontSize: "14px !important" }}
//                         />
//                       ) : (
//                         <BusinessOutlinedIcon
//                           sx={{ fontSize: "14px !important" }}
//                         />
//                       )
//                     }
//                     label={locationStatus}
//                     size="small"
//                     sx={{
//                       height: 24,
//                       fontSize: "0.7rem",
//                       fontWeight: 600,
//                       bgcolor: locationStatus === "WFH" ? "#EFF6FF" : "#F5F3FF",
//                       color: locationStatus === "WFH" ? "#3B82F6" : "#8B5CF6",
//                       border: `1px solid ${locationStatus === "WFH" ? "#BFDBFE" : "#DDD6FE"}`,
//                     }}
//                   />
//                   {/* Edit/Reset Button */}
//                   <IconButton
//                     size="small"
//                     onClick={() => setLocationStatus(null)}
//                     sx={{
//                       color: "#94A3B8",
//                       p: 0.5,
//                       "&:hover": { color: "#0F172A", bgcolor: "#E2E8F0" },
//                     }}
//                   >
//                     <EditOutlinedIcon sx={{ fontSize: 16 }} />
//                   </IconButton>
//                 </Box>
//               </Box>
//             </Fade>
//           )}
//         </Box>
//       </Box>
//     </Card>
//   );
// }

// import { Box, Typography, Card, Stack } from "@mui/material";
// import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
// import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

// export default function WorkLocationStatusCard() {
//   return (
//     <Card
//       sx={{
//         borderRadius: 3,
//         boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.02)",
//         border: "1px solid #E2E8F0",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           p: 1.5,
//           borderBottom: "1px solid #F1F5F9",
//         }}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Box
//             sx={{
//               bgcolor: "#0F172A",
//               color: "white",
//               p: 0.5,
//               borderRadius: 1.5,
//               display: "flex",
//             }}
//           >
//             <MapsHomeWorkOutlinedIcon sx={{ fontSize: 18 }} />
//           </Box>
//           <Box>
//             <Typography
//               variant="subtitle2"
//               sx={{ fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}
//             >
//               Location Status
//             </Typography>
//             <Typography sx={{ color: "#64748B", fontSize: "0.65rem" }}>
//               Daily WFH & WFO Log
//             </Typography>
//           </Box>
//         </Stack>
//       </Box>

//       <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>
//         <Stack
//           direction="row"
//           sx={{ bgcolor: "#F8FAFC", p: 1, borderRadius: 1.5, mb: 1.5 }}
//         >
//           <Typography
//             sx={{
//               flex: 1,
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Date
//           </Typography>
//           <Typography
//             sx={{
//               flex: 1,
//               textAlign: "center",
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Shift
//           </Typography>
//           <Typography
//             sx={{
//               flex: 1,
//               textAlign: "right",
//               fontWeight: 600,
//               color: "#475569",
//               fontSize: "0.7rem",
//             }}
//           >
//             Status
//           </Typography>
//         </Stack>

//         <Box
//           sx={{
//             flex: 1,
//             border: "1px dashed #CBD5E1",
//             borderRadius: 2,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             py: 2,
//             bgcolor: "#F8FAFC50",
//             cursor: "pointer",
//           }}
//         >
//           <MapOutlinedIcon sx={{ color: "#94A3B8", fontSize: 24, mb: 0.5 }} />
//           <Typography
//             variant="caption"
//             sx={{ color: "#475569", fontWeight: 600 }}
//           >
//             No location entry today
//           </Typography>
//           <Typography sx={{ color: "#94A3B8", fontSize: "0.65rem" }}>
//             Click to add your location
//           </Typography>
//         </Box>
//       </Box>
//     </Card>
//   );
// }
