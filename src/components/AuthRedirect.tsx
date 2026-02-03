
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { EmployerProfile, AdminProfile } from '@/types/auth';

const AuthRedirect = () => {
  const { user, profile, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profileLoading) {
      return; 
    }

    const isSuperAdminInToken = user?.roles?.includes('SuperAdmin');
    const isSuperAdminInProfile = (profile as AdminProfile)?.role === 'SuperAdmin';

    if (isSuperAdminInToken || isSuperAdminInProfile) {
      navigate('/admin');
      return;
    }

    const primaryRole = user?.roles?.[0];

    switch (primaryRole) {
      case 'Employer': {
        const employerProfile = profile as EmployerProfile;
        
        if (employerProfile?.verification_status === 'Verified' || employerProfile?.verified === true) {
          navigate('/employer/dashboard');
        } else {
          navigate('/employer/pending-verification');
        }
        break;
      }

      case 'Admin':
      case 'Staff':
      case 'Driver':
        navigate('/dashboard');
        break;

      default:
        console.warn('AuthRedirect: Could not determine user role after loading. Redirecting to login.');
        navigate('/ingia');
        break;
    }
  }, [user, profile, profileLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-semibold mt-4">Logging you in...</h1>
            <p className="text-muted-foreground mt-2">Please wait while we redirect you to your dashboard.</p>
        </div>
    </div>
  );
};

export default AuthRedirect;
