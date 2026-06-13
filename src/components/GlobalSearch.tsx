"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (query) {
        newSearchParams.set("q", query);
      } else {
        newSearchParams.delete("q");
      }
      
      const search = newSearchParams.toString();
      const newPath = search ? `?${search}` : window.location.pathname;
      router.push(newPath);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative group hidden md:block">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        placeholder="Search personnel..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-48 lg:w-64 focus:w-72 lg:focus:w-96 bg-blue-50/50 dark:bg-slate-950/40 border border-blue-100 dark:border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-inner"
      />
    </div>
  );
}
