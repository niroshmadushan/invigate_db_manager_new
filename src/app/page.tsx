"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Database, Terminal, ShieldCheck, Network, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TechBackground } from "~/components/TechBackground";

const loadingLogs = [
  { icon: Cpu, text: "Initializing quantum processors...", delay: 0 },
  { icon: Database, text: "Mounting encrypted file systems...", delay: 600 },
  { icon: Network, text: "Establishing secure network tunnels...", delay: 1200 },
  { icon: ShieldCheck, text: "Verifying security protocols...", delay: 1800 },
];

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [activeLog, setActiveLog] = useState(0);

  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait until authentication status is known
    if (status === "loading") return;

    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 30);

    // Terminal logs appearance
    const logTimers = loadingLogs.map((log, index) => 
      setTimeout(() => setActiveLog(index), log.delay)
    );

    // Redirect
    const redirectTimer = setTimeout(() => {
      if (status === "authenticated" && session?.user?.role) {
        router.push(session.user.role === "ADMIN" ? "/admin" : "/user/applications");
      } else {
        router.push("/login");
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      logTimers.forEach(clearTimeout);
      clearTimeout(redirectTimer);
    };
  }, [router, status, session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0C0C0E] text-white overflow-hidden relative font-sans">
      <TechBackground />

      {/* Main Container */}
      <div className="flex flex-col items-center z-10 w-full max-w-[420px] px-6">
        
        {/* Premium Sci-Fi Circular Loader HUD */}
        <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
          
          {/* Outer dashed ring */}
          <motion.svg 
            animate={{ rotate: 360 }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-full h-full text-blue-500/20" 
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          </motion.svg>
          
          {/* Middle segmented ring */}
          <motion.svg 
            animate={{ rotate: -360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] text-purple-500/40" 
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="15 10 5 10" />
          </motion.svg>

          {/* Inner core spinning arch */}
          <motion.svg 
            animate={{ rotate: 360 }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] text-blue-400" 
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 120" strokeLinecap="round" />
          </motion.svg>

          {/* Pulsing inner glow */}
          <motion.div 
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-10 bg-blue-500/20 rounded-full blur-md"
          />

          {/* Core Content: Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-md border border-white/5">
            <span className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              {progress > 100 ? 100 : progress}<span className="text-[14px] text-blue-400">%</span>
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              System Load
            </span>
          </div>
        </div>

        {/* Branding Typography */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10 w-full"
        >
          <h1 className="text-[32px] font-black tracking-[0.25em] uppercase text-white drop-shadow-md mb-2">
            DB-Manager
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-3" />
          <p className="text-[10px] font-bold text-blue-400 tracking-[0.5em] uppercase">
            Enterprise Core
          </p>
        </motion.div>

        {/* Terminal Loading Logs */}
        <div className="w-full bg-[#0F0F12] border border-white/5 rounded-xl p-4 shadow-2xl relative overflow-hidden h-[140px] flex flex-col">
          {/* Subtle CRT scanning line overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none z-10" />
          
          <div className="flex items-center gap-2 mb-3 px-1 border-b border-white/5 pb-2 relative z-20">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Boot Sequence Log</span>
            <motion.div 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-3 bg-blue-500 ml-auto"
            />
          </div>

          <div className="space-y-2.5 flex-1 overflow-hidden flex flex-col justify-end relative z-20 pb-1">
            <AnimatePresence>
              {loadingLogs.map((log, index) => {
                const Icon = log.icon;
                if (index > activeLog) return null;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className="flex items-center gap-3"
                  >
                    <Icon className={`w-3.5 h-3.5 ${index === activeLog ? 'text-blue-400 animate-pulse' : 'text-emerald-500'}`} />
                    <span className={`text-[11px] font-mono tracking-tight ${index === activeLog ? 'text-blue-200 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'text-slate-400'}`}>
                      {index < activeLog ? '[OK] ' : '> '}{log.text}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </main>
  );
}
