import { useCallback, useState } from "react";
import type {
  OrgFilterKey,
  OrgFilterValues,
} from "../types/orgHierarchy.types";
import { ORG_FILTER_RESET_MAP } from "../config/orgFilterDependency";

export const useOrgHierarchyState = (
  initial: OrgFilterValues = {}
) => {
  const [values, setValues] = useState<OrgFilterValues>(initial);

  const handleChange = useCallback(
    (key: OrgFilterKey, value?: number) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };

        // Apply cascading reset
        const childrenToReset = ORG_FILTER_RESET_MAP[key];
        childrenToReset.forEach((child) => {
          delete next[child];
        });

        return next;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    setValues({});
  }, []);

  return {
    values,
    setValues,
    handleChange,
    resetAll,
  };
};