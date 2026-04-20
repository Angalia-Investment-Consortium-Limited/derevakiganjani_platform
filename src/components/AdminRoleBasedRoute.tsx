import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface AdminRoleBasedRouteProps {
  children: React.ReactNode;
}

// A specific RoleBasedRoute that ONLY allows SuperAdmins and Admins.
export const AdminRoleBasedRoute: React.FC<AdminRoleBasedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" replace />;
  }

  const allowedRoles: UserRole[] = ['SuperAdmin', 'Admin', 'Tutor', 'LicenseOfficer', 'TestOfficer', 'Finance'];
  const hasPermission = user?.roles?.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    // Redirect to a general access-denied or dashboard page instead of admin-login
    // if the user is authenticated but doesn't have the right role.
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
