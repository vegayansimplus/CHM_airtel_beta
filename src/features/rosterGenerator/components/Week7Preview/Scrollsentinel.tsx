import { useEffect, useRef } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface ScrollSentinelProps {
  /** Called once when the sentinel enters the viewport */
  onVisible: () => void;
  isFetching: boolean;
  hasMore: boolean;
  /** Total loaded vs total available — shown when all rows are loaded */
  loadedCount: number;
  totalCount: number | null;
}

/**
 * A zero-height sentinel row placed at the bottom of the table body.
 * An IntersectionObserver fires `onVisible` as soon as it enters view,
 * which triggers the next page fetch via usePaginatedFutureWeek.
 *
 * When hasMore is false it renders a quiet "all loaded" confirmation.
 */
export function ScrollSentinel({
  onVisible,
  isFetching,
  hasMore,
  loadedCount,
  totalCount,
}: ScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible();
      },
      {
        // Fire when 10% of the sentinel is visible
        threshold: 0.1,
        // Start loading slightly before the user actually hits the bottom
        rootMargin: "0px 0px 120px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, hasMore]);

  if (!hasMore) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={0.75}
        sx={{ py: 1.25 }}
      >
        <CheckCircleOutlineIcon
          sx={{ fontSize: 13, color: "success.main", opacity: 0.7 }}
        />
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
          {totalCount !== null
            ? `All ${totalCount} employees loaded`
            : "All employees loaded"}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box ref={sentinelRef} sx={{ py: 1.25 }}>
      {isFetching && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
        >
          <CircularProgress size={14} thickness={4} />
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            Loading more…{" "}
            {totalCount !== null && `(${loadedCount} / ${totalCount})`}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}