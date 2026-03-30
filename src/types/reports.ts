export interface LicenseCategoryStats {
  category: string;
  new: number;
  renewals: number;
  approved: number;
  rejected: number;
  pending: number;
  total: number;
}

export interface LicensesStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  renewals: number;
  newApplications: number;
  byCategory: Record<string, LicenseCategoryStats>;
}

export interface JiTestiCategoryStats {
  id: string;
  name: string;
  attempts: number;
  passed: number;
  totalScore: number;
  avgScore: number;
  passRate: number;
  avgTimeMinutes: number;
}

export interface JiTestiStats {
  totalAttempts: number;
  passed: number;
  failed: number;
  avgScore: number;
  passRate: number;
  byCategory: Record<string, JiTestiCategoryStats>;
}

export interface JobsStats {
  totalPosts: number;
  activePosts: number;
  filledPositions: number;
  expiredPosts: number;
  totalApplications: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
}

export interface FinanceServiceStats {
  service: string;
  totalAmount: number;
  transactions: number;
  avgTransaction: number;
}

export interface FinanceStats {
  totalRevenue: number;
  byService: Record<string, FinanceServiceStats>;
}

export interface OverviewStats {
  totalActiveDrivers: number;
  totalActivePosts: number;
  pendingApprovals: number;
  totalRevenue: number;
}

export interface AdminReportsData {
  licenses: LicensesStats;
  jitesti: JiTestiStats;
  jobs: JobsStats;
  finance: FinanceStats;
  overview: OverviewStats;
}
