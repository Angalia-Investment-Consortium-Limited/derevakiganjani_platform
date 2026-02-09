
import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { EmployerVerification } from '@/types/jobs'; // This might need adjustment depending on the final data structure

const PAGE_SIZE = 10;

// --- HOOK for the list of employer verification requests ---
export const useEmployerVerificationManagement = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const buildQuery = useCallback(() => {
    // Corrected collection name to 'employer_profiles' as per schema
    let q = query(collection(db, 'employer_profiles'));

    if (statusFilter !== 'all') {
      q = query(q, where('verification_status', '==', statusFilter));
    }

    if (searchTerm) {
      q = query(q, where('company_name', '>=', searchTerm), where('company_name', '<=', searchTerm + '\uf8ff'));
    }

    return q;
  }, [statusFilter, searchTerm]);

  const fetchEmployers = useCallback(async (page = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const q = buildQuery();

      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);

      let pageQuery = query(q, orderBy('company_name', 'asc'), limit(PAGE_SIZE));
      if (page > 0 && lastDoc) {
        pageQuery = query(pageQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(pageQuery);
      const employersData = querySnapshot.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          status: d.data().verification_status, // Align field name
      }));
      setEmployers(employersData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err: any) {
      console.error("Error fetching employer profiles:", err);
      setError(err.message || 'Failed to fetch employer profiles');
    } finally {
      setIsLoading(false);
    }
  }, [lastDoc, buildQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setLastDoc(null);
    fetchEmployers(0);
  }, [fetchEmployers]);

  useEffect(() => {
      fetchEmployers(currentPage);
  }, [currentPage, fetchEmployers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    employers, total, isLoading, error, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, totalPages, refresh,
  };
};


// --- HOOK for a single employer review ---
export const useEmployerReview = (employerId: string | null) => {
  const [employer, setEmployer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchEmployer = useCallback(async () => {
    if (!employerId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // The primary document is in 'employer_profiles'
      const profileRef = doc(db, 'employer_profiles', employerId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        throw new Error('Employer profile not found');
      }
      const employerData = { id: profileSnap.id, ...profileSnap.data() };
      
      // We also need the user's base info (like email) from the 'users' collection
      const userRef = doc(db, 'users', employerId);
      const userSnap = await getDoc(userRef);
      if(userSnap.exists()) {
          employerData.email = userSnap.data().email;
          employerData.phone = userSnap.data().mobile_no;
      }

      setEmployer(employerData);

    } catch (err: any) {
      console.error("Error fetching employer for review:", err);
      setError(err.message || 'Failed to fetch employer data');
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchEmployer();
  }, [fetchEmployer]);

  const updateVerificationStatus = async (newStatus: 'Verified' | 'Rejected', remarks: string) => {
    if (!employerId) return;
    setIsUpdating(true);
    try {
      const employerRef = doc(db, 'employer_profiles', employerId);
      await updateDoc(employerRef, { 
          verification_status: newStatus, 
          verification_remarks: remarks,
          verified_at: new Date(),
      });
      // Optimistically update local state
      setEmployer((prev: any) => prev ? { ...prev, verification_status: newStatus, verification_remarks: remarks } : null);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update verification status');
    } finally {
      setIsUpdating(false);
    }
  };

  return { employer, isLoading, error, isUpdating, updateVerificationStatus, refresh: fetchEmployer };
};
