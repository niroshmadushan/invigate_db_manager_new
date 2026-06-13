"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { Camera, Mail, Lock, User, Phone, Briefcase, Shield, X, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState(session?.user?.phone || "");
  const [designation, setDesignation] = useState(session?.user?.designation || "");
  const [image, setImage] = useState(session?.user?.image || "");
  
  const { data: profile, refetch: refetchProfile } = api.user.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setDesignation(profile.designation || "");
      setImage(profile.image || "");
    } else if (session?.user) {
      setName(session.user.name || "");
      setPhone(session.user.phone || "");
      setDesignation(session.user.designation || "");
    }
  }, [profile, session?.user]);
  
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Modal States ===
  // Email Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<"enter_email" | "enter_otp">("enter_email");
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailOtpInput, setEmailOtpInput] = useState("");

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<"request_otp" | "enter_otp_and_password">("request_otp");
  const [passwordOtpInput, setPasswordOtpInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  // === TRPC Mutations ===
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Profile updated successfully!");
      refetchProfile(); // Refresh the TRPC profile data (image, etc)
      update({
        name: variables.name,
        phone: variables.phone,
        designation: variables.designation,
      });
    }
  });

  const sendOtpToNewEmail = api.auth.sendOtpToNewEmail.useMutation({
    onSuccess: () => {
      toast.success("Verification code sent to " + newEmailInput);
      setEmailStep("enter_otp");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifyOtpAndChangeEmail = api.auth.verifyOtpAndChangeEmail.useMutation({
    onSuccess: () => {
      toast.success("Email changed successfully!");
      setIsEmailModalOpen(false);
      setNewEmailInput("");
      setEmailOtpInput("");
      update(); // Update NextAuth session
    },
    onError: (err) => toast.error(err.message),
  });

  const sendPasswordResetOtp = api.auth.sendOtp.useMutation({
    onSuccess: () => {
      toast.success("OTP sent to your current email!");
      setPasswordStep("enter_otp_and_password");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifyOtpAndResetPassword = api.auth.verifyOtpAndResetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setIsPasswordModalOpen(false);
      setPasswordOtpInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    },
    onError: (err) => toast.error(err.message),
  });

  // === Handlers ===
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, phone, designation, image });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        updateProfile.mutate({ name, phone, designation, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendNewEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput) return toast.error("Please enter a valid email");
    sendOtpToNewEmail.mutate({ newEmail: newEmailInput });
  };

  const handleChangeEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtpInput) return toast.error("Please enter the OTP");
    verifyOtpAndChangeEmail.mutate({ newEmail: newEmailInput, code: emailOtpInput });
  };

  const handleRequestPasswordOtp = () => {
    if (!session?.user?.email) return toast.error("User email not found");
    sendPasswordResetOtp.mutate({ email: session.user.email, purpose: "RESET_PASSWORD" });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOtpInput || !newPasswordInput || !confirmPasswordInput) {
      return toast.error("Please fill all fields");
    }
    if (newPasswordInput !== confirmPasswordInput) {
      return toast.error("Passwords do not match");
    }
    if (!session?.user?.email) return toast.error("User email not found");
    
    verifyOtpAndResetPassword.mutate({
      email: session.user.email,
      code: passwordOtpInput,
      newPassword: newPasswordInput,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header Area */}
      <header className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-[18px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider uppercase">
            Account Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1 font-bold tracking-wide">
            Manage your profile, security, and preferences.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Avatar & Navigation */}
        <div className="w-full lg:w-56 shrink-0 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative group">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-slate-900 transition-transform duration-500 group-hover:scale-105">
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[28px] font-extrabold text-blue-600 dark:text-blue-400">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white text-center tracking-wide">
              {name || "User Profile"}
            </h3>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">
              {designation || session?.user?.role || "USER"}
            </p>
          </div>

          <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex flex-col gap-1">
            <button 
              id="tour-basic-info"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-extrabold uppercase tracking-widest transition-all duration-300 ${activeTab === "general" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <User className="w-4 h-4" />
              Basic Info
            </button>
            <button 
              id="tour-security"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-extrabold uppercase tracking-widest transition-all duration-300 ${activeTab === "security" ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </nav>
        </div>

        {/* Right Column: Dynamic Form Content */}
        <div className="flex-1 w-full min-w-0 min-h-[500px]">
          
          {activeTab === "general" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white tracking-wide uppercase">
                    Basic Information
                  </h2>
                  <p className="text-[12px] font-bold text-slate-400 mt-1 tracking-wider">Update your personal details here.</p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" /> Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-extrabold uppercase tracking-widest py-3 px-8 rounded-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white tracking-wide uppercase">
                    Security & Access
                  </h2>
                  <p className="text-[12px] font-bold text-slate-400 mt-1 tracking-wider">Manage your credentials securely.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                
                {/* Email Address Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div>
                    <h3 className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-slate-400" /> Email Address
                    </h3>
                    <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 ml-6">{session?.user?.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEmailStep("enter_email");
                      setNewEmailInput("");
                      setEmailOtpInput("");
                      setIsEmailModalOpen(true);
                    }}
                    className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-2.5 rounded-lg text-[12px] font-extrabold uppercase tracking-widest hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shrink-0"
                  >
                    Change Email
                  </button>
                </div>

                {/* Password Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div>
                    <h3 className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-slate-400" /> Password
                    </h3>
                    <p className="text-[13px] font-bold text-slate-400 ml-6">Secure your account</p>
                  </div>
                  <button 
                    onClick={() => {
                      setPasswordStep("request_otp");
                      setPasswordOtpInput("");
                      setNewPasswordInput("");
                      setConfirmPasswordInput("");
                      setIsPasswordModalOpen(true);
                    }}
                    className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-6 py-2.5 rounded-lg text-[12px] font-extrabold uppercase tracking-widest hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shrink-0"
                  >
                    Reset Password
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* === CHANGE EMAIL MODAL === */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 pb-0">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  Change Email
                </h3>
                <p className="text-[13px] font-bold text-slate-500 mt-1 mb-6">
                  {emailStep === "enter_email" ? "Enter your new email address to receive a verification code." : "Enter the 6-digit code sent to your new email."}
                </p>
              </div>

              {emailStep === "enter_email" ? (
                <form onSubmit={handleSendNewEmailOtp} className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. you@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sendOtpToNewEmail.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-extrabold uppercase tracking-widest py-3 px-8 rounded-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 mt-2"
                  >
                    {sendOtpToNewEmail.isPending ? "Sending..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleChangeEmailSubmit} className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      required
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 tracking-widest text-center transition-colors"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifyOtpAndChangeEmail.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-extrabold uppercase tracking-widest py-3 px-8 rounded-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 mt-2"
                  >
                    {verifyOtpAndChangeEmail.isPending ? "Verifying..." : "Verify & Change Email"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === RESET PASSWORD MODAL === */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 pb-0">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  Reset Password
                </h3>
                <p className="text-[13px] font-bold text-slate-500 mt-1 mb-6">
                  {passwordStep === "request_otp" 
                    ? "We need to send a verification code to your current email to authorize this change." 
                    : "Enter the verification code and your new password."}
                </p>
              </div>

              {passwordStep === "request_otp" ? (
                <div className="p-6 pt-0">
                  <button
                    onClick={handleRequestPasswordOtp}
                    disabled={sendPasswordResetOtp.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-[13px] font-extrabold uppercase tracking-widest py-3 px-8 rounded-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50"
                  >
                    {sendPasswordResetOtp.isPending ? "Sending..." : "Send Verification Code"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      required
                      value={passwordOtpInput}
                      onChange={(e) => setPasswordOtpInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 tracking-widest text-center transition-colors"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-[14px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyOtpAndResetPassword.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-[13px] font-extrabold uppercase tracking-widest py-3 px-8 rounded-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 mt-4"
                  >
                    {verifyOtpAndResetPassword.isPending ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
