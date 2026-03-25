import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types/jobs';

const PAGE_SIZE = 10;

export const useAdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'jobs'));

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    if (searchQuery) {
      q = query(q, where('job_title', '>=', searchQuery), where('job_title', '<=', searchQuery + '\uf8ff'));
    }

    return q;
  }, [statusFilter, searchQuery]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = buildQuery();

      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);

      let pageQuery = query(q, orderBy('posted_date', 'desc'), limit(PAGE_SIZE));
      if (currentPage > 0 && lastDoc) {
        pageQuery = query(pageQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(pageQuery);
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, lastDoc, buildQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setLastDoc(null);
    fetchJobs();
  }, [fetchJobs]);

  const deleteJob = async (jobId: string) => {
    setDeleting(true);
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await deleteDoc(jobRef);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };
  
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    jobs,
    total,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    deleteJob,
    deleting,
    refresh,
  };
};

export const useAdminJob = (jobId: string | null) => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const jobRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(jobRef);
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() } as Job);
        } else {
          setError('Job not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return { job, isLoading, error };
};

export const useCreateJob = () => {
    const [loading, setLoading] = useState(false);

    const createJob = async (jobData: Partial<Job>) => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'jobs'), {
                ...jobData,
                posted_date: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error creating job: ", error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    };

    return { createJob, loading };
};

export const useUpdateJob = () => {
    const [loading, setLoading] = useState(false);

    const updateJob = async (jobData: Partial<Job> & { id: string }) => {
        setLoading(true);
        try {
            const { id, ...data } = jobData;
            const jobRef = doc(db, 'jobs', id);
            await updateDoc(jobRef, data);
        } catch (error) {
            console.error("Error updating job: ", error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    };

    return { updateJob, loading };
};
