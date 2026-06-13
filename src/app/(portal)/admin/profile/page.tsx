"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState(session?.user?.phone || "");
  const [designation, setDesignation] = useState(session?.user?.designation || "");

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      alert("Profile updated successfully!");
      update();
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, phone, designation });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00778b]">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personnel details and security</p>
      </header>

      <div className="glass rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-bold mb-4 border-b border-slate-800/50 pb-2 text-[#c5a975]">Basic Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00778b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email Address (Locked)</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00778b]"
                placeholder="+94 77 123 4567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00778b]"
                placeholder="Senior DBA"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="mt-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="glass rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-bold mb-4 border-b border-slate-800/50 pb-2 text-[#c01132]">Security & Authentication</h2>
        <div className="space-y-4">
           <p className="text-sm text-slate-400">To change your password or email address, you must verify your identity via OTP.</p>
           
           <div className="flex space-x-4">
              <button 
                onClick={() => {
                   alert("Please sign out and use the 'Forgot Password' flow on the login page to reset your password via OTP.");
                }}
                className="border border-[#c5a975] text-[#c5a975] hover:bg-[#c5a975]/10 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Reset Password (OTP)
              </button>
              <button 
                onClick={() => {
                   alert("Change email functionality requires system administrator approval.");
                }}
                className="border border-slate-600 text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm transition-colors cursor-not-allowed"
              >
                Change Email
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
