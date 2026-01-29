import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import type { User as FirebaseUser, ConfirmationResult } from 'firebase/auth';
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

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: User | null;
  profile: DriverProfile | EmployerProfile | AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileLoading: boolean;
  userType: UserRole | null;
  roles: UserRole[];
  loading: boolean; // Added loading property

  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  updateProfile: (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  phoneLoginStep: 'enter-phone' | 'enter-otp';
  otpError: string | null;
  resetPhoneLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DriverProfile | EmployerProfile | AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [phoneLoginStep, setPhoneLoginStep] = useState<'enter-phone' | 'enter-otp'>('enter-phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    setProfileLoading(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);

        if (userData.roles && userData.roles.length > 0) {
          const profileCollection = `${userData.roles[0].toLowerCase()}Profiles`;
          const profileDocRef = doc(db, profileCollection, firebaseUser.uid);
          const profileDoc = await getDoc(profileDocRef);

          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as DriverProfile | EmployerProfile | AdminProfile);
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

  const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneLoginStep('enter-otp');
      setOtpError(null);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(otp);
      setPhoneLoginStep('enter-phone'); // Reset for next time
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const resetPhoneLogin = () => {
    setPhoneLoginStep('enter-phone');
    setConfirmationResult(null);
    setOtpError(null);
  };

  const register = async (data: RegisterData) => {
    const { email, password, role, phone_number, ...profileData } = data;

    const userCredential = await createUserWithEmailAndPassword(auth, email!, password);
    const firebaseUser = userCredential.user;

    await sendEmailVerification(firebaseUser);

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '', // Ensure email is a string
      roles: [role],
      createdAt: Timestamp.now(),
      phoneNumber: phone_number,
    });

    const profileCollection = `${role.toLowerCase()}Profiles`;
    const profileDocRef = doc(db, profileCollection, firebaseUser.uid);
    await setDoc(profileDocRef, {
      ...profileData,
      uid: firebaseUser.uid,
      email: firebaseUser.email || '', // Ensure email is a string
      phoneNumber: phone_number,
    });

    return userCredential;
  };

  const updateProfile = async (data: Partial<DriverProfile | EmployerProfile | AdminProfile>) => {
    if (!currentUser || !user?.roles) return;

    const profileCollection = `${user.roles[0].toLowerCase()}Profiles`;
    const profileDocRef = doc(db, profileCollection, currentUser.uid);
    await updateDoc(profileDocRef, data);
    await fetchUserProfile(currentUser); // Refresh profile
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
    signInWithPhone,
    verifyOtp,
    updateProfile,
    refreshProfile,
    phoneLoginStep,
    otpError,
    resetPhoneLogin,
    loading: isLoading, // Assign isLoading to loading
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
