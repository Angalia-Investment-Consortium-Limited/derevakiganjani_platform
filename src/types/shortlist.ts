import type { DriverProfile } from './auth';

export interface ShortlistItem extends DriverProfile {
  id: string; 
  status: 'shortlisted' | 'contacted' | 'interviewed' | 'hired';
  jobId: string;
}
