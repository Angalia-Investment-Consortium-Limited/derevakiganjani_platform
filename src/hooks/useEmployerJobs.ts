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
        let q = query(collection(db, 'jobs'), where('employerId', '==', currentUser.uid), orderBy('postedOn', 'desc'));

        if (filters.searchTerm) {
          q = query(q, where('title', '>=', filters.searchTerm), where('title', '<=', filters.searchTerm + '\uf8ff'));
        }
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.vehicleType) {
          q = query(q, where('vehicleType', '==', filters.vehicleType));
        }
        if (filters.region) {
          q = query(q, where('location', '==', filters.region));
        }

        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobsData);
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
