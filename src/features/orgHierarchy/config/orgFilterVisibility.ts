import type { OrgFilterKey } from "../types/orgHierarchy.types";

export const ORG_FILTER_VISIBILITY: Record<string, OrgFilterKey[]> = {
  SUPER_ADMIN: ["vertical", "teamFunction", "domain", "subDomain"],
  VERTICAL_HEAD: ["teamFunction", "domain", "subDomain"],
  FUNCTION_HEAD: ["domain", "subDomain"],
  DOMAIN_HEAD: ["subDomain"],
  TEAM_LEAD: ["teamFunction"],
  TEAM_MEMBER: ["teamFunction"],
  SUB_DOMAIN_HEAD: ["domain","subDomain"],
};
