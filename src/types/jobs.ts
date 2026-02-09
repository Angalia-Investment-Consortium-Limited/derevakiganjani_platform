import { Timestamp } from "firebase/firestore";

export interface Job {
    id: string;
    employerId: string;
    job_title: string;
    employment_type: 'full-time' | 'contract' | 'temporary' | 'part-time' | '';
    positions?: number;
    vehicleType?: 'car' | 'motorcycle' | 'bus' | 'truck' | 'other' | '';
    licenseCategory?: string[];
    required_license_class: string;
    minExperience?: number;
    required_skills: string[];
    region: string;
    district?: string;
    salary_range?: string;
    benefits?: string[];
    job_description: string;
    expire_date?: Timestamp | string;
    startDate?: Timestamp | string;
    status: 'Open' | 'Closed' | 'draft';
    posted_date: Timestamp;
    applicationCount?: number;
    employerName?: string; // from DB
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
