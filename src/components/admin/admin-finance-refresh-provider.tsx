"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FinanceRefreshContextValue = {
  refreshKey: number;
  bumpDataRefresh: () => void;
};

const FinanceRefreshContext = createContext<FinanceRefreshContextValue | null>(null);

export function AdminFinanceRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpDataRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshKey, bumpDataRefresh }),
    [refreshKey, bumpDataRefresh],
  );

  return (
    <FinanceRefreshContext.Provider value={value}>{children}</FinanceRefreshContext.Provider>
  );
}

export function useAdminFinanceRefresh() {
  const ctx = useContext(FinanceRefreshContext);
  if (!ctx) {
    throw new Error("useAdminFinanceRefresh must be used within AdminFinanceRefreshProvider");
  }
  return ctx;
}
