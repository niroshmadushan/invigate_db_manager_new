"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Plus, Trash2, Edit2, Shield, Eye, Edit3, X, Users
} from "lucide-react";

// List of all restrictable modules from the Sidebar
const SYSTEM_MODULES = [
  { id: "departments", name: "Departments", group: "Sri Lankan Catering" },

  { id: "applications", name: "Applications", group: "SriLankan Airlines" },
  { id: "divisions", name: "Divisions", group: "SriLankan Airlines" },
  { id: "mitbs", name: "MITBS", group: "SriLankan Airlines" },
  { id: "itbsm", name: "ITBSM", group: "SriLankan Airlines" },
  { id: "cost-center", name: "Cost Center", group: "SriLankan Airlines" },
  { id: "single-user", name: "Single User", group: "SriLankan Airlines" },
  { id: "groups", name: "Groups", group: "SriLankan Airlines" },
  { id: "help-desk", name: "Help Desk", group: "SriLankan Airlines" },

  { id: "logs-it-service", name: "Logs - (IT-Service)", group: "IT services Catalogue" },
  { id: "reminders", name: "Reminders", group: "IT services Catalogue" },

  { id: "cr-resolution", name: "CR Resolution", group: "CHANGE REQUEST" },
  { id: "report", name: "Report", group: "CHANGE REQUEST" },

  { id: "app-access", name: "App Access", group: "Tracking Console" },
  { id: "app-tracking", name: "App Tracking", group: "Tracking Console" },
];

export default function RolesManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  // { "applications": { view: true, edit: false }, ... }
  const [permissions, setPermissions] = useState<Record<string, { view: boolean, edit: boolean }>>({});

  const utils = api.useUtils();

  const { data: roles, isLoading } = api.role.getAll.useQuery();

  const createRole = api.role.create.useMutation({
    onSuccess: () => {
      toast.success("Role created successfully");
      utils.role.getAll.invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRole = api.role.update.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      utils.role.getAll.invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteRole = api.role.delete.useMutation({
    onSuccess: () => {
      toast.success("Role deleted successfully");
      utils.role.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const openModal = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      setPermissions(role.permissions as any);
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDescription("");
      // Initialize empty permissions
      const initialPerms: any = {};
      SYSTEM_MODULES.forEach(m => initialPerms[m.id] = { view: false, edit: false });
      setPermissions(initialPerms);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSave = () => {
    if (!roleName) return toast.error("Role name is required");

    if (editingRole) {
      updateRole.mutate({
        id: editingRole.id,
        name: roleName,
        description: roleDescription,
        permissions,
      });
    } else {
      createRole.mutate({
        name: roleName,
        description: roleDescription,
        permissions,
      });
    }
  };

  const togglePermission = (moduleId: string, type: 'view' | 'edit') => {
    setPermissions(prev => {
      const current = prev[moduleId] || { view: false, edit: false };
      const updated = { ...current, [type]: !current[type] };

      // Auto-enable view if edit is enabled
      if (type === 'edit' && updated.edit) updated.view = true;
      // Auto-disable edit if view is disabled
      if (type === 'view' && !updated.view) updated.edit = false;

      return { ...prev, [moduleId]: updated };
    });
  };

  // Group modules for UI rendering
  const modulesByGroup = SYSTEM_MODULES.reduce((acc, module) => {
    if (!acc[module.group]) acc[module.group] = [];
    acc[module.group].push(module);
    return acc;
  }, {} as Record<string, typeof SYSTEM_MODULES>);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Roles
          </h1>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
            Create custom permission profiles to strictly isolate module access for users.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full p-12 text-center text-slate-500 font-bold animate-pulse">Loading securely...</div>
        )}
        {roles?.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 font-bold">No custom roles created yet.</div>
        )}
        {roles?.map((role, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={role.id}
            className="group flex flex-col bg-slate-50 dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{role.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{role._count.users} Assigned Users</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 bg-white dark:bg-[#0B0F19]">
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {role.description || "No specific description provided for this role profile."}
              </p>
            </div>
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-[#151923]/50">
              <button
                onClick={() => openModal(role)}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 dark:hover:border-purple-800/60 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Configure
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete the '${role.name}' role?`)) {
                    deleteRole.mutate({ id: role.id });
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:border-red-800/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {editingRole ? "Edit Permission Role" : "Create New Role"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Role Name</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Helpdesk Tier 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Description</label>
                  <input
                    type="text"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Brief description of who gets this role..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                  Module Access Matrix
                </h3>

                {Object.entries(modulesByGroup).map(([group, modules]) => (
                  <div key={group} className="mb-6">
                    <h4 className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3">
                      {group}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {modules.map(module => {
                        const perm = permissions[module.id] || { view: false, edit: false };
                        return (
                          <div key={module.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 hover:border-purple-500/50 transition-colors">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {module.name}
                            </span>
                            <div className="flex gap-2">
                              {/* View Toggle */}
                              <button
                                onClick={() => togglePermission(module.id, 'view')}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${perm.view ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>

                              {/* Edit Toggle */}
                              <button
                                onClick={() => togglePermission(module.id, 'edit')}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${perm.edit ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3 shrink-0">
              <button
                onClick={closeModal}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createRole.isPending || updateRole.isPending}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white uppercase tracking-widest bg-purple-600 hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
              >
                {createRole.isPending || updateRole.isPending ? "Saving..." : "Save Role Matrix"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
