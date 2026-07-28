"use client";

import { useEffect, useState } from "react";

const EMPTY = {
  projects: [],
  teamMembers: [],
  projectMembers: [],
  unreadCount: 0,
  navCounts: {},
  notifications: [],
};

/**
 * Reads the chrome's data from a promise created on the server by the workspace
 * layout. The shell renders with `EMPTY` first and fills in the switcher, avatar
 * and nav tallies when it resolves — the chrome must never wait on this.
 *
 * Previous data is kept while a new promise resolves, so the badges update in
 * place after a mutation instead of blinking back to empty. There is no
 * module-level cache: that is exactly what used to leave a stale count on screen
 * until the page was reloaded.
 */
export function useShellData(shellData) {
  const [data, setData] = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shellData) {
      return undefined;
    }

    let active = true;

    Promise.resolve(shellData)
      .then((payload) => {
        if (active && payload) {
          setData(payload);
        }
      })
      .catch(() => {
        // The chrome is still usable without its tallies; leave what we have.
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [shellData]);

  return { ...data, isLoading };
}
