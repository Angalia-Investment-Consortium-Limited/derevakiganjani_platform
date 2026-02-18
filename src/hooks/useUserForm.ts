import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/types/auth';
import { useToast } from "@/hooks/use-toast";

const roleCollectionMap: Record<string, string> = {
  Driver: 'driver_profiles',
  Employer: 'employer_profiles',
  Admin: 'admins',
};

// Helper function to remove undefined values from an object
const removeUndefined = (obj: any) => {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

export const useUserForm = (userId: string | null) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEdit = !!userId;

  const fetchUser = useCallback(async () => {
    // ... existing fetch logic remains the same ...
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

    try {
        if (isEdit) {
            // Edit logic remains unchanged for now.
            console.log("User editing not yet implemented in this flow.");
        } else {
            // 1. Create user in Firebase Authentication
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const uid = userCredential.user.uid;

            // 2. Send verification email
            await sendEmailVerification(userCredential.user);
            toast({
                title: "User Created",
                description: "Verification email sent successfully.",
            });

            const batch = writeBatch(db);

            // 3. Create the main user document in 'users' collection
            const userRef = doc(db, 'users', uid);
            const role = formData.user_type as UserRole;
            let userRoles: UserRole[] = [role];
            if (role === 'Admin') {
                userRoles = formData.is_super_admin === true ? ['SuperAdmin', 'Admin'] : ['Admin'];
            }

            batch.set(userRef, {
                full_name: formData.full_name,
                email: formData.email,
                mobile_no: formData.mobile_no || null,
                user_type: role,
                roles: userRoles, 
                language: formData.language || "sw",
                enabled: true,
                status: "Active",
                createdAt: serverTimestamp(),
            });

            // 4. Create the role-specific profile document
            const profileRef = doc(db, roleCollectionMap[role], uid);
            let profilePayload = {};

            if (role === 'Driver') {
                profilePayload = { national_id: formData.national_id, license_number: formData.license_number, licenseCategory: formData.licenseCategory, experience_years: formData.experience_years, region: formData.region, district: formData.district };
            } else if (role === 'Employer') {
                profilePayload = { company_name: formData.company_name, company_type: formData.company_type, company_registration: formData.company_registration, website: formData.website, address: formData.address, region: formData.region, district: formData.district, verification_status: 'unverified' };
            } else if (role === 'Admin') {
                profilePayload = { is_tutor: formData.is_tutor, is_license_officer: formData.is_license_officer, is_test_officer: formData.is_test_officer, is_finance: formData.is_finance, is_super_admin: formData.is_super_admin, department: formData.department, position: formData.position };
            }

            const cleanProfilePayload = removeUndefined(profilePayload);
            batch.set(profileRef, cleanProfilePayload);

            // 5. Commit all writes to the database
            await batch.commit();
            
            return { success: true, uid };
        }
    } catch (err: any) {
        console.error("Error saving user directly:", err);
        let errorMessage = err.message || 'An unexpected error occurred.';
        if (err.code === 'auth/email-already-in-use') {
            errorMessage = 'A user with this email address already exists.';
        } else if (err.code === 'auth/weak-password') {
            errorMessage = 'The password is too weak. Please use a stronger password.';
        }
        setError(errorMessage);
        throw new Error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  return { user, isLoading, isSubmitting, error, saveUser, isEdit };
};
