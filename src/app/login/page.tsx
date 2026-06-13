"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LoginSplashScreen } from "~/components/LoginSplashScreen";
import { Lock, Mail, KeyRound, ShieldAlert, Loader2, User, Database, ArrowRight, ShieldCheck } from "lucide-react";
import { TechBackground } from "~/components/TechBackground";

const CornerNode = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const isLeft = position.includes("l");
  const isTop = position.includes("t");
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 1, delay: 0.5 }}
      className={`absolute ${isTop ? "top-[15%]" : "bottom-[15%]"} ${isLeft ? "left-0" : "right-0"} flex items-center z-10`}
    >
      {isLeft && (
        <>
          <div className="w-6 h-px bg-white/10" />
          <div className="w-14 h-8 bg-[#151518] border border-white/5 rounded flex items-center justify-center relative shadow-lg">
            <div className="grid grid-cols-3 gap-[3px] opacity-20">
              {[...Array(6)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />)}
            </div>
            <div className="absolute w-[5px] h-[5px] bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.4)] -right-[3px] rounded-sm" />
          </div>
        </>
      )}
      {!isLeft && (
        <>
          <div className="w-14 h-8 bg-[#151518] border border-white/5 rounded flex items-center justify-center relative shadow-lg">
            <div className="grid grid-cols-3 gap-[3px] opacity-20">
              {[...Array(6)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />)}
            </div>
            <div className="absolute w-[5px] h-[5px] bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.4)] -left-[3px] rounded-sm" />
          </div>
          <div className="w-6 h-px bg-white/10" />
        </>
      )}
    </motion.div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Auth Flow State
  const [authMode, setAuthMode] = useState<"LOGIN" | "OTP" | "FORGOT" | "RESET">("LOGIN");
  const [showSplash, setShowSplash] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.push(session.user.role === "ADMIN" ? "/admin" : "/user/applications");
    }
  }, [status, session, router]);

  // tRPC Mutations
  const verifyCredentialsMutation = api.auth.verifyCredentialsAndSendOtp.useMutation({
    onSuccess: () => {
      setAuthMode("OTP");
      toast.success("Identity verified. Access code sent to your email.");
      setLoading(false);
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials detected. Connection terminated.");
      setLoading(false);
    }
  });

  const sendOtpMutation = api.auth.sendOtp.useMutation({
    onSuccess: () => {
      setAuthMode("RESET");
      toast.success("Verification code sent to your email.");
    },
    onError: (err) => toast.error(err.message),
  });

  const resetPasswordMutation = api.auth.verifyOtpAndResetPassword.useMutation({
    onSuccess: () => {
      setAuthMode("LOGIN");
      setOtp("");
      setNewPassword("");
      toast.success("Password reset successfully. Secure access granted.");
    },
    onError: (err) => toast.error(err.message),
  });

  // Handlers
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    verifyCredentialsMutation.mutate({ email, password });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await signIn("credentials", {
      email,
      password,
      otp,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid access code.");
      setLoading(false);
    } else {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      setShowSplash(true);
      toast.success("Authentication successful. Establishing secure link...");
      setTimeout(() => {
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/user/applications");
        }
      }, 2500);
    }
  };

  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    sendOtpMutation.mutate({ email, purpose: "RESET_PASSWORD" });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please provide both OTP and new password.");
    resetPasswordMutation.mutate({ email, code: otp, newPassword });
  };

  if (showSplash) {
    return <LoginSplashScreen />;
  }

  return (
    <div className="flex min-h-screen bg-[#0C0C0E] font-sans items-center justify-center relative overflow-hidden">
      <TechBackground />

      {/* Main Screen Top Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
          <Database className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black text-white tracking-[0.2em] uppercase drop-shadow-md">
          DB-Manager
        </span>
      </motion.div>

      {/* Nodes */}
      <CornerNode position="tl" />
      <CornerNode position="tr" />
      <CornerNode position="bl" />
      <CornerNode position="br" />

      {/* Center Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-[380px] bg-[#151517] border border-white/5 rounded-2xl p-8 z-20 shadow-2xl relative"
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-black border border-white/10 rounded-full flex items-center justify-center relative shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 blur-md" />
            {authMode === "OTP" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 relative z-10 animate-pulse" />
            ) : (
              <User className="w-6 h-6 text-blue-400 relative z-10" />
            )}
            
            {/* Tiny decoration dots */}
            <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-white/30 rounded-full" />
            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white/30 rounded-full" />
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white/30 rounded-full" />
            <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-white/30 rounded-full" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[22px] font-semibold text-white mb-2">
            {authMode === "LOGIN" && "Welcome Back"}
            {authMode === "OTP" && "Verify Identity"}
            {authMode === "FORGOT" && "Recover Access"}
            {authMode === "RESET" && "Set New Password"}
          </h1>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            {authMode === "LOGIN" && "Please enter your credentials to access the secure portal."}
            {authMode === "OTP" && "Enter the 6-digit access code sent to your email to complete the login."}
            {authMode === "FORGOT" && "Enter your email to receive a password reset code."}
            {authMode === "RESET" && "Enter the code sent to your email and your new password."}
          </p>
        </div>

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {authMode === "LOGIN" && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyCredentials} 
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                     <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email address" 
                    required
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-500" 
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                     <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    required
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-500" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B75E3] hover:bg-[#0A66C2] text-white font-medium text-[13px] py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(11,117,227,0.25)] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                </button>

                <div className="pt-4 pb-1">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode("FORGOT")}
                    className="group flex items-center justify-center gap-2 w-full text-[12px] font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Forgot your password?
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                  </button>
                </div>
              </motion.form>
            )}

            {authMode === "OTP" && (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldAlert className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[18px] font-mono tracking-[0.5em] text-center text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 placeholder:tracking-normal focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("LOGIN");
                      setOtp("");
                    }}
                    className="w-1/3 bg-[#1C1C1E] hover:bg-[#252528] text-white text-[12px] font-semibold py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[13px] py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify Login
                  </button>
                </div>
              </motion.form>
            )}

            {authMode === "FORGOT" && (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSendForgotOtp} 
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-500"
                    placeholder="Registered Email"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("LOGIN")}
                    className="w-1/3 bg-[#1C1C1E] hover:bg-[#252528] text-white text-[12px] font-semibold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendOtpMutation.isPending}
                    className="w-2/3 bg-[#0B75E3] hover:bg-[#0A66C2] text-white font-semibold text-[13px] py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(11,117,227,0.25)] flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Code
                  </button>
                </div>
              </motion.form>
            )}

            {authMode === "RESET" && (
              <motion.form 
                key="reset"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleResetPassword} 
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldAlert className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[16px] font-mono tracking-[0.3em] text-center text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-600 placeholder:tracking-normal"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-500"
                    placeholder="New Password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full bg-[#0B75E3] hover:bg-[#0A66C2] text-white font-semibold text-[13px] py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(11,117,227,0.25)] flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
                >
                  {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Reset
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom Credits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center px-4 z-30 pointer-events-none"
      >
        <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-wider uppercase leading-relaxed max-w-2xl mx-auto">
          Designed and developed by <span className="text-slate-300 font-bold">Connex Code Works</span> — Internal Software Team
          <br className="hidden sm:block" />
          <span className="text-slate-400">Connex Information Technologies for SriLankan Airlines</span>
          <br />
          <span className="text-slate-600 text-[9px] sm:text-[10px]">Since 2025 &bull; Version 3.0</span>
        </p>
      </motion.div>
    </div>
  );
}
