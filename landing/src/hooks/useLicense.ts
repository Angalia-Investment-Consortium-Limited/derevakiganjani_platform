/**
 * License Management Hooks
 * 
 * Custom React hooks for license application management
 */

import { useState, useCallback } from 'react';
import { useFrappeGetCall, useFrappePostCall, useFrappeFileUpload } from 'frappe-react-sdk';
import type {
  LicenseApplicationFormData,
  GetRegionsResponse,
  GetDistrictsResponse,
  SubmitApplicationResponse,
  GetApplicationsResponse,
  GetApplicationStatusResponse,
  GetStatisticsResponse,
  ApplicationFilter,
  LicenseApplication,
  FileUpload
} from '@/types/license';

/**
 * Hook to get all Tanzania regions
 */
export function useRegions() {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetRegionsResponse>(
    'derevahuduma_platform.api.license.get_regions',
    undefined,
    undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    regions: data?.regions || [],
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to get districts for a specific region
 */
export function useDistricts(region: string | null) {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetDistrictsResponse>(
    'derevahuduma_platform.api.license.get_districts',
    region ? { region } : undefined,
    region ? `districts-${region}` : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    districts: data?.districts || [],
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to submit a license application
 */
export function useSubmitApplication() {
  const { call, loading, error, reset } = useFrappePostCall<SubmitApplicationResponse>(
    'derevahuduma_platform.api.license.submit_license_application'
  );

  const submitApplication = useCallback(
    async (formData: LicenseApplicationFormData) => {
      try {
        const result = await call(formData);
        return result;
      } catch (err) {
        console.error('Error submitting application:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    submitApplication,
    isSubmitting: loading,
    error,
    reset
  };
}

/**
 * Hook to get user's license applications
 */
export function useMyApplications(filter?: ApplicationFilter) {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetApplicationsResponse>(
    'derevahuduma_platform.api.license.get_my_applications',
    filter,
    'my-applications',
    {
      revalidateOnFocus: true
    }
  );

  return {
    applications: data?.applications || [],
    total: data?.total || 0,
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to get application status by reference number
 */
export function useApplicationStatus(refNo: string | null) {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetApplicationStatusResponse>(
    'derevahuduma_platform.api.license.get_application_status',
    refNo ? { ref_no: refNo } : undefined,
    refNo ? `application-${refNo}` : null,
    {
      revalidateOnFocus: true
    }
  );

  return {
    application: data?.application,
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to get all applications (Admin/Staff only)
 */
export function useAllApplications(filter?: ApplicationFilter) {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetApplicationsResponse>(
    'derevahuduma_platform.api.license.get_all_applications',
    filter ? {
      status: filter.status,
      application_type: filter.application_type,
      search: filter.search,
      limit: filter.limit || 20,
      offset: filter.offset || 0
    } : undefined,
    'all-applications',
    {
      revalidateOnFocus: true
    }
  );

  return {
    applications: data?.applications || [],
    total: data?.total || 0,
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to update application status (Admin/Staff only)
 */
export function useUpdateApplicationStatus() {
  const { call, loading, error, reset } = useFrappePostCall(
    'derevahuduma_platform.api.license.update_application_status'
  );

  const updateStatus = useCallback(
    async (name: string, status: string, reviewer_notes?: string) => {
      try {
        const result = await call({
          name,
          status,
          reviewer_notes
        });
        return result;
      } catch (err) {
        console.error('Error updating application status:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    updateStatus,
    isUpdating: loading,
    error,
    reset
  };
}

/**
 * Hook to get application statistics (Admin/Staff only)
 */
export function useApplicationStatistics() {
  const { data, error, isLoading, mutate } = useFrappeGetCall<GetStatisticsResponse>(
    'derevahuduma_platform.api.license.get_application_statistics',
    undefined,
    'application-statistics',
    {
      revalidateOnFocus: true
    }
  );

  return {
    statistics: data?.statistics,
    error,
    isLoading,
    refetch: mutate
  };
}

/**
 * Hook to upload documents
 */
export function useDocumentUpload() {
  const { upload, loading, error, reset } = useFrappeFileUpload();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadDocument = useCallback(
    async (file: File, onProgress?: (progress: number) => void) => {
      try {
        setUploadProgress(0);
        
        const result = await upload(file, {
          isPrivate: true,
          folder: 'Home/License Applications'
        });

        // Simulate progress for now since frappe-react-sdk may not support onProgress
        setUploadProgress(100);
        onProgress?.(100);

        return result;
      } catch (err) {
        console.error('Error uploading document:', err);
        throw err;
      }
    },
    [upload]
  );

  return {
    uploadDocument,
    isUploading: loading,
    uploadProgress,
    error,
    reset
  };
}

/**
 * Hook to manage application form state
 */
export function useApplicationForm(initialData?: Partial<LicenseApplicationFormData>) {
  const [formData, setFormData] = useState<Partial<LicenseApplicationFormData>>(
    initialData || {}
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);

  const updateFormData = useCallback(
    (data: Partial<LicenseApplicationFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const addFile = useCallback((file: FileUpload) => {
    setUploadedFiles((prev) => [...prev, file]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialData || {});
    setCurrentStep(0);
    setUploadedFiles([]);
  }, [initialData]);

  return {
    formData,
    currentStep,
    uploadedFiles,
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    addFile,
    removeFile,
    reset
  };
}

/**
 * Hook to validate file uploads
 */
export function useFileValidation() {
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const maxSize = 8 * 1024 * 1024; // 8 MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Ukubwa wa faili unazidi 8 MB. Tafadhali chagua faili dogo.'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Aina ya faili haijaidhinishwa. Tafadhali tumia PDF, JPG au PNG.'
      };
    }

    return { valid: true };
  }, []);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        // For PDFs, return a placeholder
        resolve('/pdf-icon.png');
      }
    });
  }, []);

  return {
    validateFile,
    createPreview
  };
}

/**
 * Hook to track application by reference number
 */
export function useTrackApplication() {
  const [refNo, setRefNo] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  
  const { application, error, isLoading, refetch } = useApplicationStatus(
    isTracking ? refNo : null
  );

  const trackApplication = useCallback((referenceNumber: string) => {
    setRefNo(referenceNumber);
    setIsTracking(true);
  }, []);

  const reset = useCallback(() => {
    setRefNo('');
    setIsTracking(false);
  }, []);

  return {
    application,
    error,
    isLoading,
    trackApplication,
    reset,
    refetch
  };
}

/**
 * Hook to get application details by ID
 */
export function useApplicationDetails() {
  const { call, loading, error, reset } = useFrappePostCall<GetApplicationStatusResponse>(
    'derevahuduma_platform.api.license.get_application_details'
  );
  const [application, setApplication] = useState<LicenseApplication | null>(null);

  const fetchDetails = useCallback(
    async (id: string) => {
      try {
        const result = await call({ name: id });
        setApplication(result?.application || null);
        return result;
      } catch (err) {
        console.error('Error fetching application details:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    application,
    isLoading: loading,
    error,
    fetchDetails,
    reset
  };
}

/**
 * Hook to copy text to clipboard
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }, []);

  return { copy, copied };
}

/**
 * Hook to initiate license payment
 */
export function useInitiateLicensePayment() {
  const { call, loading, error, reset } = useFrappePostCall(
    'derevahuduma_platform.api.license.initiate_license_payment'
  );

  const initiatePayment = useCallback(
    async (applicationName: string) => {
      try {
        const result = await call({ application_name: applicationName });
        return result;
      } catch (err) {
        console.error('Error initiating payment:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    initiatePayment,
    isInitiating: loading,
    error,
    reset
  };
}

/**
 * Hook to verify license payment
 */
export function useVerifyLicensePayment() {
  const { call, loading, error, reset } = useFrappePostCall(
    'derevahuduma_platform.api.license.verify_license_payment'
  );

  const verifyPayment = useCallback(
    async (transactionId: string) => {
      try {
        const result = await call({ transaction_id: transactionId });
        return result;
      } catch (err) {
        console.error('Error verifying payment:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    verifyPayment,
    isVerifying: loading,
    error,
    reset
  };
}

/**
 * Hook to handle license payment webhook
 */
export function useLicensePaymentWebhook() {
  const { call, loading, error, reset } = useFrappePostCall(
    'derevahuduma_platform.api.license.license_payment_webhook'
  );

  const handleWebhook = useCallback(
    async (webhookData: any) => {
      try {
        const result = await call(webhookData);
        return result;
      } catch (err) {
        console.error('Error handling webhook:', err);
        throw err;
      }
    },
    [call]
  );

  return {
    handleWebhook,
    isProcessing: loading,
    error,
    reset
  };
}
