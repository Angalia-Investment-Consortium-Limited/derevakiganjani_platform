import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { EmployerProfile } from '@/types/auth';
import { useEffect } from 'react';

interface EmployerVerificationGuardProps {
  children: React.ReactNode;
}

export const EmployerVerificationGuard: React.FC<EmployerVerificationGuardProps> = ({ children }) => {
  const { profile, profileLoading, refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const employerProfile = profile as EmployerProfile;
  const status = employerProfile?.verificationStatus?.trim().toLowerCase();

  if (status === 'verified') {
    return <>{children}</>;
  }

  return <Navigate to="/employer/pending-verification" replace />;
};
