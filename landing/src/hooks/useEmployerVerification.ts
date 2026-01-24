import { useState, useCallback } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';

export interface Employer {
  name: string;
  company_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  verification_status: string;
  creation: string;
  risk_level?: string;
}

export interface EmployersResponse {
  message: {
    success: boolean;
    employers: Employer[];
    error?: string;
  };
}

export interface ReviewEmployerData {
  employer_name: string;
  action: 'approve' | 'reject';
  comments?: string;
}

/**
 * Custom hook for employer verification management operations
 */
export const useEmployerVerification = () => {
  const { data, error, isLoading, mutate } = useFrappeGetCall<EmployersResponse>(
    'derevahuduma_platform.api.admin_employer.get_employer_verification_queue',
    undefined,
    undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    employers: data?.message?.employers || [],
    total: (data?.message?.employers || []).length,
    isLoading,
    error: error || data?.message?.error,
    mutate,
  };
};

/**
 * Hook for reviewing employer verification
 */
export const useReviewEmployer = () => {
  const { call, loading, error } = useFrappePostCall<{ success: boolean; message: string }>(
    'derevahuduma_platform.api.admin_employer.review_employer_verification'
  );

  const reviewEmployer = useCallback(
    async (reviewData: ReviewEmployerData) => {
      try {
        const response = await call(reviewData);
        return response;
      } catch (err) {
        throw err;
      }
    },
    [call]
  );

  return {
    reviewEmployer,
    loading,
    error,
  };
};

/**
 * Combined hook with all employer verification operations
 */
export const useEmployerVerificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { employers: allEmployers, isLoading, error, mutate } = useEmployerVerification();

  const { reviewEmployer, loading: reviewing } = useReviewEmployer();

  // Filter employers on frontend
  const employers = allEmployers.filter((employer) => {
    const matchesSearch =
      !searchTerm ||
      employer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employer.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = employers.length;

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    // Data
    employers,
    total,
    isLoading,
    error,

    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,

    // Operations
    reviewEmployer,
    refresh,

    // Loading states
    reviewing,
  };
};
