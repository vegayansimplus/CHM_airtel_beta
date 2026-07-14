import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const ReadonlyAutoFields: React.FC<{
  fields: Array<{ label: string; value: string | number | null | undefined }>;
}> = ({ fields }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.primary.main, 0.03),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      {fields.map((f, i) => (
        <Box key={i}>
          <Typography
            sx={{
              fontSize: 10,
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.5,
            }}
          >
            {f.label}
          </Typography>
          <Typography
            sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
          >
            {f.value || "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
