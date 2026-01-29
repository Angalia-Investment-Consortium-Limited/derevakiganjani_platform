import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types/jobs';

export const useJobs = (filters: any) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'jobs'), orderBy('postedOn', 'desc'));

        if (filters.searchTerm) {
          // This is a simplified search. For more complex search, a dedicated search service like Algolia or Typesense is recommended.
          q = query(q, where('title', '>=', filters.searchTerm), where('title', '<=', filters.searchTerm + '\uf8ff'));
        }
        if (filters.vehicleType) {
          q = query(q, where('vehicleType', '==', filters.vehicleType));
        }
        if (filters.licenseCategory) {
          q = query(q, where('licenseRequired', '==', filters.licenseCategory));
        }
        if (filters.region) {
          q = query(q, where('location', '==', filters.region));
        }
        if (filters.jobType) {
          q = query(q, where('jobType', '==', filters.jobType));
        }
        
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  return { jobs, loading };
};
