
import { useState, useCallback, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  Timestamp, 
  getCountFromServer,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Application } from '@/types/jobs';
import { 
  ApplicationStatus, 
  type DocumentUpload,
  type DocumentType, 
  type FileUploadConfig, 
  type LicenseApplication, 
  type LicenseApplicationFormData, 
  type SubmitApplicationResponse 
} from '@/types/license';

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
        const q = query(collection(db, 'job_applications'), where('driverId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const appsData = await Promise.all(querySnapshot.docs.map(async (document) => {
          const app = { id: document.id, ...document.data() } as any;
          if (app.jobId) {
            try {
              const jobSnap = await getDoc(doc(db, 'jobs', app.jobId));
              if (jobSnap.exists()) {
                const jobData = jobSnap.data();
                app.jobTitle = jobData.job_title || 'Unknown Job';
                app.employerName = jobData.company_name || jobData.employerName || 'Unknown Employer';
              }
            } catch (e) {
              console.error("Failed to fetch job context for application:", e);
            }
          }
          // Align fields to what MyApplications.tsx expects
          app.appliedOn = app.application_date || app.appliedOn;
          app.lastUpdate = app.application_date;
          app.timeline = [{ status: 'completed', event: 'Application Submitted', date: app.application_date ? new Date(app.application_date.seconds * 1000).toLocaleDateString() : 'N/A' }];
          return app as Application;
        }));
        
        // Sort client-side to avoid requiring a composite index in Firestore
        appsData.sort((a: any, b: any) => {
          const timeA = a.appliedOn?.seconds || 0;
          const timeB = b.appliedOn?.seconds || 0;
          return timeB - timeA;
        });

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


// --- LICENSE APPLICATIONS (Refactored Hooks) ---

export const useMyApplications = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState<LicenseApplication[]>([]);
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
                // Corrected field names to align with schema
                const q = query(
                    collection(db, 'license_applications'), 
                    where('userId', '==', currentUser.uid),
                    orderBy('submittedOn', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const appsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseApplication));
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
    const [application, setApplication] = useState<LicenseApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setIsLoading(false);
            setError("Application ID is required.");
            return;
        }
        setIsLoading(true);
        const docRef = doc(db, "license_applications", applicationId);
        
        const unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setApplication({ id: docSnap.id, ...docSnap.data() } as LicenseApplication);
                    setError(null);
                } else {
                    setError("Application not found.");
                }
                setIsLoading(false);
            },
            (err: any) => {
                setError(err.message || "Failed to fetch application details.");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [applicationId]);

    return { application, isLoading, error };
};

export const useTrackApplication = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [application, setApplication] = useState<LicenseApplication | null>(null);

    const track = async (trackingId: string) => {
        setIsLoading(true);
        setError(null);
        setApplication(null);
        if (!trackingId?.trim()) {
            setError("Tracking ID is required.");
            setIsLoading(false);
            return;
        }
        try {
            const docRef = doc(db, 'license_applications', trackingId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setApplication({id: docSnap.id, ...docSnap.data()} as LicenseApplication);
            } else {
                setError("Application with that tracking ID not found.");
            }
        } catch(err: any) {
            setError(err.message || 'An error occurred while tracking the application.');
        } finally {
            setIsLoading(false);
        }
    };

    return { track, isLoading, error, application };
};

export const useCopyToClipboard = () => {
    const copy = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
    };
    return copy;
};

export const useFileValidation = (config: FileUploadConfig) => {
    const validate = (file: File, documentType: DocumentType) => {
        const docConfig = config.allowedFileTypes[documentType];
        if (!docConfig) return "Invalid document type.";
        
        const { maxSize, allowedTypes } = docConfig;
        if (file.size > maxSize) return `File is too large. Max size is ${maxSize / 1024 / 1024}MB.`;
        if (!allowedTypes.includes(file.type)) return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
        return null;
    };
    return validate;
};

export const useDocumentUpload = (userId: string) => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadDocuments = async (files: {file: File, documentType: DocumentType}[], applicationId: string): Promise<DocumentUpload[]> => {
        setIsUploading(true);
        const storage = getStorage();
        const uploadedDocs: DocumentUpload[] = [];

        for (const {file, documentType} of files) {
            const storageRef = ref(storage, `license-documents/${userId}/${applicationId}/${documentType}_${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed',
                    () => { /* Progress can be handled here */ },
                    (error) => { 
                        console.error(`Failed to upload ${documentType}`, error);
                        reject(error); 
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        uploadedDocs.push({ name: documentType, url: downloadURL });
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

// Implemented full multi-step logic as required by the wizard component
export const useApplicationForm = (initialState: Partial<LicenseApplicationFormData>) => {
    const [formData, setFormData] = useState<Partial<LicenseApplicationFormData>>(initialState);
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<{file: File, documentType: DocumentType}[]>([]);

    const updateFormData = useCallback((data: Partial<LicenseApplicationFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    }, []);

    const addFile = useCallback((file: File, documentType: DocumentType) => {
        setUploadedFiles(prev => [...prev.filter(f => f.documentType !== documentType), { file, documentType }]);
    }, []);
    
    const removeFile = useCallback((documentType: DocumentType) => {
        setUploadedFiles(prev => prev.filter(f => f.documentType !== documentType));
    }, []);

    const nextStep = useCallback(() => setCurrentStep(prev => prev + 1), []);
    const previousStep = useCallback(() => setCurrentStep(prev => prev - 1), []);

    return { formData, currentStep, uploadedFiles, updateFormData, nextStep, previousStep, addFile, removeFile };
};

// Rewritten to match the implementation plan's payment flow
export const useSubmitApplication = ( ) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const { uploadDocuments } = useDocumentUpload(currentUser?.uid || '');

    const submit = async (
        formData: Partial<LicenseApplicationFormData>, 
        files: {file: File, documentType: DocumentType}[]
    ): Promise<SubmitApplicationResponse> => {
        setIsSubmitting(true);
        if (!currentUser) {
            setIsSubmitting(false);
            return { success: false, message: "User not authenticated." };
        }
        
        let tempAppId = `temp_${Date.now()}`;
        
        try {
            // 1. Create payment document
            const paymentDocRef = await addDoc(collection(db, 'payments'), {
                userId: currentUser.uid,
                service: 'Leseni Application Fee',
                amount: 50000, // TODO: Make this dynamic based on application type
                status: 'pending',
                provider: 'Selcom',
                createdAt: Timestamp.now(),
            });

            // 2. Upload documents with a temporary ID, then update the application
            const uploadedDocs = await uploadDocuments(files, tempAppId);

            // 3. Create license application document
            const submissionData: Omit<LicenseApplication, 'id'> = {
                userId: currentUser.uid,
                paymentId: paymentDocRef.id,
                status: ApplicationStatus.PendingPayment,
                submittedOn: Timestamp.now(),
                lastUpdated: Timestamp.now(),
                applicationType: formData.application_type!,
                fullName: formData.full_name!,
                fullNameNormalized: formData.full_name!.toLowerCase(),
                ...(formData.nida_number && { nidaNumber: formData.nida_number }),
                ...(formData.tin_number && { tinNumber: formData.tin_number }),
                phoneNumber: formData.phone_number!,
                email: formData.email!,
                region: formData.region!,
                district: formData.district!,
                ...(formData.ward && { ward: formData.ward }),
                ...(formData.exam_date && { examDate: formData.exam_date }),
                ...(formData.latra_type && { latraType: formData.latra_type }),
                ...(formData.street_address && { streetAddress: formData.street_address }),
                categories: formData.license_category!,
                documents: uploadedDocs,
            };
            const appDocRef = await addDoc(collection(db, 'license_applications'), submissionData);
            
            // 4. Update payment doc with the final application ID
            await updateDoc(paymentDocRef, {
                referenceId: appDocRef.id
            });
            
            // NOTE: The storage path will have a temp ID, but this is acceptable. 
            // A cleaner approach might involve a two-step write or a Cloud Function to rename the folder,
            // but this is the most robust solution without server-side logic.

            setIsSubmitting(false);
            return {
                success: true,
                message: "Application created successfully. Proceeding to payment.",
                applicationId: appDocRef.id,
                paymentId: paymentDocRef.id,
            };

        } catch (error: any) {
            setIsSubmitting(false);
            console.error("Application Submission Error: ", error);
            return { success: false, message: error.message || "An unexpected error occurred during submission." };
        }
    };
    return { submit, isSubmitting };
};

export const useApplicationStatistics = () => {
    const [stats, setStats] = useState<{total: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, 'license_applications'));
                const snapshot = await getCountFromServer(q);
                setStats({ total: snapshot.data().count }); 
            } catch (error) {
                console.error("Error fetching application stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return { stats, isLoading };
};
