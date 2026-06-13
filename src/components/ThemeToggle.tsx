"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 opacity-50" disabled></button>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button 
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 bg-white dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className={`absolute inset-0 bg-indigo-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full`}></div>
      {currentTheme === 'dark' ? (
        <svg className="w-4 h-4 relative z-10 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 relative z-10 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
