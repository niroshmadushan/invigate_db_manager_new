import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Sidebar } from "~/components/Sidebar";
import { Header } from "~/components/Header";
import { ActivityTracker } from "~/components/ActivityTracker";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex h-screen w-full bg-slate-200 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30 transition-colors duration-500 relative">
      <ActivityTracker />
      
      {/* App Window (Full Screen) */}
      <div className="w-full h-full bg-white dark:bg-[#151923] flex overflow-hidden transition-colors duration-500">
        
        {/* Sidebar Component */}
        <Sidebar role={role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#151923] relative z-10 transition-colors duration-500 border-l border-slate-100 dark:border-slate-800/50">
          
          {/* Dynamic Header */}
          <Header session={session} />

          {/* Page Content (Flat White Background) */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-[#0B0F19] transition-colors p-4">
            <div className="w-full max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>

          {/* Very Thin Footer */}
          <footer className="h-8 shrink-0 bg-white dark:bg-[#151923] border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between px-8 transition-colors duration-500 z-20">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              &copy; {new Date().getFullYear()} DB-Manager. All rights reserved.
            </p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
              Developed & Designed by <span className="text-blue-600 dark:text-blue-400">Connex Code Works</span> <span className="opacity-60">— Internal Software Team of Connex Information Technologies</span>
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
