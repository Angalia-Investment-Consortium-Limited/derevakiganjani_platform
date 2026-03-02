import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Employer } from '@/types/employer';

// Hook for the main management page (/employer-verification)
export const useEmployerVerificationManagement = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const employersCollection = collection(db, 'employers');
      const querySnapshot = await getDocs(employersCollection);
      const employersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Employer[];
      setEmployers(employersList);
    } catch (err: any) {
      console.error("Error fetching employers: ", err);
      setError('Failed to fetch employer verification requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  return { employers, isLoading, error, refresh: fetchEmployers };
};

// Hook for the individual review page (/employer-review/:id)
export const useEmployerReview = (employerId: string | null) => {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployer = useCallback(async () => {
    if (!employerId) {
        setIsLoading(false);
        setError('No employer ID provided.');
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const employerDocRef = doc(db, 'employers', employerId);
      const docSnap = await getDoc(employerDocRef);

      if (docSnap.exists()) {
        setEmployer({ id: docSnap.id, ...docSnap.data() } as Employer);
      } else {
        setError('Employer not found.');
        setEmployer(null);
      }
    } catch (err: any) {
      console.error(`Error fetching employer ${employerId}: `, err);
      setError('Failed to fetch employer details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchEmployer();
  }, [fetchEmployer]);

  const updateEmployerStatus = async (status: 'verified' | 'rejected' | 'suspended', remarks: string) => {
    if (!employerId) {
        throw new Error('Cannot update status without an employer ID.');
    }

    const employerDocRef = doc(db, 'employers', employerId);
    await updateDoc(employerDocRef, {
        verificationStatus: status,
        remarks: remarks,
        processedAt: Timestamp.now(), // Keep a record of when it was processed
    });
    // Refresh local data after update
    fetchEmployer();
  };

  const deleteEmployer = async () => {
    if (!employerId) {
        throw new Error('Cannot delete without an employer ID.');
    }
    const employerDocRef = doc(db, 'employers', employerId);
    await deleteDoc(employerDocRef);
  }

  return { employer, isLoading, error, updateEmployerStatus, deleteEmployer, refresh: fetchEmployer };
};
