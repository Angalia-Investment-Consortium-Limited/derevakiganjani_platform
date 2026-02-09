import { useState, useCallback, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, getDoc, deleteDoc } from 'firebase/firestore';
import type { WhereFilterOp, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types/jobs';

const PAGE_SIZE = 15;

interface Filter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

const useJobsHook = (initialFilters: Filter[] = []) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>(initialFilters);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const pageCursors = useRef<(DocumentSnapshot | null)[]>([null]);
  const isFetching = useRef(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'jobs'));
    filters.forEach(filter => {
      if (filter.value && filter.value !== 'all') {
        q = query(q, where(filter.field, filter.operator, filter.value));
      }
    });
    return q;
  }, [filters]);

  useEffect(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    const fetchPage = async () => {
      try {
        const q = buildQuery();
        
        if (currentPage === 0) {
          const countSnapshot = await getCountFromServer(q);
          setTotal(countSnapshot.data().count);
        }

        let pageQuery = query(q, orderBy('posted_date', 'desc'), limit(PAGE_SIZE));
        const cursor = pageCursors.current[currentPage];
        if (cursor) {
          pageQuery = query(pageQuery, startAfter(cursor));
        }

        const querySnapshot = await getDocs(pageQuery);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (lastVisible) {
          pageCursors.current[currentPage + 1] = lastVisible;
        }

        const jobsData = await Promise.all(querySnapshot.docs.map(async (d) => {
          const job = { id: d.id, ...d.data() } as Job;
          job.company_name = job.employerName;
          // If employerName is not on job, then we can fetch from employer profile
          if (!job.company_name && job.employerId) { 
            try {
              const employerRef = doc(db, 'employer_profiles', job.employerId);
              const employerSnap = await getDoc(employerRef);
              job.company_name = employerSnap.exists() ? employerSnap.data().company_name : 'Unknown';
            } catch (e) {
              console.error(`Failed to fetch employer for job ${job.id}`, e);
              job.company_name = 'Unknown';
            }
          }
          return job;
        }));

        setJobs(jobsData);

      } catch (err: any) {
        console.error("Error fetching jobs:", err);
        setError(err.message || 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };

    fetchPage();
  }, [currentPage, buildQuery, refreshKey]);

  const refresh = () => {
    setCurrentPage(0);
    pageCursors.current = [null];
    setRefreshKey(k => k + 1);
  };

  const setStatusFilter = (status: string) => {
    setCurrentPage(0);
    pageCursors.current = [null];
    setFilters(prev => {
        const otherFilters = prev.filter(f => f.field !== 'status');
        return status === 'all' ? otherFilters : [...otherFilters, { field: 'status', operator: '==', value: status }];
    });
  };

  const deleteJob = async (jobId: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await deleteDoc(jobRef);
      refresh();
    } catch (err: any) {
      console.error("Error deleting job:", err);
      throw new Error(err.message || 'Failed to delete job');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    jobs, total, isLoading, error, 
    filters, setFilters: setStatusFilter,
    currentPage, setCurrentPage, totalPages, 
    refresh, deleteJob
  };
};

export const useJobs = useJobsHook;
export const useJobManagement = () => useJobsHook([{ field: 'status', operator: '==', value: 'all' }]);

export const useJobApplicants = (jobId: string | null) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [job, setJob] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicants = useCallback(async () => {
    if (!jobId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        setJob({ id: jobSnap.id, ...jobSnap.data() });
      } else {
        throw new Error('Job not found');
      }

      const q = query(collection(db, 'job_applications'), where('job_id', '==', jobId), orderBy('applied_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const applicantsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setApplicants(applicantsData);

    } catch (err: any) {
      console.error("Error fetching job applicants:", err);
      setError(err.message || 'Failed to fetch applicants');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  return { applicants, job, isLoading, error, refresh: fetchApplicants };
};