"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Loader2, Key, Users, AppWindow, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

export function AppAccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allAppGroups, isLoading, isError } = api.appAccess.getAllGrouped.useQuery({ search });

  const displayGroups = allAppGroups || [];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] w-full relative">
      
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Fetching access lists...</p>
        </div>
      )}

      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 font-medium">Failed to load application access data.</p>
        </div>
      )}

      {!isLoading && !isError && displayGroups.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <Key className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium text-slate-500">No applications found matching your search.</p>
        </div>
      )}

      {/* Modern Grid Layout */}
      {!isLoading && !isError && displayGroups.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10 mt-4"
        >
          {displayGroups.map((group) => (
            <motion.button
              key={group.app_name}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/user/app-access/${encodeURIComponent(group.app_name)}`)}
              className="flex flex-col text-left bg-white dark:bg-[#151923] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <AppWindow className="w-6 h-6" />
              </div>
              
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 min-h-[40px]">
                {group.app_name}
              </h3>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {group.employees.length} Users
                </div>
                
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
