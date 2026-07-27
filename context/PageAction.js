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

const PageActionContext = createContext(null);

/**
 * The header's primary button belongs to the chrome, but the behaviour behind it
 * belongs to the screen. Route meta supplies the label so the button paints with
 * the rest of the shell, and the mounted screen registers the handler here.
 */
export function PageActionProvider({ children }) {
  const [handler, setHandler] = useState(null);

  const register = useCallback((next) => {
    setHandler(next ? () => next : null);
  }, []);

  const value = useMemo(() => ({ handler, register }), [handler, register]);

  return (
    <PageActionContext.Provider value={value}>{children}</PageActionContext.Provider>
  );
}

/** Read by the shell to decide whether the primary button is live. */
export function usePageActionHandler() {
  return useContext(PageActionContext)?.handler || null;
}

/** Called by a screen to own the header's primary action while it is mounted. */
export function usePageAction(onAction) {
  const register = useContext(PageActionContext)?.register;
  const latest = useRef(onAction);
  latest.current = onAction;

  useEffect(() => {
    if (!register) {
      return undefined;
    }

    register(() => latest.current?.());
    return () => register(null);
  }, [register]);
}
