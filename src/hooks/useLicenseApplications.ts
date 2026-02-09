import { useState, useCallback, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LicenseApplication } from '@/types/license';

const APPLICATIONS_COLLECTION = 'license_applications';
const PAGE_SIZE = 15;

/**
 * Hook for fetching and managing a list of license applications.
 */
export const useLicenseApplications = () => {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Use a ref to store the last document of each page to avoid re-renders
  const lastDocRef = useRef<any[]>([]);

  // Reset pagination when the filter changes
  useEffect(() => {
    setCurrentPage(0);
    lastDocRef.current = [];
  }, [statusFilter]);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let q = query(collection(db, APPLICATIONS_COLLECTION));

      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      
      // Only fetch total count on the first page load for a filter
      if (currentPage === 0) {
          const countSnapshot = await getCountFromServer(q);
          setTotal(countSnapshot.data().count);
      }

      let pageQuery = query(q, orderBy('submittedOn', 'desc'), limit(PAGE_SIZE));
      
      // Use the last document from the previous page for pagination
      if (currentPage > 0 && lastDocRef.current[currentPage - 1]) {
        pageQuery = query(pageQuery, startAfter(lastDocRef.current[currentPage - 1]));
      }

      const querySnapshot = await getDocs(pageQuery);
      const applicationsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as LicenseApplication));
      
      // Store the last document of the current page
      lastDocRef.current[currentPage] = querySnapshot.docs[querySnapshot.docs.length - 1];

      setApplications(applicationsData);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  // Main effect to fetch data when page or filter changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const refresh = useCallback(() => {
    // Re-run the fetch for the current page
    if (currentPage === 0) {
        fetchApplications();
    } else {
        // Reset to the first page, which will trigger the fetch effect
        setCurrentPage(0);
    }
  }, [fetchApplications, currentPage]);
  
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    applications,
    total,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh,
  };
};

/**
 * Hook for fetching and managing a single license application review.
 */
export const useLicenseApplicationReview = (applicationId: string | null) => {
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
        setApplication(null);
        return;
    };

    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const applicationData: LicenseApplication = {
          id: docSnap.id,
          userId: data.userId,
          applicationType: data.applicationType,
          fullName: data.fullName,
          fullNameNormalized: data.fullNameNormalized,
          phoneNumber: data.phoneNumber,
          email: data.email,
          region: data.region,
          district: data.district,
          licenseCategory: data.licenseCategory,
          latraType: data.latraType,
          currentLicenseNumber: data.currentLicenseNumber,
          status: data.status,
          paymentStatus: data.paymentStatus,
          refNo: data.refNo,
          adminComment: data.adminComment,
          submittedOn: data.submittedOn,
          reviewDate: data.reviewDate,
          reviewer: data.reviewer,
          remarks: data.remarks,
          documents: data.documents,
          processedOn: data.processedOn,
        };
        setApplication(applicationData);
      } else {
        setError('Application not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const updateStatus = async (newStatus: 'approved' | 'rejected' | 'pending', remarks: string) => {
    if (!applicationId) return;

    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(docRef, {
      status: newStatus,
      remarks: remarks,
      processedOn: Timestamp.now(),
    });
  };

  return { application, isLoading, error, updateStatus, refresh: fetchApplication };
};
