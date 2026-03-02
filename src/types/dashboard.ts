import type { Timestamp } from 'firebase/firestore';

// Types for data returned by the useEmployerDashboard hook

export interface EmployerDashboardStats {
  totalJobPosts: number;
  totalApplicants: number;
  shortlisted: number;
  interviews: number;
  hired: number;
}

export interface RecentApplicant {
  id: string;
  driverId: string;
  driverName: string;
  jobTitle: string;
  licenseCategory: string;
  driverExperience: number;
  appliedOn: Timestamp;
  status: 'New' | 'Viewed' | 'Shortlisted';
}

export interface RecentJobPost {
  id: string;
  title: string;
  applicationCount: number;
  status: 'Published' | 'Draft';
  postedOn: Timestamp;
}

export interface EmployerDashboardData {
  stats: EmployerDashboardStats;
  recentApplicants: RecentApplicant[];
  recentJobPosts: RecentJobPost[];
  loading: boolean;
  error: Error | null;
}
