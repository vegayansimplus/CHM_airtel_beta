import { Box, Typography } from "@mui/material";

export const InfoBlock = ({
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
