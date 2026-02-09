import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/types/auth';
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
      const role = formData.user_type as UserRole;
      
      if (isEdit) {
        if (!userId) throw new Error("User ID is missing for an update operation.");
        
        const batch = writeBatch(db);

        // 1. Prepare User Document Update
        const userRef = doc(db, 'users', userId);
        const userUpdatePayload: { [key: string]: any } = {
            full_name: formData.full_name,
            email: formData.email,
            mobile_no: formData.mobile_no,
            enabled: formData.status === 'active',
            status: formData.status === 'active' ? 'Active' : 'Suspended',
        };
        batch.update(userRef, userUpdatePayload);
        
        // 2. Prepare Profile Document Update/Creation
        if (role && roleCollectionMap[role]) {
            const profileRef = doc(db, roleCollectionMap[role], userId);
            
            const profilePayload: { [key: string]: any } = {};
            const knownUserFields = ['id', 'profile', 'password', 'user_type', 'full_name', 'email', 'mobile_no', 'enabled', 'status'];
            for (const key in formData) {
                if (!knownUserFields.includes(key)) {
                    profilePayload[key] = formData[key];
                }
            }

            batch.set(profileRef, profilePayload, { merge: true });
        }
        
        if (formData.password) {
          console.warn("Password update from client form is not implemented securely.");
        }

        await batch.commit();

      } else {
        await createUserCallable({ 
            email: formData.email, 
            password: formData.password, 
            displayName: formData.full_name, 
            role 
        });
      }

    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(err.message || 'Failed to save user');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { user, isLoading, isSubmitting, error, saveUser, isEdit };
};
