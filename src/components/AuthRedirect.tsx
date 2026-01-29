
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthRedirect = () => {
  const { user, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until the profile is loaded and user object is available
    if (profileLoading) {
      return;
    }

    const role = user?.roles?.[0]; // Get the primary role

    switch (role) {
      case 'Admin':
        navigate('/admin');
        break;
      case 'Employer':
        navigate('/employer/dashboard');
        break;
      case 'Driver':
        navigate('/dashboard');
        break;
      default:
        // If role is not found, or not one of the above, redirect to a safe place
        console.error('Unknown or missing user role:', role);
        navigate('/login');
        break;
    }
    // Added user to dependency array to re-run effect when user object changes
  }, [user, profileLoading, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Please wait, redirecting...</p>
    </div>
  );
};

export default AuthRedirect;
