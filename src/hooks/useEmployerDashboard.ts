import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Job, Application } from '@/types/jobs';

export const useEmployerDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>({ totalJobPosts: 0, totalApplicants: 0, shortlisted: 0, interviews: 0, hired: 0 });
  const [recentApplicants, setRecentApplicants] = useState<Application[]>([]);
  const [recentJobPosts, setRecentJobPosts] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch jobs
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', currentUser.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setRecentJobPosts(jobsData.slice(0, 5));

        // Fetch applications
        const appsQuery = query(collection(db, 'applications'), where('employerId', '==', currentUser.uid), orderBy('appliedOn', 'desc'), limit(5));
        const appsSnapshot = await getDocs(appsQuery);
        const appsData = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setRecentApplicants(appsData);

        // Calculate stats
        const totalJobPosts = jobsData.length;
        const allAppsQuery = query(collection(db, 'applications'), where('employerId', '==', currentUser.uid));
        const allAppsSnapshot = await getDocs(allAppsQuery);
        const totalApplicants = allAppsSnapshot.size;
        const shortlisted = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Shortlisted').length;
        const interviews = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Interview').length;
        const hired = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Hired').length;
        setStats({ totalJobPosts, totalApplicants, shortlisted, interviews, hired });

      } catch (error) {
        console.error("Error fetching employer dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return { stats, recentApplicants, recentJobPosts, loading };
};
