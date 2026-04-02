import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  Fade,
  IconButton,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// import { SlideUpTransition } from "../../../../components/common/SlideUpTransition";
// import { PlanInvDialogProps, ThemeColors } from "../../types/crq.types";

import { DialogHeader } from "./DialogHeader";
import { FormPanel } from "./FormPanel";
import { PreviewPanel } from "./PreviewPanel";
import type { PlanInvDialogProps, ThemeColors } from "../../../types/crq.types";
import { SlideUpTransition } from "../../../../../components/common/SlideUpTransition";

export const PlanInvDialog: React.FC<PlanInvDialogProps> = ({
  open,
  onClose,
  crq,
  colors,
  onSubmit,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [panelOpen, setPanelOpen] = useState(true);

  // Derived properties
  const crqNo = crq?.crqNo ?? null;
  const crqId = crq?.crqId ?? null;
  const crqStatus = crq?.crqStatus ?? crq?.status ?? null;
  const isCancelled = ["canceled", "Cancel", "Canceled"].includes(
    crqStatus ?? "",
  );

  // Safe color defaults mapping to theme
  const dialogColors: ThemeColors = {
    accent: colors?.accent ?? theme.palette.primary.main,
    surface: colors?.surface ?? theme.palette.background.paper,
    border: colors?.border ?? theme.palette.divider,
    textPrimary: colors?.textPrimary ?? theme.palette.text.primary,
    textSecondary: colors?.textSecondary ?? theme.palette.text.secondary,
    isDark: colors?.isDark ?? theme.palette.mode === "dark",
  };

  useEffect(() => {
    if (isSmall) setPanelOpen(false);
  }, [isSmall]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isSmall}
      TransitionComponent={SlideUpTransition}
      keepMounted={false}
      PaperProps={{
        elevation: 0,
        sx: {
          height: isSmall ? "100%" : "88vh",
          maxHeight: 780,
          display: "flex",
          flexDirection: "column",
          bgcolor: dialogColors.isDark ? "#131419" : "#F4F5F7",
          borderRadius: isSmall ? 0 : "16px",
          border: `1px solid ${dialogColors.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
        },
      }}
    >
      <DialogHeader
        crqNo={crqNo}
        crqId={crqId}
        isCancelled={isCancelled}
        colors={dialogColors}
        onClose={onClose}
      />

      <Box
        sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}
      >
        <FormPanel
          crq={crq}
          crqNo={crqNo}
          crqId={crqId}
          isCancelled={isCancelled}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
          onClose={onClose}
          onExternalSubmit={onSubmit}
        />

        {/* Float Open Button */}
        <Fade in={!panelOpen && !isSmall}>
          <Tooltip title="Show validation form" placement="right" arrow>
            <IconButton
              onClick={() => setPanelOpen(true)}
              size="small"
              sx={{
                position: "absolute",
                left: 10,
                top: 20,
                zIndex: 40,
                bgcolor: dialogColors.surface,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Fade>

        <PreviewPanel
          crqNo={crqNo}
          crqStatus={crqStatus}
          isCancelled={isCancelled}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          colors={dialogColors}
        />
      </Box>
    </Dialog>
  );
};

export default PlanInvDialog;

// /**
//  * PlanInvDialog.tsx
//  * Professional CRQ Review Dialog — Clean Enterprise Design
//  * MUI v5 · React Hook Form · TypeScript · Fully Accessible
//  */

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   Alert,
//   alpha,
//   Box,
//   Button,
//   Chip,
//   CircularProgress,
//   Collapse,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Slide,
//   Stack,
//   styled,
//   TextField,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";
// import {type TransitionProps } from "@mui/material/transitions";
// import { Controller, useForm } from "react-hook-form";
// import { toast } from "react-toastify";

// // ── Icons ─────────────────────────────────────────────────────────────────────
// import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
// import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import CloseIcon from "@mui/icons-material/Close";
// import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
// import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
// import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
// import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
// import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// // ─────────────────────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────────────────────

// interface ReviewFormInputs {
//   status?: "Done" | "Failed" | "canceled";
//   remark?: string;
//   cygnetStatus?: "REJECT_TO_PLANNING" | "REJECT_TO_OPERATIONS";
//   field1?: string;
//   cancellationReason?: string;
//   field5?: string;
// }

// export interface PlanInvDialogProps {
//   open: boolean;
//   onClose: () => void;
//   crq: any;
//   colors?: {
//     accent?: string;
//     accentDim?: string;
//     border?: string;
//     surface?: string;
//     background?: string;
//     textPrimary?: string;
//     textSecondary?: string;
//     isDark?: boolean;
//   };
//   onSubmit?: (data: any) => void;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Static config
// // ─────────────────────────────────────────────────────────────────────────────

// const STATUS_OPTIONS = [
//   {
//     value: "Done" as const,
//     label: "Pass",
//     description: "Implementation completed successfully",
//     icon: ThumbUpOutlinedIcon,
//     palette: "success" as const,
//   },
//   {
//     value: "Failed" as const,
//     label: "Failed",
//     description: "Implementation did not meet requirements",
//     icon: ThumbDownOutlinedIcon,
//     palette: "error" as const,
//   },
//   {
//     value: "canceled" as const,
//     label: "Cancelled",
//     description: "Implementation was cancelled before completion",
//     icon: CancelOutlinedIcon,
//     palette: "warning" as const,
//   },
// ] as const;

// // ─────────────────────────────────────────────────────────────────────────────
// // Styled primitives
// // ─────────────────────────────────────────────────────────────────────────────

// /** Slide-up dialog entrance */
// const SlideUp = React.forwardRef(function SlideUp(
//   props: TransitionProps & { children: React.ReactElement<any, any> },
//   ref: React.Ref<unknown>,
// ) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// /** Animated status selection card */
// const StatusCard = styled(Box, {
//   shouldForwardProp: (p) =>
//     !["selected", "accent", "isDisabled"].includes(p as string),
// })<{ selected?: boolean; accent?: string; isDisabled?: boolean }>(
//   ({ theme, selected, accent, isDisabled }) => ({
//     position: "relative",
//     display: "flex",
//     alignItems: "flex-start",
//     gap: theme.spacing(1.5),
//     padding: theme.spacing(1.5, 2),
//     borderRadius: 12,
//     border: "1.5px solid",
//     borderColor: selected ? accent : theme.palette.divider,
//     backgroundColor: selected
//       ? alpha(accent!, 0.06)
//       : theme.palette.background.paper,
//     color: selected ? accent : theme.palette.text.secondary,
//     cursor: isDisabled ? "not-allowed" : "pointer",
//     userSelect: "none",
//     opacity: isDisabled ? 0.5 : 1,
//     overflow: "hidden",
//     transition: "all 180ms cubic-bezier(0.4,0,0.2,1)",

//     // Left accent stripe
//     "&::before": {
//       content: '""',
//       position: "absolute",
//       left: 0,
//       top: 0,
//       bottom: 0,
//       width: 3,
//       borderRadius: "12px 0 0 12px",
//       backgroundColor: accent,
//       transform: selected ? "scaleY(1)" : "scaleY(0)",
//       transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
//     },

//     ...(!isDisabled && {
//       "&:hover": {
//         borderColor: accent,
//         backgroundColor: alpha(accent!, 0.05),
//         color: accent,
//         transform: "translateY(-1px)",
//         boxShadow: `0 4px 12px ${alpha(accent!, 0.12)}`,
//       },
//     }),

//     ...(selected && {
//       boxShadow: `0 2px 10px ${alpha(accent!, 0.15)}`,
//     }),
//   }),
// );

// /** Team toggle button */
// const TeamButton = styled(Box, {
//   shouldForwardProp: (p) => !["selected", "accent"].includes(p as string),
// })<{ selected?: boolean; accent?: string }>(({ theme, selected, accent }) => ({
//   flex: 1,
//   textAlign: "center",
//   padding: theme.spacing(0.875, 0.5),
//   borderRadius: 8,
//   border: "1.5px solid",
//   borderColor: selected ? accent : theme.palette.divider,
//   backgroundColor: selected ? accent : "transparent",
//   color: selected ? "#fff" : theme.palette.text.secondary,
//   cursor: "pointer",
//   fontSize: 12,
//   fontWeight: selected ? 600 : 400,
//   letterSpacing: selected ? "0.01em" : 0,
//   userSelect: "none",
//   transition: "all 160ms ease",
//   "&:hover": {
//     borderColor: accent,
//     color: selected ? "#fff" : accent,
//     backgroundColor: selected ? accent : alpha(accent!, 0.07),
//   },
// }));

// /** Subtle uppercase section label */
// const SectionLabel = styled(Typography)(({ theme }) => ({
//   fontSize: 10,
//   fontWeight: 700,
//   letterSpacing: "0.1em",
//   textTransform: "uppercase",
//   color: theme.palette.text.disabled,
// }));

// // ─────────────────────────────────────────────────────────────────────────────
// // Mock CheckPoint preview (replace with actual component)
// // ─────────────────────────────────────────────────────────────────────────────

// const CheckPointSummaryPreview: React.FC<{
//   crqNo?: string | null;
//   crqStatus?: string | null;
// }> = ({ crqNo, crqStatus }) => (
//   <Box
//     sx={{
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "center",
//       minHeight: 220,
//       border: "1.5px dashed",
//       borderColor: "divider",
//       borderRadius: 3,
//       p: 4,
//       gap: 1.5,
//       bgcolor: "background.paper",
//     }}
//   >
//     <Box
//       sx={{
//         width: 52,
//         height: 52,
//         borderRadius: "50%",
//         bgcolor: (t) => alpha(t.palette.text.disabled, 0.08),
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <AssignmentTurnedInOutlinedIcon
//         sx={{ fontSize: 26, color: "text.disabled" }}
//       />
//     </Box>
//     <Typography variant="subtitle2" fontWeight={600} color="text.primary">
//       CheckPoint Summary Preview
//     </Typography>
//     <Stack direction="row" spacing={1} alignItems="center">
//       <Typography variant="body2" color="text.secondary">
//         CRQ:{" "}
//         <Box
//           component="strong"
//           sx={{ color: "text.primary", fontFamily: "monospace" }}
//         >
//           {crqNo || "N/A"}
//         </Box>
//       </Typography>
//       <Box
//         sx={{
//           width: 3,
//           height: 3,
//           borderRadius: "50%",
//           bgcolor: "text.disabled",
//         }}
//       />
//       <Typography variant="body2" color="text.secondary">
//         Status:{" "}
//         <Box component="strong" sx={{ color: "text.primary" }}>
//           {crqStatus || "N/A"}
//         </Box>
//       </Typography>
//     </Stack>
//   </Box>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Dialog
// // ─────────────────────────────────────────────────────────────────────────────

// export const PlanInvDialog: React.FC<PlanInvDialogProps> = ({
//   open,
//   onClose,
//   crq,
//   colors,
//   onSubmit: onExternalSubmit,
// }) => {
//   const theme = useTheme();
//   const isSmall = useMediaQuery(theme.breakpoints.down("md"));

//   const [panelOpen, setPanelOpen] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submissionError, setSubmissionError] = useState<string | null>(null);
//   const formRef = useRef<HTMLFormElement>(null);

//   // ── CRQ data ──────────────────────────────────────────────────────────────
//   const crqNo: string | null = crq?.crqNo ?? null;
//   const crqId: string | null = crq?.crqId ?? null;
//   const crqStatus: string | null = crq?.crqStatus ?? crq?.status ?? null;
//   const planNumber: string = crq?.planNumber ?? "";
//   const isCancelled = ["canceled", "Cancel", "Canceled"].includes(
//     crqStatus ?? "",
//   );

//   // ── Mock cancellation reasons ─────────────────────────────────────────────
//   const cancellationReasons = useMemo(
//     () => [
//       {
//         cancellationReason: "Weather Conditions",
//         cancellationRollbackOwner: "John Doe",
//       },
//       {
//         cancellationReason: "Equipment Failure",
//         cancellationRollbackOwner: "Jane Smith",
//       },
//       {
//         cancellationReason: "Resource Unavailable",
//         cancellationRollbackOwner: "Admin Team",
//       },
//     ],
//     [],
//   );

//   // ── Responsive collapse ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (isSmall) setPanelOpen(false);
//   }, [isSmall]);

//   // ── Form ──────────────────────────────────────────────────────────────────
//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors, isDirty },
//   } = useForm<ReviewFormInputs>({
//     defaultValues: { status: undefined, remark: "", cygnetStatus: undefined },
//   });

//   const statusValue = watch("status");
//   const selectedReason = watch("cancellationReason");
//   const remarkRequired = statusValue === "Failed" || statusValue === "canceled";

//   useEffect(() => {
//     if (statusValue !== "canceled")
//       setValue("cygnetStatus", undefined, { shouldValidate: false });
//   }, [statusValue, setValue]);

//   useEffect(() => {
//     if (!open) {
//       const t = setTimeout(
//         () => reset({ status: undefined, remark: "", cygnetStatus: undefined }),
//         300,
//       );
//       return () => clearTimeout(t);
//     }
//     reset({ status: undefined, remark: "", cygnetStatus: undefined });
//     setSubmissionError(null);
//   }, [open, crqNo, crqId, reset]);

//   const rollbackOwner = useMemo(
//     () =>
//       cancellationReasons.find((r) => r.cancellationReason === selectedReason)
//         ?.cancellationRollbackOwner ?? "",
//     [selectedReason, cancellationReasons],
//   );

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleFormSubmit = useCallback(
//     async (data: ReviewFormInputs) => {
//       if (!crqNo || !crqId || !data.status) {
//         toast.error("CRQ details or status is missing.");
//         return;
//       }
//       if (data.status === "canceled") {
//         const missing: string[] = [];
//         if (!data.field1) missing.push("Remedy Status");
//         if (!data.cancellationReason) missing.push("Cancellation Reason");
//         if (!data.cygnetStatus) missing.push("Send back to team");
//         if (!data.field5) missing.push("Remedy Remark");
//         if (missing.length) {
//           toast.error(`Required: ${missing.join(", ")}`, {
//             position: "top-right",
//           });
//           return;
//         }
//       }
//       const payload = {
//         olmId: "MOCK_USER_ID",
//         crqNo,
//         crqId,
//         planNumber,
//         taskNumber: crq?.tasks?.map((t: any) => t.taskId).join(",") ?? "",
//         localStatus: data.status,
//         cygnetStatus: data.cygnetStatus,
//         remark: data.remark ?? "",
//         field1: data.field1,
//         field3: data.cancellationReason,
//         field4: rollbackOwner,
//         field5: data.field5,
//       };
//       setIsSubmitting(true);
//       setSubmissionError(null);
//       setTimeout(() => {
//         setIsSubmitting(false);
//         toast.success(`Review for ${crqNo} submitted!`);
//         onExternalSubmit?.(payload);
//         onClose();
//       }, 1500);
//     },
//     [
//       crqNo,
//       crqId,
//       planNumber,
//       crq?.tasks,
//       rollbackOwner,
//       onExternalSubmit,
//       onClose,
//     ],
//   );

//   // ── Design tokens ─────────────────────────────────────────────────────────
//   const accent = colors?.accent ?? theme.palette.primary.main;
//   const surface = colors?.surface ?? theme.palette.background.paper;
//   const border = colors?.border ?? theme.palette.divider;
//   const text1 = colors?.textPrimary ?? theme.palette.text.primary;
//   const text2 = colors?.textSecondary ?? theme.palette.text.secondary;
//   const isDark = colors?.isDark ?? theme.palette.mode === "dark";

//   const paletteColor = {
//     success: theme.palette.success.main,
//     error: theme.palette.error.main,
//     warning: theme.palette.warning.main,
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="xl"
//       fullWidth
//       fullScreen={isSmall}
//       TransitionComponent={SlideUp}
//       keepMounted={false}
//       aria-labelledby="crq-dialog-title"
//       PaperProps={{
//         elevation: 0,
//         sx: {
//           height: isSmall ? "100%" : "88vh",
//           maxHeight: isSmall ? "100%" : 780,
//           display: "flex",
//           flexDirection: "column",
//           bgcolor: isDark ? "#131419" : "#F4F5F7",
//           borderRadius: isSmall ? 0 : "16px",
//           overflow: "hidden",
//           border: `1px solid ${
//             isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
//           }`,
//           boxShadow: isDark
//             ? "0 40px 100px rgba(0,0,0,0.6)"
//             : "0 24px 80px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
//         },
//       }}
//     >
//       {/* ━━━━ HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
//       <DialogTitle
//         id="crq-dialog-title"
//         sx={{
//           p: 0,
//           flexShrink: 0,
//           bgcolor: surface,
//           borderBottom: `1px solid ${border}`,
//         }}
//       >
//         <Stack
//           direction="row"
//           alignItems="center"
//           spacing={1.5}
//           sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5 }}
//         >
//           {/* Icon badge */}
//           <Box
//             aria-hidden="true"
//             sx={{
//               width: 34,
//               height: 34,
//               borderRadius: 2,
//               background: `linear-gradient(135deg, ${alpha(
//                 accent,
//                 0.18,
//               )} 0%, ${alpha(accent, 0.08)} 100%)`,
//               border: `1px solid ${alpha(accent, 0.2)}`,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               flexShrink: 0,
//             }}
//           >
//             <FactCheckOutlinedIcon sx={{ color: accent, fontSize: 18 }} />
//           </Box>

//           {/* Title */}
//           <Typography
//             variant="subtitle1"
//             sx={{
//               fontWeight: 700,
//               fontSize: 15,
//               color: text1,
//               letterSpacing: "-0.01em",
//               whiteSpace: "nowrap",
//             }}
//           >
//             CRQ Review
//           </Typography>

//           {/* Vertical separator */}
//           <Box
//             sx={{
//               width: "1px",
//               height: 16,
//               bgcolor: border,
//               display: { xs: "none", sm: "block" },
//             }}
//           />

//           {/* Meta chips */}
//           <Stack
//             direction="row"
//             spacing={0.75}
//             alignItems="center"
//             sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap" }}
//           >
//             {crqNo && (
//               <Chip
//                 label={crqNo}
//                 size="small"
//                 aria-label={`CRQ number: ${crqNo}`}
//                 sx={{
//                   height: 22,
//                   fontFamily:
//                     '"JetBrains Mono", "Fira Code", "Courier New", monospace',
//                   fontWeight: 600,
//                   fontSize: 10.5,
//                   bgcolor: alpha(accent, 0.1),
//                   color: accent,
//                   border: `1px solid ${alpha(accent, 0.2)}`,
//                   "& .MuiChip-label": { px: 1.25, letterSpacing: "0.02em" },
//                 }}
//               />
//             )}
//             {crqId && (
//               <Chip
//                 label={`ID: ${crqId}`}
//                 size="small"
//                 variant="outlined"
//                 aria-label={`CRQ ID: ${crqId}`}
//                 sx={{
//                   height: 22,
//                   fontFamily:
//                     '"JetBrains Mono", "Fira Code", "Courier New", monospace',
//                   fontSize: 10.5,
//                   color: text2,
//                   borderColor: border,
//                   "& .MuiChip-label": { px: 1.25 },
//                 }}
//               />
//             )}
//             {isCancelled && (
//               <Chip
//                 label="Cancelled"
//                 size="small"
//                 aria-label="CRQ status: Cancelled"
//                 sx={{
//                   height: 22,
//                   fontSize: 10.5,
//                   bgcolor: alpha(theme.palette.error.main, 0.1),
//                   color: theme.palette.error.main,
//                   border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
//                   fontWeight: 600,
//                   "& .MuiChip-label": { px: 1.25 },
//                 }}
//               />
//             )}
//           </Stack>

//           <Box sx={{ flex: 1 }} />

//           {/* Close button */}
//           <Tooltip title="Close" arrow>
//             <IconButton
//               onClick={onClose}
//               size="small"
//               aria-label="Close dialog"
//               sx={{
//                 color: text2,
//                 width: 30,
//                 height: 30,
//                 borderRadius: 1.5,
//                 "&:hover": {
//                   bgcolor: alpha(theme.palette.error.main, 0.08),
//                   color: theme.palette.error.main,
//                 },
//                 transition: "all 150ms ease",
//               }}
//             >
//               <CloseIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       </DialogTitle>

//       {/* ━━━━ BODY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
//       <Box
//         sx={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}
//       >
//         {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
//         <Box
//           component="aside"
//           aria-label="Validation form"
//           sx={{
//             width: panelOpen ? { xs: "100%", md: "360px" } : "0px",
//             minWidth: panelOpen ? { xs: "100%", md: "360px" } : "0px",
//             transition:
//               "width 280ms cubic-bezier(0.4,0,0.2,1), min-width 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
//             opacity: panelOpen ? 1 : 0,
//             overflow: "hidden",
//             borderRight: panelOpen ? `1px solid ${border}` : "none",
//             display: "flex",
//             flexDirection: "column",
//             bgcolor: surface,
//             flexShrink: 0,
//           }}
//         >
//           {panelOpen && (
//             <Box
//               ref={formRef}
//               component="form"
//               onSubmit={handleSubmit(handleFormSubmit)}
//               noValidate
//               sx={{ display: "flex", flexDirection: "column", height: "100%" }}
//             >
//               {/* Panel header strip */}
//               <Box
//                 sx={{
//                   px: 2.5,
//                   py: 1.25,
//                   borderBottom: `1px solid ${border}`,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   flexShrink: 0,
//                   bgcolor: isDark ? alpha("#fff", 0.02) : alpha(accent, 0.025),
//                 }}
//               >
//                 <TuneRoundedIcon
//                   sx={{ fontSize: 14, color: accent }}
//                   aria-hidden="true"
//                 />
//                 <SectionLabel>Validation Action</SectionLabel>
//               </Box>

//               {/* Scrollable form area */}
//               <DialogContent
//                 sx={{
//                   p: 0,
//                   flex: 1,
//                   overflowY: "auto",
//                   overflowX: "hidden",
//                   "&::-webkit-scrollbar": { width: 3 },
//                   "&::-webkit-scrollbar-thumb": {
//                     bgcolor: alpha(text2, 0.2),
//                     borderRadius: 4,
//                   },
//                 }}
//               >
//                 <Box
//                   sx={{
//                     p: 2.5,
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 2.5,
//                   }}
//                 >
//                   {/* Cancelled CRQ alert */}
//                   <Collapse in={isCancelled} unmountOnExit>
//                     <Alert
//                       severity="error"
//                       icon={<WarningAmberRoundedIcon fontSize="small" />}
//                       sx={{ borderRadius: 2, fontSize: 13 }}
//                     >
//                       This CRQ is <strong>Cancelled</strong>. All actions are
//                       disabled.
//                     </Alert>
//                   </Collapse>

//                   {/* Submission error */}
//                   <Collapse in={Boolean(submissionError)} unmountOnExit>
//                     <Alert
//                       severity="error"
//                       sx={{ borderRadius: 2, fontSize: 13 }}
//                     >
//                       {submissionError}
//                     </Alert>
//                   </Collapse>

//                   {/* ── Status selector ──────────────────────────────── */}
//                   <Box>
//                     <Stack
//                       direction="row"
//                       spacing={0.5}
//                       alignItems="center"
//                       sx={{ mb: 1.25 }}
//                     >
//                       <Typography
//                         variant="caption"
//                         sx={{ fontWeight: 600, color: text2, fontSize: 12 }}
//                       >
//                         Select outcome
//                       </Typography>
//                       <Box
//                         component="span"
//                         sx={{
//                           color: "error.main",
//                           fontSize: 13,
//                           lineHeight: 1,
//                         }}
//                         aria-label="required"
//                       >
//                         *
//                       </Box>
//                     </Stack>

//                     <Controller
//                       name="status"
//                       control={control}
//                       rules={{ required: "Please select an outcome." }}
//                       render={({ field }) => (
//                         <Stack
//                           spacing={1}
//                           role="radiogroup"
//                           aria-label="Validation outcome"
//                         >
//                           {STATUS_OPTIONS.map((opt) => {
//                             const color = paletteColor[opt.palette];
//                             const selected = field.value === opt.value;
//                             const IconComp = opt.icon;
//                             return (
//                               <StatusCard
//                                 key={opt.value}
//                                 selected={selected}
//                                 accent={color}
//                                 isDisabled={isCancelled}
//                                 onClick={() =>
//                                   !isCancelled && field.onChange(opt.value)
//                                 }
//                                 role="radio"
//                                 aria-checked={selected}
//                                 aria-disabled={isCancelled}
//                                 tabIndex={isCancelled ? -1 : 0}
//                                 onKeyDown={(e) => {
//                                   if (
//                                     (e.key === "Enter" || e.key === " ") &&
//                                     !isCancelled
//                                   ) {
//                                     e.preventDefault();
//                                     field.onChange(opt.value);
//                                   }
//                                 }}
//                               >
//                                 {/* Icon box */}
//                                 <Box
//                                   sx={{
//                                     width: 32,
//                                     height: 32,
//                                     borderRadius: 1.5,
//                                     bgcolor: selected
//                                       ? alpha(color, 0.14)
//                                       : alpha(text2, 0.06),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     flexShrink: 0,
//                                     transition: "background-color 180ms ease",
//                                   }}
//                                 >
//                                   <IconComp
//                                     sx={{
//                                       fontSize: 17,
//                                       color: selected ? color : text2,
//                                     }}
//                                     aria-hidden="true"
//                                   />
//                                 </Box>

//                                 {/* Text */}
//                                 <Box sx={{ flex: 1, minWidth: 0, pt: 0.1 }}>
//                                   <Typography
//                                     sx={{
//                                       fontSize: 13.5,
//                                       fontWeight: selected ? 700 : 500,
//                                       lineHeight: 1.25,
//                                       color: selected ? color : text1,
//                                       transition: "color 180ms ease",
//                                     }}
//                                   >
//                                     {opt.label}
//                                   </Typography>
//                                   <Typography
//                                     variant="caption"
//                                     sx={{
//                                       fontSize: 11,
//                                       color: selected
//                                         ? alpha(color, 0.75)
//                                         : text2,
//                                       display: "block",
//                                       lineHeight: 1.4,
//                                       mt: 0.25,
//                                       transition: "color 180ms ease",
//                                     }}
//                                   >
//                                     {opt.description}
//                                   </Typography>
//                                 </Box>

//                                 {/* Selected dot */}
//                                 <Fade in={selected}>
//                                   <Box
//                                     sx={{
//                                       width: 7,
//                                       height: 7,
//                                       borderRadius: "50%",
//                                       bgcolor: color,
//                                       flexShrink: 0,
//                                       mt: 0.5,
//                                     }}
//                                     aria-hidden="true"
//                                   />
//                                 </Fade>
//                               </StatusCard>
//                             );
//                           })}
//                         </Stack>
//                       )}
//                     />

//                     <Collapse in={Boolean(errors.status)} unmountOnExit>
//                       <Alert
//                         severity="warning"
//                         sx={{
//                           mt: 1.5,
//                           borderRadius: 1.5,
//                           py: 0.5,
//                           fontSize: 12,
//                         }}
//                       >
//                         {errors.status?.message}
//                       </Alert>
//                     </Collapse>
//                   </Box>

//                   {/* ── Cancellation details ──────────────────────────── */}
//                   <Collapse in={statusValue === "canceled"} unmountOnExit>
//                     <Paper
//                       variant="outlined"
//                       aria-label="Cancellation details"
//                       sx={{
//                         borderRadius: 2.5,
//                         borderColor: alpha(theme.palette.warning.main, 0.35),
//                         overflow: "hidden",
//                         bgcolor: alpha(theme.palette.warning.main, 0.025),
//                       }}
//                     >
//                       {/* Section strip */}
//                       <Stack
//                         direction="row"
//                         spacing={0.875}
//                         alignItems="center"
//                         sx={{
//                           px: 2,
//                           py: 1.1,
//                           borderBottom: `1px solid ${alpha(
//                             theme.palette.warning.main,
//                             0.2,
//                           )}`,
//                           bgcolor: alpha(theme.palette.warning.main, 0.05),
//                         }}
//                       >
//                         <CancelOutlinedIcon
//                           sx={{
//                             fontSize: 14,
//                             color: theme.palette.warning.dark,
//                           }}
//                           aria-hidden="true"
//                         />
//                         <SectionLabel
//                           sx={{ color: theme.palette.warning.dark }}
//                         >
//                           Cancellation Details
//                         </SectionLabel>
//                       </Stack>

//                       <Stack spacing={2} sx={{ p: 2 }}>
//                         {/* Send back to */}
//                         <Box>
//                           <Stack
//                             direction="row"
//                             spacing={0.4}
//                             alignItems="center"
//                             sx={{ mb: 0.875 }}
//                           >
//                             <Typography
//                               variant="caption"
//                               sx={{
//                                 fontWeight: 600,
//                                 fontSize: 12,
//                                 color: text2,
//                               }}
//                             >
//                               Send activity back to
//                             </Typography>
//                             <Box
//                               component="span"
//                               sx={{ color: "error.main", fontSize: 13 }}
//                               aria-label="required"
//                             >
//                               *
//                             </Box>
//                           </Stack>

//                           <Controller
//                             name="cygnetStatus"
//                             control={control}
//                             rules={{ required: "Please select a team." }}
//                             render={({ field }) => (
//                               <Stack
//                                 direction="row"
//                                 spacing={1}
//                                 role="radiogroup"
//                                 aria-label="Send back to team"
//                               >
//                                 {[
//                                   {
//                                     value: "REJECT_TO_PLANNING",
//                                     label: "Planning Team",
//                                   },
//                                   {
//                                     value: "REJECT_TO_OPERATIONS",
//                                     label: "Operations Team",
//                                   },
//                                 ].map((opt) => (
//                                   <TeamButton
//                                     key={opt.value}
//                                     selected={field.value === opt.value}
//                                     accent={accent}
//                                     onClick={() =>
//                                       !isCancelled && field.onChange(opt.value)
//                                     }
//                                     role="radio"
//                                     aria-checked={field.value === opt.value}
//                                     tabIndex={0}
//                                     onKeyDown={(e) => {
//                                       if (e.key === "Enter" || e.key === " ") {
//                                         e.preventDefault();
//                                         !isCancelled &&
//                                           field.onChange(opt.value);
//                                       }
//                                     }}
//                                   >
//                                     {opt.label}
//                                   </TeamButton>
//                                 ))}
//                               </Stack>
//                             )}
//                           />
//                         </Box>

//                         {/* Remedy Status */}
//                         <Controller
//                           name="field1"
//                           control={control}
//                           rules={{ required: "Required" }}
//                           render={({ field }) => (
//                             <FormControl
//                               size="small"
//                               fullWidth
//                               disabled={isCancelled}
//                               error={Boolean(errors.field1)}
//                             >
//                               <InputLabel
//                                 id="remedy-status-label"
//                                 sx={{ fontSize: 13 }}
//                               >
//                                 Remedy Status *
//                               </InputLabel>
//                               <Select
//                                 {...field}
//                                 labelId="remedy-status-label"
//                                 label="Remedy Status *"
//                                 sx={{ borderRadius: 1.5, fontSize: 13 }}
//                               >
//                                 <MenuItem
//                                   value="Cancelled"
//                                   sx={{ fontSize: 13 }}
//                                 >
//                                   Cancelled
//                                 </MenuItem>
//                               </Select>
//                             </FormControl>
//                           )}
//                         />

//                         {/* Cancellation Reason */}
//                         <Controller
//                           name="cancellationReason"
//                           control={control}
//                           rules={{ required: "Required" }}
//                           render={({ field }) => (
//                             <FormControl
//                               size="small"
//                               fullWidth
//                               disabled={isCancelled}
//                               error={Boolean(errors.cancellationReason)}
//                             >
//                               <InputLabel
//                                 id="cancel-reason-label"
//                                 sx={{ fontSize: 13 }}
//                               >
//                                 Cancellation Reason *
//                               </InputLabel>
//                               <Select
//                                 {...field}
//                                 labelId="cancel-reason-label"
//                                 label="Cancellation Reason *"
//                                 sx={{ borderRadius: 1.5, fontSize: 13 }}
//                               >
//                                 {cancellationReasons.map((item, i) => (
//                                   <MenuItem
//                                     key={i}
//                                     value={item.cancellationReason}
//                                     sx={{ fontSize: 13 }}
//                                   >
//                                     {item.cancellationReason}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           )}
//                         />

//                         {/* Rollback owner (read-only) */}
//                         <TextField
//                           label="Cancellation Rejection Owner"
//                           size="small"
//                           fullWidth
//                           value={rollbackOwner}
//                           disabled={isCancelled}
//                           helperText="Auto-populated from selected reason"
//                           InputProps={{
//                             readOnly: true,
//                             startAdornment: (
//                               <PersonOutlineIcon
//                                 sx={{ color: text2, mr: 0.75, fontSize: 16 }}
//                                 aria-hidden="true"
//                               />
//                             ),
//                             sx: {
//                               fontFamily:
//                                 '"JetBrains Mono","Fira Code","Courier New",monospace',
//                               fontSize: 12.5,
//                               borderRadius: 1.5,
//                               bgcolor: alpha(text2, 0.03),
//                             },
//                           }}
//                           InputLabelProps={{ sx: { fontSize: 13 } }}
//                         />

//                         {/* Remedy Remark (field5) */}
//                         <Controller
//                           name="field5"
//                           control={control}
//                           rules={{ required: "Remedy remark is required." }}
//                           render={({ field }) => (
//                             <TextField
//                               {...field}
//                               disabled={isCancelled}
//                               size="small"
//                               fullWidth
//                               label="Remedy Remark *"
//                               placeholder="Enter cancellation remark…"
//                               error={Boolean(errors.field5)}
//                               helperText={errors.field5?.message}
//                               InputProps={{
//                                 sx: { borderRadius: 1.5, fontSize: 13 },
//                               }}
//                               InputLabelProps={{ sx: { fontSize: 13 } }}
//                             />
//                           )}
//                         />
//                       </Stack>
//                     </Paper>
//                   </Collapse>

//                   {/* ── Additional Notes ──────────────────────────────── */}
//                   <Box>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1.5,
//                         mb: 1.5,
//                       }}
//                     >
//                       <Divider sx={{ flex: 1 }} />
//                       <SectionLabel>Additional Notes</SectionLabel>
//                       <Divider sx={{ flex: 1 }} />
//                     </Box>

//                     <Controller
//                       name="remark"
//                       control={control}
//                       rules={{
//                         required: remarkRequired
//                           ? "A remark is required for this outcome."
//                           : false,
//                       }}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           disabled={isCancelled}
//                           label={
//                             remarkRequired
//                               ? "CHM Remark (Required)"
//                               : "CHM Remark (Optional)"
//                           }
//                           placeholder="Enter any additional remarks or observations…"
//                           multiline
//                           rows={3}
//                           fullWidth
//                           error={Boolean(errors.remark)}
//                           helperText={errors.remark?.message}
//                           inputProps={{
//                             "aria-required": remarkRequired,
//                             maxLength: 1000,
//                           }}
//                           InputProps={{
//                             sx: {
//                               borderRadius: 2,
//                               alignItems: "flex-start",
//                               fontSize: 13,
//                             },
//                             startAdornment: (
//                               <RateReviewOutlinedIcon
//                                 sx={{
//                                   color: text2,
//                                   mr: 1,
//                                   mt: 1.25,
//                                   fontSize: 16,
//                                   alignSelf: "flex-start",
//                                 }}
//                                 aria-hidden="true"
//                               />
//                             ),
//                           }}
//                           InputLabelProps={{ sx: { fontSize: 13 } }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Box>
//               </DialogContent>

//               {/* ── Footer ────────────────────────────────────────────── */}
//               <DialogActions
//                 sx={{
//                   px: 2,
//                   py: 1.25,
//                   borderTop: `1px solid ${border}`,
//                   bgcolor: isDark ? alpha("#fff", 0.015) : alpha(accent, 0.015),
//                   gap: 1,
//                   flexShrink: 0,
//                 }}
//               >
//                 <Button
//                   size="small"
//                   onClick={() => setPanelOpen(false)}
//                   startIcon={
//                     <ChevronLeftIcon sx={{ fontSize: "16px !important" }} />
//                   }
//                   aria-label="Hide validation panel"
//                   sx={{
//                     color: text2,
//                     fontSize: 12.5,
//                     fontWeight: 500,
//                     borderRadius: 1.5,
//                     textTransform: "none",
//                     px: 1.5,
//                     "&:hover": { bgcolor: alpha(text2, 0.07) },
//                   }}
//                 >
//                   Hide Panel
//                 </Button>

//                 <Box sx={{ flex: 1 }} />

//                 <Button
//                   type="submit"
//                   variant="contained"
//                   disabled={isSubmitting || !isDirty || isCancelled}
//                   aria-label={
//                     isSubmitting ? "Submitting validation" : "Submit validation"
//                   }
//                   aria-busy={isSubmitting}
//                   startIcon={
//                     isSubmitting ? (
//                       <CircularProgress
//                         size={14}
//                         color="inherit"
//                         aria-hidden="true"
//                       />
//                     ) : (
//                       <CheckCircleOutlineIcon
//                         sx={{ fontSize: "17px !important" }}
//                         aria-hidden="true"
//                       />
//                     )
//                   }
//                   sx={{
//                     fontSize: 13,
//                     fontWeight: 600,
//                     borderRadius: 2,
//                     textTransform: "none",
//                     px: 2.5,
//                     py: 0.875,
//                     bgcolor: accent,
//                     letterSpacing: "0.01em",
//                     boxShadow: `0 2px 10px ${alpha(accent, 0.4)}`,
//                     "&:hover": {
//                       bgcolor: accent,
//                       filter: "brightness(1.08)",
//                       boxShadow: `0 4px 18px ${alpha(accent, 0.5)}`,
//                     },
//                     "&:active": { filter: "brightness(0.96)" },
//                     "&:disabled": {
//                       boxShadow: "none",
//                       bgcolor: alpha(text2, 0.12),
//                     },
//                     transition:
//                       "filter 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
//                   }}
//                 >
//                   {isSubmitting ? "Submitting…" : "Submit Validation"}
//                 </Button>
//               </DialogActions>
//             </Box>
//           )}
//         </Box>

//         {/* ── Float-open button ─────────────────────────────────────────── */}
//         <Fade in={!panelOpen && !isSmall}>
//           <Tooltip title="Show validation form" placement="right" arrow>
//             <IconButton
//               onClick={() => setPanelOpen(true)}
//               size="small"
//               aria-label="Show validation panel"
//               sx={{
//                 position: "absolute",
//                 left: 10,
//                 top: 20,
//                 zIndex: 40,
//                 width: 30,
//                 height: 30,
//                 bgcolor: surface,
//                 border: `1px solid ${border}`,
//                 boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//                 color: text2,
//                 "&:hover": {
//                   bgcolor: alpha(accent, 0.08),
//                   color: accent,
//                   borderColor: alpha(accent, 0.4),
//                 },
//                 transition: "all 140ms ease",
//               }}
//             >
//               <ChevronRightIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Tooltip>
//         </Fade>

//         {/* ━━━━ RIGHT PANEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
//         <Box
//           component="section"
//           aria-label="Checkpoint summary preview"
//           sx={{
//             flex: 1,
//             minWidth: 0,
//             display: "flex",
//             flexDirection: "column",
//             bgcolor: isDark ? alpha("#fff", 0.02) : "#F4F5F7",
//           }}
//         >
//           {/* Toolbar */}
//           <Box
//             sx={{
//               px: 2.5,
//               py: 1.2,
//               borderBottom: `1px solid ${border}`,
//               bgcolor: isDark ? alpha(surface, 0.7) : alpha("#fff", 0.8),
//               backdropFilter: "blur(10px)",
//               display: "flex",
//               alignItems: "center",
//               gap: 1.5,
//               flexShrink: 0,
//             }}
//           >
//             <Typography
//               variant="body2"
//               sx={{ fontWeight: 700, fontSize: 13, color: text1 }}
//             >
//               CheckPoint Summary Preview
//             </Typography>

//             <Chip
//               label="Live"
//               size="small"
//               aria-label="Live data"
//               sx={{
//                 height: 20,
//                 fontSize: 10,
//                 fontWeight: 700,
//                 bgcolor: alpha(accent, 0.1),
//                 color: accent,
//                 border: `1px solid ${alpha(accent, 0.25)}`,
//                 "& .MuiChip-label": {
//                   px: 1,
//                   letterSpacing: "0.04em",
//                 },
//               }}
//             />

//             <Box sx={{ flex: 1 }} />

//             <Tooltip
//               title={
//                 panelOpen
//                   ? "Collapse validation form"
//                   : "Expand validation form"
//               }
//               arrow
//             >
//               <Button
//                 size="small"
//                 onClick={() => setPanelOpen((v) => !v)}
//                 startIcon={
//                   panelOpen ? (
//                     <ChevronLeftIcon sx={{ fontSize: "15px !important" }} />
//                   ) : (
//                     <ChevronRightIcon sx={{ fontSize: "15px !important" }} />
//                   )
//                 }
//                 aria-label={
//                   panelOpen ? "Hide validation form" : "Show validation form"
//                 }
//                 disabled={isCancelled}
//                 sx={{
//                   color: accent,
//                   fontSize: 12,
//                   fontWeight: 500,
//                   borderRadius: 1.5,
//                   textTransform: "none",
//                   px: 1.5,
//                   py: 0.5,
//                   border: `1px solid ${alpha(accent, 0.28)}`,
//                   bgcolor: "transparent",
//                   "&:hover": { bgcolor: alpha(accent, 0.07) },
//                   "&:disabled": { opacity: 0.35 },
//                   transition: "all 140ms ease",
//                 }}
//               >
//                 {panelOpen ? "Hide Validation" : "Show Validation"}
//               </Button>
//             </Tooltip>
//           </Box>

//           {/* Preview content */}
//           <Box
//             sx={{
//               flex: 1,
//               overflowY: "auto",
//               p: { xs: 2, sm: 2.5 },
//               "&::-webkit-scrollbar": { width: 3 },
//               "&::-webkit-scrollbar-thumb": {
//                 bgcolor: alpha(text2, 0.18),
//                 borderRadius: 4,
//               },
//             }}
//           >
//             <CheckPointSummaryPreview crqNo={crqNo} crqStatus={crqStatus} />
//           </Box>
//         </Box>
//       </Box>
//     </Dialog>
//   );
// };

// export default PlanInvDialog;
