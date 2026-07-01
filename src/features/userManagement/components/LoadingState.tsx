import { Box, Skeleton, Stack } from "@mui/material";

const shimmerSx = {
  bgcolor: "rgba(15,23,42,0.06)",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
  },
};

export function StatsSkeleton() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2} mb={3}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            flex: "1 1 220px",
            minWidth: 200,
            p: 2.25,
            borderRadius: "18px",
            border: "1px solid rgba(15,23,42,0.06)",
            background: "#fff",
          }}
        >
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px", ...shimmerSx }} />
          <Skeleton variant="text" width="50%" height={34} sx={{ mt: 1.5, ...shimmerSx }} />
          <Skeleton variant="text" width="70%" height={18} sx={shimmerSx} />
        </Box>
      ))}
    </Stack>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Box
      sx={{
        borderRadius: "18px",
        border: "1px solid rgba(15,23,42,0.06)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, px: 3, py: 1.5, bgcolor: "#F8FAFC" }}>
        {["User", "Employee ID", "Department", "Role", "Status", "Actions"].map((h) => (
          <Skeleton key={h} variant="text" width={100} height={16} sx={shimmerSx} />
        ))}
      </Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Stack
          key={i}
          direction="row"
          alignItems="center"
          gap={2}
          px={3}
          py={1.75}
          sx={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={shimmerSx} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={16} sx={shimmerSx} />
            <Skeleton variant="text" width="45%" height={14} sx={shimmerSx} />
          </Box>
          <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 999, ...shimmerSx }} />
          <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 999, ...shimmerSx }} />
          <Skeleton variant="text" width={60} height={16} sx={shimmerSx} />
        </Stack>
      ))}
    </Box>
  );
}

export default function LoadingState() {
  return (
    <Box>
      <StatsSkeleton />
      <TableSkeleton />
    </Box>
  );
}
