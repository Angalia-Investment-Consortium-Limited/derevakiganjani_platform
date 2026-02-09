import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rolesSnapshot = await getDocs(collection(db, 'roles'));
      const rolesData = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
      setRoles(rolesData);

      const permissionsSnapshot = await getDocs(collection(db, 'permissions'));
      const permissionsData = permissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Permission));
      setPermissions(permissionsData);

    } catch (err: any) {
      console.error("Error fetching roles and permissions:", err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateRolePermissions = async (roleId: string, newPermissions: string[]) => {
    try {
      const roleRef = doc(db, 'roles', roleId);
      await updateDoc(roleRef, { permissions: newPermissions });
      // Refresh local state
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === roleId ? { ...role, permissions: newPermissions } : role
        )
      );
    } catch (err: any) {
      console.error(`Error updating permissions for role ${roleId}:`, err);
      throw new Error(err.message || 'Failed to update permissions');
    }
  };

  return { roles, permissions, isLoading, error, refresh: fetchData, updateRolePermissions };
};