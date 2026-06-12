"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useAppContext();

  useEffect(() => {
    router.replace(isAuthenticated ? "/projects" : "/login");
  }, [isAuthenticated, router]);

  return null;
}
