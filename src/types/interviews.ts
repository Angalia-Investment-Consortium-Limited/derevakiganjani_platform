export interface Interview {
    id: string;
    candidateId?: string;
    jobId?: string;
    employerId?: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    time: string;
    mode: 'In-person' | 'Phone' | 'Online';
    status: 'Confirmed' | 'Requested' | 'Completed' | 'Cancelled';
    notes?: string;
}
