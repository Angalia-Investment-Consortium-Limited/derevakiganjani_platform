import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole, AdminProfile } from '@/types/auth';

interface AdminRoleBasedRouteProps {
  children: React.ReactNode;
}

// A specific RoleBasedRoute that ONLY allows SuperAdmins.
export const AdminRoleBasedRoute: React.FC<AdminRoleBasedRouteProps> = ({ children }) => {
  const { user, profile, isAuthenticated, isLoading, profileLoading } = useAuth();

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" replace />;
  }

  const allowedRoles: UserRole[] = ['SuperAdmin'];
  const hasRoleInUserObject = user?.roles?.some(role => allowedRoles.includes(role));
  const hasRoleInProfile = (profile as AdminProfile)?.role === 'SuperAdmin';

  const hasPermission = hasRoleInUserObject || hasRoleInProfile;

  if (!hasPermission) {
    return <Navigate to="/auth/admin-login" replace />;
  }

  return <>{children}</>;
};
