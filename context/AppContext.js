"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerRole, setViewerRole] = useState("Admin");

  const value = useMemo(
    () => ({
      isAuthenticated,
      isStoreHydrated: true,
      viewerRole,
      selectors: {
        projectCards: [],
        getProjectBundle() {
          return null;
        },
        getRecentProjectActivity() {
          return [];
        },
        getLeadActivities() {
          return [];
        },
      },
      login() {
        setIsAuthenticated(true);
      },
      logout() {
        setIsAuthenticated(false);
      },
      setViewerRole,
    }),
    [isAuthenticated, viewerRole],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
