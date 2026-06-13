"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

export function ActivityTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);
  
  const createLogMutation = api.logs.createLog.useMutation();

  useEffect(() => {
    if (!pathname) return;
    
    // Prevent logging the exact same path twice in a row (e.g., due to React strict mode double render)
    if (lastLoggedPath.current === pathname) return;
    
    lastLoggedPath.current = pathname;

    // Log the page view
    createLogMutation.mutate({
      action: "PAGE_VIEW",
      pageUrl: pathname,
      details: "User navigated to " + pathname,
    });
  }, [pathname, createLogMutation]);

  return null; // This is a headless component
}
