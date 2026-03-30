import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types/jobs';

export const useEmployerJobs = (filters: any) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'jobs'), where('employerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        let jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

        if (filters.searchTerm) {
          jobsData = jobsData.filter(j => j.job_title?.toLowerCase().includes(filters.searchTerm.toLowerCase()));
        }
        if (filters.status && filters.status !== 'all') {
          jobsData = jobsData.filter(j => j.status === filters.status);
        }
        if (filters.vehicleType && filters.vehicleType !== 'all') {
          jobsData = jobsData.filter(j => j.vehicleType === filters.vehicleType);
        }
        if (filters.region && filters.region !== 'all') {
          jobsData = jobsData.filter(j => j.region === filters.region);
        }

        jobsData.sort((a, b) => {
          const aMillis = (a.posted_date as any)?.seconds ? (a.posted_date as any).seconds * 1000 : 0;
          const bMillis = (b.posted_date as any)?.seconds ? (b.posted_date as any).seconds * 1000 : 0;
          return bMillis - aMillis;
        });

        // Also fetch application counts like dashboard does to populate `job.applicationCount` if needed
        const jobsWithCounts = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const { getCountFromServer, query: cfQuery, where: cfWhere, collection: cfColl } = await import('firebase/firestore');
              const appsCountQuery = cfQuery(cfColl(db, 'job_applications'), cfWhere('jobId', '==', job.id));
              const appsCountSnapshot = await getCountFromServer(appsCountQuery);
              return { ...job, applicationCount: appsCountSnapshot.data().count };
            } catch (err) {
              return { ...job, applicationCount: 0 };
            }
          })
        );

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error("Error fetching employer jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentUser, filters]);

  return { jobs, loading };
};
