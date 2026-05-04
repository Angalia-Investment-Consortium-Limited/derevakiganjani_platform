export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Referee {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
}

export interface CVData {
  id?: string;
  requestId: string;
  driverId: string;
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    professionalSummary: string;
  };
  skills: string[];
  languages: string[];
  experience: WorkExperience[];
  education: Education[];
  referees: Referee[];
  licenseCategories: string[];
  preferredVehicles: string[];
  createdAt: any;
  updatedAt: any;
}
