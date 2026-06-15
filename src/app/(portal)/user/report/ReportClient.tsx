"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Loader2, Download, FileSpreadsheet, FileText, Database, Layers, Users, ShieldAlert, Building2, Briefcase, Activity } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

type ExportType = 'excel' | 'csv';

export function ReportClient() {
  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { canView, isLoading: isPermsLoading } = usePermissions("report");

  useEffect(() => {
    const handleSearchUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
    };
    window.addEventListener('search-updated', handleSearchUpdate);
    return () => window.removeEventListener('search-updated', handleSearchUpdate);
  }, []);

  const reports = [
    { 
      id: 'app_manage', 
      title: 'Application Management', 
      description: 'Comprehensive report mapping applications to APC and APO roles.', 
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      fetchData: () => utils.reports.getApplicationManage.fetch()
    },
    { 
      id: 'ccm_manage', 
      title: 'Cost Centre Managers', 
      description: 'Detailed breakdown of Cost Centres and their respective Managers.', 
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      fetchData: () => utils.reports.getCcmManage.fetch()
    },
    { 
      id: 'hod_manage', 
      title: 'Head of Departments', 
      description: 'Report detailing Divisions and their Head of Departments.', 
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      fetchData: () => utils.reports.getHodManage.fetch()
    },
    { 
      id: 'itbsm_manage', 
      title: 'ITBSM Management', 
      description: 'Mapping of Divisions, Departments, and IT Service Owners.', 
      icon: <Database className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      fetchData: () => utils.reports.getItbsmManage.fetch()
    },
    { 
      id: 'mitbsm_manage', 
      title: 'MITBSM Management', 
      description: 'Directory of MITBS Managers across various divisions.', 
      icon: <Users className="w-6 h-6 text-rose-500" />,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      fetchData: () => utils.reports.getMitbsmManage.fetch()
    },
    { 
      id: 'single_role', 
      title: 'Single Role Users', 
      description: 'Security report outlining employees mapped to single roles.', 
      icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      fetchData: () => utils.reports.getSingleRole.fetch()
    },
    { 
      id: 'pending_requests', 
      title: 'Pending Requests', 
      description: 'Live overview of pending operations from the external API.', 
      icon: <Activity className="w-6 h-6 text-pink-500" />,
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      fetchData: () => utils.reports.getPendingRequests.fetch()
    }
  ];

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = async (report: typeof reports[0], type: ExportType) => {
    try {
      setDownloadingId(report.id);
      
      const data = await report.fetchData() as any[];
      
      if (!data || data.length === 0) {
        toast.error("No data found for this report.");
        return;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${report.title.replace(/\s+/g, '_')}_Report_${dateStr}`;

      if (type === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast.success(`Excel file downloaded successfully.`);
      } 
      else if (type === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`CSV file downloaded successfully.`);
      }

    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
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
    <div className="flex flex-col w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            No reports match your search query.
          </div>
        ) : (
          filteredReports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="flex flex-col bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="p-6 flex-1">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${report.color}`}>
                {report.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                {report.description}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handleExport(report, 'excel')}
                disabled={downloadingId !== null}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  downloadingId === report.id 
                    ? 'bg-indigo-100 text-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                }`}
              >
                {downloadingId === report.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Excel
              </button>
              
              <button
                onClick={() => handleExport(report, 'csv')}
                disabled={downloadingId !== null}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
            </div>
          </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
