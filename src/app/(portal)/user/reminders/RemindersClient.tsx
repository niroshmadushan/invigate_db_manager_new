"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Hash, BellRing, Calendar, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

type SortColumn = "id" | "rem_num" | "rev_ticket" | "rem_date";
type SortDirection = "asc" | "desc";

export function RemindersClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const rowsPerPage = 20;

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setPage(1);
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allReminders, isLoading, isError } = api.reminder.getAll.useQuery({ search });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3 h-3 text-purple-500" /> 
      : <ArrowDown className="w-3 h-3 text-purple-500" />;
  };

  const sortedData = useMemo(() => {
    if (!allReminders) return [];
    
    return [...allReminders].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === "rem_date") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allReminders, sortColumn, sortDirection]);

  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full relative">
      <div className="flex flex-col h-full bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none relative">
        
        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#11151d]/95 backdrop-blur-md text-xs uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 z-10">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider w-24">
                  <button onClick={() => handleSort("id")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    ID
                    <SortIcon column="id" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("rem_num")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <BellRing className="w-3.5 h-3.5 text-slate-400" />
                    Reminder Number
                    <SortIcon column="rem_num" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("rev_ticket")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Ticket className="w-3.5 h-3.5 text-slate-400" />
                    Reference Ticket No
                    <SortIcon column="rev_ticket" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("rem_date")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Reminder Date
                    <SortIcon column="rem_date" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching reminders...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load reminders.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && currentData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No reminders found.</p>
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {!isLoading && !isError && currentData.map((reminder) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    key={reminder.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-default"
                  >
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      #{reminder.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-purple-700 dark:text-purple-400 text-[13px]">
                        {reminder.rem_num}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-700 dark:text-blue-400 text-[13px] font-mono tracking-wide">
                        {reminder.rev_ticket}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {new Date(reminder.rem_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && !isError && totalRows > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#11151d] z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="text-slate-900 dark:text-slate-200">{totalRows}</span> Total Reminders
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center w-12 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
