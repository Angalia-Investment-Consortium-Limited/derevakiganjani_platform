import { useState, useEffect, useMemo } from 'react';
import type { JobPost, JobApplication, JobFilter, JobApplicationFormData } from '@/types/jobs';

// Mock data for demonstration
const MOCK_JOBS: JobPost[] = [
  {
    name: 'JOB-001',
    title: 'Experienced Driver Needed',
    employer: 'Tanzania Transport Co.',
    status: 'Published',
    vehicle_type: 'Truck',
    license_category: 'C1',
    job_type: 'Full-time',
    region: 'Dar es Salaam',
    district: 'Temeke',
    salary_range_min: 1000000,
    salary_range_max: 1500000,
    salary_period: 'Monthly',
    posted_date: '2024-07-20',
    closing_date: '2024-08-20',
    total_applications: 15,
    number_of_positions: 2,
    experience_required: '5+ years'
  }
];

const MOCK_APPLICATIONS: JobApplication[] = [
  {
    name: 'APP-001',
    job_post: 'JOB-001',
    job_title: 'Experienced Driver Needed',
    status: 'Submitted',
    application_date: '2024-07-21',
    last_update_date: '2024-07-21',
  }
];

export const useGetJobs = (filters?: JobFilter, limit: number = 20, limitStart: number = 0) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return { jobs: MOCK_JOBS, isLoading, error: null, mutate: () => {} };
};

export const useGetJobDetail = (jobId: string | null) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [jobId]);

  const job = MOCK_JOBS.find(j => j.name === jobId) || null;

  return { job, isLoading, error: null, mutate: () => {} };
};

export const useApplyForJob = () => {
  const [loading, setLoading] = useState(false);

  const applyForJob = async (applicationData: JobApplicationFormData) => {
    setLoading(true);
    console.log('Applying for job:', applicationData);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve({ message: { ...MOCK_APPLICATIONS[0], ...applicationData } });
    }, 1000));
  };

  return { applyForJob, loading, error: null };
};

export const useGetMyApplications = (driverEmail: string | null) => {
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }, [driverEmail]);
  
    return { applications: MOCK_APPLICATIONS, isLoading, error: null, mutate: () => {} };
  };

  export const useGetApplicationDetail = (applicationId: string | null) => {
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }, [applicationId]);
  
    const application = MOCK_APPLICATIONS.find(a => a.name === applicationId) || null;
  
    return { application, isLoading, error: null, mutate: () => {} };
  };

  export const useWithdrawApplication = () => {
    const [loading, setLoading] = useState(false);
  
    const withdrawApplication = async (applicationId: string) => {
      setLoading(true);
      console.log('Withdrawing application:', applicationId);
      return new Promise<void>(resolve => setTimeout(() => {
        setLoading(false);
        resolve();
      }, 1000));
    };
  
    return { withdrawApplication, loading, error: null };
  };

  export const useCheckApplicationExists = (jobId: string | null, driverEmail: string | null) => {
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }, [jobId, driverEmail]);
  
    const hasApplied = MOCK_APPLICATIONS.some(a => a.job_post === jobId);
  
    return {
      hasApplied,
      existingApplication: hasApplied ? MOCK_APPLICATIONS.find(a => a.job_post === jobId) : undefined,
      isLoading
    };
  };

  export const useGetJobStatistics = (driverEmail: string | null) => {
    const { applications, isLoading } = useGetMyApplications(driverEmail);
  
    const statistics = useMemo(() => {
      if (!applications) {
        return {
          total: 0,
          submitted: 0,
          viewed: 0,
          shortlisted: 0,
          interview: 0,
          accepted: 0,
          rejected: 0
        };
      }
  
      return {
        total: applications.length,
        submitted: applications.filter(a => a.status === 'Submitted').length,
        viewed: applications.filter(a => a.status === 'Viewed').length,
        shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
        interview: applications.filter(a => a.status === 'Interview').length,
        accepted: applications.filter(a => a.status === 'Accepted').length,
        rejected: applications.filter(a => a.status === 'Rejected').length
      };
    }, [applications]);
  
    return { statistics, isLoading };
  };
  

  export const useIncrementJobViews = () => {
      const incrementViews = async (jobId: string, currentViews: number = 0) => {
        console.log('Incrementing views for job:', jobId);
      }
      return { incrementViews };
  }
