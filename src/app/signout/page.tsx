"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SignOutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Premium Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 dark:bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-[420px] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-10 text-center relative z-10 shadow-sm"
      >
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 border-4 border-white dark:border-[#0B0F19] shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 -mt-16">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>

        <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
          Sign Out Request
        </h1>
        <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Are you sure you want to securely end your session? You will need to re-authenticate to access the portal again.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-[13px] font-extrabold uppercase tracking-widest py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Yes, Sign Me Out
          </button>

          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[13px] font-extrabold uppercase tracking-widest py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel & Return
          </button>
        </div>
      </motion.div>
    </div>
  );
}
