import { useState, useCallback } from 'react';
import { useFrappeGetCall, useFrappePostCall, useFrappePutCall } from 'frappe-react-sdk';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: 'Driver' | 'Employer' | 'Admin';
  roles: string[];
  status: 'Active' | 'Suspended';
  enabled: boolean;
  created_on: string;
  user_image?: string;
  profile?: any;
}

export interface UsersResponse {
  message: {
    success: boolean;
    data: User[];
    total: number;
    limit: number;
    offset: number;
    error?: string;
  };
}

export interface UserResponse {
  message: {
    success: boolean;
    data: User;
    error?: string;
  };
}

export interface CreateUserData {
  full_name: string;
  mobile_no: string;
  user_type: 'Driver' | 'Employer' | 'Admin';
  email?: string;
  password?: string;
  language?: 'en' | 'sw';
  // Driver fields
  license_number?: string;
  license_category?: string;
  experience_years?: number;
  region?: string;
  district?: string;
  national_id?: string;
  // Employer fields
  company_name?: string;
  company_type?: string;
  company_registration?: string;
  address?: string;
  website?: string;
  verification_status?: string;
  // Admin fields
  department?: string;
  position?: string;
  is_tutor?: boolean;
  is_license_officer?: boolean;
  is_test_officer?: boolean;
  is_finance?: boolean;
  is_super_admin?: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  user_id: string;
}

/**
 * Custom hook for user management operations
 */
export const useUsers = (
  searchQuery: string = '',
  roleFilter: string = 'all',
  statusFilter: string = 'all',
  limit: number = 50,
  offset: number = 0
) => {
  const { data, error, isLoading, mutate } = useFrappeGetCall<UsersResponse>(
    'derevahuduma_platform.api.admin.get_users',
    {
      search_query: searchQuery,
      role_filter: roleFilter,
      status_filter: statusFilter,
      limit: limit.toString(),
      offset: offset.toString(),
    },
    undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    users: data?.message?.data || [],
    total: data?.message?.total || 0,
    isLoading,
    error: error || data?.message?.error,
    mutate,
  };
};

/**
 * Hook to get a single user
 */
export const useUser = (userId: string | null) => {
  const { data, error, isLoading, mutate } = useFrappeGetCall<UserResponse>(
    'derevahuduma_platform.api.admin.get_user',
    userId ? { user_id: userId } : undefined,
    userId ? `user-${userId}` : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    user: data?.message?.data,
    isLoading,
    error: error || data?.message?.error,
    mutate,
  };
};

/**
 * Hook for creating a new user
 */
export const useCreateUser = () => {
  const { call, loading, error } = useFrappePostCall<UserResponse>(
    'derevahuduma_platform.api.admin.create_user'
  );

  const createUser = useCallback(
    async (userData: CreateUserData) => {
      try {
        const response = await call(userData);
        return response;
      } catch (err) {
        throw err;
      }
    },
    [call]
  );

  return {
    createUser,
    loading,
    error,
  };
};

/**
 * Hook for updating a user
 */
export const useUpdateUser = () => {
  const { call, loading, error } = useFrappePostCall<UserResponse>(
    'derevahuduma_platform.api.admin.update_user'
  );

  const updateUser = useCallback(
    async (userData: UpdateUserData) => {
      try {
        const response = await call(userData);
        return response;
      } catch (err) {
        throw err;
      }
    },
    [call]
  );

  return {
    updateUser,
    loading,
    error,
  };
};

/**
 * Hook for toggling user status (suspend/activate)
 */
export const useToggleUserStatus = () => {
  const { call, loading, error } = useFrappePostCall<{ success: boolean; message: string }>(
    'derevahuduma_platform.api.admin.toggle_user_status'
  );

  const toggleUserStatus = useCallback(
    async (userId: string, enabled: boolean) => {
      try {
        const response = await call({
          user_id: userId,
          enabled: enabled ? 1 : 0,
        });
        return response;
      } catch (err) {
        throw err;
      }
    },
    [call]
  );

  return {
    toggleUserStatus,
    loading,
    error,
  };
};

/**
 * Hook for deleting a user
 */
export const useDeleteUser = () => {
  const { call, loading, error } = useFrappePostCall<{ success: boolean; message: string }>(
    'derevahuduma_platform.api.admin.delete_user'
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        const response = await call({
          user_id: userId,
        });
        return response;
      } catch (err) {
        throw err;
      }
    },
    [call]
  );

  return {
    deleteUser,
    loading,
    error,
  };
};

/**
 * Combined hook with all user management operations
 */
export const useUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);

  const { users, total, isLoading, error, mutate } = useUsers(
    searchQuery,
    roleFilter,
    statusFilter,
    pageSize,
    currentPage * pageSize
  );

  const { createUser, loading: creating } = useCreateUser();
  const { updateUser, loading: updating } = useUpdateUser();
  const { toggleUserStatus, loading: toggling } = useToggleUserStatus();
  const { deleteUser, loading: deleting } = useDeleteUser();

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    // Data
    users,
    total,
    isLoading,
    error,
    
    // Filters
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    
    // Operations
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    refresh,
    
    // Loading states
    creating,
    updating,
    toggling,
    deleting,
  };
};
