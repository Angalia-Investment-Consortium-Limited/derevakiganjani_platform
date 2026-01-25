import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { EmployerProfile } from '@/types/auth';

interface EmployerVerificationGuardProps {
  children: React.ReactNode;
}

export const EmployerVerificationGuard: React.FC<EmployerVerificationGuardProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is an employer
  const isEmployer = user?.roles?.includes('Employer') || user?.user_type === 'Employer';

  if (!isEmployer) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check employer verification status
  const employerProfile = profile as EmployerProfile;
  
  if (!employerProfile) {
    // Profile not loaded yet, show loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if employer is verified
  const isVerified = employerProfile.verified === true || employerProfile.verification_status === 'Verified';

  if (!isVerified) {
    // Redirect to pending verification page
    return <Navigate to="/employer/pending-verification" replace />;
  }

  // Employer is verified, allow access
  return <>{children}</>;
};
