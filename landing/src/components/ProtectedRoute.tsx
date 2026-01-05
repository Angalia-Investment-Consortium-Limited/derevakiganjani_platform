import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isValidating, profileLoading } = useAuth();
  const location = useLocation();

  // Show loading while validating auth or loading profile
  if (isValidating || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/ingia" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
