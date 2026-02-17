import type { LoggedUserApiResponse } from "../types/auth.types";

export const normalizeRBAC = (apiUser: LoggedUserApiResponse) => {
  const moduleMap: Record<string, string[]> = {};

  apiUser.modules.forEach((mod) => {
    moduleMap[mod.moduleName] = [...new Set(mod.permissions)];
  });

  return moduleMap;
};
