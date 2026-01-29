
import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, updateDoc, deleteDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types/auth';

const PAGE_SIZE = 10;

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'users'));

    if (roleFilter !== 'all') {
      q = query(q, where('user_type', '==', roleFilter));
    }

    if (statusFilter !== 'all') {
      const enabled = statusFilter === 'active';
      q = query(q, where('enabled', '==', enabled));
    }
    
    // This is a simplified search. For a more robust search, you would need a search service like Algolia or Elasticsearch.
    if (searchQuery) {
        q = query(q, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
    }

    return q;
  }, [roleFilter, statusFilter, searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = buildQuery();
      
      // Get total count for pagination
      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);

      // Fetch data for the current page
      let pageQuery = query(q, orderBy('created_on', 'desc'), limit(PAGE_SIZE));
      if (currentPage > 0 && lastDoc) {
        pageQuery = query(pageQuery, startAfter(lastDoc));
      }
      
      const querySnapshot = await getDocs(pageQuery);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().enabled ? 'Active' : 'Suspended' } as User));
      setUsers(usersData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, lastDoc, buildQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setLastDoc(null);
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    setToggling(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { enabled: newStatus });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update user status');
    } finally {
      setToggling(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (err: any) {
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
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleUserStatus,
    deleteUser,
    toggling,
    deleting,
    refresh,
  };
};

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
};

export const useCreateUser = () => {
    const [loading, setLoading] = useState(false);

    const createUser = async (userData: any) => {
        setLoading(true);
        try {
            const usersCollection = collection(db, 'users');
            await addDoc(usersCollection, {
                ...userData,
                created_on: new Date(),
                enabled: true,
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return { createUser, loading };
};

export const useUpdateUser = () => {
    const [loading, setLoading] = useState(false);

    const updateUser = async (userData: any) => {
        setLoading(true);
        try {
            const { user_id, ...dataToUpdate } = userData;
            if (!user_id) throw new Error("User ID is required to update.");

            const userRef = doc(db, 'users', user_id);
            await updateDoc(userRef, dataToUpdate);

        } catch (error: any) {
            throw new Error(error.message || 'Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    return { updateUser, loading };
};
