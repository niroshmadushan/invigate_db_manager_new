import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export function usePermissions(moduleId: string) {
  const { data: session, status } = useSession();
  
  // Only fetch profile if authenticated and NOT an ADMIN
  // Admins always bypass so we can skip the query if we wanted, 
  // but let's fetch it anyway just in case they have a specific role assigned.
  const { data: profile, isLoading: isLoadingProfile } = api.user.getProfile.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const isLoading = status === "loading" || isLoadingProfile;
  const role = session?.user?.role;

  // Admin bypass: If they don't have a restricted role, they get full access
  if (role === "ADMIN" && !profile?.permissionRole) {
    return { canView: true, canEdit: true, isLoading };
  }

  // If no permission role is found for a regular user, deny access as fallback
  if (!profile?.permissionRole) {
    return { canView: false, canEdit: false, isLoading };
  }

  const perms = profile.permissionRole.permissions as Record<string, { view: boolean, edit: boolean }>;
  const modulePerms = perms[moduleId];

  return {
    canView: !!modulePerms?.view,
    canEdit: !!modulePerms?.edit,
    isLoading
  };
}
