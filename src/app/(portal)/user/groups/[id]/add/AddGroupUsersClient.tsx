"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, Hash, User, Mail, AtSign, Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

export function AddGroupUsersClient({ groupId }: { groupId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [isConfirmingAdd, setIsConfirmingAdd] = useState(false);
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

  const { data: records, isLoading, isError } = api.groups.getAllUsersForGroupAdd.useQuery();
  const addUsersMutation = api.groups.addUsersToGroup.useMutation({
    onSuccess: () => {
      router.push(`/user/groups/${groupId}`);
    }
  });

  const safeRecords = records || [];
  
  const filteredRecords = useMemo(() => {
    if (!search) return safeRecords;
    const lowerSearch = search.toLowerCase();
    return safeRecords.filter((r: any) => 
      r.name?.toLowerCase().includes(lowerSearch) ||
      r.username?.toLowerCase().includes(lowerSearch) ||
      r.email?.toLowerCase().includes(lowerSearch) ||
      r.id?.toString().includes(lowerSearch)
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

  const toggleSelection = (userId: number) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const handleAddSelected = () => {
    if (selectedUserIds.size === 0) return;
    setIsConfirmingAdd(true);
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
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-4">
            <button 
              suppressHydrationWarning
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Add Users to Group #{groupId}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Select users from the database to add to this group
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {selectedUserIds.size} Selected
            </span>
            <button
              suppressHydrationWarning
              onClick={handleAddSelected}
              disabled={selectedUserIds.size === 0 || addUsersMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              {addUsersMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Add Selected Users
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#11151d]/95 backdrop-blur-md text-xs uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 w-16 text-center">
                  {/* Select All could go here, but omitted for simplicity across pagination */}
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-24 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('id')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      ID
                    </div>
                    <SortIcon columnKey="id" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-64 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('name')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Name
                    </div>
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider w-64 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('username')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AtSign className="w-3.5 h-3.5 text-slate-400" />
                      Username
                    </div>
                    <SortIcon columnKey="username" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-extrabold tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group" onClick={() => handleSort('email')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email
                    </div>
                    <SortIcon columnKey="email" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching local users...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load local users.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && sortedRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No users found.</p>
                      {search && <p className="text-xs text-slate-400">Try adjusting your universal search criteria.</p>}
                    </div>
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {!isLoading && !isError && currentRecords.map((record: any, idx) => {
                  const isSelected = selectedUserIds.has(record.id);
                  return (
                    <motion.tr 
                      key={`${record.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                      onClick={() => toggleSelection(record.id)}
                    >
                      <td className="px-6 py-2.5 text-center">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 font-mono font-bold text-slate-500 dark:text-slate-400 text-xs">
                        #{record.id}
                      </td>
                      <td className="px-6 py-2.5 font-semibold text-slate-900 dark:text-slate-200 text-sm">
                        {record.name}
                      </td>
                      <td className="px-6 py-2.5 text-slate-600 dark:text-slate-300 text-sm">
                        {record.username}
                      </td>
                      <td className="px-6 py-2.5 text-slate-500 dark:text-slate-400 text-sm">
                        {record.email}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#11151d]/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, sortedRecords.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sortedRecords.length}</span> users
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

      <AnimatePresence>
        {isConfirmingAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#151923] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Members</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to add <strong className="text-slate-700 dark:text-slate-300">{selectedUserIds.size}</strong> user{selectedUserIds.size > 1 ? 's' : ''} to Group #{groupId}?</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 mt-8">
                  <button
                    onClick={() => setIsConfirmingAdd(false)}
                    disabled={addUsersMutation.isPending}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => addUsersMutation.mutate({ id: groupId, users: Array.from(selectedUserIds) })}
                    disabled={addUsersMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {addUsersMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Yes, Add Users
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
