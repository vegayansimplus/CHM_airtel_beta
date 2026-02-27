import type { OrgFilterKey } from "../types/orgHierarchy.types";

/**
 * Defines parent dependency for each filter
 * If parent is not selected → child is disabled
 */
export const ORG_FILTER_DEPENDENCY: Partial<
  Record<OrgFilterKey, OrgFilterKey>
> = {
  teamFunction: "vertical",
  domain: "teamFunction",
  subDomain: "domain",
};

/**
 * Defines reset cascade logic
 * When key changes → remove all children
 */
export const ORG_FILTER_RESET_MAP: Record<
  OrgFilterKey,
  OrgFilterKey[]
> = {
  vertical: ["teamFunction", "domain", "subDomain"],
  teamFunction: ["domain", "subDomain"],
  domain: ["subDomain"],
  subDomain: [],
};