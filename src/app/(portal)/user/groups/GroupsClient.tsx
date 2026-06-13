"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, Hash, Users, FolderOpen, Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function GroupsClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 25;

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setCurrentPage(1); 
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: records, isLoading, isError } = api.groups.getGroups.useQuery();

  const safeRecords = records || [];
  
  const filteredRecords = useMemo(() => {
    if (!search) return safeRecords;
    const lowerSearch = search.toLowerCase();
    return safeRecords.filter((r: any) => 
      r.name?.toLowerCase().includes(lowerSearch) ||
      r.id?.toString().includes(lowerSearch) ||
      r.total?.toString().includes(lowerSearch)
    );
  }, [safeRecords, search]);

  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;
    
    return [...filteredRecords].sort((a: any, b: any) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortConfig]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);

  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null;
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full relative">
      <div className="flex flex-col h-full bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none relative">
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#11151d]/95 backdrop-blur-md text-xs uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-32 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('id')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      Group ID
                    </div>
                    <SortIcon columnKey="id" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('name')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                      Group Name
                    </div>
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-48 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('total')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Total Members
                    </div>
                    <SortIcon columnKey="total" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 w-32">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching external groups...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load groups data.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && sortedRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No groups found.</p>
                      {search && <p className="text-xs text-slate-400">Try adjusting your universal search criteria.</p>}
                    </div>
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {!isLoading && !isError && currentRecords.map((record: any, idx) => (
                  <motion.tr 
                    key={`${record.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-2 font-mono font-bold text-slate-500 dark:text-slate-400 text-xs">
                      #{record.id}
                    </td>
                    <td className="px-6 py-2 font-semibold text-slate-900 dark:text-slate-200 text-sm">
                      {record.name}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md text-xs font-bold
                          ${record.total > 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20' : 
                            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-inset ring-slate-500/20'}`}
                        >
                          {record.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <Link 
                        href={`/user/groups/${record.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                      >
                        <Users className="w-3.5 h-3.5" />
                        View Users
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#11151d]/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, sortedRecords.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sortedRecords.length}</span> groups
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
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          currentPage === pageNumber
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
