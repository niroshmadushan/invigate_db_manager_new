"use client";

import { api } from "~/trpc/react";
import { Loader2, User, Briefcase, Mail, Building, MapPin, Phone, Hash, ShieldAlert, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePermissions } from "~/hooks/usePermissions";
import { PermissionDenied } from "~/components/PermissionDenied";

const ROLE_COLUMNS = [
  "ticket_no", "cneint", "mgdp", "cpmit", "tld", "mho", "mitbs", "cfo", "ceo", "fnm", 
  "hoit", "it_po", "eng_po", "gp_po", "pt_po", "ge_po", "it_pro", "cnent", "csm", "itsm", 
  "sdm", "db_lead", "nt_lead", "wan_lead", "ma", "smit", "epa", "opa", "gpa", "ppa", 
  "ghpa", "itpa", "net_lead", "rm", "g10"
];

export function UserProfileClient({ userId }: { userId: number }) {
  const router = useRouter();
  const { canView, isLoading: isPermsLoading } = usePermissions("single-user");

  const { data: userProfile, isLoading: isProfileLoading, isError } = api.singleUser.getUserProfile.useQuery(
    { userId },
    { enabled: !!userId && canView }
  );

  const isLoading = isProfileLoading || isPermsLoading;

  if (isPermsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)] w-full bg-slate-50 dark:bg-[#0f1219] rounded-2xl">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!canView) {
    return <PermissionDenied />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f1219] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151923] shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/user/single-user')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Comprehensive User Profile
                </h2>
                <p className="text-xs text-slate-500 font-medium">Viewing complete roles and metadata</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-500">Loading full user profile...</p>
            </div>
          ) : isError || !userProfile ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-500">
              <ShieldAlert className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold">Failed to load user profile.</p>
              <button 
                onClick={() => router.push('/user/single-user')}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Go Back
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full max-w-[1600px] mx-auto"
            >
              {/* Left Column: Basic Details */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 dark:from-purple-900/40 dark:to-blue-900/40"></div>
                  
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-[#151923] border-4 border-white dark:border-[#151923] shadow-md flex items-center justify-center text-3xl font-extrabold text-purple-600 dark:text-purple-400 relative z-10 mt-6 mb-4">
                    {userProfile.details.name ? userProfile.details.name.charAt(0) : userProfile.details.username.charAt(0)}
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {`${userProfile.details.name || ''} ${userProfile.details.lastname || ''}`.trim() || 'Unknown Name'}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-6">@{userProfile.details.username}</p>
                  
                  <div className="w-full flex flex-col gap-4 text-left">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile.details.position || 'No Position Set'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile.details.department || 'No Department'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile.details.email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile.details.mobile || 'No Mobile Phone'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{userProfile.details.location || 'No Location Set'}</span>
                    </div>
                  </div>
                </div>

                {/* System Data */}
                <div className="bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">System Record</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">System ID</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-purple-500" /> {userProfile.details.id}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Employee No</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userProfile.details.employee_number || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded inline-flex w-fit ${userProfile.details.is_disabled ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                        {userProfile.details.is_disabled ? 'DISABLED' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Roles and Flags */}
              <div className="xl:col-span-3 flex flex-col gap-6">
                
                {/* Extended Roles Flags */}
                <div className="bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-600" />
                      System Profile Flags
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Status of all administrative column flags assigned in user_details.</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {ROLE_COLUMNS.map(col => {
                        const value = userProfile.details[col];
                        const hasRole = value === 1 || value === '1' || value === true || (typeof value === 'number' && value > 0 && col === 'ticket_no') || (typeof value === 'string' && value.trim() !== '' && value !== '0');
                        
                        return (
                          <div key={col} className={`flex items-center gap-2 p-3 rounded-xl border ${hasRole ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/50' : 'bg-slate-50/50 border-slate-100 dark:bg-[#11151d]/50 dark:border-slate-800/50'} transition-colors`}>
                            <div className="shrink-0">
                              {hasRole ? (
                                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${hasRole ? 'text-purple-900 dark:text-purple-100' : 'text-slate-500'}`}>
                                {col.replace('_', ' ')}
                              </span>
                              {hasRole && col === 'ticket_no' && (
                                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">ID: {value}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Joined user_roles Table Data */}
                <div className="bg-white dark:bg-[#151923] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Assigned Role Mappings (user_roles)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Explicit roles assigned in the user_roles table linked by User ID.</p>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                    {userProfile.roles.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center text-slate-400">
                        <Briefcase className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No external roles mapped.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm relative">
                        <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#11151d]/95 backdrop-blur-md text-xs uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 z-10">
                          <tr>
                            <th className="px-6 py-3 font-bold w-32">Role ID</th>
                            <th className="px-6 py-3 font-bold">Short Name</th>
                            <th className="px-6 py-3 font-bold">Long Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                          {userProfile.roles.map(role => (
                            <tr key={role.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                              <td className="px-6 py-3 font-mono text-xs">#{role.id}</td>
                              <td className="px-6 py-3 font-bold text-purple-700 dark:text-purple-400 uppercase text-xs">{role.short_name}</td>
                              <td className="px-6 py-3 font-medium">{role.long_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
