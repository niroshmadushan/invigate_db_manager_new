"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Loader2, Search as SearchIcon, User, Briefcase, Mail, Building, MapPin, Phone, Hash, ShieldAlert, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

const ROLE_COLUMNS = [
  "ticket_no", "cneint", "mgdp", "cpmit", "tld", "mho", "mitbs", "cfo", "ceo", "fnm", 
  "hoit", "it_po", "eng_po", "gp_po", "pt_po", "ge_po", "it_pro", "cnent", "csm", "itsm", 
  "sdm", "db_lead", "nt_lead", "wan_lead", "ma", "smit", "epa", "opa", "gpa", "ppa", 
  "ghpa", "itpa", "net_lead", "rm", "g10"
];

type SortColumn = "role_id" | "short_name" | "long_name" | "assigned_user" | "department";
type SortDirection = "asc" | "desc";

export function SingleUserClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("short_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const rowsPerPage = 20;
  const router = useRouter();
  const { canView, isLoading: isPermsLoading } = usePermissions("single-user");

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setPage(1);
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const { data: allData, isLoading, isError } = api.singleUser.getAllRoles.useQuery({ search });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3 h-3 text-purple-500" /> 
      : <ArrowDown className="w-3 h-3 text-purple-500" />;
  };

  const sortedData = useMemo(() => {
    if (!allData) return [];
    
    return [...allData].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortColumn === "assigned_user") {
        valA = a.first_name || a.username || "";
        valB = b.first_name || b.username || "";
      } else {
        valA = a[sortColumn] || "";
        valB = b[sortColumn] || "";
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allData, sortColumn, sortDirection]);

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
                  <button onClick={() => handleSort("role_id")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    ID
                    <SortIcon column="role_id" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider min-w-[150px]">
                  <button onClick={() => handleSort("short_name")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Role Name
                    <SortIcon column="short_name" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider min-w-[200px]">
                  <button onClick={() => handleSort("long_name")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    Role Description
                    <SortIcon column="long_name" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 font-extrabold tracking-wider min-w-[200px]">
                  <button onClick={() => handleSort("assigned_user")} className="flex items-center gap-2 group hover:text-purple-600 dark:hover:text-purple-400 transition-colors focus:outline-none">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Assigned User
                    <SortIcon column="assigned_user" />
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
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fetching role assignments...</p>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-red-500 font-medium text-sm">Failed to load roles.</p>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && currentData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No role assignments found.</p>
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {!isLoading && !isError && currentData.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    key={`${item.role_id}-${index}`} 
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/user/single-user/${item.user_id}`)}
                  >
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{item.role_id}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-purple-700 dark:text-purple-400 text-xs uppercase tracking-wide">
                        {item.short_name}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {item.long_name}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                            {item.first_name || item.last_name 
                              ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                              : 'Unknown User'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide truncate flex items-center gap-1">
                            @{item.username} {item.department && `• ${item.department}`}
                          </span>
                        </div>
                        <button 
                          className="p-1.5 opacity-0 group-hover:opacity-100 shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-500 dark:text-purple-400 transition-all shadow-sm flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-wider"
                          title="View User Profile"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
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
                <span className="text-slate-900 dark:text-slate-200">{totalRows}</span> Total Assignments
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
