import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyGetFutureWeekQuery, type FutureWeekRow } from "../../api/rosterGenerationApiSlice";
const PAGE_SIZE = 10;

export interface PaginatedFutureWeekResult {
  rows: FutureWeekRow[];
  total: number | null;
  isoWeek: number | null;
  isoYear: number | null;
  isFetching: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function usePaginatedFutureWeek(
  subDomainId: number
): PaginatedFutureWeekResult {
  const [rows, setRows] = useState<FutureWeekRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [isoWeek, setIsoWeek] = useState<number | null>(null);
  const [isoYear, setIsoYear] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  // Guard against stale async callbacks when subDomainId changes
  const fetchIdRef = useRef(0);

  const [trigger] = useLazyGetFutureWeekQuery();

  const hasMore = total === null || rows.length < total;

  // ------------------------------------------------------------------
  // Core fetch — accepts a pageNumber and an optional reset flag.
  // Uses fetchIdRef to discard responses from a previous subDomain.
  // ------------------------------------------------------------------
  const fetchPage = useCallback(
    async (pageNumber: number, reset = false) => {
      if (isFetching) return;

      const fetchId = ++fetchIdRef.current;

      setIsFetching(true);
      setIsError(false);

      try {
        const result = await trigger({
          subDomainId,
          pageNumber,
          pageSize: PAGE_SIZE,
        }).unwrap();

        // Discard if a newer fetch has started (e.g. subDomainId changed)
        if (fetchId !== fetchIdRef.current) return;

        setTotal(result.totalEmployees);
        setIsoWeek(result.isoWeek ?? null);
        setIsoYear(result.isoYear ?? null);
        setRows((prev) => (reset ? result.data : [...prev, ...result.data]));
        setPage(pageNumber);
      } catch {
        if (fetchId !== fetchIdRef.current) return;
        setIsError(true);
      } finally {
        if (fetchId === fetchIdRef.current) setIsFetching(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subDomainId, trigger]
    // Intentionally omit isFetching from deps — we read it as a gate
    // but don't want to recreate fetchPage every render
  );

  // ------------------------------------------------------------------
  // Reset + initial load whenever subDomainId changes
  // ------------------------------------------------------------------
  useEffect(() => {
    setRows([]);
    setPage(1);
    setTotal(null);
    setIsoWeek(null);
    setIsoYear(null);
    setIsError(false);
    fetchPage(1, true);
  }, [subDomainId]);

  // ------------------------------------------------------------------
  // Public callbacks
  // ------------------------------------------------------------------
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      fetchPage(page + 1, false);
    }
  }, [fetchPage, hasMore, isFetching, page]);

  const refetch = useCallback(() => {
    setRows([]);
    setPage(1);
    setTotal(null);
    setIsError(false);
    fetchPage(1, true);
  }, [fetchPage]);

  return {
    rows,
    total,
    isoWeek,
    isoYear,
    isFetching,
    isError,
    hasMore,
    loadMore,
    refetch,
  };
}