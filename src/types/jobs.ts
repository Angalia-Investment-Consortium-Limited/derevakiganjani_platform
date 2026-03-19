import { Timestamp } from "firebase/firestore";

export interface Job {
    id: string;
    title: string;
    jobType: 'full-time' | 'contract' | 'temporary' | 'part-time' | '';
    region: string;
    district: string;
    minExperience: number;
    salaryMin?: number;
    salaryMax?: number;
    description: string;
    skills: string[];
    benefits: string[];
    licenseCategory: string[];
    deadline: string | Timestamp;
    employerId: string;
    employerName: string;
    postedOn: Timestamp;
    status: 'Published' | 'Draft' | 'Closed';
    applicationCount?: number;
    positions?: number;
    vehicleType?: 'car' | 'motorcycle' | 'bus' | 'truck' | 'other' | '';
    startDate?: Timestamp | string;
    company_name?: string; // for UI
}

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    employerId: string;
    driverId: string; 
    appliedOn: Timestamp; 
    status: 'New' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected' | 'Pending';
    licenseCategory: string;
    driverExperience: number;
    driverName?: string; 
}

export interface EmployerVerification {
    id: string;
    employer_name: string;
    company_name: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    date_submitted: string;
    reviewed_by?: string;
    review_date?: string;
    notes?: string;
}
