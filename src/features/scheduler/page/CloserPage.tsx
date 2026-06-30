import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const CloserPage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="closer" domainId={domainId} subDomainId={subDomainId} />
);

export default CloserPage;
