import type { ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useTabColorTokens } from "../../../style/theme";
import { getCardSx } from "../../dashboard/constants/dashboard.styles";

interface Props {
  title: string;
  action?: ReactNode;
  /** Fixed pixel height for chart canvases; pass "auto" for content that sizes itself (tables). */
  height?: number | string;
  children: ReactNode;
}

export function ChartCard({ title, action, height = 300, children }: Props) {
  const theme = useTheme();
  const colors = useTabColorTokens(theme);

  return (
    <Box sx={{ ...getCardSx(colors), p: "16px 18px", display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{title}</Typography>
        {action}
      </Box>
      <Box sx={{ height, position: "relative" }}>{children}</Box>
    </Box>
  );
}
