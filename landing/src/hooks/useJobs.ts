/**
 * Custom hooks for Job management using frappe-react-sdk
 * Handles job listings, applications, and related operations
 */

import { useFrappeGetDocList, useFrappeGetDoc, useFrappePostCall, useFrappeDocTypeEventListener } from 'frappe-react-sdk';
import type { Filter } from 'frappe-react-sdk';
import type { JobPost, JobApplication, JobFilter, JobApplicationFormData } from '@/types/jobs';
import { useMemo } from 'react';

/**
 * Hook to fetch published jobs with filters
 */
export const useGetJobs = (filters?: JobFilter, limit: number = 20, limitStart: number = 0) => {
  // Build Frappe filters from JobFilter
  const frappeFilters = useMemo(() => {
    const f: Filter[] = [['status', '=', 'Published']];
    
    if (filters?.vehicle_type) {
      f.push(['vehicle_type', '=', filters.vehicle_type]);
    }
    
    if (filters?.license_category) {
      f.push(['license_category', '=', filters.license_category]);
    }
    
    if (filters?.job_type) {
      f.push(['job_type', '=', filters.job_type]);
    }
    
    if (filters?.region) {
      f.push(['region', '=', filters.region]);
    }
    
    if (filters?.district) {
      f.push(['district', '=', filters.district]);
    }
    
    if (filters?.salary_min) {
      f.push(['salary_range_min', '>=', filters.salary_min]);
    }
    
    if (filters?.salary_max) {
      f.push(['salary_range_max', '<=', filters.salary_max]);
    }
    
    if (filters?.search) {
      f.push(['title', 'like', `%${filters.search}%`]);
    }
    
    // Only show jobs that haven't closed yet
    const today = new Date().toISOString().split('T')[0];
    f.push(['closing_date', '>=', today]);
    
    return f;
  }, [filters]);

  const { data, isLoading, error, mutate } = useFrappeGetDocList<JobPost>('Job Post', {
    fields: [
      'name',
      'title',
      'employer',
      'status',
      'vehicle_type',
      'license_category',
      'job_type',
      'region',
      'district',
      'salary_range_min',
      'salary_range_max',
      'salary_period',
      'posted_date',
      'closing_date',
      'total_applications',
      'number_of_positions',
      'experience_required'
    ],
    filters: frappeFilters,
    limit,
    limit_start: limitStart,
    orderBy: {
      field: 'posted_date',
      order: 'desc'
    }
  });

  // Real-time updates
  useFrappeDocTypeEventListener('Job Post', () => {
    mutate();
  });

  return { jobs: data, isLoading, error, mutate };
};

/**
 * Hook to fetch a single job detail
 */
export const useGetJobDetail = (jobId: string | null) => {
  const { data, isLoading, error, mutate } = useFrappeGetDoc<JobPost>(
    'Job Post',
    jobId ?? undefined,
    jobId ? undefined : null
  );

  return { job: data, isLoading, error, mutate };
};

/**
 * Hook to apply for a job
 */
export const useApplyForJob = () => {
  const { call, loading, error } = useFrappePostCall<{ message: JobApplication }>('frappe.client.insert');

  const applyForJob = async (applicationData: JobApplicationFormData) => {
    try {
      const result = await call({
        doc: {
          doctype: 'Job Application',
          ...applicationData,
          application_date: new Date().toISOString().split('T')[0],
          status: 'Submitted',
          last_update_date: new Date().toISOString().split('T')[0]
        }
      });
      return result;
    } catch (err) {
      console.error('Error applying for job:', err);
      throw err;
    }
  };

  return { applyForJob, loading, error };
};

/**
 * Hook to fetch driver's applications
 */
export const useGetMyApplications = (driverEmail: string | null) => {
  const filters = useMemo(() => {
    const f: Filter[] = [];
    if (driverEmail) {
      f.push(['driver_email', '=', driverEmail]);
    }
    return f;
  }, [driverEmail]);

  const { data, isLoading, error, mutate } = useFrappeGetDocList<JobApplication>(
    'Job Application',
    {
      fields: [
        'name',
        'job_post',
        'job_title',
        'status',
        'application_date',
        'last_update_date',
        'interview_date',
        'interview_location',
        'message_to_applicant',
        'viewed_date',
        'shortlisted_date',
        'decision_date'
      ],
      filters,
      orderBy: {
        field: 'application_date',
        order: 'desc'
      }
    },
    driverEmail ? undefined : null
  );

  // Real-time updates
  useFrappeDocTypeEventListener('Job Application', () => {
    mutate();
  });

  return { applications: data, isLoading, error, mutate };
};

/**
 * Hook to get application detail
 */
export const useGetApplicationDetail = (applicationId: string | null) => {
  const { data, isLoading, error, mutate } = useFrappeGetDoc<JobApplication>(
    'Job Application',
    applicationId ?? undefined,
    applicationId ? undefined : null
  );

  return { application: data, isLoading, error, mutate };
};

/**
 * Hook to withdraw an application
 */
export const useWithdrawApplication = () => {
  const { call, loading, error } = useFrappePostCall('frappe.client.set_value');

  const withdrawApplication = async (applicationId: string) => {
    try {
      await call({
        doctype: 'Job Application',
        name: applicationId,
        fieldname: 'status',
        value: 'Withdrawn'
      });
    } catch (err) {
      console.error('Error withdrawing application:', err);
      throw err;
    }
  };

  return { withdrawApplication, loading, error };
};

/**
 * Hook to check if driver has already applied for a job
 */
export const useCheckApplicationExists = (jobId: string | null, driverEmail: string | null) => {
  const filters = useMemo(() => {
    const f: Filter[] = [];
    if (jobId && driverEmail) {
      f.push(['job_post', '=', jobId]);
      f.push(['driver_email', '=', driverEmail]);
      f.push(['status', '!=', 'Withdrawn']);
    }
    return f;
  }, [jobId, driverEmail]);

  const { data, isLoading } = useFrappeGetDocList<JobApplication>(
    'Job Application',
    {
      fields: ['name', 'status'],
      filters,
      limit: 1
    },
    jobId && driverEmail ? undefined : null
  );

  return {
    hasApplied: data && data.length > 0,
    existingApplication: data?.[0],
    isLoading
  };
};

/**
 * Hook to get job statistics for a driver
 */
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

/**
 * Hook to increment job views count
 */
export const useIncrementJobViews = () => {
  const { call } = useFrappePostCall('frappe.client.set_value');

  const incrementViews = async (jobId: string, currentViews: number = 0) => {
    try {
      await call({
        doctype: 'Job Post',
        name: jobId,
        fieldname: 'views_count',
        value: currentViews + 1
      });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  return { incrementViews };
};
