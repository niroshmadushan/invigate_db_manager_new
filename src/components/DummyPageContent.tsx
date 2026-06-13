"use client";

import { motion } from "framer-motion";
import { Hammer, Sparkles, Construction } from "lucide-react";

export function DummyPageContent({ title, description }: { title: string; description?: string }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white/60 dark:bg-black/20 backdrop-blur-2xl rounded-[2rem] border border-slate-200/60 dark:border-white/[0.05] p-10 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-zinc-500/20 blur-3xl rounded-full"></div>

        <div className="relative z-10">
          <motion.div 
            initial={{ rotate: -15 }}
            animate={{ rotate: 5 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-50 dark:from-slate-500/10 to-zinc-50 dark:to-zinc-500/10 rounded-2xl flex items-center justify-center border border-slate-200/50 dark:border-white/10 shadow-inner"
          >
            <Construction className="w-10 h-10 text-slate-500" />
          </motion.div>
          
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {description || "This module is currently under active construction and will be deployed in a future update."}
          </p>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 py-2 px-4 rounded-xl w-max mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
