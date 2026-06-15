"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Hash, Building2, UserCircle, User, Pencil, X, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

type SortColumn = "id" | "dep_name" | "dep_man" | "sec_manager";
type SortDirection = "asc" | "desc";
type EditingRole = "DEP_MAN" | "SEC_MAN" | null;

export function DepartmentsClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const rowsPerPage = 20;

  const utils = api.useUtils();
  const { canView, canEdit, isLoading: isPermsLoading } = usePermissions("departments");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<{ id: number, dep_name: string, dep_man_id: number | null, sec_man_id: number | null, dep_man: string, sec_manager: string } | null>(null);
  const [editingRole, setEditingRole] = useState<EditingRole>(null);
  
  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedNewUser, setSelectedNewUser] = useState<{ id: number, username: string, name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(userSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setPage(1);
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allDepartments, isLoading, isError } = api.department.getAll.useQuery({ search });
  
  const { data: searchResults, isFetching: isSearchingUsers } = api.department.searchUsers.useQuery(
    { search: debouncedSearch },
    { enabled: isModalOpen && debouncedSearch.length > 2 }
  );

  const updateMutation = api.department.updateManagers.useMutation({
    onSuccess: () => {
      utils.department.getAll.invalidate();
      toast.success("Manager updated successfully!");
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

  const openModal = (dept: NonNullable<typeof allDepartments>[0], role: "DEP_MAN" | "SEC_MAN") => {
    setEditingDept(dept);
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingDept(null);
      setEditingRole(null);
      setUserSearchQuery("");
      setDebouncedSearch("");
      setSelectedNewUser(null);
    }, 200);
  };

  const confirmUpdate = () => {
    if (!editingDept || !editingRole || !selectedNewUser) return;
    
    // We send back the unchanged original data for the other role
    const dep_man = editingRole === "DEP_MAN" ? selectedNewUser.username : (editingDept.dep_man || "");
    const dep_man_id = editingRole === "DEP_MAN" ? selectedNewUser.id : editingDept.dep_man_id;
    
    const sec_manager = editingRole === "SEC_MAN" ? selectedNewUser.username : (editingDept.sec_manager || "");
    const sec_man_id = editingRole === "SEC_MAN" ? selectedNewUser.id : editingDept.sec_man_id;

    updateMutation.mutate({
      id: editingDept.id,
      dep_man,
      dep_man_id,
      sec_manager,
      sec_man_id,
    });
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3 h-3 text-purple-500" /> 
      : <ArrowDown className="w-3 h-3 text-purple-500" />;
  };

  const sortedData = useMemo(() => {
    if (!allDepartments) return [];
    
    return [...allDepartments].sort((a, b) => {
      let valA: any = a.id;
      let valB: any = b.id;

      if (sortColumn === "dep_name") {
        valA = a.dep_name?.toLowerCase() || "";
        valB = b.dep_name?.toLowerCase() || "";
      } else if (sortColumn === "dep_man") {
        valA = (a.dep_man || "").toLowerCase();
        valB = (b.dep_man || "").toLowerCase();
      } else if (sortColumn === "sec_manager") {
        valA = (a.sec_manager || "").toLowerCase();
        valB = (b.sec_manager || "").toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allDepartments, sortColumn, sortDirection]);

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
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("dep_name")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Department Name
                    <SortIcon column="dep_name" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("dep_man")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <UserCircle className="w-3.5 h-3.5 text-slate-400" />
                    Department Manager
                    <SortIcon column="dep_man" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider">
                  <button onClick={() => handleSort("sec_manager")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <UserCircle className="w-3.5 h-3.5 text-slate-400" />
                    Section Manager
                    <SortIcon column="sec_manager" />
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
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching departments...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load departments.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && currentData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No departments found.</p>
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {!isLoading && !isError && currentData.map((dept) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    key={dept.id} 
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group cursor-default"
                  >
                    <td className="px-6 py-2.5 font-bold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      #{dept.id}
                    </td>
                    <td className="px-6 py-2.5 font-bold text-slate-900 dark:text-slate-100 text-[13px] uppercase tracking-wide truncate max-w-[250px]" title={dept.dep_name}>
                      {dept.dep_name}
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${dept.dep_man ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                            {dept.dep_man || 'Not Assigned'}
                          </span>
                          {dept.dep_man_id && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                              ID: {dept.dep_man_id}
                            </span>
                          )}
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => openModal(dept, "DEP_MAN")}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                            title="Edit Department Manager"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${dept.sec_manager ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                            {dept.sec_manager || 'Not Assigned'}
                          </span>
                          {dept.sec_man_id && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                              ID: {dept.sec_man_id}
                            </span>
                          )}
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => openModal(dept, "SEC_MAN")}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                            title="Edit Section Manager"
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

        {/* Improved Pagination Footer */}
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
              className="w-full max-w-lg bg-white dark:bg-[#151923] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Change {editingRole === "DEP_MAN" ? "Department Manager" : "Section Manager"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">For <span className="font-bold text-slate-700 dark:text-slate-300">{editingDept?.dep_name}</span></p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {!selectedNewUser ? (
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Search users by name, username, or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2 min-h-[200px]">
                      {debouncedSearch.length <= 2 && (
                        <p className="text-xs text-center text-slate-500 py-10">Type at least 3 characters to search...</p>
                      )}
                      
                      {isSearchingUsers && (
                        <div className="flex justify-center py-10">
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        </div>
                      )}

                      {!isSearchingUsers && searchResults && searchResults.length === 0 && debouncedSearch.length > 2 && (
                        <p className="text-xs text-center text-slate-500 py-10">No users found.</p>
                      )}

                      {!isSearchingUsers && searchResults && searchResults.map(user => (
                        <button 
                          key={user.id}
                          onClick={() => setSelectedNewUser({ id: user.id, username: user.username, name: `${user.name || ''} ${user.lastname || ''}`.trim() || user.username })}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 text-left transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0">
                            {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {`${user.name || ''} ${user.lastname || ''}`.trim() || 'Unknown Name'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">@{user.username} • ID: {user.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                      <User className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you sure?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                      You are about to assign <span className="font-bold text-slate-900 dark:text-white">{selectedNewUser.name}</span> (@{selectedNewUser.username}) as the new <span className="font-bold">{editingRole === "DEP_MAN" ? "Department Manager" : "Section Manager"}</span> for <span className="font-bold text-slate-900 dark:text-white">{editingDept?.dep_name}</span>.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 flex justify-end gap-3">
                {selectedNewUser ? (
                  <>
                    <button 
                      onClick={() => setSelectedNewUser(null)}
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
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
