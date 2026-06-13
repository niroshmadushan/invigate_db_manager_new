import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AddGroupUsersClient } from "./AddGroupUsersClient";

export const metadata = {
  title: "Add Group Members | DB-Manager",
  description: "Add members to group",
};

export default async function AddGroupUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center bg-white dark:bg-[#151923] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading Users...
            </p>
          </div>
        </div>
      }>
        <AddGroupUsersClient groupId={parseInt(resolvedParams.id)} />
      </Suspense>
    </div>
  );
}
