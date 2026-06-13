"use client";

import { motion } from "framer-motion";
import { Check, ShieldAlert, Fingerprint, Network, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import { TechBackground } from "~/components/TechBackground";

export function LoginSplashScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence of authorization checks
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1200);
    const timer3 = setTimeout(() => setStep(3), 1800); // Final Access Granted state
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0E] overflow-hidden font-sans">
      
      <TechBackground />

      {/* Dynamic Background Glow based on success state */}
      <motion.div 
        animate={{ 
          backgroundColor: step >= 3 ? "rgba(16, 185, 129, 0.08)" : "rgba(59, 130, 246, 0.08)" 
        }}
        transition={{ duration: 1 }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none z-0"
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* Core Authorization HUD Ring */}
        <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
          
          {/* Outer scanning ring */}
          <motion.svg 
            animate={{ rotate: 360 }} 
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 w-full h-full transition-colors duration-700 ${step >= 3 ? 'text-emerald-500/30' : 'text-blue-500/30'}`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          </motion.svg>
          
          {/* Inner targeting ring */}
          <motion.svg 
            animate={{ rotate: -360 }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] transition-colors duration-700 ${step >= 3 ? 'text-emerald-500/50' : 'text-blue-400/50'}`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="30 15 10 15" />
          </motion.svg>

          {/* Core Authorization Badge */}
          <motion.div 
            animate={{ scale: step >= 3 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-6 rounded-full flex items-center justify-center border-2 backdrop-blur-md transition-all duration-700 ${
              step >= 3 
                ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                : 'bg-black/50 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
            }`}
          >
            {step >= 3 ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Check className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              </motion.div>
            ) : (
              <ShieldAlert className="w-10 h-10 text-blue-400 animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}
          </motion.div>
        </div>

        {/* Status Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10 w-full"
        >
          <h1 className={`text-[28px] font-black tracking-[0.2em] uppercase drop-shadow-md mb-2 transition-colors duration-700 ${step >= 3 ? 'text-emerald-400' : 'text-white'}`}>
            {step >= 3 ? 'Access Granted' : 'Authorizing...'}
          </h1>
          <div className={`h-px w-32 mx-auto mb-3 transition-colors duration-700 ${step >= 3 ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'}`} />
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase">
            Security Protocol 1A
          </p>
        </motion.div>

        {/* Clearance Checks Matrix */}
        <div className="w-full grid gap-3 max-w-[360px]">
          <ClearanceCheck 
            icon={<ScanFace className="w-4 h-4" />} 
            label="Biometric Verification" 
            status={step >= 1 ? "VERIFIED" : "SCANNING"} 
            active={step >= 0}
            completed={step >= 1}
          />
          <ClearanceCheck 
            icon={<Fingerprint className="w-4 h-4" />} 
            label="Credential Handshake" 
            status={step >= 2 ? "SECURED" : "NEGOTIATING"} 
            active={step >= 1}
            completed={step >= 2}
          />
          <ClearanceCheck 
            icon={<Network className="w-4 h-4" />} 
            label="Server Uplink" 
            status={step >= 3 ? "CONNECTED" : "ROUTING"} 
            active={step >= 2}
            completed={step >= 3}
          />
        </div>
      </div>
    </div>
  );
}

function ClearanceCheck({ icon, label, status, active, completed }: { icon: React.ReactNode, label: string, status: string, active: boolean, completed: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: active ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden flex items-center p-3.5 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
        completed 
          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
          : active 
            ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
            : 'bg-[#0A0A0C] border-white/5'
      }`}
    >
      {/* Sweeping radar/scan effect background if active but not completed */}
      {active && !completed && (
        <motion.div 
          initial={{ left: "-100%" }} 
          animate={{ left: "100%" }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent skew-x-12"
        />
      )}

      <div className={`mr-4 z-10 ${completed ? 'text-emerald-400' : active ? 'text-blue-400' : 'text-slate-600'}`}>
        {icon}
      </div>
      
      <div className="flex-1 z-10">
        <p className={`text-[11px] font-bold tracking-[0.05em] uppercase ${completed ? 'text-emerald-100' : active ? 'text-blue-100' : 'text-slate-500'}`}>
          {label}
        </p>
      </div>
      
      <div className="z-10 flex items-center gap-2">
        <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${completed ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : active ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`}>
          {status}
        </span>
        {active && (
          <div className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]'} `} />
        )}
      </div>
    </motion.div>
  );
}
