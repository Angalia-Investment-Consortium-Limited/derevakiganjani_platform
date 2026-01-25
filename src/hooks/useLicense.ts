import { useState, useCallback, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import type {
  LicenseApplicationFormData,
  SubmitApplicationResponse,
  ApplicationFilter,
  LicenseApplication,
  FileUpload,
  ApplicationStatistics,
  ApplicationStatus,
} from '@/types/license';

export function useRegions() {
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchRegions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'regions'));
      const regionData = querySnapshot.docs.map((doc) => doc.data().name);
      setRegions(regionData);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, isLoading, error, refetch: fetchRegions };
}

export function useDistricts(region: string | null) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const fetchDistricts = useCallback(async () => {
    if (!region) {
      setDistricts([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'districts'), where('region', '==', region));
      const querySnapshot = await getDocs(q);
      const districtData = querySnapshot.docs.map((doc) => doc.data().name);
      setDistricts(districtData);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  return { districts, isLoading, error, refetch: fetchDistricts };
}

export function useSubmitApplication() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const submitApplication = useCallback(
    async (formData: LicenseApplicationFormData): Promise<SubmitApplicationResponse> => {
      if (!currentUser) {
        throw new Error('You must be logged in to submit an application.');
      }
      setIsSubmitting(true);
      setError(null);
      try {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...formData,
          userId: currentUser.uid,
          status: 'Submitted',
          createdAt: Timestamp.now(),
        });
        return {
          success: true,
          message: 'Application submitted successfully',
          application: { ...formData, name: docRef.id, status: 'Submitted', creation: new Date().toISOString() },
        };
      } catch (e) {
        setError(e);
        return { success: false, message: 'Failed to submit application', error: e };
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser]
  );

  const reset = () => {
    setIsSubmitting(false);
    setError(null);
  };

  return { submitApplication, isSubmitting, error, reset };
}

export function useMyApplications(filter?: ApplicationFilter) {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      let q = query(collection(db, 'applications'), where('userId', '==', currentUser.uid));
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      const querySnapshot = await getDocs(q);
      const appData = querySnapshot.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      } as LicenseApplication));
      setApplications(appData);
      setTotal(appData.length);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, total, isLoading, error, refetch: fetchApplications };
}

export function useApplicationStatus(refNo: string | null) {
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!refNo) return;
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'applications', refNo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApplication({ name: docSnap.id, ...docSnap.data() } as LicenseApplication);
      } else {
        setApplication(null);
      }
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [refNo]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return { application, isLoading, error, refetch: fetchApplication };
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<any | null>(null);

  const uploadDocument = useCallback(
    async (file: File, onProgress?: (progress: number) => void): Promise<{ file_url: string }> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      try {
        const storageRef = ref(storage, `documents/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
              onProgress?.(progress);
            },
            (error) => {
              setError(error);
              setIsUploading(false);
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setIsUploading(false);
                resolve({ file_url: downloadURL });
              });
            }
          );
        });
      } catch (e) {
        setError(e);
        setIsUploading(false);
        throw e;
      }
    },
    []
  );

  const reset = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  return { uploadDocument, isUploading, uploadProgress, error, reset };
}

export function useApplicationDetails(applicationId: string) {
  return useApplicationStatus(applicationId);
}

export function useAllApplications(filter?: ApplicationFilter) {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let q = query(collection(db, 'applications'));
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      const querySnapshot = await getDocs(q);
      const appData = querySnapshot.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      } as LicenseApplication));
      setApplications(appData);
      setTotal(appData.length);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, total, isLoading, error, refetch: fetchApplications };
}

export function useApplicationStatistics() {
  const [statistics, setStatistics] = useState<ApplicationStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'applications'));
      const applications = querySnapshot.docs.map((doc) => doc.data() as LicenseApplication);

      const stats: ApplicationStatistics = {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'Pending').length,
        under_review: applications.filter((a) => a.status === 'Under Review').length,
        approved: applications.filter((a) => a.status === 'Approved').length,
        rejected: applications.filter((a) => a.status === 'Rejected').length,
        completed: applications.filter((a) => a.status === 'Completed').length,
        by_type: {
          new_license: applications.filter((a) => a.application_type === 'New License').length,
          renewal: applications.filter((a) => a.application_type === 'Renewal').length,
          latra_exam: applications.filter((a) => a.application_type === 'LATRA Exam').length,
        },
      };
      setStatistics(stats);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, isLoading, error, refetch: fetchStatistics };
}

export function useUpdateApplicationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const updateStatus = useCallback(async (applicationId: string, status: ApplicationStatus): Promise<{ success: boolean }> => {
    setIsUpdating(true);
    setError(null);
    try {
      const docRef = doc(db, 'applications', applicationId);
      await updateDoc(docRef, { status });
      return { success: true };
    } catch (e) {
      setError(e);
      return { success: false };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateStatus, isUpdating, error };
}

export function useFileValidation(options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }) {
    const maxSize = options?.maxSize;
    const allowedTypes = options?.allowedTypes;
  
    const validateFile = useCallback(
      (file: File): { valid: boolean; error?: string } => {
        if (maxSize && file.size > maxSize) {
          return {
            valid: false,
            error: `File size exceeds the maximum limit of ${maxSize / 1024 / 1024}MB.`,
          };
        }
  
        if (allowedTypes && !allowedTypes.includes(file.type)) {
          return {
            valid: false,
            error: `File type not allowed. Please upload one of the following: ${allowedTypes.join(
              ', '
            )}.`, 
          };
        }
  
        return { valid: true };
      },
      [maxSize, allowedTypes]
    );

    const createPreview = useCallback(async (file: File): Promise<string> => {
      // Only create previews for images
      if (file.type.startsWith('image/')) {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (typeof reader.result === 'string') {
                      resolve(reader.result);
                  } else {
                      reject(new Error('Failed to create preview.'));
                  }
              };
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
          });
      }
      return Promise.resolve(''); // Return empty string for non-image files
  }, []);

    return { validateFile, createPreview };
  }

  export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);
  
    const copyToClipboard = useCallback((text: string) => {
      if (!navigator.clipboard) {
        console.warn('Clipboard API not available');
        return;
      }
  
      navigator.clipboard.writeText(text).then(
        () => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        },
        (err) => {
          console.error('Failed to copy: ', err);
        }
      );
    }, []);
  
    return { isCopied, copyToClipboard };
  }

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

    const addFile = useCallback((file: FileUpload) => {
        // Avoid adding duplicates
        setUploadedFiles((prev) => prev.find(f => f.document_type === file.document_type) ? prev : [...prev, file]);
      }, []);
  
    // ... other functions like removeFile, reset can be added if needed
  
    return {
      formData,
      currentStep,
      uploadedFiles,
      updateFormData,
      nextStep,
      previousStep,
      addFile,
    };
  }