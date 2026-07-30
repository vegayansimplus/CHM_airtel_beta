import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { sequentialBlue } from "../utils/chartPalette";
import { EmptyOrErrorState } from "./EmptyOrErrorState";
import type { AgingHeatmapResponseDto } from "../types/crqAnalytics.types";

interface Props {
  data: AgingHeatmapResponseDto | undefined;
  isLoading?: boolean;
  isError?: boolean;
}

/** Stage x bucket intensity grid — sourced from crqdashboard's /crq/agingheatmap (see migration gap notes: no
 * aging endpoint exists in crqanalytic, and this proc has no circleId filter). */
export function AgingHeatmapGrid({ data, isLoading, isError }: Props) {
  const theme = useTheme();

  if (isError) return <EmptyOrErrorState kind="error" />;
  if (!isLoading && (!data || data.cells.length === 0)) return <EmptyOrErrorState kind="empty" />;
  if (!data) return null;

  const cellByKey = new Map(data.cells.map((c) => [`${c.stage}::${c.bucket}`, c]));

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `160px repeat(${data.buckets.length}, minmax(64px, 1fr))`,
          gap: "2px",
          minWidth: 160 + data.buckets.length * 64,
        }}
      >
        <Box />
        {data.buckets.map((bucket) => (
          <Typography
            key={bucket}
            sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", textAlign: "center", pb: "6px" }}
          >
            {bucket}
          </Typography>
        ))}

        {data.stages.map((stage) => (
          <Box key={stage} sx={{ display: "contents" }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                pr: 1,
              }}
            >
              {stage}
            </Typography>
            {data.buckets.map((bucket) => {
              const cell = cellByKey.get(`${stage}::${bucket}`);
              const intensity = cell?.intensity ?? 0;
              const bg = cell && cell.count > 0 ? sequentialBlue(intensity) : theme.palette.action.hover;
              const textColor = intensity > 0.55 ? "#ffffff" : theme.palette.text.primary;
              return (
                <Tooltip key={bucket} title={`${stage} · ${bucket}: ${cell?.count ?? 0} CRQs`} arrow>
                  <Box
                    sx={{
                      height: 34,
                      borderRadius: "6px",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "default",
                      transition: "transform .15s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: textColor }}>
                      {cell?.count ?? 0}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
