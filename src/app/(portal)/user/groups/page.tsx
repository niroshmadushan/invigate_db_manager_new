import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { GroupsClient } from "./GroupsClient";

export const metadata = {
  title: "Groups Directory | DB-Manager",
  description: "View and manage external groups",
};

export default function GroupsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center bg-white dark:bg-[#151923] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading Groups...
            </p>
          </div>
        </div>
      }>
        <GroupsClient />
      </Suspense>
    </div>
  );
}
