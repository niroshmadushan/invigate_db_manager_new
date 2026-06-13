"use client";

import { motion } from "framer-motion";

export const TechBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Dark Base */}
      <div className="absolute inset-0 bg-[#0C0C0E]" />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }}
      />
      
      {/* Floating Orbs for Ambient Tech Glow */}
      <motion.div 
        animate={{ 
          transform: ['translate(0%, 0%)', 'translate(10%, -10%)', 'translate(-5%, 5%)', 'translate(0%, 0%)'] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          transform: ['translate(0%, 0%)', 'translate(-10%, 10%)', 'translate(5%, -5%)', 'translate(0%, 0%)'] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"
      />

      {/* SVG Network Graph */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <svg width="2000" height="1000" viewBox="0 0 2000 1000" fill="none" className="min-w-full min-h-full object-cover">
          {/* Animated Connecting Lines */}
          <g stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1">
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: "linear" }} d="M 200 200 L 500 100 L 800 300 L 1200 150 L 1600 400 L 1800 200" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: "linear" }} d="M 100 800 L 400 900 L 700 600 L 1100 850 L 1500 600 L 1900 900" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: "linear" }} d="M 300 400 L 600 700 L 900 450 L 1300 650 L 1700 300" />
            
            {/* Cross Connections */}
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 1 }} d="M 500 100 L 600 700" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 1.5 }} d="M 800 300 L 700 600" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 0.5 }} d="M 1200 150 L 1100 850" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 2 }} d="M 1600 400 L 1500 600" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6.5, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 0.2 }} d="M 800 300 L 900 450" />
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 5.2, repeat: Infinity, repeatType: 'reverse', ease: "linear", delay: 1.1 }} d="M 1200 150 L 1300 650" />
          </g>
          
          {/* Static Nodes */}
          <g fill="rgba(255, 255, 255, 0.8)">
            <circle cx="200" cy="200" r="3" />
            <circle cx="500" cy="100" r="4" />
            <circle cx="800" cy="300" r="3" />
            <circle cx="1200" cy="150" r="5" />
            <circle cx="1600" cy="400" r="3" />
            <circle cx="1800" cy="200" r="4" />
            <circle cx="100" cy="800" r="3" />
            <circle cx="400" cy="900" r="4" />
            <circle cx="700" cy="600" r="5" />
            <circle cx="1100" cy="850" r="3" />
            <circle cx="1500" cy="600" r="4" />
            <circle cx="1900" cy="900" r="3" />
            <circle cx="300" cy="400" r="4" />
            <circle cx="600" cy="700" r="3" />
            <circle cx="900" cy="450" r="4" />
            <circle cx="1300" cy="650" r="3" />
            <circle cx="1700" cy="300" r="5" />
          </g>

          {/* Pulsing Nodes */}
          <motion.circle cx="500" cy="100" r="15" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" fill="none" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="1200" cy="150" r="20" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="1.5" fill="none" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
          <motion.circle cx="700" cy="600" r="15" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" fill="none" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
          <motion.circle cx="1700" cy="300" r="18" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" fill="none" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }} />
        </svg>
      </div>
    </div>
  );
};
