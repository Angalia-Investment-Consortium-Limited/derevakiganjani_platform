import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFrappeAuth, useFrappeGetCall, useFrappePostCall, useFrappeGetDocList } from 'frappe-react-sdk';
import type { 
  User, 
  UserRole,
  RegisterData,
  DriverProfile,
  EmployerProfile,
  AdminProfile
} from '@/types/auth';

interface AuthContextType {
  // From useFrappeAuth - primary auth state
  currentUser: string | null;
  isValidating: boolean;
  isLoading: boolean; // Added for components that use isLoading
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: () => Promise<void>;
  getUserCookie: () => void;
  
  // Profile data
  profile: DriverProfile | EmployerProfile | AdminProfile | null;
  profileLoading: boolean;
  profileError: any;
  refreshProfile: () => Promise<void>;
  
  // Computed values
  isAuthenticated: boolean;
  userType: UserRole | null;
  roles: UserRole[];
  user: User | null;
  
  // Actions
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Primary auth state from frappe-react-sdk
  const { 
    currentUser, 
    isValidating, 
    login: frappeLogin, 
    logout: frappeLogout,
    updateCurrentUser,
    getUserCookie
  } = useFrappeAuth();

  // Fetch user profile when authenticated using custom API
  // This automatically refetches when currentUser changes
  const { 
    data: profileResponse, 
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile 
  } = useFrappeGetCall<any>(
    'derevahuduma_platform.api.auth.get_user_profile',
    currentUser ? undefined : undefined, // Pass undefined for params
    currentUser ? `user_profile_${currentUser}` : null, // Use unique key for caching, null to disable
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        // Extract actual data from message wrapper if present
        const actualData = data?.message || data;
        console.log('[AuthContext] Profile loaded:', actualData?.name);
      },
      onError: (error) => {
        console.error('[AuthContext] Profile load error:', error);
        // If 403/401, reset auth state
        if (error?.httpStatus === 403 || error?.httpStatus === 401) {
          getUserCookie();
        }
      }
    }
  );

  // Extract profile data from response (handle message wrapper)
  const profileData = useMemo(() => {
    if (!profileResponse) return null;
    // Frappe API wraps response in 'message' key
    return profileResponse.message || profileResponse;
  }, [profileResponse]);

  // Fetch specific profile based on user type
  const { data: employerProfileData, error: employerProfileError, isLoading: employerProfileLoading } = useFrappeGetDocList<any>('Employer Profile', {
    fields: ['name', 'user', 'company_name', 'contact_person', 'verified', 'verification_status', 'full_name', 'phone_number', 'email'],
    filters: [['user', '=', currentUser || '']],
    limit: 1
  }, currentUser ? `employer_profile_${currentUser}` : null);

  // API calls for registration and profile updates
  const { call: registerCall } = useFrappePostCall('derevahuduma_platform.api.auth.register');
  const { call: updateProfileCall } = useFrappePostCall('derevahuduma_platform.api.auth.update_profile');

  // Compute derived values using useMemo for performance
  const isAuthenticated = useMemo(() => {
    return !!currentUser && !isValidating;
  }, [currentUser, isValidating]);

  const userType = useMemo<UserRole | null>(() => {
    if (!profileData) return null;
    
    // Check roles to determine user type
    const roles = profileData.roles || [];
    
    // Check for custom roles first
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Staff')) return 'Staff';
    if (roles.includes('Employer')) return 'Employer';
    if (roles.includes('Driver')) return 'Driver';
    
    // Fallback: Treat System Manager as Admin
    if (roles.includes('System Manager')) return 'Admin';
    
    return null;
  }, [profileData]);

  const roles = useMemo<UserRole[]>(() => {
    if (!profileData?.roles) return [];
    
    const userRoles: UserRole[] = [];
    const rolesList = profileData.roles || [];
    
    // Add custom roles
    if (rolesList.includes('Admin')) userRoles.push('Admin');
    if (rolesList.includes('Staff')) userRoles.push('Staff');
    if (rolesList.includes('Employer')) userRoles.push('Employer');
    if (rolesList.includes('Driver')) userRoles.push('Driver');
    
    // Fallback: Treat System Manager as Admin if no custom roles
    if (userRoles.length === 0 && rolesList.includes('System Manager')) {
      userRoles.push('Admin');
    }
    
    return userRoles;
  }, [profileData]);

  const user = useMemo<User | null>(() => {
    if (!currentUser || !profileData) return null;
    
    return {
      name: currentUser,
      email: profileData.email || '',
      full_name: profileData.full_name || profileData.name || '',
      user_image: profileData.user_image,
      mobile_no: profileData.mobile_no,
      user_type: userType || undefined, // Convert null to undefined for User type
      roles: roles,
      enabled: profileData.enabled !== 0,
    };
  }, [currentUser, profileData, userType, roles]);

  const profile = useMemo<DriverProfile | EmployerProfile | AdminProfile | null>(() => {
    if (!profileData) return null;

    // Check user roles to determine profile type
    const roles = profileData.roles || [];
    const isEmployer = roles.includes('Employer');

    if (isEmployer && employerProfileData && employerProfileData.length > 0) {
      // Return EmployerProfile data
      const empProfile = employerProfileData[0];
      return {
        name: empProfile.name,
        user: empProfile.user,
        company_name: empProfile.company_name,
        contact_person: empProfile.contact_person,
        verified: empProfile.verified,
        verification_status: empProfile.verification_status,
        full_name: empProfile.full_name || profileData.full_name || profileData.name || '',
        phone_number: empProfile.phone_number || profileData.mobile_no || '',
        email: empProfile.email || profileData.email,
      } as EmployerProfile;
    }

    // For other user types or fallback, return basic profile info from User doc
    return {
      name: profileData.name,
      user: currentUser || '',
      full_name: profileData.full_name || '',
      phone_number: profileData.mobile_no || '',
      email: profileData.email,
    } as any; // Type assertion since we're returning partial data
  }, [profileData, currentUser, employerProfileData]);

  // Enhanced login function
  const login = async (username: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login for:', username);
      
      // Use frappe-react-sdk's login
      await frappeLogin({ username, password });
      
      console.log('[AuthContext] Login successful, updating user data...');
      
      // Refresh current user data
      await updateCurrentUser();
      
      // Profile will auto-fetch via useFrappeGetDoc when currentUser updates
      console.log('[AuthContext] Login complete');
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      
      // Reset auth state on error
      if (error?.httpStatus === 403 || error?.httpStatus === 401) {
        getUserCookie();
      }
      
      throw error;
    }
  };

  // Enhanced logout function
  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await frappeLogout();
      console.log('[AuthContext] Logout successful');
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      // Force logout even if API call fails
      getUserCookie();
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      console.log('[AuthContext] Registering user:', data.email || data.mobile_no);
      
      await registerCall(data);
      
      console.log('[AuthContext] Registration successful');
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => {
    try {
      console.log('[AuthContext] Updating profile...');
      
      await updateProfileCall(data);
      
      // Refresh profile data
      await mutateProfile();
      
      console.log('[AuthContext] Profile updated successfully');
    } catch (error: any) {
      console.error('[AuthContext] Profile update error:', error);
      throw error;
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    try {
      console.log('[AuthContext] Refreshing profile...');
      await updateCurrentUser();
      await mutateProfile();
      console.log('[AuthContext] Profile refreshed');
    } catch (error) {
      console.error('[AuthContext] Failed to refresh profile:', error);
      throw error;
    }
  };

  // Compute isLoading as combination of isValidating and profileLoading
  const isLoading = isValidating || profileLoading;

  const contextValue: AuthContextType = {
    // Auth state
    currentUser: currentUser || null, // Ensure it's always string | null
    isValidating,
    isLoading, // Added isLoading property
    login,
    logout,
    updateCurrentUser: async () => { await updateCurrentUser(); }, // Wrap to return Promise<void>
    getUserCookie,
    
    // Profile state
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    
    // Computed values
    isAuthenticated,
    userType,
    roles,
    user,
    
    // Actions
    register,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
