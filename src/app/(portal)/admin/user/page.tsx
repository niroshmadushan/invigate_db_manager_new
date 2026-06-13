"use client";

import { useState, Suspense } from "react";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, Fingerprint, Activity, Clock, ShieldAlert, X } from "lucide-react";

function UserDashboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: users, refetch, isFetching } = api.user.getAllUsers.useQuery(
    { searchQuery },
    { refetchOnWindowFocus: false }
  );

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reportIssuePrompt, setReportIssuePrompt] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const openDetailsModal = (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleReportIssue = (userId: string) => {
    setReportIssuePrompt({
      title: "Flag Record Anomaly",
      message: "Are you sure you want to flag this personnel record for administrative review? This action is logged.",
      onConfirm: () => {
        // Mocking an API call
        toast.success("Anomaly flagged successfully. Admin notified.");
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 relative h-full flex flex-col"
    >
      <header className="flex justify-between items-end border-b border-slate-200/60 dark:border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-100 dark:border-slate-500/20 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">Database Oversight</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium tracking-wide">Read-only personnel roster access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-widest uppercase">System Online</span>
        </div>
      </header>

      {searchQuery && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
          Showing search results for: <strong className="text-slate-500">{searchQuery}</strong>
        </motion.div>
      )}

      <div className="bg-white dark:bg-[#151923] shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 relative">
            <thead className="text-[10px] uppercase bg-slate-50 dark:bg-[#0B0F19] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Personnel</th>
                <th className="px-6 py-4 font-bold tracking-wider">Designation</th>
                <th className="px-6 py-4 font-bold tracking-wider">Access Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
              {isFetching && !users ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 animate-pulse text-sm">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-50 animate-bounce" />
                    Querying database...
                  </td>
                </tr>
              ) : users?.map((u, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} 
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name || "N/A"}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{u.designation || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openDetailsModal(u)} className="text-[10px] font-bold border border-slate-200 dark:border-white/10 hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-400 px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-transparent">
                      VIEW RECORD
                    </button>
                    <button onClick={() => handleReportIssue(u.id)} className="text-[10px] font-bold border border-slate-200 dark:border-white/10 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500 px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-transparent text-slate-500">
                      FLAG
                    </button>
                  </td>
                </motion.tr>
              ))}
              {(!isFetching && users?.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 text-sm">No records match your query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* --- CONFIRMATION MODAL --- */}
        {reportIssuePrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center mx-auto -mt-10 mb-4 text-amber-500 shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{reportIssuePrompt.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{reportIssuePrompt.message}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setReportIssuePrompt(null)} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={() => { reportIssuePrompt.onConfirm(); setReportIssuePrompt(null); }} 
                    className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-md transition-colors"
                  >
                    Confirm Flag
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- DETAILS MODAL --- */}
        {isDetailsModalOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white/95 dark:bg-black/80 backdrop-blur-xl w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-500/10 rounded-xl text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-500/20">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Personnel Dossier</h3>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Read-Only View</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-center pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500 to-zinc-500 mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-slate-500/30 mb-4">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name || "Unknown"}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Designation</label>
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {selectedUser.designation || "Not Specified"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Role</label>
                      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedUser.role === "ADMIN" ? "bg-zinc-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]" : "bg-slate-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"}`}></div>
                        {selectedUser.role}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Access Level</label>
                      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {selectedUser.accessLevel || "Standard"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Record ID</label>
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                      {selectedUser.id}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-white/5 mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last accessed just now</span>
                  </div>
                  <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl transition-colors shadow-lg">
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="text-slate-400 animate-pulse">Initializing Portal...</div>}>
      <UserDashboardContent />
    </Suspense>
  );
}
