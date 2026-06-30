import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const MopValidatePage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="mopvalidate" domainId={domainId} subDomainId={subDomainId} />
);

export default MopValidatePage;
