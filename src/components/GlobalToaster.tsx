"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function GlobalToaster() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Toaster 
      position="top-right" 
      theme={currentTheme as "light" | "dark" | "system"} 
      toastOptions={{
        className: 'bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-sm font-bold text-[12px] uppercase tracking-wider rounded-xl',
      }}
    />
  );
}
