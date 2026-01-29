import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { EmployerVerification } from '@/types/jobs';

const PAGE_SIZE = 10;

export const useEmployerVerificationManagement = () => {
  const [employers, setEmployers] = useState<EmployerVerification[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [reviewing, setReviewing] = useState(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'employerVerifications'));

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    if (searchTerm) {
      q = query(q, where('companyName', '>=', searchTerm), where('companyName', '<=', searchTerm + '\uf8ff'));
    }

    return q;
  }, [statusFilter, searchTerm]);

  const fetchEmployers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = buildQuery();

      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);

      let pageQuery = query(q, orderBy('creation', 'desc'), limit(PAGE_SIZE));
      if (currentPage > 0 && lastDoc) {
        pageQuery = query(pageQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(pageQuery);
      const employersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployerVerification));
      setEmployers(employersData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch employer verifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, lastDoc, buildQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setLastDoc(null);
    fetchEmployers();
  }, [fetchEmployers]);

  const reviewEmployer = async (employerId: string, newStatus: string) => {
    setReviewing(true);
    try {
      const employerRef = doc(db, 'employerVerifications', employerId);
      await updateDoc(employerRef, { status: newStatus });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update employer status');
    } finally {
      setReviewing(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    employers,
    total,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    reviewEmployer,
    reviewing,
    refresh,
  };
};