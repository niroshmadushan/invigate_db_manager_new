"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "~/trpc/react";
import { 
  Database, Network, ShieldCheck, Activity, Key, ChevronRight, 
  Clock, Server, RefreshCw, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isLoadingStatus } = api.logs.getDashboardData.useQuery(undefined, { refetchInterval: 30000 });
  const { data: logsData, isLoading: isLoadingLogs } = api.logs.getLogs.useQuery({ limit: 5 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-full p-4 lg:p-6 text-slate-800 dark:text-slate-200">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >


        {/* Top Grid - Status & Role */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Status Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-[#151923] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4" /> System Health
            </h3>

            {isLoadingStatus ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Database Node */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1C1F2E] flex items-center justify-center border border-slate-200 dark:border-white/5">
                        <Database className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#151923] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">Database Core</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">{dashboardData?.status.database}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-400">{dashboardData?.status.latency}ms</p>
                  </div>
                </div>

                {/* API Node */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1C1F2E] flex items-center justify-center border border-slate-200 dark:border-white/5">
                        <Network className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#151923] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">API Gateway</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">{dashboardData?.status.api}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-400">{dashboardData?.status.latency ? dashboardData.status.latency - 5 : 10}ms</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Role & Permissions Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-[#151923] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row gap-8 h-full">
              <div className="sm:w-1/3 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/5 pb-6 sm:pb-0 sm:pr-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{isLoadingStatus ? "Loading..." : dashboardData?.roleName}</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{isLoadingStatus ? "..." : dashboardData?.roleDesc}</p>
                
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" />
                  Access Granted
                </div>
              </div>

              <div className="sm:w-2/3 relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Permissions Schema</h3>
                {isLoadingStatus ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : dashboardData?.permissions ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(dashboardData.permissions as any).map(([key, perms]: [string, any]) => (
                      <div key={key} className="bg-slate-50 dark:bg-[#1C1F2E] border border-slate-100 dark:border-white/5 rounded-xl p-3 flex items-center justify-between group/perm hover:border-blue-500/30 transition-colors">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{key}</span>
                        <div className="flex gap-1">
                          {Object.keys(perms).map((p) => (
                            <div key={p} className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={p} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl p-6">
                    <p className="text-[12px] text-slate-400 text-center">No explicit custom permissions configured. Operating on default access layer.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Timeline */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#151923] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Recent System Activity
            </h3>
            <button 
              onClick={() => router.push("/user/logs")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center group"
            >
              View Full History <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute top-0 bottom-0 left-[19px] w-px bg-slate-200 dark:bg-slate-800" />

            {isLoadingLogs ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="w-full space-y-2 py-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logsData?.items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No recent activity detected.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {logsData?.items.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    key={log.id} 
                    className="flex gap-4 relative z-10 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#151923] border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-blue-500 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors" />
                    </div>
                    <div className="bg-slate-50 dark:bg-[#1C1F2E] border border-slate-100 dark:border-white/5 rounded-xl p-3 w-full shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                            {log.action}
                          </span>
                          {log.pageUrl && (
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none">
                              {log.pageUrl}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium tracking-wider whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
