import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, AdminProfile, EmployerProfile, DriverProfile, UserRole } from '@/types/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const roleCollectionMap: Record<string, string> = {
  Driver: 'driver_profiles',
  Employer: 'employer_profiles',
  Admin: 'admins',
};

export const useUserForm = (userId: string | null) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!userId;

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = { id: userSnap.id, ...userSnap.data() } as User;
      const role = userData.user_type as UserRole;
      let profileData = {};

      if (role && roleCollectionMap[role]) {
        const profileRef = doc(db, roleCollectionMap[role], userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          profileData = profileSnap.data();
        }
      }

      setUser({ ...userData, profile: profileData });

    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const saveUser = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    
    const createUserCallable = httpsCallable(functions, 'createUser');

    try {
      const { profile, ...userData } = formData;
      const role = userData.user_type as UserRole;
      
      if (isEdit) {
        if (!userId) throw new Error("User ID is missing for an update operation.");
        
        const batch = writeBatch(db);

        // Update user document
        const userRef = doc(db, 'users', userId);
        const userUpdatePayload: Partial<User> = {
            full_name: userData.full_name,
            email: userData.email,
            mobile_no: userData.mobile_no,
            enabled: userData.status === 'active',
            status: userData.status === 'active' ? 'Active' : 'Suspended',
        };
        batch.update(userRef, userUpdatePayload as any);

        // Update profile document
        if (role && roleCollectionMap[role]) {
            const profileRef = doc(db, roleCollectionMap[role], userId);
            batch.update(profileRef, profile);
        }

        await batch.commit();

      } else {
        // Create user via Firebase Function
        await createUserCallable({ 
            email: userData.email, 
            password: userData.password, 
            displayName: userData.full_name, 
            role 
        });
        // The function should trigger the creation of user and profile docs.
        // We might need to manually create/update the profile data here if the function doesn't handle it.
        // For now, assume the function sets the basics, and we navigate away.
      }

    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(err.message || 'Failed to save user');
      throw err; // Re-throw to be caught in the component
    } finally {
      setIsSubmitting(false);
    }
  };

  return { user, isLoading, isSubmitting, error, saveUser, isEdit };
};
