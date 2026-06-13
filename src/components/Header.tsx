"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, LayoutDashboard, Shield, Users } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { navStructure, NavItem } from "~/components/Sidebar";
import { api } from "~/trpc/react";

import { useTheme } from "next-themes";

export function Header({ session }: { session: any }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [greeting, setGreeting] = useState("WELCOME");
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);

  useEffect(() => {
    // Check if user has seen theme tooltip
    const hasSeenTooltip = localStorage.getItem("themeTooltipSeen");
    if (!hasSeenTooltip) {
      setTheme("dark"); // Force dark mode on first visit
      setTimeout(() => setShowThemeTooltip(true), 1500); // Show after 1.5s
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("GOOD MORNING");
    else if (hour < 18) setGreeting("GOOD AFTERNOON");
    else setGreeting("GOOD EVENING");
  }, []);

  const currentPage = useMemo(() => {
    let matched: NavItem | undefined;
    
    if (pathname === '/admin') return { label: "Admin Terminal", icon: Shield };
    if (pathname === '/admin/user') return { label: "Database Oversight", icon: Users };
    if (pathname === '/admin/profile' || pathname === '/user/profile') return { label: "User Profile", icon: Users };

    navStructure.forEach(group => {
      const found = group.items.find(item => item.href === pathname);
      if (found) matched = found;
    });
    
    return matched || { label: "Dashboard", icon: LayoutDashboard };
  }, [pathname]);

  const Icon = currentPage.icon;

  const role = session.user.role || "ADMIN";
  const firstName = session.user.name?.split(' ')[0]?.toUpperCase() || "USER";
  const initial = session.user.name ? session.user.name.charAt(0).toUpperCase() : "U";

  const { data: profile } = api.user.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });
  
  const userImage = profile?.image || null;

  return (
    <header className="w-full h-[72px] bg-white dark:bg-[#151923] border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-500">
      
      {/* Left: System Status & Dynamic Title */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
          <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase">{currentPage.label}</span>
        </div>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-5" />
        
        <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">{greeting}, {firstName}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        
        {/* Universal Search */}
        <motion.div 
          animate={{ width: isSearchFocused ? 300 : 240 }}
          className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-full h-10 px-3 transition-colors border border-transparent focus-within:border-slate-200 dark:focus-within:border-slate-700"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="Universal Search..." 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => {
              const val = e.target.value;
              const params = new URLSearchParams(window.location.search);
              if (val) params.set("q", val);
              else params.delete("q");
              window.history.replaceState(null, '', `?${params.toString()}`);
              // Dispatch custom event so the client page can listen if it doesn't use standard Next.js navigation hooks
              window.dispatchEvent(new Event('search-updated'));
            }}
            defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("q") || "" : ""}
            className="w-full bg-transparent border-none text-[13px] font-medium px-3 focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </motion.div>

        {/* Theme Toggle with Tooltip */}
        <div id="tour-theme" className="flex items-center justify-center ml-2 relative">
          <div className="[&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full [&>button]:bg-slate-50 dark:[&>button]:bg-slate-800/50 [&>button]:border-none [&>button]:hover:-translate-y-0.5 [&>button]:active:scale-95 [&>button]:transition-all [&>button]:duration-300 [&>button]:shadow-none hover:[&>button]:shadow-none" onClick={() => {
            setShowThemeTooltip(false);
            localStorage.setItem("themeTooltipSeen", "true");
          }}>
            <ThemeToggle />
          </div>

          <AnimatePresence>
            {showThemeTooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className="absolute top-[120%] right-0 mt-2 w-56 bg-blue-600 text-white p-3 rounded-xl shadow-2xl z-50 pointer-events-none"
              >
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-blue-600 rotate-45" />
                <p className="text-xs font-bold leading-relaxed relative z-10">
                  Welcome! You can easily switch between Light and Dark themes right here.
                </p>
                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowThemeTooltip(false);
                      localStorage.setItem("themeTooltipSeen", "true");
                    }}
                    className="text-[10px] font-extrabold bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded transition-colors pointer-events-auto"
                  >
                    GOT IT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div id="tour-notifications" className="relative">
          <button 
            suppressHydrationWarning
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
          >
            <div className="relative">
              <Bell className="w-[18px] h-[18px] group-hover:rotate-[20deg] transition-transform duration-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-800"></span>
            </div>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden z-50 shadow-xl"
              >
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                </div>
                <div className="p-2">
                  <div className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">Welcome to DB Manager!</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">We're glad to have you here. Your setup is complete.</p>
                      <p className="text-[9px] font-bold text-blue-600 mt-1">Just now</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-2" />

        {/* Profile */}
        <Link 
          id="tour-profile"
          href={role === "ADMIN" ? "/admin/profile" : "/user/profile"} 
          className="flex items-center gap-3 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
        >
          <div className="flex flex-col items-end justify-center">
            <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{firstName}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight uppercase tracking-wider">{role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden text-[16px] font-extrabold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            {userImage ? (
              <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </Link>

      </div>
    </header>
  );
}
