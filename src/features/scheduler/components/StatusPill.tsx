import CancelIcon from "@mui/icons-material/Cancel";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Box } from "@mui/material";

export const StatusPill = ({
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
