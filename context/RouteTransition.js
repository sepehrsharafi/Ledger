"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const RouteTransitionContext = createContext(null);

// Navigations that resolve faster than this never show a skeleton, so cached
// routes stay a single instant swap instead of flashing.
const SKELETON_DELAY = 80;

function toPathname(href) {
  return String(href || "").split("?")[0].split("#")[0];
}

/**
 * Tracks the route the user is heading to before the App Router has committed
 * it. Next only knows about a route's `loading.js` once that segment has been
 * fetched (and prefetch is disabled in development), so without this the
 * content area keeps showing the previous page while the server works.
 */
export function RouteTransitionProvider({ children }) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState(null);
  const [isSkeletonVisible, setIsSkeletonVisible] = useState(false);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const startNavigation = useCallback(
    (href) => {
      const target = toPathname(href);
      if (!target || target === pathname) {
        return;
      }

      clearTimers();
      setPendingPath(target);
      setIsSkeletonVisible(false);
      timers.current.push(
        window.setTimeout(() => setIsSkeletonVisible(true), SKELETON_DELAY),
        // Safety valve: never strand the UI on a skeleton if a navigation is
        // cancelled or fails.
        window.setTimeout(() => {
          setPendingPath(null);
          setIsSkeletonVisible(false);
        }, 20000),
      );
    },
    [clearTimers, pathname],
  );

  useEffect(() => {
    clearTimers();
    setPendingPath(null);
    setIsSkeletonVisible(false);
  }, [clearTimers, pathname]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo(
    () => ({
      pendingPath: isSkeletonVisible ? pendingPath : null,
      startNavigation,
    }),
    [isSkeletonVisible, pendingPath, startNavigation],
  );

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  return (
    useContext(RouteTransitionContext) || {
      pendingPath: null,
      startNavigation() {},
    }
  );
}
