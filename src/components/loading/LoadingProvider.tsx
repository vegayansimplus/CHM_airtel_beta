import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type LoadingLevel = "global" | "page";

interface LoadingRegistryState {
  global: Set<string>;
  page: Set<string>;
}

interface LoadingContextValue {
  registry: React.MutableRefObject<LoadingRegistryState>;
  notify: () => void;
  version: number;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

/**
 * Root of the app's loading-priority system. The registry itself lives in a
 * ref (register/unregister never needs to walk React state), but the context
 * `value` object's identity must change on every registry mutation — that's
 * what tells React to re-render consumers of `useLoadingVisibility` even
 * though the `children` element reference passed in from main.tsx never
 * changes (which would otherwise let React bail out of the subtree).
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const registry = useRef<LoadingRegistryState>({ global: new Set(), page: new Set() });
  const [version, setVersion] = useState(0);
  const notify = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => ({ registry, notify, version }), [notify, version]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

function useLoadingContext(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("Loading hooks must be used within <LoadingProvider>");
  }
  return ctx;
}

/** Registers/unregisters `key` as an active loader at `level` while `active` is true. */
function useRegisterLoading(level: LoadingLevel, key: string, active: boolean) {
  const { registry, notify } = useLoadingContext();

  useEffect(() => {
    const set = registry.current[level];
    if (active) {
      if (!set.has(key)) {
        set.add(key);
        notify();
      }
    } else if (set.has(key)) {
      set.delete(key);
      notify();
    }

    return () => {
      if (set.has(key)) {
        set.delete(key);
        notify();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, key, active]);
}

/** App bootstrap / auth hydration only — highest priority, suppresses everything else. */
export function useGlobalLoading(active: boolean, key: string) {
  useRegisterLoading("global", key, active);
}

/** A page/route's *initial* data load only — never pass `isFetching` here, only `isLoading && !data`. */
export function usePageLoading(active: boolean, key: string) {
  useRegisterLoading("page", key, active);
}

/** Read-only visibility snapshot for loader components to self-suppress by priority. */
export function useLoadingVisibility(): { globalActive: boolean; pageActive: boolean } {
  // Subscribing via useContext (inside useLoadingContext) re-renders this
  // hook's caller whenever the provider's `value` identity changes (i.e. on
  // every notify() bump), even though the ref itself never changes identity.
  const { registry } = useLoadingContext();
  const globalActive = registry.current.global.size > 0;
  const pageActive = !globalActive && registry.current.page.size > 0;
  return { globalActive, pageActive };
}
