import {
  Paper,
  Stack,
  IconButton,
  Box,
  Checkbox,
  Chip,
  Button,
  Collapse,
  Typography,
} from "@mui/material";
import type { Colors } from "../../types/colorTypes";
// import CrqInfoCards from "./CrqInfoCards";
// import CrqTaskTable from "./CrqTaskTable";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import StopRoundedIcon from "@mui/icons-material/StopRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CrqInfoCards from "../plan-and-inventory/CrqInfoCards";
import CrqTaskTable from "../plan-and-inventory/CrqTaskTable";
interface CrqCardProps {
  crq: any;
  plan: any;
  isOpen: boolean;
  isSelected: boolean;
  colors: Colors;
  onToggle: () => void;
  onSelect: () => void;
  onStartPause: () => void;
}

export const CrqCard: React.FC<CrqCardProps> = ({
  crq,
  plan,
  isOpen,
  isSelected,
  colors,
  onToggle,
  onSelect,
  onStartPause,
}) => {
  const isFailed = ["canceled", "cancel", "Canceled"].includes(crq.crqStatus);
  const status = crq.impactAnalysisStatus || crq.crqReviewStatus;
  const isRunning = status === "In Progress";

  return (
    <Paper
      elevation={0}
      className="crq-card"
      sx={{
        mb: 1.5,
        borderRadius: colors.radiusL,
        border: `1.5px solid ${isSelected ? colors.accentBorder : colors.border}`,
        bgcolor: isSelected ? colors.accentDim : colors.surface,
        // bgcolor:"red",
        overflow: "hidden",
        transition:
          "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        "&:hover": {
          borderColor: isSelected ? colors.accent : colors.borderHover,
          boxShadow: colors.isDark
            ? "0 4px 22px rgba(0,0,0,0.32)"
            : "0 4px 22px rgba(99,102,241,0.10)",
        },
      }}
    >
      {/* ── Header Row ── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1.1,
          gap: 1.5,
          borderLeft: `3px solid ${isSelected ? colors.accent : "transparent"}`,
          transition: "border-color 0.18s ease",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <IconButton
          size="small"
          onClick={onToggle}
          disableRipple={false}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            flexShrink: 0,
            bgcolor: isOpen ? colors.accentDim : colors.trackOff,
            color: isOpen ? colors.accent : colors.textSecondary,
            border: `1px solid ${isOpen ? colors.accentBorder : colors.border}`,
            "&:hover": {
              bgcolor: colors.accentDim,
              color: colors.accent,
              borderColor: colors.accentBorder,
            },
          }}
        >
          <Box className={`expand-chevron${isOpen ? " open" : ""}`}>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </Box>
        </IconButton>

        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          size="small"
          sx={{
            p: 0,
            flexShrink: 0,
            color: colors.border,
            "&.Mui-checked": { color: colors.accent },
          }}
        />

        {/* <Box
          sx={{
            px: 1.2,
            py: 0.45,
            borderRadius: "7px",
            bgcolor: colors.accentDim,
            border: `1px solid ${colors.accentBorder}`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: colors.accent,
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            {crq.crqNo}
          </Typography>
        </Box> */}

        {/* <Stack direction="row" spacing={0.7} flexShrink={0}>
          {crq.crqStatus && (
            <StatusPill value={crq.crqStatus} colors={colors} />
          )}
          {status && status !== crq.crqStatus && (
            <StatusPill value={status} colors={colors} />
          )}
        </Stack> */}

        {/* Info Cards Container */}
        <Box sx={{ flex: 1, overflowX: "scroll" , width:"60vw"}}>
          <CrqInfoCards crq={crq} colors={colors} />
        </Box>

        {(crq.tasks?.length ?? 0) > 0 && (
          <Chip
            icon={<AssignmentOutlinedIcon style={{ fontSize: 12 }} />}
            label={crq.tasks.length}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: colors.infoDim,
              color: colors.info,
              border: `1px solid ${colors.infoBorder}`,
              "& .MuiChip-icon": { color: colors.info, ml: 0.7, mr: -0.4 },
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        )}

        <Button
          variant="outlined"
          size="small"
          disabled={isFailed}
          startIcon={
            isRunning ? (
              <StopRoundedIcon sx={{ fontSize: "14px !important" }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />
            )
          }
          onClick={onStartPause}
          sx={{
            flexShrink: 0,
            height: 30,
            minWidth: 90,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            borderRadius: "8px",
            px: 1.5,
            transition: "all 0.15s ease",
            ...(isFailed
              ? {
                  bgcolor: colors.trackOff,
                  color: colors.textDim,
                  borderColor: colors.trackOffBorder,
                  "&.Mui-disabled": {
                    bgcolor: colors.trackOff,
                    color: colors.textDim,
                    borderColor: colors.trackOffBorder,
                  },
                }
              : isRunning
                ? {
                    bgcolor: colors.dangerDim,
                    color: colors.danger,
                    borderColor: colors.dangerBorder,
                    "&:hover": {
                      bgcolor: colors.danger,
                      color: "#fff",
                      borderColor: colors.danger,
                    },
                  }
                : {
                    bgcolor: colors.successDim,
                    color: colors.success,
                    borderColor: colors.successBorder,
                    "&:hover": {
                      bgcolor: colors.success,
                      color: "#fff",
                      borderColor: colors.success,
                    },
                  }),
          }}
        >
          {isFailed ? "Disabled" : isRunning ? "Pause" : "Start"}
        </Button>
      </Stack>

      {/* ── Tasks Collapse ── */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            borderRadius: colors.radius,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 0.85,
              bgcolor: colors.infoDim,
              borderBottom: `1px solid ${colors.infoBorder}`,
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 13, color: colors.info }} />
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: colors.info }}
            >
              Tasks
            </Typography>
            <Chip
              label={crq.tasks?.length ?? 0}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: `${colors.info}22`,
                color: colors.info,
                "& .MuiChip-label": { px: 0.7 },
              }}
            />
          </Stack>
          <Box sx={{ bgcolor: colors.surface }}>
            <CrqTaskTable tasks={crq.tasks} colors={colors} />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};


// /**
//  * CrqCard.tsx
//  * Single CRQ row card — header row + collapsible tasks panel.
//  * Composes: StatusPill · CrqInfoCards · CrqActionButton · TasksPanel
//  */
// import React from "react";
// import {
//   Box,
//   Checkbox,
//   Chip,
//   IconButton,
//   Paper,
//   Stack,
//   Typography,
// } from "@mui/material";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
// import type { Colors } from "../../types/colorTypes";
// import { StatusPill } from "../wrapper/StatusPill";
// import CrqInfoCards from "../plan-and-inventory/CrqInfoCards";
// import { TasksPanel } from "./TasksPanel";
// import { CrqActionButton } from "./CrqActionButton";

// // import { StatusPill }      from "./StatusPill";
// // import { CrqActionButton } from "./CrqActionButton";
// // import { TasksPanel }      from "./TasksPanel";
// // import CrqInfoCards        from "./CrqInfoCards";   // existing component
// // import type { Colors }     from "./colorTypes";

// // ─────────────────────────────────────────────────────────────────────────────
// interface CrqCardProps {
//   crq: any;
//   plan: any;
//   isOpen: boolean;
//   isSelected: boolean;
//   colors: Colors;
//   onToggle: () => void;
//   onSelect: () => void;
//   onStartPause: () => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// export const CrqCard: React.FC<CrqCardProps> = ({
//   crq,
//   plan,
//   isOpen,
//   isSelected,
//   colors,
//   onToggle,
//   onSelect,
//   onStartPause,
// }) => {
//   const isFailed  = ["canceled", "cancel", "Canceled"].includes(crq.crqStatus);
//   const status    = crq.impactAnalysisStatus || crq.crqReviewStatus;
//   const isRunning = status === "In Progress";

//   return (
//     <Paper
//       elevation={0}
//       className="crq-card"
//       sx={{
//         mb: 1.5,
//         borderRadius: colors.radiusL,
//         border: `1.5px solid ${isSelected ? colors.accentBorder : colors.border}`,
//         bgcolor: isSelected ? colors.accentDim : colors.surface,
//         overflow: "hidden",
//         transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
//         "&:hover": {
//           borderColor: isSelected ? colors.accent : colors.borderHover,
//           boxShadow: colors.isDark
//             ? "0 4px 22px rgba(0,0,0,0.32)"
//             : "0 4px 22px rgba(99,102,241,0.10)",
//         },
//       }}
//     >
//       {/* ── Header row ─────────────────────────────────────────────────────── */}
//       <Stack
//         direction="row"
//         alignItems="center"
//         sx={{
//           px: 1.5,
//           py: 1.1,
//           gap: 1.5,
//           // Selected left-accent bar
//           borderLeft: `3px solid ${isSelected ? colors.accent : "transparent"}`,
//           transition: "border-color 0.18s ease",
//           overflowX: "auto",
//           "&::-webkit-scrollbar": { display: "none" },
//         }}
//       >
//         {/* Expand chevron */}
//         <IconButton
//           size="small"
//           onClick={onToggle}
//           sx={{
//             width: 28,
//             height: 28,
//             borderRadius: "7px",
//             flexShrink: 0,
//             bgcolor: isOpen ? colors.accentDim : colors.trackOff,
//             color:   isOpen ? colors.accent    : colors.textSecondary,
//             border:  `1px solid ${isOpen ? colors.accentBorder : colors.border}`,
//             "&:hover": {
//               bgcolor: colors.accentDim,
//               color: colors.accent,
//               borderColor: colors.accentBorder,
//             },
//           }}
//         >
//           <Box className={`expand-chevron${isOpen ? " open" : ""}`}>
//             <ChevronRightIcon sx={{ fontSize: 16 }} />
//           </Box>
//         </IconButton>

//         {/* Select checkbox */}
//         <Checkbox
//           checked={isSelected}
//           onChange={onSelect}
//           size="small"
//           sx={{
//             p: 0,
//             flexShrink: 0,
//             color: colors.border,
//             "&.Mui-checked": { color: colors.accent },
//           }}
//         />

//         {/* CRQ number badge */}
//         <Box
//           sx={{
//             px: 1.2,
//             py: 0.45,
//             borderRadius: "7px",
//             bgcolor: colors.accentDim,
//             border: `1px solid ${colors.accentBorder}`,
//             flexShrink: 0,
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: 12,
//               fontWeight: 800,
//               color: colors.accent,
//               fontFamily: "'JetBrains Mono','Fira Code',monospace",
//               letterSpacing: 0.5,
//               lineHeight: 1,
//             }}
//           >
//             {crq.crqNo}
//           </Typography>
//         </Box>

//         {/* Status pills */}
//         <Stack direction="row" spacing={0.7} flexShrink={0}>
//           {crq.crqStatus && (
//             <StatusPill value={crq.crqStatus} colors={colors} />
//           )}
//           {status && status !== crq.crqStatus && (
//             <StatusPill value={status} colors={colors} />
//           )}
//         </Stack>

//         {/* Info cards — grows to fill remaining space */}
//         <Box sx={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
//           <CrqInfoCards crq={crq} colors={colors} />
//         </Box>

//         {/* Task count chip */}
//         {(crq.tasks?.length ?? 0) > 0 && (
//           <Chip
//             icon={<AssignmentOutlinedIcon style={{ fontSize: 12 }} />}
//             label={crq.tasks.length}
//             size="small"
//             sx={{
//               height: 22,
//               fontSize: 11,
//               fontWeight: 700,
//               flexShrink: 0,
//               bgcolor: colors.infoDim,
//               color: colors.info,
//               border: `1px solid ${colors.infoBorder}`,
//               "& .MuiChip-icon":  { color: colors.info, ml: 0.7, mr: -0.4 },
//               "& .MuiChip-label": { px: 0.8 },
//             }}
//           />
//         )}

//         {/* Start / Pause button */}
//         <CrqActionButton
//           isFailed={isFailed}
//           isRunning={isRunning}
//           colors={colors}
//           onClick={onStartPause}
//         />
//       </Stack>

//       {/* ── Collapsible tasks ───────────────────────────────────────────────── */}
//       <TasksPanel tasks={crq.tasks ?? []} isOpen={isOpen} colors={colors} />
//     </Paper>
//   );
// };