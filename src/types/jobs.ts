import { Timestamp } from "firebase/firestore";

export interface Job {
    id: string;
    employerId: string;
    title: string;
    jobType: 'full-time' | 'contract' | 'temporary' | 'part-time' | '';
    positions: number;
    vehicleType: 'car' | 'motorcycle' | 'bus' | 'truck' | 'other' | '';
    licenseCategory: string[];
    licenseRequired: string;
    minExperience: number;
    skills: string[];
    region: string;
    district: string;
    salaryMin?: number;
    salaryMax?: number;
    benefits?: string[];
    description: string;
    deadline?: Timestamp | string;
    startDate?: Timestamp | string;
    status: 'Open' | 'Closed' | 'draft';
    postedOn: Timestamp;
    applicationCount?: number;
}

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    employerId: string;
    driverId: string; // Corrected from applicantId
    appliedOn: Timestamp; // Corrected from applicationDate
    status: 'New' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected' | 'Pending';
    
    // Denormalized data from driver profile, included when application is created
    licenseCategory: string;
    driverExperience: number;

    // Dynamically added in hooks
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
