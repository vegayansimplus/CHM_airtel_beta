
import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalisedEmployee } from "../../types/Futureweek.types";
import { useLazyGetFutureWeekQuery } from "../../api/rosterGenerationApiSlice";
import { normaliseRows } from "../../util/Futureweek.utils";

const PAGE_SIZE = 50;

export interface PaginatedFutureWeekState {
  employees:     NormalisedEmployee[];
  isoWeek:       number;
  isoYear:       number;
  totalEmployees: number;
  isLoading:     boolean;
  isFetchingMore: boolean;
  isError:       boolean;
  /** Trigger an initial load or reload for a new subDomainId */
  load: (subDomainId: number) => void;
}

export function usePaginatedFutureWeek(): PaginatedFutureWeekState {
  const [triggerFetch, { isFetching, isError }] = useLazyGetFutureWeekQuery();

  const [employees,      setEmployees]      = useState<NormalisedEmployee[]>([]);
  const [isoWeek,        setIsoWeek]        = useState(0);
  const [isoYear,        setIsoYear]        = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Guards against stale async closures when subDomainId changes mid-flight
  const activeSubDomainRef = useRef<number | null>(null);

  const load = useCallback(
    async (subDomainId: number) => {
      activeSubDomainRef.current = subDomainId;

      // ── Reset state for the new domain ────────────────────────────────────
      setEmployees([]);
      setIsoWeek(0);
      setIsoYear(0);
      setTotalEmployees(0);
      setIsLoading(true);
      setIsFetchingMore(false);

      let page = 1;
      const accumulated: NormalisedEmployee[] = [];

      try {
        while (true) {
          // Bail out if a newer load() call has superseded us
          if (activeSubDomainRef.current !== subDomainId) return;

          const isFirstPage = page === 1;

          const result = await triggerFetch({
            subDomainId,
            pageNumber: page,
            pageSize:   PAGE_SIZE,
          }).unwrap();

          // Guard again after the await resolves
          if (activeSubDomainRef.current !== subDomainId) return;

          const normalised = normaliseRows(result.data ?? []);
          accumulated.push(...normalised);

          // Persist week meta from first page
          if (isFirstPage) {
            setIsoWeek(result.isoWeek);
            setIsoYear(result.isoYear);
            setTotalEmployees(result.totalEmployees);
            setIsLoading(false);
          }

          // Stream rows into state after each page so the UI updates progressively
          setEmployees([...accumulated]);

          const done =
            result.data.length < PAGE_SIZE ||
            accumulated.length >= result.totalEmployees;

          if (done) {
            setIsFetchingMore(false);
            break;
          }

          // More pages to fetch
          setIsFetchingMore(true);
          page++;
        }
      } catch {
        if (activeSubDomainRef.current === subDomainId) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [triggerFetch],
  );

  return {
    employees,
    isoWeek,
    isoYear,
    totalEmployees,
    isLoading,
    isFetchingMore,
    isError,
    load,
  };
}