import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

/** Thin wrapper - all behaviour comes from GenericStagePage + stageConfig. */
export const ImpactAnalysisPage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="impactanalysis" domainId={domainId} subDomainId={subDomainId} />
);

export default ImpactAnalysisPage;
