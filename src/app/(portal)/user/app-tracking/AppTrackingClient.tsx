"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, CalendarDays, Hash, FileCheck2, User, Search, ChevronLeft, ChevronRight, LayoutList, Layers, ArrowUpDown, ChevronUp, ChevronDown, IdCard, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

export function AppTrackingClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;
  const { canView, isLoading: isPermsLoading } = usePermissions("app-tracking");

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setCurrentPage(1); // Reset to first page on new search
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: records, isLoading, isError } = api.appTracking.getAll.useQuery({ search });

  const safeRecords = records || [];
  const totalPages = Math.ceil(safeRecords.length / itemsPerPage);

  const sortedRecords = useMemo(() => {
    if (!sortConfig) return safeRecords;

    return [...safeRecords].sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof typeof a];
      let bVal: any = b[sortConfig.key as keyof typeof b];

      if (sortConfig.key === 'fullname') {
        aVal = `${a.name || ''} ${a.lastname || ''}`.trim();
        bVal = `${b.name || ''} ${b.lastname || ''}`.trim();
      }

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeRecords, sortConfig]);

  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null; // Toggle off third click
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-500" /> : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  };

  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  // Utility to format date nicely
  const formatDate = (date: Date | null) => {
    if (!date) return <span className="text-slate-400 italic">Unknown Date</span>;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(date));
  };

  // Utility to format name nicely
  const formatFullName = (name: string | null, lastname: string | null) => {
    if (!name && !lastname) return <span className="text-slate-400 italic">Unknown User</span>;
    return `${name || ''} ${lastname || ''}`.trim();
  };

  if (isPermsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)] w-full">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!canView) {
    return <PermissionDenied />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full relative">

      {/* Header removed as requested */}

      <div className="flex flex-col h-full bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none relative">
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full min-w-[1400px] text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#11151d]/95 backdrop-blur-md text-xs uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-16">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    ID
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('acc_date')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      Access Date
                    </div>
                    <SortIcon columnKey="acc_date" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('rec_method')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                      Recorded Method
                    </div>
                    <SortIcon columnKey="rec_method" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-32 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('t_number')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      Ticket No
                    </div>
                    <SortIcon columnKey="t_number" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('fullname')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Full Name
                    </div>
                    <SortIcon columnKey="fullname" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-32 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('staff_no')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-3.5 h-3.5 text-slate-400" />
                      Employee No
                    </div>
                    <SortIcon columnKey="staff_no" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-1/4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('app_access')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Application Accesses
                    </div>
                    <SortIcon columnKey="app_access" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('app_name')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      Application Name
                    </div>
                    <SortIcon columnKey="app_name" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching tracking records...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load app tracking data.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && safeRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No records found.</p>
                      {search && <p className="text-xs text-slate-400">Try adjusting your universal search criteria.</p>}
                    </div>
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {!isLoading && !isError && currentRecords.map((record, idx) => (
                  <motion.tr
                    key={`${record.staff_no}-${record.t_number}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-2 font-mono font-bold text-slate-500 dark:text-slate-400 text-xs">
                      {((currentPage - 1) * itemsPerPage) + idx + 1}
                    </td>
                    <td className="px-6 py-2 text-slate-700 dark:text-slate-300 text-sm font-medium whitespace-nowrap">
                      {formatDate(record.acc_date)}
                    </td>
                    <td className="px-6 py-2">
                      {record.rec_method ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
                          ${record.rec_method.toLowerCase() === 'automated' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20'}`}
                        >
                          {record.rec_method}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-2 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {record.t_number ? `#${record.t_number}` : <span className="text-slate-400 italic font-sans font-normal">NULL</span>}
                    </td>
                    <td className="px-6 py-2 font-semibold text-slate-900 dark:text-slate-200 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-[10px] shrink-0 ring-1 ring-indigo-500/20">
                          {((record.name?.[0] || '') + (record.lastname?.[0] || '')).toUpperCase() || '?'}
                        </div>
                        {formatFullName(record.name, record.lastname)}
                      </div>
                    </td>
                    <td className="px-6 py-2 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {record.staff_no ?? <span className="text-slate-400 italic font-sans font-normal">N/A</span>}
                    </td>
                    <td className="px-6 py-2 font-medium text-slate-600 dark:text-slate-300 text-sm">
                      {record.app_access ? (
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs">
                          {record.app_access}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal text-xs">No Access Logged</span>
                      )}
                    </td>
                    <td className="px-6 py-2 font-medium text-slate-600 dark:text-slate-300 text-sm">
                      {record.app_name ? (
                        <span className="inline-block bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs ring-1 ring-inset ring-purple-500/20">
                          {record.app_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal text-xs">N/A</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Premium Pagination Footer */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#11151d]/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, safeRecords.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{safeRecords.length}</span> records
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show max 5 pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${currentPage === pageNumber
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="text-slate-400 px-1 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
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
