import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ReportClient } from "./ReportClient";

export const metadata = {
  title: "Reports Download | DB-Manager",
  description: "Download Excel and CSV reports",
};

export default function ReportPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <Suspense fallback={
        <div className="flex h-64 w-full items-center justify-center bg-white dark:bg-[#151923] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading Reports Dashboard...
            </p>
          </div>
        </div>
      }>
        <ReportClient />
      </Suspense>
    </div>
  );
}
