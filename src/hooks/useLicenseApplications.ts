import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LicenseApplication } from '@/types/license';

const PAGE_SIZE = 10;

export const useLicenseApplications = () => {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'licenseApplications'));

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }
    
    if (typeFilter !== 'all') {
        q = query(q, where('applicationType', '==', typeFilter));
    }

    if (searchTerm) {
      q = query(q, where('fullName', '>=', searchTerm), where('fullName', '<=', searchTerm + '\uf8ff'));
    }

    return q;
  }, [statusFilter, typeFilter, searchTerm]);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = buildQuery();

      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);

      let pageQuery = query(q, orderBy('submission_date', 'desc'), limit(PAGE_SIZE));
      if (currentPage > 0 && lastDoc) {
        pageQuery = query(pageQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(pageQuery);
      const applicationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as LicenseApplication));
      setApplications(applicationsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch license applications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, lastDoc, buildQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setLastDoc(null);
    fetchApplications();
  }, [fetchApplications]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const applicationRef = doc(db, 'licenseApplications', applicationId);
      await updateDoc(applicationRef, { status: newStatus });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    applications,
    total,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    updateApplicationStatus,
    updating,
    refresh,
  };
};
