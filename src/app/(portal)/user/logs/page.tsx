"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "~/trpc/react";
import { Clock, Search, Filter, Calendar, ChevronLeft, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogsPage() {
  const router = useRouter();
  
  // Filters
  const [pageFilter, setPageFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Fetch logs
  const { data, isLoading } = api.logs.getLogs.useQuery({
    limit: 100,
    pageFilter: pageFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0C0C0E] text-slate-800 dark:text-slate-200">
      {/* Thin Header */}
      <div className="shrink-0 px-6 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151923] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/user/dashboard")}
            className="w-8 h-8 rounded-lg bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-tight">
              <Clock className="w-4 h-4 text-blue-500" />
              System Audit Logs
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Filter by Page URL..." 
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-white/5 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-[180px] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-white/5 rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:light] dark:[color-scheme:dark] transition-colors"
              />
            </div>
            <span className="text-slate-400 text-xs">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:light] dark:[color-scheme:dark] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Bleed Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#0C0C0E] custom-scrollbar">
        <table className="w-full text-left border-collapse relative min-w-max">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#151923] shadow-sm">
            <tr className="border-b border-slate-200 dark:border-white/5">
              <th className="px-6 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
              <th className="px-6 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target Page</th>
              <th className="px-6 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-full">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
                  <p className="text-sm">Scanning audit records...</p>
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                  <Filter className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No audit logs match your current filters.</p>
                </td>
              </tr>
            ) : (
              data?.items.map((log) => (
                <motion.tr 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key={log.id} 
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="text-[13px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[250px] block">
                      {log.pageUrl || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[13px] text-slate-600 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
                      {log.details || "—"}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
