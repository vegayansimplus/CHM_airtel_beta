import React from "react";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: theme.palette.primary.main,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          display="block"
          color="text.disabled"
          sx={{ fontSize: 10, mt: 0.2 }}
        >
          {subtitle}
        </Typography>
      )}
      <Divider
        sx={{ mt: 0.75, borderColor: alpha(theme.palette.primary.main, 0.18) }}
      />
    </Box>
  );
};
