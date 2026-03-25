import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { EmployerDashboardStats, RecentApplicant, RecentJobPost, EmployerDashboardData } from '@/types/dashboard';
import type { Job, Application } from '@/types/jobs';

export const useEmployerDashboard = (): EmployerDashboardData => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployerDashboardStats>({ totalJobPosts: 0, totalApplicants: 0, shortlisted: 0, interviews: 0, hired: 0 });
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [recentJobPosts, setRecentJobPosts] = useState<RecentJobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Depending on user.uid to prevent re-fetching on every render
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const employerId = user.uid;

        // --- Global Stats Calculation ---
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', employerId));
        const jobsSnapshot = await getDocs(jobsQuery);
        const totalJobPosts = jobsSnapshot.size;

        const allAppsQuery = query(collection(db, 'job_applications'), where('employerId', '==', employerId));
        const allAppsSnapshot = await getDocs(allAppsQuery);
        const totalApplicants = allAppsSnapshot.size;
        const shortlisted = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Shortlisted').length;
        const interviews = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Interview').length;
        const hired = allAppsSnapshot.docs.filter(doc => doc.data().status === 'Hired').length;
        setStats({ totalJobPosts, totalApplicants, shortlisted, interviews, hired });

        // --- Recent Job Posts (with application counts) ---
        const allJobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        allJobsData.sort((a, b) => (b.posted_date as Timestamp).toMillis() - (a.posted_date as Timestamp).toMillis());
        
        const recentJobsData = await Promise.all(
          allJobsData.slice(0, 5).map(async (job) => {
            const appsCountQuery = query(collection(db, 'job_applications'), where('jobId', '==', job.id));
            const appsCountSnapshot = await getCountFromServer(appsCountQuery);
            const status = job.status === 'Open' ? 'Published' : (job.status as string) === 'draft' || job.status === 'Draft' ? 'Draft' : job.status;
            return {
              id: job.id,
              title: job.job_title,
              applicationCount: appsCountSnapshot.data().count,
              status: status as 'Published' | 'Draft',
              postedOn: job.posted_date,
            } as RecentJobPost;
          })
        );
        setRecentJobPosts(recentJobsData);

        // --- Recent Applicants (enriched with driver and job details) ---
        const allAppsData = allAppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        allAppsData.sort((a, b) => ((b.application_date || b.appliedOn) as Timestamp)?.toMillis() - ((a.application_date || a.appliedOn) as Timestamp)?.toMillis());

        const recentAppsData = await Promise.all(
          allAppsData.slice(0, 5).map(async (app) => {
            let driverName = 'Unknown Driver';
            if (app.driverId) {
              const driverRef = doc(db, 'driver_profiles', app.driverId);
              const driverSnap = await getDoc(driverRef);
              if (driverSnap.exists()) {
                const driverData = driverSnap.data();
                driverName = driverData.fullName || driverData.full_name || (driverData.first_name ? `${driverData.first_name} ${driverData.last_name}` : 'Unknown Driver');
                
                const lic = driverData.license_category || driverData.categories || 'N/A';
                app.licenseCategory = Array.isArray(lic) ? lic.join(', ') : lic;
                app.driverExperience = driverData.experience_years || driverData.experience || 0;
              }
            }
            let jobTitle = 'Unknown Job';
            if (app.jobId) {
              const jobRef = doc(db, 'jobs', app.jobId);
              const jobSnap = await getDoc(jobRef);
              if (jobSnap.exists()) {
                jobTitle = (jobSnap.data() as Job).job_title || 'N/A';
              }
            }
            return {
              id: app.id,
              driverId: app.driverId,
              driverName,
              jobTitle,
              licenseCategory: app.licenseCategory,
              driverExperience: app.driverExperience,
              appliedOn: app.application_date || (app as any).appliedOn,
              status: app.status,
            } as RecentApplicant;
          })
        );
        setRecentApplicants(recentAppsData);

      } catch (e) {
        console.error("Error fetching employer dashboard data:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  return { stats, recentApplicants, recentJobPosts, loading, error };
};
