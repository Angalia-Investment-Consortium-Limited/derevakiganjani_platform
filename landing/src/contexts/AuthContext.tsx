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
  getUserCookie: () => void;
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

  // Use useFrappeAuth hook - this is the primary source of auth state
  const { 
    currentUser, 
    isValidating, 
    login: frappeLogin, 
    logout: frappeLogout,
    updateCurrentUser,
    getUserCookie
  } = useFrappeAuth();

  // Fetch user profile based on user type
  // Only fetch if currentUser exists (user is logged in)
  const profileKey = currentUser ? 'derevahuduma_platform.api.auth.get_user_profile' : null;
  const { data: profileData, mutate: mutateProfile } = useFrappeGetCall<any>(
    profileKey as string,
    undefined,
    profileKey as string,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const { call: registerCall } = useFrappePostCall('derevahuduma_platform.api.auth.register');
  const { call: updateProfileCall } = useFrappePostCall('derevahuduma_platform.api.auth.update_profile');

  // Initialize auth state from currentUser (provided by useFrappeAuth)
  // Note: currentUser is just the username string, we need to fetch full user data
  useEffect(() => {
    if (currentUser) {
      // User is logged in, but we need profile data for full user info
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: isValidating || !profileData,
        error: null,
      }));
    } else if (!isValidating) {
      // User is not logged in and not validating
      setAuthState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } else {
      // Still validating
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
      }));
    }
  }, [currentUser, isValidating, profileData]);

  // Load profile data when available
  useEffect(() => {
    if (profileData) {
      // The API returns user data with user_type, roles, and profile
      const userData = profileData;
      
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          user_type: userData.user_type,
          roles: userData.roles
        } as User,
        profile: userData.profile || null,
      }));
    }
  }, [profileData]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Use Frappe's login function
      await frappeLogin({
        username: credentials.usr,
        password: credentials.pwd,
      });
      
      // Refresh current user data
      await updateCurrentUser();
      
      // Fetch profile data which includes user_type, roles, and full user info
      const profileResponse = await mutateProfile();
      
      if (!profileResponse) {
        throw new Error('Failed to load user data after login');
      }
      
      // Profile response contains user data with user_type, roles, and profile
      const userData = profileResponse as any;
      const profile = userData?.profile || null;
      
      // Create user object from profile response
      const enhancedUser: User = {
        name: currentUser || '',
        email: userData?.email || '',
        full_name: userData?.full_name || '',
        user_image: userData?.user_image,
        mobile_no: userData?.mobile_no,
        user_type: userData?.user_type,
        roles: userData?.roles || [],
        enabled: true,
      };
      
      setAuthState({
        user: enhancedUser,
        profile: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { user: enhancedUser, profile };
    } catch (error: any) {
      // Reset auth state on error
      if (error.httpStatus === 403 || error.httpStatus === 401) {
        getUserCookie(); // Reset auth cookie state
      }
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        profile: null,
        isAuthenticated: false,
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
      getUserCookie(); // Reset auth state
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
      await updateCurrentUser();
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
        getUserCookie,
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
