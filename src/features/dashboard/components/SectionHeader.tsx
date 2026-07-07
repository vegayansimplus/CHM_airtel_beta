import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import type { Colors } from "../types/colorTypes";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  colors: Colors;
}

export function SectionHeader({ title, subtitle, right, colors }: SectionHeaderProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 11, color: colors.textSecondary, mt: 0.3, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {right}
    </Box>
  );
}
