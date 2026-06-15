"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, ChevronDown, ChevronRight, Building2, LayoutGrid, ShieldAlert, User, Pencil, X, Search as SearchIcon, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

export function ItbsmClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({});
  const utils = api.useUtils();
  const { canView, canEdit, isLoading: isPermsLoading } = usePermissions("itbsm");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedNewUser, setSelectedNewUser] = useState<{ username: string, name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(userSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allData, isLoading, isError } = api.itbsm.getAll.useQuery({ search });

  const { data: searchResults, isFetching: isSearchingUsers } = api.itbsm.searchUsers.useQuery(
    { search: debouncedSearch },
    { enabled: isModalOpen && debouncedSearch.length > 2 }
  );

  const updateMutation = api.itbsm.updateItbsm.useMutation({
    onSuccess: () => {
      utils.itbsm.getAll.invalidate();
      closeModal();
    }
  });

  const groupedData = useMemo(() => {
    if (!allData) return {};
    
    const groups: Record<string, typeof allData> = {};
    for (const item of allData) {
      if (!groups[item.division_name]) {
        groups[item.division_name] = [];
      }
      groups[item.division_name].push(item);
    }
    return groups;
  }, [allData]);

  const toggleDivision = (divisionName: string) => {
    setExpandedDivisions(prev => ({
      ...prev,
      [divisionName]: !prev[divisionName]
    }));
  };

  const openModal = (e: React.MouseEvent, divisionName: string) => {
    e.stopPropagation();
    setSelectedDivision(divisionName);
    // Auto-select all departments initially
    const departments = groupedData[divisionName]?.map(d => d.department) || [];
    setSelectedDepartments(departments);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedDivision(null);
      setSelectedDepartments([]);
      setUserSearchQuery("");
      setDebouncedSearch("");
      setSelectedNewUser(null);
    }, 200);
  };

  const toggleDepartmentSelection = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const toggleAllDepartments = () => {
    if (!selectedDivision) return;
    const allDepts = groupedData[selectedDivision]?.map(d => d.department) || [];
    if (selectedDepartments.length === allDepts.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(allDepts);
    }
  };

  const confirmUpdate = () => {
    if (!selectedDivision || !selectedNewUser || selectedDepartments.length === 0) return;
    updateMutation.mutate({
      divisionName: selectedDivision,
      departments: selectedDepartments,
      newUsername: selectedNewUser.username
    });
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
    <div className="flex flex-col w-full h-[calc(100vh-140px)] relative">
      <div className="flex flex-col h-full bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden relative">
        
        {/* Header Title Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#11151d]/50">
          <ShieldAlert className="w-5 h-5 text-purple-600 mr-3" />
          <h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">ITBSM Directory</h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 w-full">
            {isLoading && (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching ITBSM assignments...</p>
              </div>
            )}
            
            {isError && (
              <div className="col-span-full flex items-center justify-center py-20">
                <p className="text-red-500 font-medium text-sm">Failed to load ITBSM assignments.</p>
              </div>
            )}

            {!isLoading && !isError && Object.keys(groupedData).length === 0 && (
              <div className="col-span-full flex items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No ITBSM assignments found.</p>
              </div>
            )}

            <AnimatePresence>
              {!isLoading && !isError && Object.entries(groupedData).map(([divisionName, departments]) => {
                const isExpanded = expandedDivisions[divisionName];
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={divisionName} 
                    className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#11151d] transition-all hover:border-purple-200 dark:hover:border-purple-900/50 group break-inside-avoid mb-6 w-full inline-block"
                  >
                    {/* Expandable Header */}
                    <div className="flex items-center justify-between p-1 pr-4 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer" onClick={() => toggleDivision(divisionName)}>
                      <div className="flex items-center gap-3 p-2">
                        <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                            {divisionName}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {departments.length} Department{departments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button 
                            onClick={(e) => openModal(e, divisionName)}
                            className="p-2 opacity-0 group-hover:opacity-100 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                            title="Edit ITBSM for Departments"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <div className="p-1 rounded-full text-slate-400">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content (Departments) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-slate-200 dark:border-slate-800"
                        >
                          <div className="p-3 bg-slate-50 dark:bg-[#0f1219]">
                            <div className="flex flex-col gap-3">
                              {departments.map((dept) => (
                                <div 
                                  key={dept.id} 
                                  className="flex flex-col p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors bg-white dark:bg-[#151923] shadow-sm"
                                >
                                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/50">
                                    <LayoutGrid className="w-3.5 h-3.5 text-purple-500" />
                                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate" title={dept.department}>
                                      {dept.department}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                      <User className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[12px] font-bold text-slate-900 dark:text-slate-100 truncate">
                                        {dept.itbsm_first_name || dept.itbsm_last_name 
                                          ? `${dept.itbsm_first_name || ''} ${dept.itbsm_last_name || ''}`.trim()
                                          : 'Unknown ITBSM'}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide truncate">
                                        {dept.itbsm_username ? `@${dept.itbsm_username}` : 'No username assigned'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedDivision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-[#151923] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Assign ITBSM for Departments
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Division: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedDivision}</span></p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Department Selection Column */}
                <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/50 flex flex-col bg-slate-50/30 dark:bg-[#11151d]/30 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between shrink-0">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select Departments</h4>
                    <button 
                      onClick={toggleAllDepartments}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      {selectedDepartments.length === (groupedData[selectedDivision]?.length || 0) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div className="flex flex-col gap-1">
                      {groupedData[selectedDivision]?.map(dept => {
                        const isSelected = selectedDepartments.includes(dept.department);
                        return (
                          <label 
                            key={dept.id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                          >
                            <div className="mt-0.5 text-purple-600 dark:text-purple-500">
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[13px] font-bold ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                {dept.department}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-500 truncate max-w-[200px]" title={dept.itbsm_username ? `@${dept.itbsm_username}` : ''}>
                                Current: {dept.itbsm_first_name || dept.itbsm_last_name 
                                  ? `${dept.itbsm_first_name || ''} ${dept.itbsm_last_name || ''}`.trim()
                                  : (dept.itbsm_username ? `@${dept.itbsm_username}` : 'None')}
                              </span>
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isSelected}
                              onChange={() => toggleDepartmentSelection(dept.department)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* User Search Column */}
                <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-[#151923] overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Assign New ITBSM</h4>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search user by name..."
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          if (selectedNewUser) setSelectedNewUser(null);
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {selectedNewUser ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 fade-in">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                          <User className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Selected ITBSM</h4>
                        <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-full">
                          <span className="font-bold text-slate-900 dark:text-white">{selectedNewUser.name}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">@{selectedNewUser.username}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-6">
                          Ready to assign to {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {debouncedSearch.length <= 2 && (
                          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                            <p className="text-xs text-slate-500">Type at least 3 characters to search users...</p>
                          </div>
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
                            key={user.username}
                            onClick={() => setSelectedNewUser({ 
                              username: user.username, 
                              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username 
                            })}
                            className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-100 dark:hover:border-purple-800/50 text-left transition-all group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0">
                              {user.first_name ? user.first_name.charAt(0) : user.username.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Name'}
                              </span>
                              <span className="text-xs font-medium text-slate-500 truncate">@{user.username}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 flex justify-between items-center shrink-0">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{selectedDepartments.length}</span> selected
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmUpdate}
                    disabled={updateMutation.isPending || !selectedNewUser || selectedDepartments.length === 0}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
