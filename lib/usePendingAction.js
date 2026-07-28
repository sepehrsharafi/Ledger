"use client";

import { useCallback, useState, useTransition } from "react";

/**
 * Tracks which single control is mid-flight, so a mutation can report progress on
 * the thing that was clicked rather than blanking the screen.
 *
 * `startTransition` is given an async function on purpose: React keeps `isPending`
 * true until the action resolves *and* the resulting re-render commits. Because
 * every action here ends in `revalidatePath`, that covers the whole round trip —
 * the server query, the streamed re-render, and the repaint — so the spinner
 * disappears exactly when the new data appears, never before.
 *
 * `key` identifies the control (a status name, a member id, "save"), letting the
 * caller light up one chip or one row instead of all of them.
 */
export function usePendingAction() {
  const [pendingKey, setPendingKey] = useState(null);
  const [isPending, startTransition] = useTransition();

  const run = useCallback((key, action) => {
    // Set outside the transition so the spinner appears on the very next paint.
    setPendingKey(key);
    startTransition(async () => {
      await action();
    });
  }, []);

  return {
    /**
     * The key passed to `run`, or null once the update has landed.
     *
     * Masked by `isPending` rather than cleared when the action resolves. Those
     * are not the same moment: the server action settles well before the
     * revalidated render commits, and clearing on resolution dropped the spinner
     * while the controls were still disabled — a couple of seconds of frozen UI
     * with nothing explaining why. Tying both to `isPending` keeps them in step.
     */
    pendingKey: isPending ? pendingKey : null,
    isPending,
    run,
  };
}
