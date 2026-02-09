import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type {
  User,
  UserRole,
  RegisterData,
  DriverProfile,
  EmployerProfile,
  AdminProfile,
} from '@/types/auth';
import { useOTP } from '@/hooks/useOTP';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: User | null;
  profile: DriverProfile | EmployerProfile | AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileLoading: boolean;
  userType: UserRole | null;
  roles: UserRole[];
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  otp: ReturnType<typeof useOTP>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DriverProfile | EmployerProfile | AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const otp = useOTP();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    setProfileLoading(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);

        if (userData.roles && userData.roles.length > 0) {
          const primaryRole = userData.roles[0];
          let profileCollection = '';

          if (primaryRole === 'Driver') {
            profileCollection = 'driver_profiles';
          } else if (primaryRole === 'Employer') {
            profileCollection = 'employers';
          } else if (primaryRole === 'SuperAdmin' || primaryRole === 'Admin' || primaryRole === 'Staff') {
            profileCollection = 'admins';
          }

          if (profileCollection) {
            const profileDocRef = doc(db, profileCollection, firebaseUser.uid);
            const profileDoc = await getDoc(profileDocRef);

            if (profileDoc.exists()) {
              setProfile(profileDoc.data() as DriverProfile | EmployerProfile | AdminProfile);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const register = async (data: RegisterData) => {
    const { email, password, role, phone_number, ...profileData } = data;

    const userCredential = await createUserWithEmailAndPassword(auth, email!, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      roles: [role],
      createdAt: Timestamp.now(),
      phoneNumber: phone_number,
    });

    let profileCollection = '';
    if (role === 'Driver') {
      profileCollection = 'driver_profiles';
    } else if (role === 'Employer') {
      profileCollection = 'employers';
    } else if (role === 'SuperAdmin' || role === 'Admin' || role === 'Staff') {
      profileCollection = 'admins';
    }

    if(profileCollection){
      const profileDocRef = doc(db, profileCollection, firebaseUser.uid);
      await setDoc(profileDocRef, {
        ...profileData,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        phoneNumber: phone_number,
      });
    }

    return userCredential;
  };

  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);
    setUser((prevUser) => ({ ...prevUser, ...data } as User));
  };

  const updateProfile = async (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => {
    if (!currentUser || !user?.roles) return;

    const primaryRole = user.roles[0];
    let profileCollection = '';
    if (primaryRole === 'Driver') {
      profileCollection = 'driver_profiles';
    } else if (primaryRole === 'Employer') {
      profileCollection = 'employers';
    } else if (primaryRole === 'SuperAdmin' || primaryRole === 'Admin' || primaryRole === 'Staff') {
      profileCollection = 'admins';
    }

    if(profileCollection){
      const profileDocRef = doc(db, profileCollection, currentUser.uid);
      await updateDoc(profileDocRef, data);
      setProfile((prevProfile) => ({ ...prevProfile, ...data } as any));
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };
  
  const userType = user?.roles?.[0] || null;

  const contextValue: AuthContextType = {
    currentUser,
    user,
    profile,
    isAuthenticated: !!currentUser,
    isLoading,
    profileLoading,
    userType,
    roles: user?.roles || [],
    login,
    logout,
    register,
    sendPasswordResetEmail: sendPasswordReset,
    updateUser,
    updateProfile,
    refreshProfile,
    loading: isLoading,
    otp,
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
