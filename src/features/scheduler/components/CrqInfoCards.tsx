import React from "react";
import { Stack, Box, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { format } from "date-fns";

interface InfoItem {
  label: string;
  value: React.ReactNode;
}
interface CrqInfoCardsProps {
  // crq: any;
  colors: any;
  items: InfoItem[];
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
      bgcolor: colors.accentDim,
      borderRadius: colors.radius,
      px: 2,
      py: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "180px",
      whiteSpace: "nowrap",
    }}
  >
    <Typography
      component="div"
      variant="caption"
      sx={{ color: colors.textSecondary, mb: 0.5, fontSize: "0.75rem" }}
    >
      {label}
    </Typography>
    <Typography
      component="div"
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

const CrqInfoCards: React.FC<CrqInfoCardsProps> = ({ colors, items }) => {
  const formatDate = (dateString: string) =>
    dateString ? format(new Date(dateString), "dd-MMM-yyyy HH:mm") : "-";

  return (
    <Stack direction="row" gap={1.5} alignItems="center">
      {items.map((item, index) => (
        <InfoBlock
          key={index}
          label={item.label}
          value={item.value}
          colors={colors}
        />
      ))}
    </Stack>
  );
};

export default CrqInfoCards;
