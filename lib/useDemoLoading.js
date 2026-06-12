"use client";

import { useEffect, useState } from "react";

export function useDemoLoading(key, delay = 650) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timeout);
  }, [key, delay]);

  return loading;
}
