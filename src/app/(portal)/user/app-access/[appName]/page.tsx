import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppAccessDetailClient } from "./AppAccessDetailClient";

export default async function AppAccessDetailPage({ params }: { params: Promise<{ appName: string }> }) {
  // Await the params before using them as required by Next.js 15
  const resolvedParams = await params;
  const appName = decodeURIComponent(resolvedParams.appName);

  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
          <p className="font-medium">Loading Application Users...</p>
        </div>
      }>
        <AppAccessDetailClient appName={appName} />
      </Suspense>
    </div>
  );
}
