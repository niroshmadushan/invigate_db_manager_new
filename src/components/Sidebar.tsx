"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Shield, Settings, FileText, Activity, LogOut, ChevronLeft,
  AppWindow, Network, Briefcase, ServerCog, Receipt, User, UsersRound, Building2,
  Headset, ScrollText, TerminalSquare, BellRing, Workflow, BarChart3, Key, LocateFixed, Code, Search, ChevronDown, Database, ShieldCheck, LayoutGrid, ClipboardList, Plane
} from "lucide-react";
import { signOut } from "next-auth/react";
import { api } from "~/trpc/react";

export type NavItem = {
  label: string;
  href: string;
  icon: any;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navStructure: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Sri Lankan Catering",
    items: [
      { label: "Departments", href: "/user/departments", icon: Building2 },
    ]
  },
  {
    title: "Organizational",
    items: [
      { label: "Applications", href: "/user/applications", icon: AppWindow },
      { label: "Divisions", href: "/user/divisions", icon: Network },
      { label: "MITBS", href: "/user/mitbs", icon: LayoutGrid },
      { label: "ITBSM", href: "/user/itbsm", icon: ServerCog },
      { label: "Cost Center", href: "/user/cost-center", icon: Receipt },
      { label: "Single User", href: "/user/single-user", icon: User },
      { label: "Groups", href: "/user/groups", icon: UsersRound },
      { label: "Help Desk", href: "/user/help-desk", icon: Headset },
    ]
  },
  {
    title: "IT services Catalogue",
    items: [
      { label: "Logs - (IT-Service)", href: "/user/logs-it-service", icon: TerminalSquare },
      { label: "Reminders", href: "/user/reminders", icon: BellRing },
    ]
  },
  {
    title: "Clearing Request",
    items: [
      { label: "CR Resolution", href: "/user/cr-resolution", icon: Workflow },
      { label: "Report", href: "/user/report", icon: BarChart3 },
    ]
  },
  {
    title: "Tracking Console",
    items: [
      { label: "App Access", href: "/user/app-access", icon: Key },
      { label: "App Tracking", href: "/user/app-tracking", icon: LocateFixed },
    ]
  }
];

export function Sidebar({ role }: { role: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const pathname = usePathname();
  const { data: profile } = api.user.getProfile.useQuery();

  // Filter the raw nav structure based on RBAC permissions
  const filteredNavStructure = useMemo(() => {
    // Admins bypass everything if they don't have a restricted permission role assigned
    // but the system is designed to allow assigning roles to anyone. Let's strictly enforce Permission Roles for Users.
    // Actually, Admin overrides usually see everything, but let's apply the role if it exists.
    if (!profile?.permissionRole && role === "ADMIN") return navStructure;
    
    if (!profile?.permissionRole) {
      // If no permission role is assigned, block access to everything as a fail-safe
      return [];
    }

    const perms = profile.permissionRole.permissions as Record<string, { view: boolean, edit: boolean }>;
    
    return navStructure.map(group => {
      // Extract the ID from the href (e.g. "/user/applications" -> "applications")
      const filteredItems = group.items.filter(item => {
        const id = item.href.split("/").pop();
        if (!id) return false;
        if (id === "dashboard") return true; // Always allow access to Dashboard
        return perms[id]?.view === true;
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [profile, role]);



  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 210 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col bg-white dark:bg-[#151923] relative z-20 flex-shrink-0 overflow-hidden"
    >
      {/* Logo Area */}
      <div className="h-14 px-6 flex items-center justify-between relative shrink-0">
        <AnimatePresence mode="popLayout">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 absolute left-6"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Database className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <h1 className="font-bold text-slate-900 dark:text-white tracking-wide text-[13.5px] leading-tight">DB-Manager</h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          suppressHydrationWarning
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all z-10 ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>
      </div>



      {/* Menu Items */}
      <nav id="tour-sidebar-nav" className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2 px-4 transition-all duration-300 ${isCollapsed ? 'space-y-2' : 'space-y-6'}`}>
        
        {/* Core Segment */}
        <div>
          <div className="space-y-1 mt-2">
            {role === "ADMIN" && (
              <>
                <Link href="/admin" title="Admin Dashboard" className={`group flex items-center gap-3 px-3 py-1.5 rounded-xl font-bold text-[12px] transition-all ${pathname === '/admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-transform ${pathname === '/admin' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Admin Dashboard</motion.span>}
                  </AnimatePresence>
                </Link>

                <Link href="/admin/personnel" title="Personnel" className={`group flex items-center gap-3 px-3 py-1.5 rounded-xl font-bold text-[12px] transition-all ${pathname === '/admin/personnel' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-transform ${pathname === '/admin/personnel' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Personnel</motion.span>}
                  </AnimatePresence>
                </Link>

                <Link href="/admin/roles" title="Roles" className={`group flex items-center gap-3 px-3 py-1.5 rounded-xl font-bold text-[12px] transition-all ${pathname === '/admin/roles' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-transform ${pathname === '/admin/roles' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Roles</motion.span>}
                  </AnimatePresence>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Groups (Only for non-ADMIN users) */}
        {role !== "ADMIN" && filteredNavStructure.map((group, idx) => {
          const isZipped = collapsedGroups[group.title];
          
          return (
            <div key={idx} className="relative">
              <AnimatePresence>
                {!isCollapsed ? (
                  <motion.button 
                    onClick={() => toggleGroup(group.title)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="w-full flex items-center justify-between px-2 mt-4 mb-2 group/header"
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 group-hover/header:text-slate-600 dark:group-hover/header:text-slate-300 uppercase tracking-widest transition-colors">
                      {group.title}
                    </span>
                    <motion.div 
                      animate={{ rotate: isZipped ? -90 : 0 }} 
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 dark:text-slate-500 group-hover/header:text-slate-600 dark:group-hover/header:text-slate-300"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </motion.button>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-px w-8 mx-auto bg-slate-200 dark:bg-slate-700/50 my-2" />
                )}
              </AnimatePresence>
              
              <AnimatePresence initial={false}>
                {(!isZipped || isCollapsed) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {group.items.map((item, i) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={i} 
                          href={item.href} 
                          title={item.label}
                          className={`group flex items-center gap-3 px-3 py-1.5 rounded-xl font-medium text-[12px] transition-all relative ${isActive ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          
                          {/* Floating Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="absolute left-16 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                              {item.label}
                              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-blue-600"></div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-3 shrink-0 flex flex-col gap-3">
        {/* Development Info Box (Purple Gradient like Image) */}
        <div className={`flex flex-col p-3 rounded-2xl bg-gradient-to-br from-[#9333ea] to-[#4f46e5] text-white relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'items-center justify-center p-2 aspect-square' : ''}`}>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className={`flex-shrink-0 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'}`}>
              <Plane className="w-4 h-4 text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-bold whitespace-nowrap">SriLankan Airlines</p>
                <p className="text-[9px] text-white/80 leading-tight mt-0.5 truncate">Internal System</p>
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative z-10 overflow-hidden">
                <div className="w-full h-1 bg-white/20 rounded-full mt-4 mb-3">
                  <div className="h-full bg-white rounded-full w-[45%]"></div>
                </div>
                <button onClick={() => setShowSignOutModal(true)} className="flex items-center justify-between w-full py-2 px-4 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-xl text-[11px] font-bold transition-colors">
                  <span>Sign Out</span>
                  <div className="w-4 h-4 rounded-full bg-white text-purple-600 flex items-center justify-center">
                    <LogOut className="w-2.5 h-2.5" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <button onClick={() => setShowSignOutModal(true)} className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity rounded-2xl" title="Sign Out">
              <LogOut className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Sign Out Modal Popup */}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 dark:bg-[#0C0C0E]/80 backdrop-blur-sm"
              onClick={() => setShowSignOutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#151518] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mb-4 relative">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t border-r border-red-500/50 rounded-full" 
                />
                <LogOut className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-[0.1em]">System Sign Out</h2>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-6 px-4 leading-relaxed font-medium">
                Are you sure you want to terminate your current session? You will need to re-authenticate to access the portal.
              </p>
              
              <div className="flex items-center w-full gap-3">
                <button 
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-[11px] tracking-widest uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#202025] dark:border dark:border-white/5 dark:text-slate-300 dark:hover:bg-[#25252A] dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-[11px] tracking-widest uppercase bg-red-600/90 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
