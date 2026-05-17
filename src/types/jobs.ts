import { Timestamp } from "firebase/firestore";

export interface Job {
    id: string; // document ID
    employerId: string;
    employerName: string;
    job_title: string;
    job_type: 'Full-time' | 'Contract' | 'Temporary' | 'Part-time' | 'full-time' | 'contract' | 'temporary' | 'part-time' | '';
    job_industry?: string;
    region: string;
    district: string;
    salary: {
        from: number;
        to: number;
    };
    minimum_experience_years: number;
    application_deadline: Timestamp | string;
    required_license_category: string[];
    required_qualification_and_experience?: string[];
    required_training_and_certification?: string[];
    job_description: string;
    responsibilities?: string | string[];
    application_link?: string;
    required_skills: string[];
    skills_required_html?: string;
    benefits?: string[];
    how_to_apply?: string;
    posted_date: Timestamp;
    status: 'Open' | 'Closed' | 'Draft' | 'Published'; // Keep Published for compat if needed temporarily, but Schema says Open/Closed/Draft
    expire_date?: Timestamp | string;
    
    // Additional optional fields used in UI
    applicationCount?: number;
    positions?: number;
    vehicleType?: 'car' | 'motorcycle' | 'bus' | 'truck' | 'other' | 'Car' | 'Motorcycle' | 'Bus' | 'Truck' | '';
    startDate?: Timestamp | string;
    company_name?: string; 
}

export interface Application {
    id: string; // document ID
    driverId: string; 
    employerId: string;
    jobId: string;
    application_date: Timestamp; 
    status: 'New' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected' | 'Pending' | 'Applied' | 'Submitted';
    
    // Additional optional fields
    jobTitle?: string;
    licenseCategory?: string;
    driverExperience?: number;
    driverName?: string; 
    employerName?: string;
    appliedOn?: any;
    lastUpdate?: any;
    timeline?: any[];
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
