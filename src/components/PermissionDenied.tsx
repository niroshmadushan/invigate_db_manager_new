import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] w-full relative">
      <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You do not have permission to view this module. If you believe this is a mistake, please contact your administrator.
        </p>
        <Link 
          href="/user/dashboard"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
