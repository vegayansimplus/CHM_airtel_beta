import React from "react";
import { Box, FormHelperText, Typography } from "@mui/material";

interface FieldRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  required,
  children,
  error,
  hint,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      alignItems: "flex-start",
      gap: 2,
      minHeight: 40,
    }}
  >
    <Box sx={{ pt: 1.1 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: error ? "error.main" : "text.primary",
          lineHeight: 1.4,
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: "error.main", ml: 0.25 }}>
            *
          </Box>
        )}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: "text.disabled" }}
        >
          {hint}
        </Typography>
      )}
    </Box>
    <Box>
      {children}
      {error && (
        <FormHelperText error sx={{ mt: 0.25, fontSize: 10, ml: 0 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  </Box>
);
