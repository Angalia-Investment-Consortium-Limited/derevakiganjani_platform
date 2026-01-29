import { Timestamp } from "firebase/firestore";

export interface Job {
    id: string;
    employerId: string;
    title: string;
    jobType: 'full-time' | 'contract' | 'temporary' | '';
    positions: number;
    vehicleType: 'car' | 'motorcycle' | 'bus' | 'truck' | 'other' | '';
    licenseCategory: string[];
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
}

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    applicantId: string;
    applicantName: string;
    applicationDate: string;
    status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
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
