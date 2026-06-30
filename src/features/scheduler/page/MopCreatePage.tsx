import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const MopCreatePage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="mopcreate" domainId={domainId} subDomainId={subDomainId} />
);

export default MopCreatePage;
