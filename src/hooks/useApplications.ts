
import { useState, useCallback, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Application } from '@/types/jobs';
import { ApplicationStatus, type DocumentType, FILE_UPLOAD_CONFIG, type LicenseApplication, type LicenseApplicationFormData, type SubmitApplicationResponse } from '@/types/license';

// --- JOB APPLICATIONS (Existing Hook) ---
export const useApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'job_applications'), where('driverId', '==', currentUser.uid), orderBy('appliedOn', 'desc'));
        const querySnapshot = await getDocs(q);
        const appsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching job applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  return { applications, loading };
};


// --- LICENSE APPLICATIONS (New Hooks) ---

export const useMyApplications = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const q = query(
                    collection(db, 'license_applications'), 
                    where('user_id', '==', currentUser.uid),
                    orderBy('submission_date', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const appsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setApplications(appsData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch applications.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [currentUser]);

    return { applications, isLoading, error };
};

export const useApplicationDetails = (applicationId: string) => {
    const [application, setApplication] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplication = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, "license_applications", applicationId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setApplication({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Application not found.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch application details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplication();
    }, [applicationId]);

    return { application, isLoading, error };
};

export const useTrackApplication = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [application, setApplication] = useState<any|null>(null);

    const track = async (trackingId: string) => {
        setIsLoading(true);
        setError(null);
        setApplication(null);
        try {
            const q = query(collection(db, 'license_applications'), where('id', '==', trackingId));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                throw new Error("Application with that tracking ID not found.");
            }
            setApplication({id: snapshot.docs[0].id, ...snapshot.docs[0].data()});
        } catch(err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return { track, isLoading, error, application };
};

export const useCopyToClipboard = () => {
    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    return copy;
};

export const useFileValidation = (config: typeof FILE_UPLOAD_CONFIG) => {
    const validate = (file: File, documentType: DocumentType) => {
        const { maxSize, allowedTypes } = config.allowedFileTypes[documentType];
        if (file.size > maxSize) return `File is too large. Max size is ${maxSize / 1024 / 1024}MB.`;
        if (!allowedTypes.includes(file.type)) return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        return null;
    };
    return validate;
};

export const useDocumentUpload = (userId: string) => {
    const [uploads, setUploads] = useState<any>({});
    const [isUploading, setIsUploading] = useState(false);

    const uploadDocuments = async (files: {file: File, documentType: DocumentType}[]) => {
        setIsUploading(true);
        const storage = getStorage();
        const uploadedDocs: any = {};

        for (const {file, documentType} of files) {
            const storageRef = ref(storage, `license-documents/${userId}/${documentType}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => { /* Progress can be handled here */ },
                    (error) => { reject(error); },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        uploadedDocs[documentType] = { url: downloadURL, type: documentType };
                        resolve();
                    }
                );
            });
        }
        setIsUploading(false);
        return uploadedDocs;
    };

    return { uploadDocuments, isUploading };
};

export const useApplicationForm = () => {
    const [formData, setFormData] = useState<Partial<LicenseApplicationFormData>>({});
    const updateFormData = (data: Partial<LicenseApplicationFormData>) => {
        setFormData(prev => ({...prev, ...data}));
    };
    return { formData, updateFormData };
};

export const useSubmitApplication = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    const submit = async (formData: LicenseApplicationFormData): Promise<SubmitApplicationResponse> => {
        setIsSubmitting(true);
        if (!currentUser) {
            setIsSubmitting(false);
            return { success: false, message: "User not authenticated" };
        }
        try {
            const submissionData: Omit<LicenseApplication, 'id'> = {
                ...formData,
                user_id: currentUser.uid,
                status: ApplicationStatus.Pending,
                submission_date: Timestamp.now(),
                full_name_normalized: formData.full_name.toLowerCase(),
                documents: formData.documents || [],
            };
            const docRef = await addDoc(collection(db, 'license_applications'), submissionData);
            setIsSubmitting(false);
            return {
                success: true,
                message: "Application submitted successfully!",
                application: {
                    name: formData.full_name,
                    reference_number: docRef.id,
                    application_type: formData.application_type,
                    status: ApplicationStatus.Pending,
                    submission_date: new Date().toISOString(),
                }
            };
        } catch (error: any) {
            setIsSubmitting(false);
            return { success: false, message: error.message || "Submission failed.", error };
        }
    };
    return { submit, isSubmitting };
};

export const useApplicationStatistics = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, 'license_applications'));
                const snapshot = await getCountFromServer(q);
                // This is a simplified version. A real implementation would need more queries for detailed stats.
                // @ts-ignore
                setStats({ total: snapshot.data().count }); 
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return { stats, isLoading };
};
