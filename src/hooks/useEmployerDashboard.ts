import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
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
        // 1. Fetch Job Posts
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', currentUser.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setRecentJobPosts(jobsData.slice(0, 5));

        // 2. Fetch Recent Applications
        const appsQuery = query(collection(db, 'applications'), where('employerId', '==', currentUser.uid), orderBy('appliedOn', 'desc'), limit(5));
        const appsSnapshot = await getDocs(appsQuery);
        
        // Enrich applications with driver data
        const appsData = await Promise.all(appsSnapshot.docs.map(async (appDoc) => {
          const application = { id: appDoc.id, ...appDoc.data() } as Application;

          // Fetch the corresponding driver's profile
          if (application.driverId) {
            const driverRef = doc(db, 'driver_profiles', application.driverId);
            const driverSnap = await getDoc(driverRef);
            if (driverSnap.exists()) {
              // Add driverName to the application object
              return { ...application, driverName: driverSnap.data().fullName };
            }
          }
          // Return the application as is, with a placeholder name if driver not found
          return { ...application, driverName: 'Unknown Driver' };
        }));

        setRecentApplicants(appsData);

        // 3. Calculate All-Time Stats
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
