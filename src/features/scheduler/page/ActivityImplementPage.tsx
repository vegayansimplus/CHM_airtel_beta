import React from "react";
import { GenericStagePage } from "../components/generic/GenericStagePage";

interface Props {
  domainId?: number;
  subDomainId?: number;
}

export const ActivityImplementPage: React.FC<Props> = ({ domainId, subDomainId }) => (
  <GenericStagePage stageKey="activityimplement" domainId={domainId} subDomainId={subDomainId} />
);

export default ActivityImplementPage;
