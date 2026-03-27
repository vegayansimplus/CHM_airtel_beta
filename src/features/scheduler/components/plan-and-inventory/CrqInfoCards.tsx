// import React from "react";
// import { Box, Typography } from "@mui/material";
// import { format } from "date-fns";

// interface CrqInfoCardsProps {
//   crq: any;
//   colors: any;
// }

// const InfoBlock = ({
//   label,
//   value,
//   colors,
// }: {
//   label: string;
//   value: string;
//   colors: any;
// }) => (
//   <Box
//     sx={{
//       borderRadius: colors.radius,
//       border: `1px solid ${colors.border}`,
//       bgcolor: colors.surface2,
//       px: 1.1,
//       py: 0.55,
//       minWidth: 130,
//       display: "flex",
//       flexDirection: "column",
//       gap: 0.15,
//     }}
//   >
//     <Typography
//       sx={{
//         fontSize: 9,
//         fontWeight: 700,
//         color: colors.textDim,
//         textTransform: "uppercase",
//         letterSpacing: 0.4,
//       }}
//     >
//       {label}
//     </Typography>
//     <Typography
//       sx={{
//         fontSize: 12,
//         fontWeight: 600,
//         color: colors.textPrimary,
//         fontFamily:
//           label.includes("Date") ||
//           label.includes("End") ||
//           label.includes("Start")
//             ? "'JetBrains Mono','Fira Code',monospace"
//             : "inherit",
//       }}
//     >
//       {value}
//     </Typography>
//   </Box>
// );

// const CrqInfoCards: React.FC<CrqInfoCardsProps> = ({ crq, colors }) => {
//   const formatDate = (dateString: string) =>
//     dateString ? format(new Date(dateString), "dd-MMM-yyyy HH:mm") : "-";

//   return (
//     <Box
//       sx={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
//         gap: 1,
//         width: "100%",
//       }}
//     >
//       <InfoBlock
//         label="Location"
//         value={crq.locationCodeM6 || "-"}
//         colors={colors}
//       />
//       <InfoBlock
//         label="Plan Start"
//         value={formatDate(crq.activityPlanStartDate)}
//         colors={colors}
//       />
//       <InfoBlock
//         label="Plan End"
//         value={formatDate(crq.activityPlanEndDate)}
//         colors={colors}
//       />
//       <InfoBlock
//         label="Impact Start"
//         value={formatDate(crq.impactStartDate)}
//         colors={colors}
//       />
//       <InfoBlock
//         label="Impact End"
//         value={formatDate(crq.impactEndDate)}
//         colors={colors}
//       />
//       <InfoBlock
//         label="OLMID"
//         value={crq.olmidImpactAnalysis || crq.olmidReview || "-"}
//         colors={colors}
//       />
//     </Box>
//   );
// };

// export default CrqInfoCards;

import React from "react";
import { Stack, Box, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { format } from "date-fns";

interface CrqInfoCardsProps {
  crq: any;
  colors: any;
}

const InfoBlock = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: React.ReactNode;
  colors: any;
}) => (
  <Box
    sx={{
      // bgcolor: colors.surface2,
      bgcolor:colors.accentDim,
      borderRadius: colors.radius,
      px: 2,
      py: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "120px",
      whiteSpace: "nowrap",
    }}
  >
    <Typography
      variant="caption"
      sx={{ color: colors.textSecondary, mb: 0.5, fontSize: "0.75rem" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, color: colors.textPrimary }}
    >
      {value}
    </Typography>
  </Box>
);

const StatusPill = ({
  status,
  colors,
  isImpact = false,
}: {
  status: string;
  colors: any;
  isImpact?: boolean;
}) => {
  const isFailed = ["canceled", "cancel", "Canceled"].includes(status);
  const isInProgress = status === "In Progress";

  const icon = isFailed ? (
    <CancelIcon fontSize="small" />
  ) : isInProgress ? (
    <AutorenewIcon fontSize="small" />
  ) : null;
  const pillColor = isFailed
    ? colors.danger
    : isInProgress
      ? colors.info
      : colors.success;
  const pillBorder = isFailed
    ? colors.dangerBorder
    : isInProgress
      ? colors.infoBorder
      : colors.successBorder;

  return (
    <Box
      sx={{
        border: `1px solid ${pillBorder}`,
        color: pillColor,
        borderRadius: "16px",
        px: 1.5,
        py: 0.25,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: colors.surface,
        fontSize: "0.8rem",
        fontWeight: 600,
      }}
    >
      {icon}
      <span>{status || "-"}</span>
    </Box>
  );
};

const CrqInfoCards: React.FC<CrqInfoCardsProps> = ({ crq, colors }) => {
  const formatDate = (dateString: string) =>
    dateString ? format(new Date(dateString), "dd-MMM-yyyy HH:mm") : "-";

  return (
    <Stack direction="row" gap={1.5} alignItems="center">
      <InfoBlock label="CRQ No" value={crq.crqNo} colors={colors} />
      <InfoBlock
        label="Start Date"
        value={formatDate(crq.activityPlanStartDate)}
        colors={colors}
      />
      <InfoBlock
        label="End Date"
        value={formatDate(crq.activityPlanEndDate)}
        colors={colors}
      />

      <InfoBlock
        label="CRQ Status"
        value={<StatusPill status={crq.crqStatus} colors={colors} />}
        colors={colors}
      />

      <InfoBlock
        label="Impact Status"
        value={
          <StatusPill
            status={crq.impactAnalysisStatus || crq.crqReviewStatus}
            colors={colors}
            isImpact
          />
        }
        colors={colors}
      />

      <InfoBlock
        label="Impact Start"
        value={crq.impactStartDate || "-"}
        colors={colors}
      />
      <InfoBlock
        label="Impact End"
        value={crq.impactEndDate || "-"}
        colors={colors}
      />
      <InfoBlock
        label="OLM ID Impact Analysis"
        value={crq.olmidImpactAnalysis || crq.olmidReview || "-"}
        colors={colors}
      />
    </Stack>
  );
};

export default CrqInfoCards;
