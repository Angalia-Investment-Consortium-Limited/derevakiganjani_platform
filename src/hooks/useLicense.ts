import { useState, useCallback, useEffect } from 'react';
import type {
  LicenseApplicationFormData,
  SubmitApplicationResponse,
  ApplicationFilter,
  LicenseApplication,
  FileUpload
} from '@/types/license';

const MOCK_REGIONS = ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya'];
const MOCK_DISTRICTS: { [key: string]: string[] } = {
    'Dar es Salaam': ['Ilala', 'Temeke', 'Kinondoni', 'Ubungo', 'Kigamboni'],
    'Mwanza': ['Nyamagana', 'Ilemela', 'Sengerema'],
    'Arusha': ['Arusha City', 'Arusha Rural', 'Meru'],
    'Dodoma': ['Dodoma Urban', 'Bahi', 'Chamwino'],
    'Mbeya': ['Mbeya Urban', 'Rungwe', 'Kyela'],
};

const MOCK_APPLICATIONS: LicenseApplication[] = [
    {
        name: 'APP-001',
        application_type: 'New License',
        full_name: 'John Doe',
        status: 'Submitted',
        creation: new Date().toISOString(),
    }
]

export function useRegions() {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);
    return { regions: MOCK_REGIONS, isLoading, error: null, refetch: () => {} };
}

export function useDistricts(region: string | null) {
    const [isLoading, setIsLoading] = useState(false);
    const [districts, setDistricts] = useState<string[]>([]);
    useEffect(() => {
        if (region) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setDistricts(MOCK_DISTRICTS[region] || []);
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [region]);
    return { districts, isLoading, error: null, refetch: () => {} };
}

export function useSubmitApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitApplication = useCallback(
    async (formData: LicenseApplicationFormData): Promise<SubmitApplicationResponse> => {
      setIsSubmitting(true);
      console.log('Submitting application:', formData);
      return new Promise(resolve => setTimeout(() => {
        setIsSubmitting(false);
        const newApplication = { ...MOCK_APPLICATIONS[0], name: `APP-${Math.floor(Math.random() * 1000)}`};
        resolve({ success: true, message: 'Application submitted', application: newApplication });
      }, 1500));
    },
    []
  );

  return { submitApplication, isSubmitting, error: null, reset: () => {} };
}

export function useMyApplications(filter?: ApplicationFilter) {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);
    return { applications: MOCK_APPLICATIONS, total: MOCK_APPLICATIONS.length, isLoading, error: null, refetch: () => {} };
}

export function useApplicationStatus(refNo: string | null) {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [refNo]);

    const application = refNo ? { ...MOCK_APPLICATIONS[0], name: refNo } : null;
    return { application, isLoading, error: null, refetch: () => {} };
}

export function useDocumentUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
  
    const uploadDocument = useCallback(
      async (file: File, onProgress?: (progress: number) => void): Promise<{ file_url: string }> => {
        setIsUploading(true);
        setUploadProgress(0);
        console.log("Uploading file:", file.name);
  
        // Simulate upload progress
        return new Promise(resolve => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 25;
            setUploadProgress(progress);
            onProgress?.(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              resolve({ file_url: `/uploads/${file.name}` });
            }
          }, 300);
        });
      },
      []
    );
  
    return { uploadDocument, isUploading, uploadProgress, error: null, reset: () => {} };
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

// Other hooks can be mocked similarly if needed.