import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const SchedulingPage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="scheduling" domainId={domainId} subDomainId={subDomainId} />
);

export default SchedulingPage;
