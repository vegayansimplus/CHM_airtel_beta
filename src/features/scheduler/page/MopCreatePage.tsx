import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  /** null = role has no domain scope (see util/orgScope.ts). */
  domainId?: number | null;
  subDomainId?: number;
}

export const MopCreatePage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="mopcreate" domainId={domainId} subDomainId={subDomainId} />
);

export default MopCreatePage;
