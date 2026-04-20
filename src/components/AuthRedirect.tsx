
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { EmployerProfile } from '@/types/auth';

const AuthRedirect = () => {
  const { user, profile, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profileLoading) {
      return; 
    }

    if (user?.roles?.includes('SuperAdmin')) {
      navigate('/admin');
      return;
    }

    const primaryRole = user?.roles?.[0];

    switch (primaryRole) {
      case 'Employer': {
        const employerProfile = profile as EmployerProfile;
        // Corrected field name from verification_status to verificationStatus
        const status = employerProfile?.verificationStatus?.toLowerCase();
        
        if (status === 'verified') {
          navigate('/employer/dashboard');
        } else {
          navigate('/employer/pending-verification');
        }
        break;
      }

      case 'Admin':
      case 'Staff':
      case 'Tutor':
      case 'LicenseOfficer':
      case 'TestOfficer':
      case 'Finance':
        navigate('/admin');
        break;

      case 'Driver':
        navigate('/dashboard');
        break;

      default:
        if (user) {
          navigate('/dashboard'); 
        } else {
          navigate('/ingia');
        }
        break;
    }
  }, [user, profile, profileLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-semibold mt-4">Logging you in...</h1>
            <p className="text-muted-foreground mt-2">Please wait while we redirect you to your dashboard.</p>
        </div>
    </div>
  );
};

export default AuthRedirect;
