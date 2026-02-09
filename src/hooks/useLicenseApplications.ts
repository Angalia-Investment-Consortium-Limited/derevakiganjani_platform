import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, getDoc, updateDoc, where, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Assuming a type definition exists for LicenseApplication
// If not, we will create it in `@/types/license-application.ts`
import type { LicenseApplication } from '@/types/license-application';

export const useLicenseApplicationsManagement = () => {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'license_applications'), orderBy('submittedOn', 'desc'));
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LicenseApplication[];
      setApplications(apps);
    } catch (err: any) {
      setError('Failed to fetch license applications.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, isLoading, error, refresh: fetchApplications };
};

export const useLicenseApplicationReview = (applicationId: string) => {
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'license_applications', applicationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApplication({ id: docSnap.id, ...docSnap.data() } as LicenseApplication);
      } else {
        setError('Application not found.');
      }
    } catch (err: any) {
      setError('Failed to fetch application details.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, toast]);

  const updateApplicationStatus = async (status: 'Approved' | 'Rejected', remarks?: string) => {
    if (!applicationId) return;
    try {
      const docRef = doc(db, 'license_applications', applicationId);
      await updateDoc(docRef, {
        status,
        ...(remarks && { remarks }), // Add remarks if provided
      });
      toast({ title: 'Success', description: `Application has been ${status.toLowerCase()}.` });
      fetchApplication(); // Refresh data
    } catch (err: any) {
      toast({ title: 'Error', description: `Failed to update application: ${err.message}`, variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return { application, isLoading, error, updateApplicationStatus, refresh: fetchApplication };
};
