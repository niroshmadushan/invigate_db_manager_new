import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ItServiceLogClient } from "./ItServiceLogClient";

export default function ItServiceLogsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
          <p className="font-medium">Loading IT Service Logs...</p>
        </div>
      }>
        <ItServiceLogClient />
      </Suspense>
    </div>
  );
}
