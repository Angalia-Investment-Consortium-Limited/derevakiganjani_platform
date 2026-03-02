export interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    time: string;
    mode: 'In-person' | 'Phone' | 'Online';
    status: 'Confirmed' | 'Requested' | 'Completed' | 'Cancelled';
    notes?: string;
}
