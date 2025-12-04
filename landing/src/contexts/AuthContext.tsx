import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useFrappeAuth, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import type { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData,
  DriverProfile,
  EmployerProfile,
  AdminProfile
} from '@/types/auth';
import { removeAuthToken } from '@/lib/frappe';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ user: User; profile: DriverProfile | EmployerProfile | AdminProfile | null }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const { currentUser, isValidating, login: frappeLogin, logout: frappeLogout } = useFrappeAuth();
  const { data: userData, error: userError, mutate: mutateUser } = useFrappeGetCall<{ message: User }>(
    'frappe.auth.get_logged_user',
    undefined,
    undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch user profile based on user type
  const { data: profileData, mutate: mutateProfile } = useFrappeGetCall<{ message: DriverProfile | EmployerProfile | AdminProfile }>(
    authState.user ? 'derevahuduma_platform.api.auth.get_user_profile' : '',
    undefined,
    undefined,
    {
      revalidateOnFocus: false,
    }
  );

  const { call: registerCall } = useFrappePostCall('derevahuduma_platform.api.auth.register');
  const { call: updateProfileCall } = useFrappePostCall('derevahuduma_platform.api.auth.update_profile');

  // Initialize auth state
  useEffect(() => {
    if (currentUser && userData?.message) {
      const user = userData.message;
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } else if (!isValidating) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, [currentUser, userData, isValidating]);

  // Load profile data
  useEffect(() => {
    if (profileData?.message) {
      setAuthState(prev => ({
        ...prev,
        profile: profileData.message,
      }));
    }
  }, [profileData]);

  // Handle user errors
  useEffect(() => {
    if (userError) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load user data',
        isLoading: false,
      }));
    }
  }, [userError]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await frappeLogin({
        username: credentials.usr,
        password: credentials.pwd,
      });
      
      // Wait for user data to be fetched
      await mutateUser();
      
      // Wait a bit for the user data to be available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch profile data
      const profileResponse = await mutateProfile();
      
      // Get the latest user data
      const userResponse = await mutateUser();
      const user = userResponse?.message;
      const profile = profileResponse?.message;
      
      if (!user) {
        throw new Error('Failed to load user data after login');
      }
      
      setAuthState({
        user,
        profile: profile || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { user, profile: profile || null };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Login failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await frappeLogout();
      removeAuthToken();
      setAuthState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      removeAuthToken();
      setAuthState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await registerCall({
        ...data,
      });
      
      // Don't auto-login, let user login manually
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Registration failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const updateProfile = async (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await updateProfileCall(data);
      
      // Refresh profile data
      await mutateProfile();
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Profile update failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      await mutateProfile();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
