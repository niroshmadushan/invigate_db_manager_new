"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Hash, Headset, Phone, Pencil, X, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

type SortColumn = "id" | "xid" | "name" | "extno";
type SortDirection = "asc" | "desc";

export function HelpdeskClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const rowsPerPage = 20;

  const utils = api.useUtils();
  const { canView, canEdit, isLoading: isPermsLoading } = usePermissions("help-desk");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ id: number, xid: number, name: string, extno: string | null } | null>(null);
  
  // Edit State
  const [newExtNo, setNewExtNo] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setPage(1);
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allHelpdesk, isLoading, isError } = api.helpdesk.getAll.useQuery({ search });

  const updateMutation = api.helpdesk.updateExtNo.useMutation({
    onSuccess: () => {
      utils.helpdesk.getAll.invalidate();
      toast.success("Extension number updated successfully!");
      closeModal();
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    }
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const openModal = (entry: NonNullable<typeof allHelpdesk>[0]) => {
    setEditingEntry(entry);
    setNewExtNo(entry.extno || "");
    setIsConfirming(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingEntry(null);
      setNewExtNo("");
      setIsConfirming(false);
    }, 200);
  };

  const handleSaveClick = () => {
    if (newExtNo.trim() === "") {
      toast.error("Extension number cannot be empty");
      return;
    }
    setIsConfirming(true);
  };

  const confirmUpdate = () => {
    if (!editingEntry) return;
    
    updateMutation.mutate({
      xid: editingEntry.xid,
      extno: newExtNo.trim(),
    });
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3 h-3 text-purple-500" /> 
      : <ArrowDown className="w-3 h-3 text-purple-500" />;
  };

  const sortedData = useMemo(() => {
    if (!allHelpdesk) return [];
    
    return [...allHelpdesk].sort((a, b) => {
      let valA: any = a[sortColumn] || "";
      let valB: any = b[sortColumn] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allHelpdesk, sortColumn, sortDirection]);

  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

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
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider w-24">
                  <button onClick={() => handleSort("xid")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    XID
                    <SortIcon column="xid" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Headset className="w-3.5 h-3.5 text-slate-400" />
                    Help Desk Name
                    <SortIcon column="name" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("extno")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Extension Number
                    <SortIcon column="extno" />
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
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching help desk entries...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load help desk data.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && currentData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No entries found.</p>
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {!isLoading && !isError && currentData.map((entry) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    key={entry.xid} 
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group cursor-default"
                  >
                    <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      #{entry.id}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      #{entry.xid}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100 text-[13px] tracking-wide">
                      {entry.name}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${entry.extno ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                          {entry.extno || 'Not Assigned'}
                        </span>
                        {canEdit && (
                          <button 
                            onClick={() => openModal(entry)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                            title="Edit Extension Number"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                <span className="text-slate-900 dark:text-slate-200">{totalRows}</span> Total Records
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#151923] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Update Extension Number
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">For <span className="font-bold text-slate-700 dark:text-slate-300">{editingEntry?.name}</span></p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex-1 bg-white dark:bg-[#151923]">
                {!isConfirming ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="extno" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Extension Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          id="extno"
                          type="text"
                          autoFocus
                          placeholder="Enter new extension number..."
                          value={newExtNo}
                          onChange={(e) => setNewExtNo(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveClick();
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">You can enter any valid number or text identifier for the extension.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                      <Phone className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you sure?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                      You are about to change the extension number for <span className="font-bold text-slate-900 dark:text-white">{editingEntry?.name}</span> to <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">{newExtNo}</span>.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 flex justify-end gap-3">
                {isConfirming ? (
                  <>
                    <button 
                      onClick={() => setIsConfirming(false)}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={confirmUpdate}
                      disabled={updateMutation.isPending}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm Update
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveClick}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
