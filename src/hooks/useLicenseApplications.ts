import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  where,
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import type { LicenseApplication } from '@/types/license-application';

interface ApplicationFilters {
  status?: string;
  type?: string;
  category?: string;
}

export const useLicenseApplicationsManagement = (filters: ApplicationFilters) => {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const constraints: QueryConstraint[] = [orderBy('submittedOn', 'desc')];
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status.charAt(0).toUpperCase() + filters.status.slice(1)));
      }
      if (filters.type && filters.type !== 'all') {
        constraints.push(where('applicationType', '==', filters.type));
      }
      if (filters.category && filters.category !== 'all') {
        constraints.push(where('categories', 'array-contains', filters.category));
      }
      
      const q = query(collection(db, 'license_applications'), ...constraints);
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
  }, [toast, filters.status, filters.type, filters.category]);

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

  const updateApplicationStatus = async (
    status: 'Approved' | 'Rejected',
    data: { applicantAdvice?: string; adminNotes?: string }
  ) => {
    if (!applicationId) {
        throw new Error('Application ID not found.');
    }
    try {
      const docRef = doc(db, 'license_applications', applicationId);
      const updatePayload = {
        status,
        applicantAdvice: data.applicantAdvice || '',
        adminNotes: data.adminNotes || '',
        remarks: data.applicantAdvice || '', // Backward compatibility
      };
      await updateDoc(docRef, updatePayload);
      fetchApplication(); // Refresh data after successful update
    } catch (err: any) {
      // Re-throw the error to be caught by the component
      throw new Error(err.message || 'Failed to update application.');
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return { application, isLoading, error, updateApplicationStatus, refresh: fetchApplication };
};
