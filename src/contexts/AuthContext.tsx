import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
// I will need to create this firebase config file later
// import { auth } from '@/lib/firebase';
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   User as FirebaseUser,
// } from 'firebase/auth';
import type {
  User,
  UserRole,
  RegisterData,
  DriverProfile,
  EmployerProfile,
  AdminProfile
} from '@/types/auth';

// Placeholder for Firebase user
type FirebaseUser = {
    uid: string;
    email: string | null;
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  
  // The following will be re-implemented later
  profile: DriverProfile | EmployerProfile | AdminProfile | null;
  profileLoading: boolean;
  isAuthenticated: boolean;
  userType: UserRole | null;
  roles: UserRole[];
  user: User | null;
  updateProfile: (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This will be replaced with onAuthStateChanged from firebase
  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setCurrentUser(user);
    //   setIsLoading(false);
    // });
    // return () => unsubscribe();
    setIsLoading(false); // For now, just set loading to false
  }, []);

  const login = async (username, password) => {
    // return signInWithEmailAndPassword(auth, username, password);
    console.log('Login with', username, password);
    // Mock user
    setCurrentUser({ uid: 'mock-uid', email: username });
  };

  const logout = async () => {
    // return signOut(auth);
    console.log('Logout');
    setCurrentUser(null);
  };

  const register = async (data: RegisterData) => {
    // const { email, password } = data;
    // return createUserWithEmailAndPassword(auth, email, password);
    console.log('Register with', data);
    // Mock user
    setCurrentUser({ uid: 'mock-uid', email: data.email });
  };

  const contextValue: AuthContextType = {
    currentUser,
    isLoading,
    login,
    logout,
    register,
    
    // The following are placeholders and will be implemented later
    profile: null,
    profileLoading: false,
    isAuthenticated: !!currentUser,
    userType: null,
    roles: [],
    user: null,
    updateProfile: async () => {},
    refreshProfile: async () => {},
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
