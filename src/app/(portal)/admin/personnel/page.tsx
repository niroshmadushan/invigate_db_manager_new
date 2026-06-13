"use client";

import { useState, Suspense } from "react";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Plus, Shield, ShieldAlert, KeyRound, UserCheck, X } from "lucide-react";

function PersonnelRosterContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: users, refetch, isFetching } = api.user.getAllUsers.useQuery(
    { searchQuery },
    { refetchOnWindowFocus: false }
  );

  const { data: roles } = api.role.getAll.useQuery();
  
  const updateUserRole = api.user.updateUserRole.useMutation({ 
    onSuccess: () => { refetch(); toast.success("Role successfully updated"); },
    onError: (err) => toast.error(err.message)
  });
  
  const createUser = api.user.createUser.useMutation({ 
    onSuccess: () => { refetch(); setIsCreateModalOpen(false); toast.success("Personnel successfully provisioned!"); },
    onError: (err) => toast.error(err.message)
  });
  
  const updateUserDetails = api.user.updateUserDetails.useMutation({ 
    onSuccess: () => { refetch(); setIsEditModalOpen(false); toast.success("Personnel details updated!"); },
    onError: (err) => toast.error(err.message)
  });
  

  const resetPassword = api.user.adminResetPassword.useMutation({ 
    onSuccess: () => { setIsResetModalOpen(false); toast.success("Password successfully forced reset!"); },
    onError: (err) => toast.error(err.message)
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Confirm Action State
  const [confirmPrompt, setConfirmPrompt] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Selected User state
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    role: "USER" as "ADMIN" | "USER",
    accessLevel: "VIEW_ONLY" as "VIEW_ONLY" | "FULL_CONTROL",
    permissionRoleId: "" as string | null,
  });

  const handleRoleChange = (userId: string, currentRole: "ADMIN" | "USER", currentAccess: "VIEW_ONLY" | "FULL_CONTROL") => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setConfirmPrompt({
      title: "Confirm Role Change",
      message: `Are you sure you want to change this user's role to ${newRole}?`,
      onConfirm: () => updateUserRole.mutate({ userId, role: newRole, accessLevel: currentAccess })
    });
  };

  const openCreateModal = () => {
    setFormData({ name: "", email: "", password: "", designation: "", role: "USER", accessLevel: "VIEW_ONLY", permissionRoleId: "" });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmPrompt({
      title: "Confirm Account Creation",
      message: `Are you sure you want to provision an account for ${formData.name}? An email will be dispatched immediately.`,
      onConfirm: () => createUser.mutate(formData)
    });
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...formData, name: user.name || "", email: user.email || "", designation: user.designation || "", permissionRoleId: user.permissionRoleId || "" });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setConfirmPrompt({
      title: "Confirm Detail Update",
      message: `Save changes for ${formData.name}?`,
      onConfirm: () => {
        updateUserDetails.mutate({ userId: selectedUser.id, name: formData.name, email: formData.email, designation: formData.designation });
        if (formData.permissionRoleId !== selectedUser.permissionRoleId) {
          updateUserRole.mutate({ userId: selectedUser.id, role: selectedUser.role, accessLevel: selectedUser.accessLevel, permissionRoleId: formData.permissionRoleId || null });
        }
      }
    });
  };

  const openResetModal = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: "" });
    setIsResetModalOpen(true);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setConfirmPrompt({
      title: "CONFIRM FORCE RESET",
      message: `Are you absolutely certain you want to force reset the password for ${selectedUser.name}? This cannot be undone.`,
      onConfirm: () => resetPassword.mutate({ userId: selectedUser.id, newPassword: formData.password })
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 relative h-full flex flex-col"
    >
      <header className="flex justify-between items-end border-b border-slate-200/60 dark:border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-100 dark:border-slate-500/20 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">Personnel Roster</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium tracking-wide">Manage system roles and access privileges</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white transition-all duration-300 ease-in-out bg-gradient-to-r from-slate-600 to-zinc-600 rounded-xl shadow-lg hover:shadow-slate-500/40 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          <span className="text-xs tracking-widest uppercase relative z-10">Add Personnel</span>
        </motion.button>
      </header>

      {searchQuery && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
          Showing search results for: <strong className="text-slate-500">{searchQuery}</strong>
        </motion.div>
      )}

      <div className="bg-white dark:bg-[#151923] shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 relative">
            <thead className="text-[10px] uppercase bg-slate-50 dark:bg-[#0B0F19] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Personnel</th>
                <th className="px-6 py-4 font-bold tracking-wider">Designation</th>
                <th className="px-6 py-4 font-bold tracking-wider">System Role</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
              {isFetching && !users ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 animate-pulse text-sm">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-50 animate-bounce" />
                    Searching records...
                  </td>
                </tr>
              ) : users?.map((u, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} 
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name || "N/A"}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{u.designation || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wide ${u.role === "ADMIN" ? 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'}`}>
                      {u.role}
                    </span>
                    {u.permissionRole && (
                      <span className="ml-2 px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wide bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {u.permissionRole.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(u)} className="text-[10px] font-bold border border-slate-200 dark:border-white/10 hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-400 px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-transparent">
                      EDIT
                    </button>
                    <button onClick={() => openResetModal(u)} className="text-[10px] font-bold border border-slate-200 dark:border-white/10 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500 px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-transparent">
                      RESET PASS
                    </button>
                    <button onClick={() => handleRoleChange(u.id, u.role, u.accessLevel)} className="text-[10px] font-bold border border-slate-200 dark:border-white/10 hover:border-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-transparent">
                      ROLE
                    </button>
                  </td>
                </motion.tr>
              ))}
              {(!isFetching && users?.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 text-sm">No personnel records found in DB.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* --- CONFIRMATION MODAL --- */}
        {confirmPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center mx-auto -mt-10 mb-4 text-slate-500 shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmPrompt.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{confirmPrompt.message}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setConfirmPrompt(null)} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={() => { confirmPrompt.onConfirm(); setConfirmPrompt(null); }} 
                    className="px-5 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow-md transition-colors"
                  >
                    Yes, Proceed
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- FORM MODALS --- */}
        {(isCreateModalOpen || isEditModalOpen || isResetModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          >
            {/* Create User Modal */}
            {isCreateModalOpen && (
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white/95 dark:bg-black/80 backdrop-blur-xl w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-500/10 rounded-xl text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-500/20">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Provision Personnel</h3>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">New System Record</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:rotate-90">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-8 space-y-5">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. john@example.com" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Temporary Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white placeholder-slate-400" placeholder="Minimum 6 characters" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                      <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white placeholder-slate-400" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5 group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Role</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as "ADMIN"|"USER"})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white appearance-none cursor-pointer">
                        <option value="USER" className="dark:bg-slate-900">USER</option>
                        <option value="ADMIN" className="dark:bg-slate-900">ADMIN</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest ml-1">Permission Role Profile</label>
                    <select value={formData.permissionRoleId || ""} onChange={e => setFormData({...formData, permissionRoleId: e.target.value})} className="w-full bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-purple-900 dark:text-purple-100 appearance-none cursor-pointer">
                      <option value="" className="dark:bg-slate-900">-- No Special Permissions (Default) --</option>
                      {roles?.map(r => (
                        <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={createUser.isPending} className="group relative px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-slate-600 to-zinc-600 rounded-xl shadow-lg hover:shadow-slate-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 overflow-hidden">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      {createUser.isPending ? "PROVISIONING..." : "PROVISION ACCOUNT"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white/95 dark:bg-black/80 backdrop-blur-xl w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-500/10 rounded-xl text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-500/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Edit Personnel</h3>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Update Record Data</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:rotate-90">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                    <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-slate-900 dark:text-white" placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest ml-1">Permission Role Profile</label>
                    <select value={formData.permissionRoleId || ""} onChange={e => setFormData({...formData, permissionRoleId: e.target.value})} className="w-full bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-purple-900 dark:text-purple-100 appearance-none cursor-pointer">
                      <option value="" className="dark:bg-slate-900">-- No Special Permissions (Default) --</option>
                      {roles?.map(r => (
                        <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={updateUserDetails.isPending} className="group relative px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-slate-600 to-zinc-600 rounded-xl shadow-lg hover:shadow-slate-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 overflow-hidden">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      {updateUserDetails.isPending ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Reset Password Modal */}
            {isResetModalOpen && (
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white/95 dark:bg-black/80 backdrop-blur-xl w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-amber-500/20 flex justify-between items-center bg-amber-50/50 dark:bg-amber-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-500 flex items-center justify-center shadow-inner border border-amber-200 dark:border-amber-500/30">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Reset Password</h3>
                      <p className="text-[10px] font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest">Security Override</p>
                    </div>
                  </div>
                  <button onClick={() => setIsResetModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:rotate-90">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleResetSubmit} className="p-8 space-y-5">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Secure Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-slate-900 dark:text-white placeholder-slate-400" placeholder="Enter new password" />
                  </div>
                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={resetPassword.isPending} className="group relative px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 overflow-hidden">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      {resetPassword.isPending ? "RESETTING..." : "CONFIRM OVERRIDE"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PersonnelRoster() {
  return (
    <Suspense fallback={<div className="text-slate-400 animate-pulse">Loading Elite DB Admin...</div>}>
      <PersonnelRosterContent />
    </Suspense>
  );
}
