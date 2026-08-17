import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { authStorage } from "../../../app/store/auth.storage";
import { useOrgHierarchyState } from "../../orgHierarchy/hooks/useOrgHierarchyState";
import { useOrgHierarchyFilters } from "../../orgHierarchy/hooks/useOrgHierarchyFilters";
import {
  useGetCrqsBySubDomainQuery,
  useGetCrqJourneyStagesQuery,
  useGetCrqDetailsQuery,
} from "../api/crqJourneyExplorer.api";
import { computeFlowProgress, groupJourneyStages } from "../utils/crqJourney.utils";
import type { CrqJourneySearchRow } from "../types/crqJourney.types";

/**
 * Drives /cabmanager/journey[/:id]: sub-domain scoped CRQ search → dynamic-length
 * journey flow. When a crqNo arrives in the URL (e.g. the All CRQs drawer's
 * "View full CRQ journey" link), it's auto-selected instead of making the user
 * re-pick org scope + CRQ from the dropdown.
 */
export const useCrqJourney = () => {
  const loggedUser = authStorage.getUser();
  const roleName = loggedUser?.roleCode ?? "TEAM_MEMBER";
  const { id: crqNoFromRoute } = useParams<{ id: string }>();

  const { values, handleChange: handleOrgFilterChange } = useOrgHierarchyState();
  const { options } = useOrgHierarchyFilters(values);

  const [selectedCrq, setSelectedCrq] = useState<CrqJourneySearchRow | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const subDomainId = values.subDomain;

  const { data: crqOptions = [], isFetching: isLoadingCrqs } = useGetCrqsBySubDomainQuery(
    subDomainId ?? 0,
    { skip: subDomainId == null }
  );

  // A different sub-domain scope invalidates whatever CRQ was picked before.
  useEffect(() => {
    setSelectedCrq(null);
  }, [subDomainId]);

  // Deep-link: /cabmanager/journey/:id lands here with a crqNo already known,
  // so fetch just enough (info card fields) to select it automatically. Once
  // consumed (or the user picks a CRQ themselves), it never overrides the
  // selection again — otherwise a background refetch of these details could
  // silently snap the user's later manual pick back to the route's crqNo.
  const [routeCrqConsumed, setRouteCrqConsumed] = useState(false);

  // One details query serves two jobs: bootstrapping the deep-linked CRQ, and
  // enriching the header strip (team function / created on / remark) for
  // whichever CRQ is selected. RTK Query dedupes them when they're the same.
  const detailsCrqNo = selectedCrq?.crqNo ?? (!routeCrqConsumed ? crqNoFromRoute : undefined);

  const {
    data: crqDetails,
    isFetching: isLoadingDetails,
    isError: isDetailsError,
  } = useGetCrqDetailsQuery(detailsCrqNo ?? "", { skip: !detailsCrqNo });

  useEffect(() => {
    if (!routeCrqConsumed && crqDetails?.info && crqDetails.info.crqNo === crqNoFromRoute) {
      setSelectedCrq({
        crqNo: crqDetails.info.crqNo,
        currentStage: crqDetails.info.currentStage,
        currentStatus: crqDetails.info.currentStatus,
        enteredCurrentStageAt: crqDetails.info.createdDate,
      });
      setRouteCrqConsumed(true);
    }
  }, [crqDetails, crqNoFromRoute, routeCrqConsumed]);

  const handleSelectCrq = (crq: CrqJourneySearchRow | null) => {
    setRouteCrqConsumed(true);
    setSelectedCrq(crq);
  };

  const handleChange = (key: Parameters<typeof handleOrgFilterChange>[0], value?: number) => {
    setRouteCrqConsumed(true);
    handleOrgFilterChange(key, value);
  };

  const {
    data: stageRows,
    isFetching: isLoadingJourney,
    isError: isJourneyError,
    refetch: refetchJourney,
  } = useGetCrqJourneyStagesQuery(selectedCrq?.crqNo ?? "", { skip: !selectedCrq });

  const flow = useMemo(() => (stageRows ? groupJourneyStages(stageRows) : null), [stageRows]);
  const progress = useMemo(() => (flow ? computeFlowProgress(flow) : null), [flow]);

  // Only the details belonging to the CRQ on screen — a stale response for the
  // previously selected CRQ must not leak into the header strip.
  const selectedDetails =
    crqDetails?.info && crqDetails.info.crqNo === selectedCrq?.crqNo ? crqDetails.info : null;

  return {
    roleName,
    values,
    options,
    handleChange,
    crqOptions,
    isLoadingCrqs,
    selectedCrq,
    handleSelectCrq,
    showLegend,
    handleToggleLegend: () => setShowLegend((v) => !v),
    isLoading: isLoadingJourney || (!!crqNoFromRoute && !selectedCrq && isLoadingDetails),
    error: isJourneyError
      ? "Failed to load CRQ journey."
      : isDetailsError && !!crqNoFromRoute && !routeCrqConsumed
        ? "Failed to load CRQ."
        : null,
    flow,
    progress,
    details: selectedDetails,
    isLoadingDetails: isLoadingDetails && !selectedDetails,
    refetch: () => {
      if (selectedCrq) void refetchJourney();
    },
    isRefreshing: isLoadingJourney,
  };
};
