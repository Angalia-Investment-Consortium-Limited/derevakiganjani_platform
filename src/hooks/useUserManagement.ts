import { useState, useCallback, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, getDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { WhereFilterOp, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, AdminProfile, EmployerProfile, DriverProfile, UserRole } from '@/types/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const PAGE_SIZE = 10;

// A mapping from the user-facing role filter to the collection name
const roleCollectionMap: Record<string, string> = {
  driver: 'driver_profiles',
  employer: 'employer_profiles',
  admin: 'admins',
};

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'driver', 'employer', 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'suspended'
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pageCursors = useRef<(DocumentSnapshot | null)[]>([null]);
  const isFetching = useRef(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'users'));

    // Role filter
    if (roleFilter !== 'all') {
      q = query(q, where('roles', 'array-contains', roleFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      q = query(q, where('enabled', '==', statusFilter === 'active'));
    }

    return q;
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    const fetchPage = async () => {
      try {
        const baseQuery = buildQuery();

        if (currentPage === 0) {
          const countSnapshot = await getCountFromServer(baseQuery);
          setTotal(countSnapshot.data().count);
        }

        let pageQuery = query(baseQuery, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        const cursor = pageCursors.current[currentPage];
        if (cursor) {
          pageQuery = query(pageQuery, startAfter(cursor));
        }

        const querySnapshot = await getDocs(pageQuery);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (lastVisible) {
          pageCursors.current[currentPage + 1] = lastVisible;
        }

        let usersData = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id, uid: d.id }) as User);

        if (searchQuery) {
          const lowercasedQuery = searchQuery.toLowerCase();
          usersData = usersData.filter(user => 
            user.full_name?.toLowerCase().includes(lowercasedQuery) ||
            user.email?.toLowerCase().includes(lowercasedQuery) ||
            user.mobile_no?.includes(lowercasedQuery)
          );
        }

        setUsers(usersData);

      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };

    fetchPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, buildQuery, refreshKey, searchQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    pageCursors.current = [null];
    setRefreshKey(k => k + 1);
  }, []);

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    setToggling(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { enabled: newStatus, status: newStatus ? 'Active' : 'Suspended' });
      refresh();
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      throw new Error(err.message || 'Failed to update user status');
    } finally {
      setToggling(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);

      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as User | undefined;
      const userRole = userData?.user_type?.toLowerCase(); // This might still be an issue

      if (userRole && roleCollectionMap[userRole]) {
        const profileCollection = roleCollectionMap[userRole];
        const profileRef = doc(db, profileCollection, userId);
        const profileDoc = await getDoc(profileRef);
        if(profileDoc.exists()) {
            batch.delete(profileRef);
        }
      }
      
      await batch.commit();
      refresh();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      throw new Error(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    users,
    total,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    refresh,
    toggleUserStatus,
    deleteUser,
    toggling,
    deleting,
  };
};

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const role = userData.roles?.[0] as UserRole; // Use roles array
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

  return { user, isLoading, error };
};

// ... (rest of the file remains the same)

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const createUserCallable = httpsCallable(functions, 'createUser');

  const createUser = async (formData: any) => {
    setLoading(true);
    try {
      const { profile, ...userData } = formData;
      const role = userData.user_type as UserRole;
      
      await createUserCallable({ 
          email: userData.email, 
          password: userData.password, 
          displayName: userData.full_name, 
          role 
      });

    } catch (err: any) {
      console.error("Error creating user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);

  const updateUser = async (formData: any) => {
    setLoading(true);
    try {
      const { user_id, profile, ...userData } = formData;
      const role = userData.user_type as UserRole;
      
      if (!user_id) throw new Error("User ID is missing for an update operation.");
      
      const batch = writeBatch(db);

      // Update user document
      const userRef = doc(db, 'users', user_id);
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
          const profileRef = doc(db, roleCollectionMap[role], user_id);
          batch.update(profileRef, profile);
      }

      await batch.commit();

    } catch (err: any) {
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading };
};