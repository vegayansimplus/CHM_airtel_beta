import type { ReactNode } from "react";
import { Box, Skeleton, useTheme } from "@mui/material";
import { useTabColorTokens } from "../../../style/theme";
import { useShimmerSx } from "../../../components/loading/Skeletons";
import { getCardSx } from "../constants/dashboard.styles";

/** `getCardSx` minus the hover lift — a placeholder isn't interactive. */
function useSkeletonCardSx() {
  const theme = useTheme();
  return { ...getCardSx(useTabColorTokens(theme)), "&:hover": {} };
}

/** One placeholder widget: header row (icon + titles) then filler rows. */
function SkeletonCard({
  height,
  lines = 3,
  children,
}: {
  height: number;
  lines?: number;
  children?: ReactNode;
}) {
  const cardSx = useSkeletonCardSx();
  const shimmerSx = useShimmerSx();

  return (
    <Box sx={{ ...cardSx, p: "16px", height, display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "10px", ...shimmerSx }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="55%" height={16} sx={shimmerSx} />
          <Skeleton variant="text" width="35%" height={12} sx={shimmerSx} />
        </Box>
      </Box>
      {children ?? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={38} sx={{ borderRadius: "10px", ...shimmerSx }} />
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * First-load placeholder for <ModernHomeDashboard>, laid out on the *same*
 * grid and card chrome as the real widgets (fixed 300px rail + fluid column,
 * `getCardSx` shells) so the finished dashboard lands in place instead of
 * replacing a centred spinner — nothing jumps, and the page never reads as an
 * empty tinted box while its 7 parallel queries settle.
 */
export function DashboardSkeleton() {
  const cardSx = useSkeletonCardSx();
  const shimmerSx = useShimmerSx();

  return (
    <Box
      aria-hidden
      sx={{
        p: { xs: "12px 4px 28px", md: "16px 8px 32px" },
        // Mirrors ModernHomeDashboard's own grid.
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "300px minmax(0, 1fr)" },
        gap: "16px",
        alignItems: "start",
      }}
    >
      {/* ── LEFT rail — profile, attendance, holidays, on-leave ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
        {/* Profile card leads with a dark hero band, so it shimmers light-on-dark. */}
        <Box sx={{ ...cardSx, height: 208, overflow: "hidden" }}>
          <Box
            sx={{
              p: "16px",
              background: "linear-gradient(130deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Skeleton variant="circular" width={46} height={46} sx={{ bgcolor: "rgba(255,255,255,.12)" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: "rgba(255,255,255,.12)" }} />
              <Skeleton variant="text" width="50%" height={14} sx={{ bgcolor: "rgba(255,255,255,.09)" }} />
              <Skeleton
                variant="rounded"
                width={90}
                height={16}
                sx={{ mt: "6px", borderRadius: "20px", bgcolor: "rgba(255,255,255,.09)" }}
              />
            </Box>
          </Box>
          <Box sx={{ p: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Skeleton variant="text" width="40%" height={14} sx={shimmerSx} />
            <Skeleton variant="rounded" height={5} sx={{ borderRadius: "99px", ...shimmerSx }} />
            <Box sx={{ display: "flex", gap: "10px" }}>
              <Skeleton variant="rounded" width="50%" height={40} sx={{ borderRadius: "10px", ...shimmerSx }} />
              <Skeleton variant="rounded" width="50%" height={40} sx={{ borderRadius: "10px", ...shimmerSx }} />
            </Box>
          </Box>
        </Box>

        <SkeletonCard height={196} lines={2} />
        <SkeletonCard height={212} lines={3} />
        <SkeletonCard height={168} lines={2} />
      </Box>

      {/* ── RIGHT column — assignments + stats, notifications, weekly schedule ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          <SkeletonCard height={296} lines={4} />

          {/* 2×2 stat grid — same shape as StatCardsGrid. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridAutoRows: "1fr",
              gap: "16px",
              height: 296,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Box
                key={i}
                sx={{ ...cardSx, p: "14px", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "10px", ...shimmerSx }} />
                <Skeleton variant="text" width="45%" height={30} sx={shimmerSx} />
                <Skeleton variant="text" width="70%" height={13} sx={shimmerSx} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Reschedule-notification strip */}
        <Box sx={{ ...cardSx, p: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "10px", ...shimmerSx }} />
          <Skeleton variant="text" width="30%" height={16} sx={shimmerSx} />
        </Box>

        {/* Weekly schedule — 7 day columns */}
        <SkeletonCard height={272}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", flex: 1 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" sx={{ height: "100%", borderRadius: "12px", ...shimmerSx }} />
            ))}
          </Box>
        </SkeletonCard>
      </Box>
    </Box>
  );
}

export default DashboardSkeleton;
